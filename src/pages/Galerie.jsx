import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

export default function Galerie({ session }) {
  const navigate = useNavigate()
  const [captures, setCaptures] = useState([])
  const [filtre, setFiltre] = useState('tous')

  useEffect(() => {
    loadCaptures()
  }, [])

  const loadCaptures = async () => {
    const { data } = await supabase
      .from('captures')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) setCaptures(data)
  }

  const filtrees = captures.filter(c => {
    if (filtre === 'tous') return true
    return c.type === filtre
  })

  return (
    <div style={styles.container}>

      <div style={styles.topbar}>
        <button onClick={() => navigate('/')} style={styles.back}>←</button>
        <div style={styles.title}>Mes captures</div>
        <button
          onClick={() => navigate('/capture')}
          style={styles.addBtn}>+</button>
      </div>

      {/* FILTRES */}
      <div style={styles.filtres}>
        {['tous', 'photo', 'idea'].map(f => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            style={{...styles.filtreBtn, ...(filtre === f ? styles.filtreActive : {})}}>
            {f === 'tous' ? 'Tous' : f === 'photo' ? '📸 Photos' : '💡 Idees'}
          </button>
        ))}
      </div>

      {/* LISTE */}
      {filtrees.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>
            {filtre === 'photo' ? '📸' : filtre === 'idea' ? '💡' : '✨'}
          </div>
          <p style={styles.emptyText}>Aucune capture pour l instant</p>
          <button
            onClick={() => navigate('/capture')}
            style={styles.emptyBtn}>
            Faire ma premiere capture
          </button>
        </div>
      ) : (
        <div style={styles.liste}>
          {filtrees.map(c => (
            <div key={c.id} style={styles.card}>
              {c.type === 'photo' && c.image_url && (
                <img src={c.image_url} style={styles.img} alt="capture" />
              )}
              <div style={styles.cardBody}>
                <div style={styles.cardTop}>
                  <div style={{
                    ...styles.typeBadge,
                    background: c.type === 'photo' ? 'rgba(192,113,90,0.12)' : 'rgba(90,138,181,0.12)',
                    color: c.type === 'photo' ? '#c0715a' : '#5a8ab5'
                  }}>
                    {c.type === 'photo' ? '📸 Photo' : '💡 Idee'}
                  </div>
                  <div style={styles.date}>
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                {c.content && (
                  <div style={styles.content}>{c.content}</div>
                )}
                <div style={styles.tag}>{c.tag}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', paddingBottom: '80px',
    background: 'linear-gradient(160deg, #e8f0f8 0%, #f7ede8 55%, #f2e4dc 100%)',
    fontFamily: 'system-ui, sans-serif' },
  topbar: { background: 'rgba(255,255,255,0.8)', padding: '12px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(180,140,120,0.12)' },
  back: { background: 'none', border: 'none', fontSize: '20px',
    cursor: 'pointer', color: '#5a8ab5', padding: '4px 8px' },
  title: { fontSize: '16px', fontWeight: '600', color: '#2a2320' },
  addBtn: { width: '32px', height: '32px', borderRadius: '50%', border: 'none',
    background: 'linear-gradient(135deg, #c0715a, #5a8ab5)',
    color: 'white', fontSize: '20px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center' },
  filtres: { display: 'flex', gap: '8px', padding: '12px 14px',
    borderBottom: '1px solid rgba(180,140,120,0.08)' },
  filtreBtn: { padding: '6px 14px', borderRadius: '16px',
    border: '1.5px solid rgba(0,0,0,0.08)', background: 'white',
    fontSize: '12px', color: '#8a7a70', cursor: 'pointer' },
  filtreActive: { background: '#5a8ab5', color: 'white', border: '1.5px solid #5a8ab5' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '60px 24px', textAlign: 'center' },
  emptyText: { fontSize: '14px', color: '#b0a090', marginBottom: '20px' },
  emptyBtn: { padding: '12px 24px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #c0715a, #5a8ab5)',
    color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  liste: { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { background: 'rgba(255,255,255,0.85)', borderRadius: '14px',
    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  img: { width: '100%', maxHeight: '200px', objectFit: 'cover' },
  cardBody: { padding: '12px' },
  cardTop: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '8px' },
  typeBadge: { padding: '3px 8px', borderRadius: '8px',
    fontSize: '11px', fontWeight: '600' },
  date: { fontSize: '10px', color: '#b0a090' },
  content: { fontSize: '13px', color: '#2a2320', lineHeight: '1.5',
    marginBottom: '6px' },
  tag: { fontSize: '10px', color: '#b0a090', textTransform: 'uppercase',
    letterSpacing: '0.5px' },
}