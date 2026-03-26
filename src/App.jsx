import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Capture from './pages/Capture'
import Galerie from './pages/Galerie'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(160deg, #e8f0f8 0%, #f2e4dc 100%)' }}>
      <p style={{ color: '#b0a090', fontSize: '16px' }}>Chargement...</p>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session ? <Home session={session} /> : <Login />} />
        <Route path="/capture" element={session ? <Capture session={session} /> : <Navigate to="/" />} />
        <Route path="/galerie" element={session ? <Galerie session={session} /> : <Navigate to="/" />} />
        <Route path="/register" element={session ? <Navigate to="/" /> : <Register />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}