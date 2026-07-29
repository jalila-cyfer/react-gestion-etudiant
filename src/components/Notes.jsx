import { useState } from 'react'

const FORMULAIRE_VIDE = { etudiantId: '', matiereCode: '', note: '' }

function Notes({ etudiants, matieres, notes, onCreer, onSupprimer }) {
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE)
  const [enEdition, setEnEdition] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [filtreMatiere, setFiltreMatiere] = useState('')

  function gererChangement(e) {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value })
  }

  async function gererSoumission(e) {
    e.preventDefault()
    if (!formulaire.etudiantId || !formulaire.matiereCode || formulaire.note === '') return

    setEnCours(true)
    setErreur(null)
    try {
      await onCreer({
        etudiantId: Number(formulaire.etudiantId),
        matiereCode: formulaire.matiereCode,
        note: Number(formulaire.note),
      })
      annulerEdition()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnCours(false)
    }
  }

  // Une note n'a pas d'identifiant propre : "modifier" revient à ré-envoyer
  // la même paire étudiant/matière avec une nouvelle valeur. On verrouille
  // donc les deux menus déroulants pour éviter de créer une note différente
  // par erreur.
  function modifier(note) {
    setEnEdition(true)
    setErreur(null)
    setFormulaire({
      etudiantId: String(note.etudiant.idEtudiant),
      matiereCode: note.matiere.codeMatiere,
      note: String(note.note),
    })
  }

  async function supprimer(idEtudiant, codeMatiere) {
    if (!confirm('Supprimer cette note ?')) return
    setErreur(null)
    try {
      await onSupprimer(idEtudiant, codeMatiere)
    } catch (err) {
      setErreur(err.message)
    }
  }

  function annulerEdition() {
    setEnEdition(false)
    setFormulaire(FORMULAIRE_VIDE)
  }

  const pasDeDonnees = etudiants.length === 0 || matieres.length === 0

  const notesFiltrees = filtreMatiere
    ? notes.filter((n) => n.matiere.codeMatiere === filtreMatiere)
    : notes

  return (
    <div>
      <h2>Gestion des notes</h2>

      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      {pasDeDonnees && (
        <div className="alerte">
          Ajoute d'abord au moins un étudiant et une matière avant de saisir des notes.
        </div>
      )}

      <form className="carte formulaire" onSubmit={gererSoumission}>
        <h3>{enEdition ? 'Modifier une note' : 'Ajouter une note'}</h3>
        <div className="grille-formulaire">
          <div className="champ">
            <label>Étudiant</label>
            <select
              name="etudiantId"
              value={formulaire.etudiantId}
              onChange={gererChangement}
              required
              disabled={enEdition}
            >
              <option value="">-- Choisir --</option>
              {etudiants.map((e) => (
                <option key={e.idEtudiant} value={e.idEtudiant}>
                  {e.prenomEtudiant} {e.nomEtudiant}
                </option>
              ))}
            </select>
          </div>
          <div className="champ">
            <label>Matière</label>
            <select
              name="matiereCode"
              value={formulaire.matiereCode}
              onChange={gererChangement}
              required
              disabled={enEdition}
            >
              <option value="">-- Choisir --</option>
              {matieres.map((m) => (
                <option key={m.codeMatiere} value={m.codeMatiere}>
                  {m.designationMatiere} ({m.codeMatiere})
                </option>
              ))}
            </select>
          </div>
          <div className="champ">
            <label>Note (/20)</label>
            <input
              type="number"
              name="note"
              min="0"
              max="20"
              step="0.25"
              value={formulaire.note}
              onChange={gererChangement}
              required
            />
          </div>
        </div>
        <div className="actions-formulaire">
          <button type="submit" className="btn btn-principal" disabled={pasDeDonnees || enCours}>
            {enCours ? 'Enregistrement…' : enEdition ? 'Enregistrer la nouvelle valeur' : 'Ajouter la note'}
          </button>
          {enEdition && (
            <button type="button" className="btn btn-secondaire" onClick={annulerEdition}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="carte">
        <div className="entete-tableau">
          <h3>Liste des notes ({notesFiltrees.length}{filtreMatiere ? ` / ${notes.length}` : ''})</h3>
          <div className="champ champ-filtre">
            <label>Filtrer par matière</label>
            <select value={filtreMatiere} onChange={(e) => setFiltreMatiere(e.target.value)}>
              <option value="">Toutes les matières</option>
              {matieres.map((m) => (
                <option key={m.codeMatiere} value={m.codeMatiere}>
                  {m.designationMatiere} ({m.codeMatiere})
                </option>
              ))}
            </select>
          </div>
        </div>
        <table className="tableau">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Matière</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notesFiltrees.length === 0 && (
              <tr>
                <td colSpan="4" className="vide">
                  {filtreMatiere ? 'Aucune note pour cette matière.' : 'Aucune note enregistrée pour le moment.'}
                </td>
              </tr>
            )}
            {notesFiltrees.map((n) => (
              <tr key={`${n.etudiant.idEtudiant}-${n.matiere.codeMatiere}`}>
                <td>{n.etudiant.prenomEtudiant} {n.etudiant.nomEtudiant}</td>
                <td>{n.matiere.designationMatiere}</td>
                <td>{n.note}/20</td>
                <td className="actions-tableau">
                  <button className="btn btn-petit" onClick={() => modifier(n)}>Modifier</button>
                  <button
                    className="btn btn-petit btn-danger"
                    onClick={() => supprimer(n.etudiant.idEtudiant, n.matiere.codeMatiere)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Notes
