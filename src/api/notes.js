import { appelerApi } from './http.js'

export function getNotes() {
  return appelerApi('/notes')
}

export function getNotesParEtudiant(etudiantId) {
  return appelerApi(`/notes/student/${etudiantId}`)
}

export function creerNote({ etudiantId, matiereCode, note }) {
  return appelerApi('/notes', {
    method: 'POST',
    body: JSON.stringify({ etudiantId, matiereCode, note }),
  })
}

export function supprimerNote(idEtudiant, codeMatiere) {
  return appelerApi(`/notes/${idEtudiant}/${codeMatiere}`, { method: 'DELETE' })
}
