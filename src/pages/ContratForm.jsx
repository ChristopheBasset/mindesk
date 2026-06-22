import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

const TYPES = [
  { value: 'energie', label: 'Énergie (élec / gaz)' },
  { value: 'telecom', label: 'Télécom (tél / internet)' },
  { value: 'mutuelle', label: 'Mutuelle (santé)' },
  { value: 'assurance_auto', label: 'Assurance auto' },
  { value: 'assurance_habitation', label: 'Assurance habitation' },
  { value: 'autre', label: 'Autre' },
]
const PERIODICITES = ['mensuel', 'trimestriel', 'annuel']
const STATUTS = [
  { value: 'actif', label: 'Actif' },
  { value: 'resilie', label: 'Résilié' },
  { value: 'en_cours', label: 'En cours' },
]

export default function ContratForm({ session }) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // --- Zone scannable (sera pré-remplie par le scan plus tard) ---
  const [type, setType] = useState('')
  const [organisme, setOrganisme] = useState('')
  const [offre, setOffre] = useState('')
  const [numeroContrat, setNumeroContrat] = useState('')
  const [titulaire, setTitulaire] = useState('')
  const [montant, setMontant] = useState('')
  const [periodicite, setPeriodicite] = useState('mensuel')
  const [telServiceClient, setTelServiceClient] = useState('')
  const [lienEspaceClient, setLienEspaceClient] = useState('')

  // --- Zone à compléter à la main (absente des factures) ---
  const [dateDebut, setDateDebut] = useState('')
  const [dureeEngagement, setDureeEngagement] = useState('')
  const [dateRenouvellement, setDateRenouvellement] = useState('')
  const [preavisJours, setPreavisJours] = useState('')
  const [reconductionTacite, setReconductionTacite] = useState(true)
  const [lienResiliation, setLienResiliation] = useState('')
  const [statut, setStatut] = useState('actif')
  const [notes, setNotes] = useState('')

  const valide = type && organisme.trim()

  const enregistrer = async () => {
    setError('')
    if (!valide) {
      setError('Le type et l\'organisme sont obligatoires.')
      return
    }
    setSaving(true)
    // Les champs vides partent en null (jamais '' dans une colonne date/num/int).
    // On ne renseigne PAS les colonnes générées : Postgres les calcule.
    const { error } = await supabase.from('contrat').insert({
      user_id: session.user.id,
      type,
      organisme: organisme.trim(),
      offre: offre.trim() || null,
      numero_contrat: numeroContrat.trim() || null,
      titulaire: titulaire.trim() || null,
      montant: montant ? Number(montant) : null,
      periodicite: periodicite || null,
      tel_service_client: telServiceClient.trim() || null,
      lien_espace_client: lienEspaceClient.trim() || null,
      date_debut: dateDebut || null,
      duree_engagement_mois: dureeEngagement ? parseInt(dureeEngagement, 10) : null,
      date_renouvellement: dateRenouvellement || null,
      preavis_jours: preavisJours ? parseInt(preavisJours, 10) : null,
      reconduction_tacite: reconductionTacite,
      lien_resiliation: lienResiliation.trim() || null,
      statut,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (error) {
      setError('Erreur à l\'enregistrement : ' + error.message)
      return
    }
    // On atterrit sur « À venir » : les échéances du nouveau contrat y apparaissent.
    navigate('/direct/avenir')
  }

  return (
    <div style={s.container}>

      <div style={s.header}>
        <button onClick={() => navigate(-1)} style={s.back}>←</button>
        <div style={s.title}>Nouveau contrat</div>
      </div>

      <div style={s.scroll}>

        {/* ZONE SCANNABLE */}
        <div style={s.zoneLabel}>
          <span style={{ ...s.zoneDot, background: '#1D9E75' }} />
          Lu sur la facture — bientôt pré-rempli par scan
        </div>
        <div style={s.card}>
          <label style={s.lab}>Type *</label>
          <select style={s.input} value={type} onChange={e => setType(e.target.value)}>
            <option value="">Choisir…</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <label style={s.lab}>Organisme *</label>
          <input style={s.input} placeholder="ex. EDF" value={organisme}
            onChange={e => setOrganisme(e.target.value)} />

          <label style={s.lab}>Offre</label>
          <input style={s.input} placeholder="ex. Tarif Bleu" value={offre}
            onChange={e => setOffre(e.target.value)} />

          <label style={s.lab}>N° de contrat</label>
          <input style={s.input} value={numeroContrat}
            onChange={e => setNumeroContrat(e.target.value)} />

          <label style={s.lab}>Titulaire</label>
          <input style={s.input} value={titulaire}
            onChange={e => setTitulaire(e.target.value)} />

          <div style={s.rowTwo}>
            <div style={s.col}>
              <label style={s.lab}>Montant (€)</label>
              <input style={s.input} type="number" inputMode="decimal" value={montant}
                onChange={e => setMontant(e.target.value)} />
            </div>
            <div style={s.col}>
              <label style={s.lab}>Périodicité</label>
              <select style={s.input} value={periodicite}
                onChange={e => setPeriodicite(e.target.value)}>
                {PERIODICITES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <label style={s.lab}>Tél. service client</label>
          <input style={s.input} type="tel" value={telServiceClient}
            onChange={e => setTelServiceClient(e.target.value)} />

          <label style={s.lab}>Lien espace client</label>
          <input style={s.input} placeholder="https://…" value={lienEspaceClient}
            onChange={e => setLienEspaceClient(e.target.value)} />
        </div>

        {/* ZONE À COMPLÉTER */}
        <div style={s.zoneLabel}>
          <span style={{ ...s.zoneDot, background: '#534AB7' }} />
          À compléter à la main — absent des factures
        </div>
        <div style={s.card}>
          <div style={s.hint}>
            Renseigne au moins une paire de dates, sinon « À venir » n'aura rien à calculer.
          </div>

          <div style={s.rowTwo}>
            <div style={s.col}>
              <label style={s.lab}>Date de début</label>
              <input style={s.input} type="date" value={dateDebut}
                onChange={e => setDateDebut(e.target.value)} />
            </div>
            <div style={s.col}>
              <label style={s.lab}>Engagement (mois)</label>
              <input style={s.input} type="number" inputMode="numeric" value={dureeEngagement}
                onChange={e => setDureeEngagement(e.target.value)} />
            </div>
          </div>

          <div style={s.rowTwo}>
            <div style={s.col}>
              <label style={s.lab}>Renouvellement</label>
              <input style={s.input} type="date" value={dateRenouvellement}
                onChange={e => setDateRenouvellement(e.target.value)} />
            </div>
            <div style={s.col}>
              <label style={s.lab}>Préavis (jours)</label>
              <input style={s.input} type="number" inputMode="numeric" value={preavisJours}
                onChange={e => setPreavisJours(e.target.value)} />
            </div>
          </div>

          <label style={s.checkRow}>
            <input type="checkbox" checked={reconductionTacite}
              onChange={e => setReconductionTacite(e.target.checked)} />
            <span>Reconduction tacite</span>
          </label>

          <label style={s.lab}>Lien de résiliation</label>
          <input style={s.input} placeholder="https://…" value={lienResiliation}
            onChange={e => setLienResiliation(e.target.value)} />

          <label style={s.lab}>Statut</label>
          <select style={s.input} value={statut} onChange={e => setStatut(e.target.value)}>
            {STATUTS.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
          </select>

          <label style={s.lab}>Notes</label>
          <textarea style={{ ...s.input, minHeight: '64px', resize: 'vertical' }}
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button
          style={{ ...s.saveBtn, opacity: (!valide || saving) ? 0.5 : 1 }}
          disabled={!valide || saving}
          onClick={enregistrer}>
          {saving ? 'Enregistrement…' : 'Enregistrer le contrat'}
        </button>

        <div style={{ height: '24px' }} />

      </div>

      <BottomNav />
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', paddingBottom: '70px',
    background: '#f7f5f0', fontFamily: 'system-ui, sans-serif' },
  header: { padding: '12px 14px', display: 'flex', alignItems: 'center',
    gap: '10px', background: '#f7f5f0' },
  back: { width: '32px', height: '32px', borderRadius: '50%',
    background: 'white', border: '1px solid rgba(0,0,0,0.07)',
    color: '#534AB7', fontSize: '18px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: '18px', fontWeight: '700', color: '#1a1510', flex: 1 },
  scroll: { overflowY: 'auto', padding: '0 14px' },
  zoneLabel: { fontSize: '11px', fontWeight: '700', color: '#888',
    margin: '10px 2px 8px', display: 'flex', alignItems: 'center' },
  zoneDot: { display: 'inline-block', width: '8px', height: '8px',
    borderRadius: '50%', marginRight: '7px', flexShrink: 0 },
  card: { background: 'white', borderRadius: '12px', padding: '14px',
    marginBottom: '6px', display: 'flex', flexDirection: 'column', gap: '4px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' },
  lab: { fontSize: '11px', fontWeight: '600', color: '#888',
    margin: '8px 0 2px' },
  input: { width: '100%', padding: '11px 12px', borderRadius: '10px',
    border: '1px solid rgba(0,0,0,0.12)', fontSize: '15px',
    fontFamily: 'system-ui, sans-serif', background: '#fafafa',
    boxSizing: 'border-box' },
  rowTwo: { display: 'flex', gap: '10px' },
  col: { flex: 1, minWidth: 0 },
  checkRow: { display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '14px', color: '#1a1510', margin: '12px 0 4px', cursor: 'pointer' },
  hint: { fontSize: '12px', color: '#BA7517', background: '#FAEEDA',
    borderRadius: '8px', padding: '8px 10px', marginBottom: '6px' },
  error: { color: '#E24B4A', fontSize: '13px', padding: '10px 4px' },
  saveBtn: { width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
    background: '#534AB7', color: 'white', fontSize: '15px',
    fontWeight: '600', cursor: 'pointer', marginTop: '14px' },
}
