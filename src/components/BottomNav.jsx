import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
  { path: '/',             icon: '🏠', label: 'Accueil'      },
  { path: '/galerie',      icon: '📸', label: 'Captures'     },
  { path: '/portefeuille', icon: '💳', label: 'Portefeuille' },
  { path: '/profil',       icon: '👤', label: 'Profil'       },
]

  return (
    <div style={styles.nav}>
      {items.map(item => (
        <div
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            ...styles.item,
            color: location.pathname === item.path ? '#c0715a' : '#c0b0a0'
          }}>
          <span style={styles.icon}>{item.icon}</span>
          <span style={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

const styles = {
  nav: { position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'rgba(255,255,255,0.95)',
    borderTop: '1px solid rgba(180,140,120,0.12)',
    display: 'flex', justifyContent: 'space-around',
    padding: '10px 0 16px', zIndex: 100 },
  item: { display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '2px', cursor: 'pointer', transition: 'color 0.2s' },
  icon: { fontSize: '20px' },
  label: { fontSize: '10px', fontWeight: '500' },
}