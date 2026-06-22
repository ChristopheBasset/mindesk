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

export default function ContratForm({ session }) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [type, setType] = useState('')
  const [organisme, setOrganisme] = useState('')
  const [numeroContrat, setNumeroContrat] = useState('')
  const [montant, setMontant] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')                 // -> date_renouvellement
  const [delaiResiliation, setDelaiResiliation] = useState('') // -> preavis_jours (en jours)
  const [lienResiliation, setLienResiliation] = useState('')
  const [tel, setTel] = useState('')

  const valide = type && organisme.trim()

  const enregistrer = async () => {
    setError('')
    if (!valide) { setError('Le type et l\'organisme sont obligatoires.'); return }
    setSaving(true)
    // On n'ecrit pas date_limite_resiliation : Postgres la calcule
    // (date_renouvellement - preavis_jours).
    const { error } = await supabase.from('contrat').insert({
      user_id: session.user.id,
      type,
      organisme: organisme.trim(),
      numero_contrat: numeroContrat.trim() || null,
      montant: montant ? Number(montant) : null,
      periodicite: 'mensuel',
      date_debut: dateDebut || null,
      date_renouvellement: dateFin || null,
      preavis_jours: delaiResiliation ? parseInt(delaiResiliation, 10) : null,
      lien_resiliation: lienResiliation.trim() || null,
      tel_service_client: tel.trim() || null,
      statut: 'actif',
    })
    setSaving(false)
    if (error) { setError('Erreur : ' + error.message); return }
    navigate('/direct/avenir')
  }

  return (
    <div style={s.container}>

      <div style={s.header}>
        <button onClick={() => navigate(-1)} style={s.back}>←</button>
        <div style={s.title}>Nouveau contrat</div>
      </div>

      <div style={s.scroll}>
        <div style={s.card}>
          <label style={s.lab}>Type *</label>
          <select style={s.input} value={type} onChange={e => setType(e.target.value)}>
            <option value="">Choisir…</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <label style={s.lab}>Nom de l'organisme *</label>
          <input style={s.input} placeholder="ex. EDF" value={organisme}
            onChange={e => setOrganisme(e.target.value)} />

          <label style={s.lab}>Numéro de contrat</label>
          <input style={s.input} value={numeroContrat}
            onChange={e => setNumeroContrat(e.target.value)} />

          <label style={s.lab}>Montant mensuel (€)</label>
          <input style={s.input} type="number" inputMode="decimal" value={montant}
            onChange={e => setMontant(e.target.value)} />

          <div style={s.rowTwo}>
            <div style={s.col}>
              <label style={s.lab}>Date de début</label>
              <input style={s.input} type="date" value={dateDebut}
                onChange={e => setDateDebut(e.target.value)} />
            </div>
            <div style={s.col}>
              <label style={s.lab}>Date de fin</label>
              <input style={s.input} type="date" value={dateFin}
                onChange={e => setDateFin(e.target.value)} />
            </div>
          </div>

          <label style={s.lab}>Délai de résiliation (jours)</label>
          <input style={s.input} type="number" inputMode="numeric" value={delaiResiliation}
            onChange={e => setDelaiResiliation(e.target.value)} />

          <label style={s.lab}>Lien de résiliation</label>
          <input style={s.input} placeholder="https://…" value={lienResiliation}
            onChange={e => setLienResiliation(e.target.value)} />

          <label style={s.lab}>Téléphone</label>
          <input style={s.input} type="tel" value={tel}
            onChange={e => setTel(e.target.value)} />
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
  card: { background: 'white', borderRadius: '12px', padding: '14px',
    marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' },
  lab: { fontSize: '11px', fontWeight: '600', color: '#888', margin: '8px 0 2px' },
  input: { width: '100%', padding: '11px 12px', borderRadius: '10px',
    border: '1px solid rgba(0,0,0,0.12)', fontSize: '15px',
    fontFamily: 'system-ui, sans-serif', background: '#fafafa', boxSizing: 'border-box' },
  rowTwo: { display: 'flex', gap: '10px' },
  col: { flex: 1, minWidth: 0 },
  error: { color: '#E24B4A', fontSize: '13px', padding: '10px 4px' },
  saveBtn: { width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
    background: '#534AB7', color: 'white', fontSize: '15px',
    fontWeight: '600', cursor: 'pointer', marginTop: '14px' },
}
