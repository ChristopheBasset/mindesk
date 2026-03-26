import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { registerBiometric, isBiometricSupported } from '../lib/webauthn'

export default function SetupBiometric({ session }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState('')

  const handleRegister = async () => {
    if (!isBiometricSupported()) {
      setError('Empreinte digitale non supportee sur cet appareil')
      return
    }

    setStatus('loading')
    setError('')

    try {
      const { credentialId, publicKey } = await registerBiometric(
        session.user.id,
        session.user.email
      )

      const { error: dbError } = await supabase
        .from('webauthn_credentials')
        .insert({
          user_id: session.user.id,
          credential_id: credentialId,
          public_key: publicKey,
        })

      if (dbError) throw dbError

      localStorage.setItem('mindesk_biometric_id', credentialId)
      localStorage.setItem('mindesk_biometric_active', 'true')

      setStatus('success')
      setTimeout(() => navigate('/'), 2000)

    } catch (err) {
      setStatus('error')
      setError('Enregistrement echoue. Verifie les permissions.')
    }
  }

  return (
    <div style={s.container}>
      <button onClick={() => navigate('/')} style={s.skip}>Passer</button>

      <div style={s.logoWrap}>
        <div style={s.logo}>
          <span style={s.logoMind}>Mind</span>
          <span style={s.logoEsk}>esk</span>
        </div>
      </div>

      <div style={s.iconWrap}>
        {status === 'success'
          ? <div style={s.iconBig}>✅</div>
          : <div style={s.iconBig}>👆</div>
        }
      </div>

      <div style={s.title}>
        {status === 'success'
          ? 'Empreinte activee !'
          : 'Activer l empreinte digitale'}
      </div>

      <div style={s.sub}>
        {status === 'success'
          ? 'Tu peux maintenant te connecter avec ton empreinte'
          : 'Connecte-toi en un geste, sans mot de passe'}
      </div>

      {error && <div style={s.error}>{error}</div>}

      {status !== 'success' && (
        <button
          onClick={handleRegister}
          disabled={status === 'loading'}
          style={s.btn}>
          {status === 'loading' ? 'En attente...' : 'Activer maintenant'}
        </button>
      )}

      <div style={s.features}>
        {['Securise et prive', 'Aucun mot de passe', 'Acces instantane'].map(f => (
          <div key={f} style={s.feature}>
            <span style={s.featureDot}>✓</span>
            <span style={s.featureText}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#f7f5f0',
    fontFamily: 'system-ui, sans-serif', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '24px', position: 'relative' },
  skip: { position: 'absolute', top: '16px', right: '16px',
    background: 'none', border: 'none', color: '#bbb',
    fontSize: '14px', cursor: 'pointer' },
  logoWrap: { textAlign: 'center', marginBottom: '32px' },
  logo: { fontSize: '28px', fontWeight: '700' },
  logoMind: { color: '#534AB7' },
  logoEsk: { color: '#1D9E75' },
  iconWrap: { marginBottom: '16px' },
  iconBig: { fontSize: '72px', textAlign: 'center' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1a1510',
    marginBottom: '10px', textAlign: 'center' },
  sub: { fontSize: '13px', color: '#bbb', marginBottom: '32px',
    textAlign: 'center', maxWidth: '260px', lineHeight: '1.6' },
  error: { color: '#E24B4A', fontSize: '13px',
    marginBottom: '16px', textAlign: 'center' },
  btn: { width: '100%', maxWidth: '280px', padding: '14px',
    borderRadius: '14px', border: 'none',
    background: 'linear-gradient(135deg, #534AB7, #1D9E75)',
    color: 'white', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', marginBottom: '32px' },
  features: { display: 'flex', flexDirection: 'column',
    gap: '10px', width: '100%', maxWidth: '260px' },
  feature: { display: 'flex', alignItems: 'center', gap: '10px' },
  featureDot: { color: '#1D9E75', fontWeight: '700', fontSize: '16px' },
  featureText: { fontSize: '13px', color: '#888' },
}