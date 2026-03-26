import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PinLogin({ onSuccess }) {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const savedPin = localStorage.getItem('mindesk_pin')

  const handleDigit = (d) => {
    const newPin = pin + d
    setPin(newPin)
    if (newPin.length === 4) {
      if (newPin === savedPin) {
        onSuccess()
      } else {
        setError('Code incorrect')
        setPin('')
        setTimeout(() => setError(''), 2000)
      }
    }
  }

  const handleDelete = () => setPin(pin.slice(0, -1))

  return (
    <div style={s.container}>
      <div style={s.body}>
        <div style={s.icon}>👋</div>
        <div style={s.title}>Bon retour !</div>
        <div style={s.sub}>Entre ton code PIN</div>

        {error && <div style={s.error}>{error}</div>}

        <div style={s.dots}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              ...s.dot,
              background: i < pin.length ? '#534AB7' : 'rgba(83,74,183,0.15)'
            }} />
          ))}
        </div>

        <div style={s.keypad}>
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
            <button
              key={i}
              onClick={() => k === '⌫' ? handleDelete() : k !== '' ? handleDigit(String(k)) : null}
              style={{
                ...s.key,
                ...(k === '' ? s.keyEmpty : {}),
                ...(k === '⌫' ? s.keyDel : {})
              }}>
              {k}
            </button>
          ))}
        </div>

        <button onClick={() => navigate('/login-email')} style={s.altBtn}>
          Utiliser email / mot de passe
        </button>
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#f7f5f0',
    fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' },
  body: { flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '24px' },
  icon: { fontSize: '48px', marginBottom: '16px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a1510', marginBottom: '8px' },
  sub: { fontSize: '13px', color: '#bbb', marginBottom: '32px' },
  error: { color: '#E24B4A', fontSize: '13px', marginBottom: '16px' },
  dots: { display: 'flex', gap: '16px', marginBottom: '40px' },
  dot: { width: '16px', height: '16px', borderRadius: '50%', transition: 'background 0.2s' },
  keypad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px', width: '100%', maxWidth: '280px' },
  key: { height: '64px', borderRadius: '16px', border: 'none',
    background: 'white', fontSize: '22px', fontWeight: '500',
    color: '#1a1510', cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  keyEmpty: { background: 'transparent', boxShadow: 'none', cursor: 'default' },
  keyDel: { background: 'transparent', boxShadow: 'none', color: '#534AB7', fontSize: '20px' },
  altBtn: { marginTop: '24px', background: 'none', border: 'none',
    color: '#bbb', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' },
}