import { useState } from 'react'

const FORMULAIRE_VIDE = { codeMatiere: '', designationMatiere: '' }

function Matieres({ matieres, onCreer, onModifier, onSupprimer }) {
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE)
  const [codeEnEdition, setCodeEnEdition] = useState(null)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)

  function gererChangement(e) {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value })
  }

  async function gererSoumission(e) {
    e.preventDefault()
    if (!formulaire.codeMatiere || !formulaire.designationMatiere) return

    setEnCours(true)
    setErreur(null)
    try {
      if (codeEnEdition) {
        await onModifier(codeEnEdition, formulaire)
      } else {
        await onCreer(formulaire)
      }
      annulerEdition()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnCours(false)
    }
  }

  function modifier(matiere) {
    setCodeEnEdition(matiere.codeMatiere)
    setErreur(null)
    setFormulaire({
      codeMatiere: matiere.codeMatiere,
      designationMatiere: matiere.designationMatiere || '',
    })
  }

  async function supprimer(code) {
    if (!confirm('Supprimer cette matière ?')) return
    setErreur(null)
    try {
      await onSupprimer(code)
    } catch (err) {
      setErreur(err.message)
    }
  }

  function annulerEdition() {
    setCodeEnEdition(null)
    setFormulaire(FORMULAIRE_VIDE)
  }

  return (
    <div>
      <h2>Gestion des matières / modules</h2>

      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      <form className="carte formulaire" onSubmit={gererSoumission}>
        <h3>{codeEnEdition ? 'Modifier une matière' : 'Ajouter une matière'}</h3>
        <div className="grille-formulaire">
          <div className="champ">
            <label>Code (identifiant unique)</label>
            <input
              name="codeMatiere"
              value={formulaire.codeMatiere}
              onChange={gererChangement}
              placeholder="Ex: BDD101"
              required
              disabled={!!codeEnEdition}
            />
          </div>
          <div className="champ">
            <label>Désignation</label>
            <input
              name="designationMatiere"
              value={formulaire.designationMatiere}
              onChange={gererChangement}
              placeholder="Ex: Base de données"
              required
            />
          </div>
        </div>
        <div className="actions-formulaire">
          <button type="submit" className="btn btn-principal" disabled={enCours}>
            {enCours ? 'Enregistrement…' : codeEnEdition ? 'Enregistrer les modifications' : 'Ajouter la matière'}
          </button>
          {codeEnEdition && (
            <button type="button" className="btn btn-secondaire" onClick={annulerEdition}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="carte">
        <h3>Liste des matières ({matieres.length})</h3>
        <table className="tableau">
          <thead>
            <tr>
              <th>Code</th>
              <th>Désignation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {matieres.length === 0 && (
              <tr>
                <td colSpan="3" className="vide">Aucune matière enregistrée pour le moment.</td>
              </tr>
            )}
            {matieres.map((mat) => (
              <tr key={mat.codeMatiere}>
                <td>{mat.codeMatiere}</td>
                <td>{mat.designationMatiere}</td>
                <td className="actions-tableau">
                  <button className="btn btn-petit" onClick={() => modifier(mat)}>Modifier</button>
                  <button className="btn btn-petit btn-danger" onClick={() => supprimer(mat.codeMatiere)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Matieres
