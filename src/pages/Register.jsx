import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.logo}>
        Mind<span style={styles.logoAccent}>esk</span>
      </h1>
      <p style={styles.sub}>Cree ton compte</p>
      {success ? (
        <div style={styles.successBox}>
          <p>Compte cree !</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            Verifie ton email pour confirmer.
          </p>
          <a href="/" style={styles.backLink}>Se connecter</a>
        </div>
      ) : (
        <form onSubmit={handleRegister} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Mot de passe (min. 6 caracteres)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creation...' : 'Creer mon compte'}
          </button>
        </form>
      )}
      <p style={styles.link}>
        Deja un compte ? <a href="/">Se connecter</a>
      </p>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(160deg, #e8f0f8 0%, #f2e4dc 100%)',
    padding: '24px'
  },
  logo: { fontSize: '36px', fontWeight: '700', color: '#2a2320', marginBottom: '6px' },
  logoAccent: { color: '#c0715a' },
  sub: { fontSize: '14px', color: '#b0a090', marginBottom: '32px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' },
  input: {
    padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid rgba(0,0,0,0.1)',
    fontSize: '15px', background: 'white', outline: 'none'
  },
  btn: {
    padding: '13px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #5a8ab5, #c0715a)',
    color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
  },
  error: { color: '#e07060', fontSize: '13px', textAlign: 'center' },
  successBox: {
    textAlign: 'center', background: 'white',
    padding: '24px', borderRadius: '16px', maxWidth: '320px'
  },
  backLink: { display: 'block', marginTop: '12px', color: '#5a8ab5' },
  link: { marginTop: '20px', fontSize: '13px', color: '#b0a090' }
}