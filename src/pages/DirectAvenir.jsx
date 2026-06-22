import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

const TYPE_LABEL = {
  energie: 'Énergie',
  telecom: 'Télécom',
  mutuelle: 'Mutuelle',
  assurance_auto: 'Assurance auto',
  assurance_habitation: 'Assurance habitation',
  autre: 'Autre',
}

// Date ISO (AAAA-MM-JJ) -> JJ/MM/AAAA, sans objet Date (pas de décalage de fuseau)
const formatDate = (iso) => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// Urgence calculée à partir de la date limite de résiliation
const urgenceDe = (iso) => {
  if (!iso) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(iso + 'T00:00:00')
  const jours = Math.round((d - today) / 86400000)
  if (jours < 0) return { label: 'Passé', color: '#bbb' }
  if (jours <= 30) return { label: 'Imminent', color: '#854F0B' }
  return { label: 'À venir', color: '#534AB7' }
}

export default function DirectAvenir({ session }) {
  const navigate = useNavigate()
  const [contrats, setContrats] = useState([])
  const [loading, setLoading] = useState(true)

  // Un bloc par contrat : on lit directement la table (dates déjà calculées par Postgres).
  const charger = () => {
    supabase
      .from('contrat')
      .select('id, type, organisme, date_limite_resiliation, date_renouvellement')
      .eq('statut', 'actif')
      .order('date_limite_resiliation', { ascending: true, nullsFirst: false })
      .then(({ data, error }) => {
        if (!error && data) setContrats(data)
        setLoading(false)
      })
  }

  useEffect(() => { charger() }, [])

  return (
    <div style={s.container}>

      <div style={s.header}>
        <button onClick={() => navigate('/')} style={s.back}>←</button>
        <div style={s.title}>À venir</div>
        <button onClick={() => navigate('/contrat/nouveau')} style={s.addBtn}>+ Contrat</button>
      </div>

      <div style={s.scroll}>

        {loading && <div style={s.muted}>Chargement…</div>}

        {!loading && contrats.length === 0 && (
          <div style={s.empty}>
            Aucun contrat pour l'instant.<br />
            Ajoutes-en un avec « + Contrat ».
          </div>
        )}

        {contrats.map((c) => {
          const u = urgenceDe(c.date_limite_resiliation)
          return (
            <div key={c.id} style={s.card}>
              <div style={s.cardTop}>
                <span style={s.typeTag}>{TYPE_LABEL[c.type] || c.type}</span>
                {u && <span style={{ ...s.urg, color: u.color }}>{u.label}</span>}
              </div>
              <div style={s.org}>{c.organisme}</div>
              <div style={s.dateLine}>
                <span style={s.dateLabel}>Résiliation avant le</span>
                <span style={{ ...s.dateVal, color: u ? u.color : '#1a1510' }}>
                  {formatDate(c.date_limite_resiliation)}
                </span>
              </div>
              <div style={s.dateLine}>
                <span style={s.dateLabel}>Fin de contrat</span>
                <span style={s.dateVal}>{formatDate(c.date_renouvellement)}</span>
              </div>
            </div>
          )
        })}

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
  addBtn: { padding: '7px 12px', borderRadius: '9px',
    border: '1px solid rgba(83,74,183,0.25)', background: 'rgba(83,74,183,0.08)',
    color: '#534AB7', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  scroll: { overflowY: 'auto', padding: '0 14px' },
  muted: { color: '#bbb', fontSize: '13px', padding: '20px', textAlign: 'center' },
  empty: { color: '#888', fontSize: '13px', padding: '24px 12px',
    textAlign: 'center', lineHeight: '1.6' },
  card: { background: 'white', borderRadius: '12px', padding: '12px 14px',
    marginBottom: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.04)' },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '6px' },
  typeTag: { fontSize: '11px', fontWeight: '700', color: '#534AB7',
    background: 'rgba(83,74,183,0.08)', borderRadius: '6px', padding: '3px 8px' },
  urg: { fontSize: '11px', fontWeight: '700' },
  org: { fontSize: '15px', fontWeight: '600', color: '#1a1510', marginBottom: '8px' },
  dateLine: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    padding: '3px 0' },
  dateLabel: { fontSize: '12px', color: '#888' },
  dateVal: { fontSize: '14px', fontWeight: '600', color: '#1a1510' },
}
