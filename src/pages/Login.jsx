import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  const pinActive = localStorage.getItem('mindesk_pin_active') === 'true'
  const pinCode = localStorage.getItem('mindesk_pin')
  const savedEmail = localStorage.getItem('mindesk_email')

  const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (!error) {
    localStorage.setItem('mindesk_email', email)
  } else {
    setError('Email ou mot de passe incorrect')
  }
  setLoading(false)
}

  const handlePinLogin = async (enteredPin) => {
    if (enteredPin === pinCode) {
      const { error } = await supabase.auth.signInWithPassword({
        email: savedEmail,
        password: localStorage.getItem('mindesk_pwd')
      })
      if (error) {
        setShowEmail(true)
      }
    }
  }

  // Si PIN activé et compte connu → afficher clavier PIN
  if (pinActive && pinCode && savedEmail && !showEmail) {
    return <PinScreen
      onSuccess={handlePinLogin}
      onUseEmail={() => setShowEmail(true)}
      email={savedEmail}
    />
  }

  return (
    <div style={s.container}>
      <div style={s.logoWrap}>
        <div style={s.logo}>
          <span style={s.logoMind}>Mind</span>
          <span style={s.logoEsk}>esk</span>
        </div>
        <p style={s.sub}>Ton bureau personnel intelligent</p>
      </div>

      <form onSubmit={handleLogin} style={s.form}>
        <input style={s.input} type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={s.input} type="password" placeholder="Mot de passe"
          value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p style={s.error}>{error}</p>}
        <button style={s.btn} type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <p style={s.link}>Pas de compte ? <a href="/register">Creer un compte</a></p>
    </div>
  )
}

function PinScreen({ onSuccess, onUseEmail, email }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleDigit = (d) => {
    const newPin = pin + d
    setPin(newPin)
    if (newPin.length === 4) {
      onSuccess(newPin)
      if (newPin !== localStorage.getItem('mindesk_pin')) {
        setError('Code incorrect')
        setPin('')
        setTimeout(() => setError(''), 2000)
      }
    }
  }

  const handleDelete = () => setPin(pin.slice(0, -1))

  return (
    <div style={s.container}>
      <div style={s.logoWrap}>
        <div style={s.logo}>
          <span style={s.logoMind}>Mind</span>
          <span style={s.logoEsk}>esk</span>
        </div>
        <div style={s.avatar}>👤</div>
        <div style={s.welcomeName}>Bonjour 👋</div>
        <div style={s.welcomeEmail}>{email}</div>
      </div>

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

      <button onClick={onUseEmail} style={s.altBtn}>
        Utiliser email / mot de passe
      </button>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#f7f5f0',
    fontFamily: 'system-ui, sans-serif', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '24px' },
  logoWrap: { textAlign: 'center', marginBottom: '24px' },
  logo: { fontSize: '32px', fontWeight: '700', marginBottom: '6px' },
  logoMind: { color: '#534AB7' },
  logoEsk: { color: '#1D9E75' },
  sub: { fontSize: '13px', color: '#bbb' },
  avatar: { fontSize: '48px', margin: '12px 0 8px' },
  welcomeName: { fontSize: '20px', fontWeight: '600', color: '#1a1510', marginBottom: '4px' },
  welcomeEmail: { fontSize: '12px', color: '#bbb' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px',
    width: '100%', maxWidth: '320px' },
  input: { padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid rgba(0,0,0,0.1)',
    fontSize: '15px', background: 'white', outline: 'none' },
  btn: { padding: '13px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #534AB7, #1D9E75)',
    color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  error: { color: '#E24B4A', fontSize: '13px', textAlign: 'center', marginBottom: '8px' },
  link: { marginTop: '20px', fontSize: '13px', color: '#bbb' },
  dots: { display: 'flex', gap: '16px', marginBottom: '32px' },
  dot: { width: '16px', height: '16px', borderRadius: '50%', transition: 'background 0.2s' },
  keypad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px', width: '100%', maxWidth: '280px' },
  key: { height: '64px', borderRadius: '16px', border: 'none',
    background: 'white', fontSize: '22px', fontWeight: '500',
    color: '#1a1510', cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  keyEmpty: { background: 'transparent', boxShadow: 'none', cursor: 'default' },
  keyDel: { background: 'transparent', boxShadow: 'none', color: '#534AB7', fontSize: '20px' },
  altBtn: { marginTop: '20px', background: 'none', border: 'none',
    color: '#bbb', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' },
}