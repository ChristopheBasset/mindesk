import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SetupPin() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')

  const handleDigit = (d) => {
    if (step === 1) {
      const newPin = pin + d
      setPin(newPin)
      if (newPin.length === 4) setStep(2)
    } else {
      const newConfirm = confirm + d
      setConfirm(newConfirm)
      if (newConfirm.length === 4) {
        if (newConfirm === pin) {
          localStorage.setItem('mindesk_pin', pin)
          localStorage.setItem('mindesk_pin_active', 'true')
          navigate('/')
        } else {
          setError('Les codes ne correspondent pas')
          setPin('')
          setConfirm('')
          setStep(1)
          setTimeout(() => setError(''), 2000)
        }
      }
    }
  }

  const handleDelete = () => {
    if (step === 1) setPin(pin.slice(0, -1))
    else setConfirm(confirm.slice(0, -1))
  }

  const current = step === 1 ? pin : confirm

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button onClick={() => navigate('/')} style={s.skip}>Passer</button>
        <div style={s.logo}>
          <span style={s.logoMind}>Mind</span>
          <span style={s.logoEsk}>esk</span>
        </div>
        <div style={{width: 50}} />
      </div>

      <div style={s.body}>
        <div style={s.icon}>🔐</div>
        <div style={s.title}>
          {step === 1 ? 'Choisis ton code PIN' : 'Confirme ton code PIN'}
        </div>
        <div style={s.sub}>
          {step === 1 ? '4 chiffres pour acceder rapidement' : 'Retape le meme code'}
        </div>

        {error && <div style={s.error}>{error}</div>}

        <div style={s.dots}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              ...s.dot,
              background: i < current.length ? '#534AB7' : 'rgba(83,74,183,0.15)'
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
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#f7f5f0',
    fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' },
  header: { padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  skip: { background: 'none', border: 'none', color: '#bbb', fontSize: '14px', cursor: 'pointer' },
  logo: { fontSize: '20px', fontWeight: '700' },
  logoMind: { color: '#534AB7' },
  logoEsk: { color: '#1D9E75' },
  body: { flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '24px' },
  icon: { fontSize: '48px', marginBottom: '16px' },
  title: { fontSize: '20px', fontWeight: '600', color: '#1a1510',
    marginBottom: '8px', textAlign: 'center' },
  sub: { fontSize: '13px', color: '#bbb', marginBottom: '32px', textAlign: 'center' },
  error: { color: '#E24B4A', fontSize: '13px', marginBottom: '16px' },
  dots: { display: 'flex', gap: '16px', marginBottom: '40px' },
  dot: { width: '16px', height: '16px', borderRadius: '50%',
    transition: 'background 0.2s' },
  keypad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px', width: '100%', maxWidth: '280px' },
  key: { height: '64px', borderRadius: '16px', border: 'none',
    background: 'white', fontSize: '22px', fontWeight: '500',
    color: '#1a1510', cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    transition: 'transform 0.1s' },
  keyEmpty: { background: 'transparent', boxShadow: 'none', cursor: 'default' },
  keyDel: { background: 'transparent', boxShadow: 'none',
    color: '#534AB7', fontSize: '20px' },
}