import { useState, useEffect, useCallback } from 'react'
import Etudiants from './components/Etudiants.jsx'
import Matieres from './components/Matieres.jsx'
import Notes from './components/Notes.jsx'
import Bulletin from './components/Bulletin.jsx'
import * as etudiantsApi from './api/etudiants.js'
import * as matieresApi from './api/matieres.js'
import * as notesApi from './api/notes.js'

function App() {
  const [ongletActif, setOngletActif] = useState('etudiants')

  const [etudiants, setEtudiants] = useState([])
  const [matieres, setMatieres] = useState([])
  const [notes, setNotes] = useState([])

  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  const chargerToutesLesDonnees = useCallback(async () => {
    setChargement(true)
    setErreur(null)
    try {
      const [donneesEtudiants, donneesMatieres, donneesNotes] = await Promise.all([
        etudiantsApi.getEtudiants(),
        matieresApi.getMatieres(),
        notesApi.getNotes(),
      ])
      setEtudiants(donneesEtudiants || [])
      setMatieres(donneesMatieres || [])
      setNotes(donneesNotes || [])
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    chargerToutesLesDonnees()
  }, [chargerToutesLesDonnees])

  // On recharge depuis le serveur après chaque écriture plutôt que de manipuler
  // les tableaux à la main : les notes renvoyées par l'API imbriquent les objets
  // Etudiant/Matiere complets, donc on laisse le backend garder la vérité.
  async function rechargerEtudiants() {
    setEtudiants((await etudiantsApi.getEtudiants()) || [])
  }
  async function rechargerMatieres() {
    setMatieres((await matieresApi.getMatieres()) || [])
  }
  async function rechargerNotes() {
    setNotes((await notesApi.getNotes()) || [])
  }

  // ---------- Étudiants ----------
  async function ajouterEtudiant(donnees) {
    await etudiantsApi.creerEtudiant(donnees)
    await rechargerEtudiants()
  }
  async function modifierEtudiant(id, donnees) {
    await etudiantsApi.modifierEtudiant(id, donnees)
    await rechargerEtudiants()
    await rechargerNotes()
  }
  async function supprimerEtudiant(id) {
    await etudiantsApi.supprimerEtudiant(id)
    await rechargerEtudiants()
    await rechargerNotes()
  }

  // ---------- Matières ----------
  async function ajouterMatiere(donnees) {
    await matieresApi.creerMatiere(donnees)
    await rechargerMatieres()
  }
  async function modifierMatiere(code, donnees) {
    await matieresApi.modifierMatiere(code, donnees)
    await rechargerMatieres()
    await rechargerNotes()
  }
  async function supprimerMatiere(code) {
    await matieresApi.supprimerMatiere(code)
    await rechargerMatieres()
    await rechargerNotes()
  }

  // ---------- Notes ----------
  async function ajouterNote(donnees) {
    await notesApi.creerNote(donnees)
    await rechargerNotes()
  }
  async function supprimerNote(idEtudiant, codeMatiere) {
    await notesApi.supprimerNote(idEtudiant, codeMatiere)
    await rechargerNotes()
  }

  const onglets = [
    { cle: 'etudiants', label: 'Étudiants', icone: '👤' },
    { cle: 'matieres', label: 'Matières / Modules', icone: '📘' },
    { cle: 'notes', label: 'Notes', icone: '📝' },
    { cle: 'bulletin', label: 'Bulletin', icone: '📄' },
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-titre">
          <span className="logo">🎓</span>
          <div>
            <h1>Gestion Scolaire</h1>
          </div>
        </div>
        <nav>
          {onglets.map((onglet) => (
            <button
              key={onglet.cle}
              className={ongletActif === onglet.cle ? 'nav-item actif' : 'nav-item'}
              onClick={() => setOngletActif(onglet.cle)}
            >
              <span>{onglet.icone}</span> {onglet.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
        </div>
      </aside>

      <main className="contenu">
        {erreur && (
          <div className="alerte alerte-erreur">
            <strong>Erreur de connexion au backend :</strong> {erreur}
            <div>
              <button className="btn btn-petit" onClick={chargerToutesLesDonnees}>
                Réessayer
              </button>
            </div>
          </div>
        )}

        {chargement && !erreur && <p>Chargement des données depuis le serveur…</p>}

        {!chargement && (
          <>
            {ongletActif === 'etudiants' && (
              <Etudiants
                etudiants={etudiants}
                onCreer={ajouterEtudiant}
                onModifier={modifierEtudiant}
                onSupprimer={supprimerEtudiant}
              />
            )}
            {ongletActif === 'matieres' && (
              <Matieres
                matieres={matieres}
                onCreer={ajouterMatiere}
                onModifier={modifierMatiere}
                onSupprimer={supprimerMatiere}
              />
            )}
            {ongletActif === 'notes' && (
              <Notes
                etudiants={etudiants}
                matieres={matieres}
                notes={notes}
                onCreer={ajouterNote}
                onSupprimer={supprimerNote}
              />
            )}
            {ongletActif === 'bulletin' && (
              <Bulletin etudiants={etudiants} notes={notes} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
