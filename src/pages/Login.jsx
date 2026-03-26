import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { verifyBiometric, isBiometricSupported } from '../lib/webauthn'

function BiometricLogin({ onFail }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const credentialId = localStorage.getItem('mindesk_biometric_id')
  const savedEmail = localStorage.getItem('mindesk_email')
  const savedPwd = localStorage.getItem('mindesk_pwd')

  const handleBiometric = async () => {
    if (!isBiometricSupported()) {
      setError('Non supporte sur cet appareil')
      return
    }
    if (!credentialId) {
      setError('Empreinte non configuree')
      setTimeout(() => onFail(), 2000)
      return
    }

    setStatus('loading')
    setError('')

    try {
      const verified = await verifyBiometric(credentialId)
      if (verified) {
        const { error } = await supabase.auth.signInWithPassword({
          email: savedEmail,
          password: savedPwd
        })
        if (error) {
          setError('Session expiree, utilise email + mot de passe')
          setTimeout(() => onFail(), 2000)
        } else {
          setStatus('success')
        }
      }
    } catch (err) {
      setStatus('error')
      setError('Empreinte non reconnue')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <div style={{textAlign: 'center', padding: '20px 24px'}}>
      <div style={{
        fontSize: '80px', marginBottom: '20px',
        cursor: 'pointer',
        opacity: status === 'loading' ? 0.5 : 1,
        transition: 'opacity 0.2s'
      }} onClick={handleBiometric}>
        {status === 'success' ? '✅' : '👆'}
      </div>

      <div style={{fontSize: '18px', fontWeight: '600',
        color: '#1a1510', marginBottom: '8px'}}>
        {status === 'success' ? 'Connecte !'
          : status === 'loading' ? 'Verification...'
          : 'Empreinte digitale'}
      </div>

      <div style={{fontSize: '13px', color: '#bbb', marginBottom: '24px'}}>
        {status === 'idle' && 'Appuie sur le doigt pour te connecter'}
        {status === 'loading' && 'Pose ton doigt sur le capteur...'}
      </div>

      {error && (
        <div style={{color: '#E24B4A', fontSize: '13px', marginBottom: '16px'}}>
          {error}
        </div>
      )}

      {status === 'idle' && (
        <button onClick={handleBiometric} style={{
          padding: '12px 28px', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(135deg, #534AB7, #1D9E75)',
          color: 'white', fontSize: '14px', fontWeight: '600',
          cursor: 'pointer', marginBottom: '16px'
        }}>
          Scanner mon empreinte
        </button>
      )}

      <div>
        <button onClick={onFail} style={{
          background: 'none', border: 'none', color: '#bbb',
          fontSize: '12px', cursor: 'pointer', textDecoration: 'underline'
        }}>
          Utiliser une autre methode
        </button>
      </div>
    </div>
  )
}

export default function Login() {
  const [mode, setMode] = useState('choice')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const pinActive = localStorage.getItem('mindesk_pin_active') === 'true'
  const pinCode = localStorage.getItem('mindesk_pin')
  const savedEmail = localStorage.getItem('mindesk_email')
  const bioActive = localStorage.getItem('mindesk_biometric_active') === 'true'

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) {
      localStorage.setItem('mindesk_email', email)
      localStorage.setItem('mindesk_pwd', password)
    } else {
      setError('Email ou mot de passe incorrect')
    }
    setLoading(false)
  }

  const handlePinDigit = async (d) => {
    const newPin = pin + d
    setPin(newPin)
    if (newPin.length === 4) {
      if (newPin === pinCode) {
        const savedPwd = localStorage.getItem('mindesk_pwd')
        const { error } = await supabase.auth.signInWithPassword({
          email: savedEmail,
          password: savedPwd
        })
        if (error) {
          setError('Session expiree, utilise email + mot de passe')
          setTimeout(() => setMode('email'), 2000)
        }
      } else {
        setError('Code incorrect')
        setPin('')
        setTimeout(() => setError(''), 2000)
      }
    }
  }

  const handleDelete = () => setPin(pin.slice(0, -1))

  // PAGE CHOIX
  if (mode === 'choice') {
    return (
      <div style={s.container}>
        <div style={s.logoWrap}>
          <div style={s.logo}>
            <span style={s.logoMind}>Mind</span>
            <span style={s.logoEsk}>esk</span>
          </div>
          <p style={s.sub}>Ton bureau personnel intelligent</p>
        </div>

        <div style={s.choiceList}>

          {pinActive && pinCode && savedEmail && (
            <button onClick={() => setMode('pin')} style={s.choiceBtn}>
              <div style={{...s.choiceIcon, background: '#EEEDFE'}}>🔐</div>
              <div style={s.choiceBody}>
                <div style={s.choiceTitle}>Code PIN</div>
                <div style={s.choiceSub}>Acces rapide en 4 chiffres</div>
              </div>
              <div style={s.choiceArrow}>›</div>
            </button>
          )}

          {bioActive && (
            <button onClick={() => setMode('bio')} style={s.choiceBtn}>
              <div style={{...s.choiceIcon, background: '#E1F5EE'}}>👆</div>
              <div style={s.choiceBody}>
                <div style={s.choiceTitle}>Empreinte digitale</div>
                <div style={s.choiceSub}>Face ID ou Touch ID</div>
              </div>
              <div style={s.choiceArrow}>›</div>
            </button>
          )}

          {!bioActive && (
            <button onClick={() => setMode('bio')} style={s.choiceBtn}>
              <div style={{...s.choiceIcon, background: '#E1F5EE'}}>👆</div>
              <div style={s.choiceBody}>
                <div style={s.choiceTitle}>Empreinte digitale</div>
                <div style={s.choiceSub}>Face ID ou Touch ID</div>
              </div>
              <div style={s.choiceArrow}>›</div>
            </button>
          )}

          <button onClick={() => setMode('email')} style={s.choiceBtn}>
            <div style={{...s.choiceIcon, background: '#E6F1FB'}}>📧</div>
            <div style={s.choiceBody}>
              <div style={s.choiceTitle}>Email et mot de passe</div>
              <div style={s.choiceSub}>Connexion classique</div>
            </div>
            <div style={s.choiceArrow}>›</div>
          </button>

        </div>

        <p style={s.link}>
          Pas de compte ? <a href="/register">Creer un compte</a>
        </p>
      </div>
    )
  }

  // PAGE PIN
  if (mode === 'pin') {
    return (
      <div style={s.container}>
        <button onClick={() => setMode('choice')} style={s.back}>← Retour</button>
        <div style={s.logoWrap}>
          <div style={s.logo}>
            <span style={s.logoMind}>Mind</span>
            <span style={s.logoEsk}>esk</span>
          </div>
          <div style={{fontSize: '13px', color: '#bbb', marginTop: '8px'}}>
            {savedEmail}
          </div>
        </div>

        <div style={s.pinTitle}>Entre ton code PIN</div>

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
            <button key={i}
              onClick={() => k === '⌫' ? handleDelete() : k !== '' ? handlePinDigit(String(k)) : null}
              style={{...s.key, ...(k===''?s.keyEmpty:{}), ...(k==='⌫'?s.keyDel:{})}}>
              {k}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // PAGE BIOMETRIE
  if (mode === 'bio') {
    return (
      <div style={s.container}>
        <button onClick={() => setMode('choice')} style={s.back}>← Retour</button>
        <div style={s.logoWrap}>
          <div style={s.logo}>
            <span style={s.logoMind}>Mind</span>
            <span style={s.logoEsk}>esk</span>
          </div>
        </div>
        <BiometricLogin onFail={() => setMode('email')} />
      </div>
    )
  }

  // PAGE EMAIL
  return (
    <div style={s.container}>
      <button onClick={() => setMode('choice')} style={s.back}>← Retour</button>
      <div style={s.logoWrap}>
        <div style={s.logo}>
          <span style={s.logoMind}>Mind</span>
          <span style={s.logoEsk}>esk</span>
        </div>
      </div>
      <form onSubmit={handleEmailLogin} style={s.form}>
        <input style={s.input} type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={s.input} type="password" placeholder="Mot de passe"
          value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p style={s.error}>{error}</p>}
        <button style={s.btn} type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#f7f5f0',
    fontFamily: 'system-ui, sans-serif', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '24px', position: 'relative' },
  back: { position: 'absolute', top: '16px', left: '16px',
    background: 'none', border: 'none', color: '#534AB7',
    fontSize: '14px', cursor: 'pointer' },
  logoWrap: { textAlign: 'center', marginBottom: '32px' },
  logo: { fontSize: '32px', fontWeight: '700', marginBottom: '6px' },
  logoMind: { color: '#534AB7' },
  logoEsk: { color: '#1D9E75' },
  sub: { fontSize: '13px', color: '#bbb' },
  choiceList: { width: '100%', maxWidth: '320px',
    display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' },
  choiceBtn: { width: '100%', background: 'white',
    border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px',
    padding: '14px', display: 'flex', alignItems: 'center',
    gap: '12px', cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', textAlign: 'left' },
  choiceIcon: { width: '42px', height: '42px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', flexShrink: 0 },
  choiceBody: { flex: 1 },
  choiceTitle: { fontSize: '14px', fontWeight: '600',
    color: '#1a1510', marginBottom: '2px' },
  choiceSub: { fontSize: '11px', color: '#bbb' },
  choiceArrow: { fontSize: '20px', color: '#bbb' },
  pinTitle: { fontSize: '18px', fontWeight: '600',
    color: '#1a1510', marginBottom: '24px', textAlign: 'center' },
  dots: { display: 'flex', gap: '16px', marginBottom: '32px' },
  dot: { width: '16px', height: '16px', borderRadius: '50%',
    transition: 'background 0.2s' },
  keypad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px', width: '100%', maxWidth: '280px' },
  key: { height: '64px', borderRadius: '16px', border: 'none',
    background: 'white', fontSize: '22px', fontWeight: '500',
    color: '#1a1510', cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  keyEmpty: { background: 'transparent', boxShadow: 'none', cursor: 'default' },
  keyDel: { background: 'transparent', boxShadow: 'none',
    color: '#534AB7', fontSize: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px',
    width: '100%', maxWidth: '320px' },
  input: { padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid rgba(0,0,0,0.1)',
    fontSize: '15px', background: 'white', outline: 'none' },
  btn: { padding: '13px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #534AB7, #1D9E75)',
    color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  error: { color: '#E24B4A', fontSize: '13px',
    textAlign: 'center', marginBottom: '8px' },
  link: { fontSize: '13px', color: '#bbb' },
}