import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Capture from './pages/Capture'
import Galerie from './pages/Galerie'
import SetupPin from './pages/SetupPin'
import PinLogin from './pages/PinLogin'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(true)

  const pinActive = localStorage.getItem('mindesk_pin_active') === 'true'
  const pinCode = localStorage.getItem('mindesk_pin')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) setLocked(true)
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f7f5f0' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          <span style={{ color: '#534AB7' }}>Mind</span>
          <span style={{ color: '#1D9E75' }}>esk</span>
        </div>
        <p style={{ color: '#bbb', fontSize: '14px' }}>Chargement...</p>
      </div>
    </div>
  )

  // PIN actif + session valide + app verrouillée
  if (session && pinActive && pinCode && locked) {
    return (
      <BrowserRouter>
        <PinLogin onSuccess={() => setLocked(false)} />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session
          ? <Home session={session} onLock={() => setLocked(true)} />
          : <Login />}
        />
        <Route path="/capture" element={session ? <Capture session={session} /> : <Navigate to="/" />} />
        <Route path="/galerie" element={session ? <Galerie session={session} /> : <Navigate to="/" />} />
        <Route path="/setup-pin" element={session ? <SetupPin /> : <Navigate to="/" />} />
        <Route path="/register" element={session ? <Navigate to="/" /> : <Register />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}