import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 6) {
      setError('Minimum 6 caracteres')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      // Sauvegarde le nouveau mot de passe localement
      localStorage.setItem('mindesk_pwd', password)
      setSuccess(true)
      setTimeout(() => onDone(), 2000)
    }
    setLoading(false)
  }

  return (
    <div style={s.container}>
      <div style={s.logoWrap}>
        <div style={s.logo}>
          <span style={s.mind}>Mind</span>
          <span style={s.esk}>esk</span>
        </div>
        <p style={s.sub}>Nouveau mot de passe</p>
      </div>

      {success ? (
        <div style={s.successBox}>
          <div style={{fontSize: '32px', marginBottom: '12px'}}>✅</div>
          <div style={s.successText}>Mot de passe mis a jour !</div>
          <div style={s.successSub}>Redirection...</div>
        </div>
      ) : (
        <form onSubmit={handleReset} style={s.form}>
          <input
            style={s.input}
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            style={s.input}
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Mise a jour...' : 'Valider le nouveau mot de passe'}
          </button>
        </form>
      )}
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#f7f5f0',
    fontFamily: 'system-ui, sans-serif', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '24px' },
  logoWrap: { textAlign: 'center', marginBottom: '32px' },
  logo: { fontSize: '32px', fontWeight: '700', marginBottom: '6px' },
  mind: { color: '#534AB7' },
  esk: { color: '#1D9E75' },
  sub: { fontSize: '14px', color: '#bbb' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px',
    width: '100%', maxWidth: '320px' },
  input: { padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid rgba(0,0,0,0.1)',
    fontSize: '15px', background: 'white', outline: 'none' },
  btn: { padding: '13px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #534AB7, #1D9E75)',
    color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  error: { color: '#E24B4A', fontSize: '13px', textAlign: 'center' },
  successBox: { textAlign: 'center' },
  successText: { fontSize: '18px', fontWeight: '600', color: '#1a1510', marginBottom: '6px' },
  successSub: { fontSize: '13px', color: '#bbb' },
}