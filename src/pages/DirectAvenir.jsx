import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

// Ordre d'affichage des groupes (le plus urgent en premier)
const URGENCES = ['imminent', 'à venir', 'passé']

const URGENCE_LABEL = {
  'imminent': 'Imminent',
  'à venir': 'À venir',
  'passé': 'Passé',
}

// La vue renvoie une date ISO (AAAA-MM-JJ) ; on l'affiche en JJ/MM/AAAA.
// Découpage de la chaîne (pas de new Date) pour éviter tout décalage de fuseau.
const formatDate = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function DirectAvenir({ session }) {
  const navigate = useNavigate()
  const [echeances, setEcheances] = useState([])
  const [loading, setLoading] = useState(true)

  // Lecture seule : on lit la VUE echeance (pas une table, donc pas d'insert).
  const charger = () => {
    supabase
      .from('echeance')
      .select('*')
      .order('date_echeance', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setEcheances(data)
        setLoading(false)
      })
  }

  useEffect(() => { charger() }, [])

  // Groupement par urgence (au lieu du thème)
  const parUrgence = echeances.reduce((acc, e) => {
    const u = e.urgence || 'à venir'
    ;(acc[u] = acc[u] || []).push(e)
    return acc
  }, {})

  // Action portée par la ligne : lien (résiliation / espace client) ou téléphone
  const actionDe = (e) => {
    if (e.lien_action) {
      return {
        type: 'lien',
        href: e.lien_action,
        label: e.nature === 'resiliation' ? 'Résilier' : 'Ouvrir',
      }
    }
    if (e.tel_action) {
      return {
        type: 'tel',
        href: `tel:${(e.tel_action || '').replace(/\s/g, '')}`,
        label: 'Appeler',
      }
    }
    return null
  }

  return (
    <div style={s.container}>

      <div style={s.header}>
        <button onClick={() => navigate('/')} style={s.back}>←</button>
        <div style={s.title}>À venir</div>
      </div>

      <div style={s.scroll}>

        {loading && <div style={s.muted}>Chargement…</div>}

        {!loading && echeances.length === 0 && (
          <div style={s.empty}>
            Aucune échéance pour l'instant.<br />
            Ajoute un contrat : ses dates clés apparaîtront ici toutes seules.
          </div>
        )}

        {URGENCES.map((u) => {
          const items = parUrgence[u]
          if (!items || items.length === 0) return null
          return (
            <div key={u} style={s.group}>
              <div style={{ ...s.groupTitle, ...(s.groupTitleByUrgence[u] || {}) }}>
                {URGENCE_LABEL[u]}
              </div>
              {items.map((e) => {
                const action = actionDe(e)
                return (
                  <div key={`${e.contrat_id}-${e.nature}-${e.date_echeance}`} style={s.row}>
                    <div style={s.rowInfo}>
                      <div style={s.rowName}>{e.titre}</div>
                      <div style={s.rowMeta}>{formatDate(e.date_echeance)}</div>
                    </div>
                    {action && (
                      action.type === 'tel'
                        ? <a href={action.href} style={s.actionBtn}>{action.label}</a>
                        : <a href={action.href} target="_blank" rel="noopener noreferrer" style={s.actionBtn}>{action.label}</a>
                    )}
                  </div>
                )
              })}
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
  scroll: { overflowY: 'auto', padding: '0 14px' },
  muted: { color: '#bbb', fontSize: '13px', padding: '20px', textAlign: 'center' },
  empty: { color: '#888', fontSize: '13px', padding: '24px 12px',
    textAlign: 'center', lineHeight: '1.6' },
  group: { marginBottom: '18px' },
  groupTitle: { fontSize: '11px', fontWeight: '700', color: '#999',
    margin: '8px 0', textTransform: 'capitalize' },
  groupTitleByUrgence: {
    'imminent': { color: '#854F0B' },
    'à venir': { color: '#534AB7' },
    'passé': { color: '#bbb' },
  },
  row: { background: 'white', borderRadius: '12px', padding: '12px 14px',
    marginBottom: '8px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.04)' },
  rowInfo: { flex: 1, minWidth: 0 },
  rowName: { fontSize: '15px', fontWeight: '600', color: '#1a1510',
    lineHeight: '1.35' },
  rowMeta: { fontSize: '13px', color: '#666', marginTop: '4px', fontWeight: '500' },
  actionBtn: { padding: '8px 14px', borderRadius: '9px',
    border: '1px solid rgba(83,74,183,0.30)', background: 'rgba(83,74,183,0.08)',
    color: '#534AB7', fontSize: '13px', fontWeight: '600',
    textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' },
}
