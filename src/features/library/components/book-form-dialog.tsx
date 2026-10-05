import { useEffect, useState, type FormEvent } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateBookMutation, useUpdateBookMutation } from '../api/library-api'
import type { Book } from '../types'

interface BookFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: Book | null
}

export function BookFormDialog({ open, onOpenChange, book }: BookFormDialogProps) {
  const isEditing = Boolean(book)
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation()
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation()

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [publisher, setPublisher] = useState('')
  const [category, setCategory] = useState('')
  const [publishedYear, setPublishedYear] = useState('')
  const [copies, setCopies] = useState('1')

  useEffect(() => {
    if (!open) return

    setTitle(book?.title ?? '')
    setAuthor(book?.author ?? '')
    setIsbn(book?.isbn ?? '')
    setPublisher(book?.publisher ?? '')
    setCategory(book?.category ?? '')
    setPublishedYear(book?.publishedYear ? String(book.publishedYear) : '')
    setCopies('1')
  }, [open, book])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      title,
      author: author || null,
      isbn: isbn || null,
      publisher: publisher || null,
      category: category || null,
      publishedYear: publishedYear ? Number(publishedYear) : null,
    }

    try {
      if (isEditing && book) {
        await updateBook({ id: book.id, ...payload }).unwrap()
        toast.success('Livre mis à jour')
      } else {
        await createBook({ ...payload, copies: Number(copies) || 0 }).unwrap()
        toast.success('Livre ajouté au catalogue')
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le livre' : 'Nouveau livre'}</DialogTitle>
          <DialogDescription>
            Un titre du catalogue. Les exemplaires reçoivent des codes d&rsquo;inventaire
            automatiques.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="author">Auteur</Label>
              <Input id="author" value={author} onChange={(event) => setAuthor(event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                placeholder="Roman, Manuel…"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="publisher">Éditeur</Label>
              <Input
                id="publisher"
                value={publisher}
                onChange={(event) => setPublisher(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="publishedYear">Année</Label>
              <Input
                id="publishedYear"
                type="number"
                min="1400"
                max="2200"
                value={publishedYear}
                onChange={(event) => setPublishedYear(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" value={isbn} onChange={(event) => setIsbn(event.target.value)} />
            </div>
            {!isEditing && (
              <div className="grid gap-1.5">
                <Label htmlFor="copies">Exemplaires</Label>
                <Input
                  id="copies"
                  type="number"
                  min="0"
                  max="100"
                  value={copies}
                  onChange={(event) => setCopies(event.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !title}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
