import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

export default function Home({ session }) {
  const navigate = useNavigate()
  const [captures, setCaptures] = useState([])

  useEffect(() => { loadCaptures() }, [])

  const loadCaptures = async () => {
    const { data } = await supabase
      .from('captures')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(3)
    if (data) setCaptures(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={s.container}>

      <div style={s.topbar}>
        <div style={s.logo}>
          <span style={s.logoMind}>Mind</span>
          <span style={s.logoEsk}>esk</span>
        </div>
        <div style={s.dateChip}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
        </div>
        <button style={s.micBtn}>🎤</button>
      </div>

      <div style={s.aiBar}>
        <div style={s.aiDot} />
        <span style={s.aiHint}><strong style={s.aiStrong}>Que fais-je pour toi ?</strong> — parle ou ecris...</span>
      </div>

      <div style={s.sec}>Capture rapide</div>
      <div style={s.captureRow}>
        <button
          onClick={() => navigate('/capture?mode=photo')}
          style={{...s.capBtn, borderTop: '3px solid #D85A30'}}>
          <span style={s.capIcon}>📸</span>
          <div>
            <div style={s.capLabel}>Photo souvenir</div>
            <div style={s.capSub}>Resto, objet, lieu...</div>
          </div>
        </button>
        <button
          onClick={() => navigate('/capture?mode=idea')}
          style={{...s.capBtn, borderTop: '3px solid #378ADD'}}>
          <span style={s.capIcon}>💡</span>
          <div>
            <div style={s.capLabel}>Idee flash</div>
            <div style={s.capSub}>Avant de l oublier</div>
          </div>
        </button>
      </div>

      <div style={s.sec}>Mes services</div>
      <div style={s.svcGrid}>
        {services.map(sv => (
          <div key={sv.label} style={s.svcItem}>
            <div style={{...s.svcIcon, background: sv.bg}}>{sv.icon}</div>
            <div style={s.svcLabel}>{sv.label}</div>
          </div>
        ))}
        <div style={s.svcItem}>
          <div style={{...s.svcIcon, background: '#f5f5f5', border: '1.5px dashed #ddd'}}>
            <span style={{color: '#ccc', fontSize: '16px'}}>+</span>
          </div>
          <div style={{...s.svcLabel, color: '#ccc'}}>Ajouter</div>
        </div>
      </div>

      <div style={s.sec}>Modules</div>
      <div style={s.grid}>
        {modules.map(m => (
          <div key={m.title} style={s.mcard}>
            <div style={{...s.mstripe, background: m.color}} />
            <span style={s.micon}>{m.icon}</span>
            <div style={s.mtitle}>{m.title}</div>
            <div style={s.msub}>{m.sub}</div>
            {m.badge && (
              <div style={{...s.mbadge, background: m.badgeBg, color: m.color}}>
                {m.badge}
              </div>
            )}
          </div>
        ))}
      </div>

      {captures.length > 0 && (
        <>
          <div style={s.sec}>Dernieres captures</div>
          <div style={s.recentList}>
            {captures.map(c => (
              <div key={c.id} style={s.recItem}>
                <div style={{
                  ...s.recThumb,
                  background: c.type === 'photo' ? '#FAECE7' : '#E6F1FB'
                }}>
                  {c.type === 'photo' && c.image_url
                    ? <img src={c.image_url} style={s.recImg} alt="" />
                    : <span style={{fontSize: '16px'}}>{c.type === 'photo' ? '📸' : '💡'}</span>
                  }
                </div>
                <div style={s.recBody}>
                  <div style={s.recTitle}>{c.content || 'Sans note'}</div>
                  <div style={s.recMeta}>
                    {c.tag} · {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div style={{
                  ...s.recTag,
                  background: c.type === 'photo' ? '#FAECE7' : '#E6F1FB',
                  color: c.type === 'photo' ? '#993C1D' : '#185FA5'
                }}>
                  {c.type === 'photo' ? '📸' : '💡'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={s.logoutWrap}>
        <button onClick={handleLogout} style={s.logoutBtn}>Deconnexion</button>
      </div>

      <BottomNav />
    </div>
  )
}

const services = [
  { icon: '⚡', label: 'EDF',    bg: '#E6F1FB' },
  { icon: '📱', label: 'SFR',    bg: '#FCEBEB' },
  { icon: '🏦', label: 'Banque', bg: '#EEEDFE' },
  { icon: '📰', label: 'Medias', bg: '#FAEEDA' },
]

const modules = [
  { icon: '📋', title: 'Taches',       sub: '0 en attente',  color: '#534AB7', badgeBg: '#EEEDFE' },
  { icon: '📸', title: 'Souvenirs',    sub: '0 captures',    color: '#D85A30', badgeBg: '#FAECE7' },
  { icon: '📅', title: 'Agenda',       sub: 'Aucun RDV',     color: '#1D9E75', badgeBg: '#E1F5EE' },
  { icon: '💡', title: 'Idees',        sub: '0 idees',       color: '#7F77DD', badgeBg: '#EEEDFE' },
  { icon: '💳', title: 'Portefeuille', sub: '0 cartes',      color: '#BA7517', badgeBg: '#FAEEDA' },
  { icon: '🔔', title: 'Alertes',      sub: 'Aucune alerte', color: '#E24B4A', badgeBg: '#FCEBEB' },
]

const s = {
  container: { minHeight: '100vh', paddingBottom: '70px',
    background: '#f7f5f0', fontFamily: 'system-ui, sans-serif' },
  topbar: { padding: '12px 16px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', background: '#f7f5f0' },
  logo: { fontSize: '20px', fontWeight: '700' },
  logoMind: { color: '#534AB7' },
  logoEsk: { color: '#1D9E75' },
  dateChip: { background: 'white', border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '20px', padding: '4px 10px', fontSize: '10px', color: '#888' },
  micBtn: { width: '30px', height: '30px', background: '#534AB7', border: 'none',
    borderRadius: '50%', cursor: 'pointer', fontSize: '14px' },
  aiBar: { margin: '4px 14px 10px', background: 'white',
    border: '1.5px solid rgba(83,74,183,0.18)', borderRadius: '12px',
    padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '8px' },
  aiDot: { width: '7px', height: '7px', borderRadius: '50%',
    background: '#534AB7', flexShrink: 0 },
  aiHint: { fontSize: '11px', color: '#bbb' },
  aiStrong: { color: '#444', fontWeight: '500' },
  sec: { fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px',
    color: '#bbb', fontWeight: '600', padding: '0 14px',
    marginBottom: '7px', marginTop: '4px' },
  captureRow: { display: 'flex', gap: '7px', padding: '0 14px', marginBottom: '12px' },
  capBtn: { flex: 1, background: 'white', border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: '14px', padding: '12px 10px',
    display: 'flex', alignItems: 'center', gap: '8px',
    cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  capIcon: { fontSize: '20px' },
  capLabel: { fontSize: '11px', fontWeight: '600', color: '#1a1510', textAlign: 'left' },
  capSub: { fontSize: '9px', color: '#bbb', textAlign: 'left', marginTop: '1px' },
  svcGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
    gap: '4px', padding: '0 12px', marginBottom: '12px' },
  svcItem: { display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '4px', padding: '6px 2px', borderRadius: '10px' },
  svcIcon: { width: '40px', height: '40px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  svcLabel: { fontSize: '9px', color: '#888', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '7px', padding: '0 14px', marginBottom: '12px' },
  mcard: { background: 'white', borderRadius: '14px', padding: '12px',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.04)' },
  mstripe: { position: 'absolute', top: 0, left: 0,
    width: '100%', height: '3px', borderRadius: '14px 14px 0 0' },
  micon: { fontSize: '18px', marginBottom: '6px', display: 'block' },
  mtitle: { fontSize: '11px', fontWeight: '600', color: '#1a1510', marginBottom: '2px' },
  msub: { fontSize: '9.5px', color: '#bbb' },
  mbadge: { position: 'absolute', top: '9px', right: '9px',
    fontSize: '9px', fontWeight: '600', padding: '1px 5px', borderRadius: '7px' },
  recentList: { padding: '0 14px', marginBottom: '14px',
    display: 'flex', flexDirection: 'column', gap: '6px' },
  recItem: { background: 'white', borderRadius: '11px', padding: '9px 10px',
    display: 'flex', alignItems: 'center', gap: '9px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.04)' },
  recThumb: { width: '36px', height: '36px', borderRadius: '8px',
    flexShrink: 0, display: 'flex', alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden' },
  recImg: { width: '100%', height: '100%', objectFit: 'cover' },
  recBody: { flex: 1 },
  recTitle: { fontSize: '10.5px', fontWeight: '500', color: '#222', lineHeight: '1.3' },
  recMeta: { fontSize: '9px', color: '#bbb', marginTop: '1px' },
  recTag: { fontSize: '12px', padding: '4px 6px', borderRadius: '7px' },
  logoutWrap: { padding: '0 14px', marginBottom: '16px' },
  logoutBtn: { width: '100%', padding: '10px', borderRadius: '10px',
    border: '1px solid rgba(0,0,0,0.08)', background: 'transparent',
    color: '#bbb', fontSize: '12px', cursor: 'pointer' },
}