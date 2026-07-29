import { appelerApi } from './http.js'

export function getEtudiants() {
  return appelerApi('/etudiants')
}

export function creerEtudiant(etudiant) {
  return appelerApi('/etudiants', {
    method: 'POST',
    body: JSON.stringify(etudiant),
  })
}

export function modifierEtudiant(id, etudiant) {
  return appelerApi(`/etudiants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(etudiant),
  })
}

export function supprimerEtudiant(id) {
  return appelerApi(`/etudiants/${id}`, { method: 'DELETE' })
}

// Bulletin texte généré côté serveur par ReportService (retourne du texte brut, pas du JSON)
export function getBulletinTexte(id) {
  return appelerApi(`/etudiants/${id}/report`)
}
