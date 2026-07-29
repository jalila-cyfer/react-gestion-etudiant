import { useState } from 'react'

const FORMULAIRE_VIDE = {
  nomEtudiant: '',
  prenomEtudiant: '',
  adresseEtudiant: '',
  telEtudiant: '',
}

function Etudiants({ etudiants, onCreer, onModifier, onSupprimer }) {
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE)
  const [idEnEdition, setIdEnEdition] = useState(null)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)

  function gererChangement(e) {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value })
  }

  async function gererSoumission(e) {
    e.preventDefault()
    if (!formulaire.nomEtudiant || !formulaire.prenomEtudiant) return

    setEnCours(true)
    setErreur(null)
    try {
      if (idEnEdition) {
        await onModifier(idEnEdition, formulaire)
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

  function modifier(etudiant) {
    setIdEnEdition(etudiant.idEtudiant)
    setErreur(null)
    setFormulaire({
      nomEtudiant: etudiant.nomEtudiant || '',
      prenomEtudiant: etudiant.prenomEtudiant || '',
      adresseEtudiant: etudiant.adresseEtudiant || '',
      telEtudiant: etudiant.telEtudiant || '',
    })
  }

  async function supprimer(id) {
    if (!confirm('Supprimer cet étudiant ?')) return
    setErreur(null)
    try {
      await onSupprimer(id)
    } catch (err) {
      setErreur(err.message)
    }
  }

  function annulerEdition() {
    setIdEnEdition(null)
    setFormulaire(FORMULAIRE_VIDE)
  }

  return (
    <div>
      <h2>Gestion des étudiants</h2>

      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      <form className="carte formulaire" onSubmit={gererSoumission}>
        <h3>{idEnEdition ? 'Modifier un étudiant' : 'Ajouter un étudiant'}</h3>
        <div className="grille-formulaire">
          <div className="champ">
            <label>Prénom</label>
            <input
              name="prenomEtudiant"
              value={formulaire.prenomEtudiant}
              onChange={gererChangement}
              placeholder="Ex: Sara"
              required
            />
          </div>
          <div className="champ">
            <label>Nom</label>
            <input
              name="nomEtudiant"
              value={formulaire.nomEtudiant}
              onChange={gererChangement}
              placeholder="Ex: Alaoui"
              required
            />
          </div>
          <div className="champ">
            <label>Adresse</label>
            <input
              name="adresseEtudiant"
              value={formulaire.adresseEtudiant}
              onChange={gererChangement}
              placeholder="Ex: Casablanca"
            />
          </div>
          <div className="champ">
            <label>Téléphone</label>
            <input
              name="telEtudiant"
              value={formulaire.telEtudiant}
              onChange={gererChangement}
              placeholder="Ex: 0600000000"
            />
          </div>
        </div>
        <div className="actions-formulaire">
          <button type="submit" className="btn btn-principal" disabled={enCours}>
            {enCours ? 'Enregistrement…' : idEnEdition ? 'Enregistrer les modifications' : "Ajouter l'étudiant"}
          </button>
          {idEnEdition && (
            <button type="button" className="btn btn-secondaire" onClick={annulerEdition}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="carte">
        <h3>Liste des étudiants ({etudiants.length})</h3>
        <table className="tableau">
          <thead>
            <tr>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {etudiants.length === 0 && (
              <tr>
                <td colSpan="5" className="vide">Aucun étudiant enregistré pour le moment.</td>
              </tr>
            )}
            {etudiants.map((etu) => (
              <tr key={etu.idEtudiant}>
                <td>{etu.prenomEtudiant}</td>
                <td>{etu.nomEtudiant}</td>
                <td>{etu.adresseEtudiant}</td>
                <td>{etu.telEtudiant}</td>
                <td className="actions-tableau">
                  <button className="btn btn-petit" onClick={() => modifier(etu)}>Modifier</button>
                  <button className="btn btn-petit btn-danger" onClick={() => supprimer(etu.idEtudiant)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Etudiants
