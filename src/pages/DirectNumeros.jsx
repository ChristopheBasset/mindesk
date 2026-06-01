import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

export default function DirectNumeros({ session }) {
  const navigate = useNavigate()
  const [numeros, setNumeros] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    let active = true
    supabase
      .from('identifiants')
      .select('*')
      .order('theme', { ascending: true })
      .order('label', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return
        if (!error && data) setNumeros(data)
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  const copier = async (valeur, id) => {
    try {
      await navigator.clipboard.writeText(valeur)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (e) {
      // presse-papier indisponible (contexte non sécurisé) — on ignore
    }
  }

  const parTheme = numeros.reduce((acc, n) => {
    const t = n.theme || 'Autres'
    ;(acc[t] = acc[t] || []).push(n)
    return acc
  }, {})

  return (
    <div style={s.container}>

      <div style={s.header}>
        <button onClick={() => navigate('/')} style={s.back}>←</button>
        <div style={s.title}>Mes numéros</div>
      </div>

      <div style={s.scroll}>

        {loading && <div style={s.muted}>Chargement…</div>}

        {!loading && numeros.length === 0 && (
          <div style={s.empty}>
            Aucun numéro enregistré pour l'instant.<br />
            Ajoute tes identifiants dans la table <strong>identifiants</strong> (Supabase),
            et ils apparaîtront ici, prêts à copier.
          </div>
        )}

        {Object.entries(parTheme).map(([theme, items]) => (
          <div key={theme} style={s.group}>
            <div style={s.groupTitle}>{theme}</div>
            {items.map(n => (
              <div key={n.id} style={s.row}>
                <div style={s.rowInfo}>
                  <div style={s.rowLabel}>{n.label}</div>
                  <div style={s.rowValue}>{n.value}</div>
                </div>
                <button
                  onClick={() => copier(n.value, n.id)}
                  style={{ ...s.copyBtn, ...(copiedId === n.id ? s.copyBtnOk : {}) }}>
                  {copiedId === n.id ? 'Copié ✓' : 'Copier'}
                </button>
              </div>
            ))}
          </div>
        ))}

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
  title: { fontSize: '18px', fontWeight: '700', color: '#1a1510' },
  scroll: { overflowY: 'auto', padding: '0 14px' },
  muted: { color: '#bbb', fontSize: '13px', padding: '20px', textAlign: 'center' },
  empty: { color: '#888', fontSize: '13px', padding: '24px 12px',
    textAlign: 'center', lineHeight: '1.6' },
  group: { marginBottom: '18px' },
  groupTitle: { fontSize: '11px', fontWeight: '700', color: '#999',
    margin: '8px 0', textTransform: 'capitalize' },
  row: { background: 'white', borderRadius: '12px', padding: '12px 14px',
    marginBottom: '8px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.04)' },
  rowInfo: { flex: 1, minWidth: 0 },
  rowLabel: { fontSize: '11px', color: '#888', marginBottom: '3px' },
  rowValue: { fontSize: '15px', fontWeight: '600', color: '#1a1510',
    fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' },
  copyBtn: { padding: '7px 12px', borderRadius: '9px',
    border: '1px solid rgba(83,74,183,0.25)', background: 'transparent',
    color: '#534AB7', fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' },
  copyBtnOk: { color: '#1D9E75', borderColor: 'rgba(29,158,117,0.35)' },
}
