import { useState, useMemo } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function appreciation(note) {
  if (note >= 16) return 'Excellent'
  if (note >= 14) return 'Très bien'
  if (note >= 12) return 'Bien'
  if (note >= 10) return 'Passable'
  return 'Insuffisant'
}

function mention(moyenne) {
  if (moyenne >= 16) return 'Félicitations'
  if (moyenne >= 14) return 'Très bien'
  if (moyenne >= 12) return 'Bien'
  if (moyenne >= 10) return 'Passable'
  return 'Insuffisant'
}

function Bulletin({ etudiants, notes }) {
  const [etudiantId, setEtudiantId] = useState('')
  const [enGeneration, setEnGeneration] = useState(false)
  const [erreur, setErreur] = useState(null)

  const etudiant = etudiants.find((e) => e.idEtudiant === Number(etudiantId))

  const lignes = useMemo(() => {
    if (!etudiant) return []
    return notes
      .filter((n) => n.etudiant.idEtudiant === etudiant.idEtudiant)
      .map((n) => ({
        matiere: n.matiere.designationMatiere,
        code: n.matiere.codeMatiere,
        note: n.note,
      }))
  }, [etudiant, notes])

  // Moyenne simple (sans pondération), comme EtudiantService.calculateAverage côté backend
  const moyenne = useMemo(() => {
    if (lignes.length === 0) return 0
    return lignes.reduce((somme, l) => somme + l.note, 0) / lignes.length
  }, [lignes])

  function imprimerBulletin() {
    window.print()
  }

  function genererPdfBulletin() {
    if (!etudiant) return
    setEnGeneration(true)
    setErreur(null)
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const largeurPage = doc.internal.pageSize.getWidth()
      const marge = 14

      // ---------- En-tête ----------
      doc.setFillColor(18, 49, 63) // même bleu-vert que la sidebar de l'app
      doc.rect(0, 0, largeurPage, 28, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text('BULLETIN DE NOTES', largeurPage / 2, 13, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const anneeScolaire = `${new Date().getFullYear()} / ${new Date().getFullYear() + 1}`
      doc.text(`Année scolaire ${anneeScolaire}`, largeurPage / 2, 21, { align: 'center' })

      // ---------- Informations étudiant ----------
      doc.setTextColor(30, 41, 59)
      let y = 40
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Informations de l\'étudiant', marge, y)
      doc.setDrawColor(203, 213, 225)
      doc.line(marge, y + 2, largeurPage - marge, y + 2)

      y += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Nom : ${etudiant.nomEtudiant || '—'}`, marge, y)
      doc.text(`Prénom : ${etudiant.prenomEtudiant || '—'}`, largeurPage / 2 + 4, y)
      y += 6.5
      doc.text(`Adresse : ${etudiant.adresseEtudiant || '—'}`, marge, y)
      doc.text(`Téléphone : ${etudiant.telEtudiant || '—'}`, largeurPage / 2 + 4, y)
      y += 6.5
      doc.text(`Date d'édition : ${new Date().toLocaleDateString('fr-FR')}`, marge, y)

      // ---------- Tableau des notes ----------
      y += 8
      autoTable(doc, {
        startY: y,
        margin: { left: marge, right: marge },
        head: [['Code', 'Matière', 'Note /20', 'Appréciation']],
        body:
          lignes.length > 0
            ? lignes.map((l) => [l.code, l.matiere, l.note.toFixed(2), appreciation(l.note)])
            : [['—', 'Aucune note enregistrée', '—', '—']],
        theme: 'grid',
        headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        alternateRowStyles: { fillColor: [244, 246, 248] },
      })

      // ---------- Résultat final ----------
      const finTableau = doc.lastAutoTable.finalY + 10
      doc.setFillColor(244, 246, 248)
      doc.rect(marge, finTableau - 6, largeurPage - marge * 2, 20, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(15, 118, 110)
      doc.text(`Moyenne générale : ${moyenne.toFixed(2)} / 20`, marge + 4, finTableau + 2)
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Mention : ${mention(moyenne)}`, marge + 4, finTableau + 10)

      // ---------- Signature ----------
      const ySignature = Math.max(finTableau + 40, 250)
      doc.setDrawColor(30, 41, 59)
      doc.line(largeurPage - marge - 60, ySignature, largeurPage - marge, ySignature)
      doc.setFontSize(9)
      doc.text('Signature du responsable pédagogique', largeurPage - marge - 60, ySignature + 5)

      // ---------- Pied de page ----------
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(
        'Document généré automatiquement — Gestion Scolaire',
        largeurPage / 2,
        290,
        { align: 'center' }
      )

      doc.save(`bulletin_${etudiant.nomEtudiant}_${etudiant.prenomEtudiant}.pdf`)
    } catch (err) {
      setErreur("Impossible de générer le PDF : " + err.message)
    } finally {
      setEnGeneration(false)
    }
  }

  return (
    <div>
      <h2 className="masquer-impression">Bulletin de notes</h2>

      {erreur && <div className="alerte alerte-erreur masquer-impression">{erreur}</div>}

      <div className="carte formulaire masquer-impression">
        <div className="champ">
          <label>Choisir un étudiant</label>
          <select value={etudiantId} onChange={(e) => setEtudiantId(e.target.value)}>
            <option value="">-- Sélectionner un étudiant --</option>
            {etudiants.map((e) => (
              <option key={e.idEtudiant} value={e.idEtudiant}>
                {e.prenomEtudiant} {e.nomEtudiant}
              </option>
            ))}
          </select>
        </div>
      </div>

      {etudiant && (
        <div className="carte bulletin">
          <div className="bulletin-entete">
            <div>
              <h3>Bulletin de notes</h3>
              <p><strong>Nom &amp; Prénom :</strong> {etudiant.prenomEtudiant} {etudiant.nomEtudiant}</p>
              <p><strong>Adresse :</strong> {etudiant.adresseEtudiant || '—'}</p>
              <p><strong>Téléphone :</strong> {etudiant.telEtudiant || '—'}</p>
            </div>
            <div className="actions-formulaire masquer-impression">
              <button className="btn btn-secondaire" onClick={imprimerBulletin}>
                Imprimer (aperçu web)
              </button>
              <button className="btn btn-principal" onClick={genererPdfBulletin} disabled={enGeneration}>
                {enGeneration ? 'Génération…' : 'Télécharger le bulletin (PDF)'}
              </button>
            </div>
          </div>

          <table className="tableau">
            <thead>
              <tr>
                <th>Code</th>
                <th>Matière</th>
                <th>Note /20</th>
              </tr>
            </thead>
            <tbody>
              {lignes.length === 0 && (
                <tr>
                  <td colSpan="3" className="vide">Aucune note pour cet étudiant.</td>
                </tr>
              )}
              {lignes.map((l) => (
                <tr key={l.code}>
                  <td>{l.code}</td>
                  <td>{l.matiere}</td>
                  <td>{l.note}</td>
                </tr>
              ))}
            </tbody>
            {lignes.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="2"><strong>Moyenne générale</strong></td>
                  <td><strong>{moyenne.toFixed(2)} / 20</strong></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {!etudiant && (
        <p className="masquer-impression">Sélectionne un étudiant pour afficher son bulletin.</p>
      )}
    </div>
  )
}

export default Bulletin
