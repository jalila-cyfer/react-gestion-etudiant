# Gestion des Étudiants — Interface connectée au backend Spring (converti en REST)

Interface React pour la gestion des étudiants, des matières/modules, des notes,
et la génération d'un bulletin téléchargeable/imprimable. Connectée au backend
Spring (`EtudiantController`, `MatiereController`, `NoteController`) une fois
convertis en `@RestController` (voir le dossier `backend-rest` fourni à côté).

## ⚠️ Étape obligatoire avant de lancer

1. Copie les fichiers du dossier `backend-rest` dans ton projet Spring (voir son
   propre README pour les détails), redémarre le serveur Spring.
2. Ouvre `src/api/config.js` et vérifie que `API_BASE_URL` correspond bien à
   l'URL de ton backend (par défaut `http://localhost:8080`).

## Installation

```bash
npm install
npm run dev
```

Ouvre ensuite l'URL affichée dans le terminal (en général http://localhost:5173).

## ⚠️ CORS

Le fichier `config/CorsConfig.java` (fourni dans `backend-rest`) autorise les appels
venant de `http://localhost:5173`. Sans lui, le navigateur bloquera toutes les requêtes.

## Fonctionnalités incluses

- **Étudiants** (`/etudiants`) : `nomEtudiant`, `prenomEtudiant`, `adresseEtudiant`, `telEtudiant`
- **Matières / Modules** (`/matieres`) : `codeMatiere` (clé primaire, non modifiable après
  création), `designationMatiere`
- **Notes** (`/notes`) : liaison étudiant + matière + valeur `/20`. Une note n'a pas
  d'identifiant propre : sa clé est le couple (étudiant, matière). "Modifier" ré-envoie
  donc la même paire avec une nouvelle valeur (les menus étudiant/matière sont verrouillés
  pendant l'édition pour éviter d'en créer une nouvelle par erreur). La liste peut être
  **filtrée par matière** via le menu déroulant au-dessus du tableau.
- **Bulletin** : sélectionner un étudiant, voir ses notes, la **moyenne simple** (comme
  `EtudiantService.calculateAverage` côté backend, sans pondération), avec deux options :
  - "Imprimer (aperçu web)" → utilise `window.print()` du navigateur
  - "Télécharger le bulletin (PDF)" → génère un **vrai PDF mis en forme** directement dans
    le navigateur (en-tête, tableau des notes, appréciations, moyenne, mention, zone de
    signature) grâce à `jsPDF` + `jspdf-autotable` — aucun appel serveur nécessaire pour ça

## Gestion des erreurs

Si le backend n'est pas joignable ou renvoie une erreur (400/404/409), un message
s'affiche dans l'interface avec un bouton "Réessayer" (chargement initial) ou un
message inline (actions de formulaire).

## Structure du projet

```
src/
  App.jsx               # état global, chargement initial, navigation
  App.css                # tous les styles
  api/
    config.js            # URL de base de l'API (À VÉRIFIER)
    http.js               # fonction utilitaire fetch + gestion d'erreurs
    etudiants.js           # appels vers /etudiants
    matieres.js             # appels vers /matieres
    notes.js                 # appels vers /notes
  components/
    Etudiants.jsx         # CRUD étudiants
    Matieres.jsx          # CRUD matières / modules
    Notes.jsx             # gestion des notes (créer/supprimer)
    Bulletin.jsx          # affichage + téléchargement du bulletin
```
