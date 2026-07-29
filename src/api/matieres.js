import { appelerApi } from './http.js'

export function getMatieres() {
  return appelerApi('/matieres')
}

export function creerMatiere(matiere) {
  return appelerApi('/matieres', {
    method: 'POST',
    body: JSON.stringify(matiere),
  })
}

export function modifierMatiere(code, matiere) {
  return appelerApi(`/matieres/${code}`, {
    method: 'PUT',
    body: JSON.stringify(matiere),
  })
}

export function supprimerMatiere(code) {
  return appelerApi(`/matieres/${code}`, { method: 'DELETE' })
}
