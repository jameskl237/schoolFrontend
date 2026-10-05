import { store } from '@/app/store'

/**
 * Ouvre le PDF de l'épreuve dans un nouvel onglet. Le téléchargement doit être
 * authentifié (header Bearer), impossible via un simple lien : on récupère donc
 * le blob puis on l'ouvre depuis une URL mémoire.
 */
export async function openExamPaper(evaluationId: number, fileName: string): Promise<void> {
  const token = store.getState().auth.accessToken
  const response = await fetch(`${import.meta.env.VITE_API_URL}/evaluations/${evaluationId}/exam-paper`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    throw new Error(`Impossible de récupérer l'épreuve (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.target = '_blank'
  anchor.rel = 'noreferrer'
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
}