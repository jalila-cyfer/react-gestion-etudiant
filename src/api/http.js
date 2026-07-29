import { API_BASE_URL } from './config.js'

// Petite fonction utilitaire pour appeler l'API et gérer les erreurs de façon uniforme.
// Ton backend renvoie parfois du JSON ({"message": "..."}) et parfois du texte simple
// sur DELETE, donc on essaie de lire en JSON et on retombe sur du texte si ça échoue.
export async function appelerApi(chemin, options = {}) {
  let reponse
  try {
    reponse = await fetch(`${API_BASE_URL}${chemin}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch (erreurReseau) {
    throw new Error(
      "Impossible de contacter le serveur. Vérifie que le backend est démarré et que l'URL dans src/api/config.js est correcte."
    )
  }

  const texteBrut = await reponse.text()
  let corps = null
  if (texteBrut) {
    try {
      corps = JSON.parse(texteBrut)
    } catch {
      corps = texteBrut
    }
  }

  if (!reponse.ok) {
    const message =
      (corps && typeof corps === 'object' && corps.message) ||
      (typeof corps === 'string' ? corps : null) ||
      `Erreur ${reponse.status}`
    throw new Error(message)
  }

  return corps
}
