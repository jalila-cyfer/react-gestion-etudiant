## Structure du projet

```
src/
  App.jsx               #  chargement initial, navigation
  App.css                # styles
  api/
    config.js            # URL de base de l'API 
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
