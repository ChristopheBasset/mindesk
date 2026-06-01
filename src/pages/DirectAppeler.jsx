import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

export default function DirectAppeler({ session }) {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase
      .from('contacts')
      .select('*')
      .order('theme', { ascending: true })
      .order('nom', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return
        if (!error && data) setContacts(data)
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  const parTheme = contacts.reduce((acc, c) => {
    const t = c.theme || 'Autres'
    ;(acc[t] = acc[t] || []).push(c)
    return acc
  }, {})

  return (
    <div style={s.container}>

      <div style={s.header}>
        <button onClick={() => navigate('/')} style={s.back}>←</button>
        <div style={s.title}>Appeler</div>
      </div>

      <div style={s.scroll}>

        {loading && <div style={s.muted}>Chargement…</div>}

        {!loading && contacts.length === 0 && (
          <div style={s.empty}>
            Aucun contact enregistré pour l'instant.<br />
            Ajoute tes numéros utiles dans la table <strong>contacts</strong> (Supabase),
            et ils apparaîtront ici, prêts à appeler.
          </div>
        )}

        {Object.entries(parTheme).map(([theme, items]) => (
          <div key={theme} style={s.group}>
            <div style={s.groupTitle}>{theme}</div>
            {items.map(c => (
              <div key={c.id} style={s.row}>
                <div style={s.rowInfo}>
                  <div style={s.rowName}>{c.nom}</div>
                  <div style={s.rowMeta}>
                    {c.role ? c.role + ' · ' : ''}{c.telephone}
                  </div>
                </div>
                <a href={`tel:${(c.telephone || '').replace(/\s/g, '')}`} style={s.callBtn}>
                  Appeler
                </a>
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
  rowName: { fontSize: '15px', fontWeight: '600', color: '#1a1510' },
  rowMeta: { fontSize: '12px', color: '#888', marginTop: '3px',
    fontFamily: 'ui-monospace, monospace' },
  callBtn: { padding: '8px 14px', borderRadius: '9px',
    border: '1px solid rgba(29,158,117,0.35)', background: 'rgba(29,158,117,0.08)',
    color: '#1D9E75', fontSize: '13px', fontWeight: '600',
    textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' },
}
