import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Capture from './pages/Capture'
import Galerie from './pages/Galerie'
import SetupPin from './pages/SetupPin'
import SetupBiometric from './pages/SetupBiometric'
import Portefeuille from './pages/Portefeuille'
import ModuleDetail from './pages/modules/ModuleDetail'
import ModuleList from './pages/modules/ModuleList'
import { LIST_MODULE_KEYS } from './pages/modules/ModuleList'
import ResetPassword from './pages/ResetPassword'
import VoiceButton from './components/VoiceButton'
import DirectNumeros from './pages/DirectNumeros'
import DirectAppeler from './pages/DirectAppeler'

// Détection immédiate du recovery au chargement
const isRecoveryLink = window.location.hash.includes('type=recovery')

function ModuleRouter({ session }) {
  const { groupeId, moduleId } = useParams()
  const key = `${groupeId}-${moduleId}`
  if (LIST_MODULE_KEYS.includes(key)) {
    return <ModuleList session={session} />
  }
  return <ModuleDetail session={session} />
}

function PinLock({ onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const pinCode = localStorage.getItem('mindesk_pin')

  const handleDigit = (d) => {
    const newPin = pin + d
    setPin(newPin)
    if (newPin.length === 4) {
      if (newPin === pinCode) {
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
      <div style={s.logoWrap}>
        <div style={s.logo}>
          <span style={{color:'#534AB7'}}>Mind</span>
          <span style={{color:'#1D9E75'}}>esk</span>
        </div>
        <div style={{fontSize:'13px', color:'#bbb', marginTop:'8px'}}>
          {localStorage.getItem('mindesk_email')}
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
            onClick={() => k === '⌫' ? handleDelete() : k !== '' ? handleDigit(String(k)) : null}
            style={{...s.key, ...(k===''?s.keyEmpty:{}), ...(k==='⌫'?s.keyDel:{})}}>
            {k}
          </button>
        ))}
      </div>
    </div>
  )
}

const s = {
  container: { minHeight:'100vh', background:'#f7f5f0',
    fontFamily:'system-ui, sans-serif', display:'flex',
    flexDirection:'column', alignItems:'center',
    justifyContent:'center', padding:'24px' },
  logoWrap: { textAlign:'center', marginBottom:'32px' },
  logo: { fontSize:'32px', fontWeight:'700' },
  pinTitle: { fontSize:'18px', fontWeight:'600', color:'#1a1510',
    marginBottom:'24px', textAlign:'center' },
  error: { color:'#E24B4A', fontSize:'13px', marginBottom:'16px' },
  dots: { display:'flex', gap:'16px', marginBottom:'32px' },
  dot: { width:'16px', height:'16px', borderRadius:'50%', transition:'background 0.2s' },
  keypad: { display:'grid', gridTemplateColumns:'repeat(3,1fr)',
    gap:'12px', width:'100%', maxWidth:'280px' },
  key: { height:'64px', borderRadius:'16px', border:'none',
    background:'white', fontSize:'22px', fontWeight:'500',
    color:'#1a1510', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  keyEmpty: { background:'transparent', boxShadow:'none', cursor:'default' },
  keyDel: { background:'transparent', boxShadow:'none', color:'#534AB7', fontSize:'20px' },
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(true)
  const [unlockedBy, setUnlockedBy] = useState(null)
  const [passwordRecovery, setPasswordRecovery] = useState(isRecoveryLink)

  const pinActive = localStorage.getItem('mindesk_pin_active') === 'true'
  const pinCode = localStorage.getItem('mindesk_pin')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true)
      }
      if (!session) {
        setLocked(true)
        setUnlockedBy(null)
      }
      if (event === 'SIGNED_IN' && locked) {
        setUnlockedBy('login')
        setLocked(false)
      }
    })

    // Sauvegarde le timestamp toutes les 5 secondes
    const interval = setInterval(() => {
      localStorage.setItem('mindesk_last_seen', Date.now().toString())
    }, 5000)

    // Au lancement, vérifie si l'app était fermée depuis longtemps
    const pinActive = localStorage.getItem('mindesk_pin_active') === 'true'
    const pinCode = localStorage.getItem('mindesk_pin')
    const lastSeen = localStorage.getItem('mindesk_last_seen')
    if (pinActive && pinCode && lastSeen) {
      const elapsed = Date.now() - parseInt(lastSeen)
      if (elapsed > 30000) {
        setLocked(true)
        setUnlockedBy(null)
      }
    }

    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#f7f5f0' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'32px', fontWeight:'700', marginBottom:'8px' }}>
          <span style={{ color:'#534AB7' }}>Mind</span>
          <span style={{ color:'#1D9E75' }}>esk</span>
        </div>
        <p style={{ color:'#bbb', fontSize:'14px' }}>Chargement...</p>
      </div>
    </div>
  )

  if (passwordRecovery) {
    return <ResetPassword onDone={() => {
      setPasswordRecovery(false)
      window.location.hash = ''
    }} />
  }

  if (session && pinActive && pinCode && locked && unlockedBy !== 'login') {
    return (
      <BrowserRouter>
        <PinLock onSuccess={() => setLocked(false)} />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          session
            ? <Home session={session} onLock={() => setLocked(true)} />
            : <Login />
        } />
        <Route path="/capture" element={session ? <Capture session={session} /> : <Navigate to="/" />} />
        <Route path="/galerie" element={session ? <Galerie session={session} /> : <Navigate to="/" />} />
        <Route path="/portefeuille" element={session ? <Portefeuille session={session} /> : <Navigate to="/" />} />
        <Route path="/setup-pin" element={session ? <SetupPin /> : <Navigate to="/" />} />
        <Route path="/setup-biometric" element={session ? <SetupBiometric session={session} /> : <Navigate to="/" />} />
        <Route path="/module/:groupeId/:moduleId" element={
          session ? <ModuleRouter session={session} /> : <Navigate to="/" />
        } />
        <Route path="/register" element={session ? <Navigate to="/" /> : <Register />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/direct/numeros" element={session ? <DirectNumeros session={session} /> : <Navigate to="/" />} />
        <Route path="/direct/appeler" element={session ? <DirectAppeler session={session} /> : <Navigate to="/" />} />
      </Routes>

      {/* Commande vocale */}
      {session && <VoiceButton />}

    </BrowserRouter>
  )
}
