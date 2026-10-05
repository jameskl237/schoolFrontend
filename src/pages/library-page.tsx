import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { BookCopy, Library, MoreHorizontal, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import {
  useAddBookCopiesMutation,
  useBooksQuery,
  useDeleteBookMutation,
} from '@/features/library/api/library-api'
import { BookFormDialog } from '@/features/library/components/book-form-dialog'
import { copyStatusLabels } from '@/features/library/labels'
import type { Book, BookCopyStatus } from '@/features/library/types'
import { getErrorMessage } from '@/lib/get-error-message'

const statusVariant: Record<BookCopyStatus, 'default' | 'secondary' | 'outline'> = {
  AVAILABLE: 'default',
  BORROWED: 'secondary',
  LOST: 'outline',
  DAMAGED: 'outline',
  RETIRED: 'outline',
}

export function LibraryPage() {
  const [search, setSearch] = useState('')
  const { data: books, isLoading } = useBooksQuery(search || undefined)
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('books.manage')
  const [deleteBook] = useDeleteBookMutation()
  const [addCopies] = useAddBookCopiesMutation()

  const [editing, setEditing] = useState<Book | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const run = async (action: Promise<unknown>, message: string) => {
    try {
      await action
      toast.success(message)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  const handleDelete = (book: Book) => {
    if (!window.confirm(`Retirer « ${book.title} » du catalogue ?`)) return

    void run(deleteBook(book.id).unwrap(), 'Livre retiré')
  }

  const available = (book: Book) => book.copies.filter((copy) => copy.status === 'AVAILABLE').length

  return (
    <>
      <PageHeader
        title="Bibliothèque"
        description="Le catalogue et l'état de chaque exemplaire."
        actions={
          canManage && (
            <Button
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              <Plus />
              Nouveau livre
            </Button>
          )
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Rechercher par titre, auteur ou ISBN…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !books?.length ? (
            <EmptyState
              icon={Library}
              title={search ? 'Aucun résultat' : 'Catalogue vide'}
              description={
                search
                  ? 'Aucun livre ne correspond à cette recherche.'
                  : 'Ajoutez le premier livre du catalogue.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Disponibles</TableHead>
                    <TableHead>Exemplaires</TableHead>
                    {canManage && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">
                        {book.title}
                        {book.publishedYear && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            {book.publishedYear}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{book.author ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{book.category ?? '—'}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {available(book)} / {book._count.copies}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {book.copies.slice(0, 6).map((copy) => (
                            <Badge key={copy.id} variant={statusVariant[copy.status]} className="text-[10px]">
                              {copy.inventoryCode.split('-').pop()} · {copyStatusLabels[copy.status]}
                            </Badge>
                          ))}
                          {book.copies.length > 6 && (
                            <span className="text-xs text-muted-foreground">
                              +{book.copies.length - 6}
                            </span>
                          )}
                          {book.copies.length === 0 && (
                            <span className="text-xs text-muted-foreground">aucun</span>
                          )}
                        </div>
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                            >
                              <MoreHorizontal />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  void run(
                                    addCopies({ id: book.id, count: 1 }).unwrap(),
                                    'Exemplaire ajouté',
                                  )
                                }
                              >
                                <BookCopy />
                                Ajouter un exemplaire
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditing(book)
                                  setDialogOpen(true)
                                }}
                              >
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem variant="destructive" onClick={() => handleDelete(book)}>
                                Retirer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </Reveal>

      <BookFormDialog open={dialogOpen} onOpenChange={setDialogOpen} book={editing} />
    </>
  )
}
