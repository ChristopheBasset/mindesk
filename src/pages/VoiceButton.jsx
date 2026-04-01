import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function VoiceButton() {
  const [phase, setPhase] = useState('idle')   // idle | listening | processing | success | error
  const [transcript, setTranscript] = useState('')
  const [message, setMessage] = useState('')
  const recognitionRef = useRef(null)
  const navigate = useNavigate()

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setMessage("Utilise Chrome pour la commande vocale")
      setPhase('error')
      setTimeout(() => setPhase('idle'), 3000)
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setPhase('listening')

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      setPhase('processing')
      await callEdgeFunction(text)
    }

    recognition.onerror = () => {
      setMessage("Je n'ai pas entendu, réessaie")
      setPhase('error')
      setTimeout(() => setPhase('idle'), 2500)
    }

    recognition.onend = () => {
      if (phase === 'listening') setPhase('idle')
    }

    recognition.start()
  }, [phase])

  // ── Appel Supabase Edge Function (clé Claude cachée côté serveur) ────────────
  const callEdgeFunction = async (text) => {
    try {
      const { data, error } = await supabase.functions.invoke('voice-command', {
        body: { transcript: text },
      })

      if (error) throw error

      setMessage(data.message || '✓')
      setPhase('success')

      setTimeout(() => {
        if (data.action === 'navigate' && data.path) {
          navigate(data.path)
        } else if (data.action === 'open_module' && data.groupe && data.module) {
          navigate(`/module/${data.groupe}/${data.module}`)
        }
        reset()
      }, 1400)

    } catch (err) {
      console.error('[VoiceButton]', err)
      setMessage("Erreur — réessaie")
      setPhase('error')
      setTimeout(() => setPhase('idle'), 2500)
    }
  }

  const reset = () => {
    setPhase('idle')
    setTranscript('')
    setMessage('')
  }

  const handleFabClick = () => {
    if (phase === 'idle') startListening()
    else if (phase === 'listening') { recognitionRef.current?.stop(); setPhase('idle') }
    else if (phase === 'error' || phase === 'success') reset()
  }

  const fabColor = {
    idle: '#534AB7', listening: '#E24B4A',
    processing: '#534AB7', success: '#1D9E75', error: '#E24B4A',
  }[phase]

  const fabIcon = {
    idle: '🎙️', listening: '⏹',
    processing: '⋯', success: '✓', error: '✕',
  }[phase]

  return (
    <>
      {phase !== 'idle' && (
        <div style={styles.overlay} onClick={() => {
          if (phase === 'listening') recognitionRef.current?.stop()
          if (phase !== 'processing') reset()
        }}>
          <div style={styles.card} onClick={e => e.stopPropagation()}>
            {phase === 'listening' && (
              <>
                <WaveAnimation />
                <p style={styles.cardTitle}>Je t'écoute…</p>
                <p style={styles.cardHint}>Tape pour arrêter</p>
              </>
            )}
            {phase === 'processing' && (
              <>
                <Spinner />
                <p style={styles.cardTranscript}>"{transcript}"</p>
                <p style={styles.cardHint}>Analyse en cours…</p>
              </>
            )}
            {phase === 'success' && (
              <>
                <div style={{...styles.statusIcon, color:'#1D9E75'}}>✓</div>
                <p style={styles.cardTitle}>{message}</p>
              </>
            )}
            {phase === 'error' && (
              <>
                <div style={{...styles.statusIcon, color:'#E24B4A'}}>!</div>
                <p style={styles.cardTitle}>{message}</p>
              </>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleFabClick}
        style={{
          ...styles.fab,
          background: fabColor,
          transform: phase === 'listening' ? 'scale(1.12)' : 'scale(1)',
          boxShadow: phase === 'listening'
            ? `0 0 0 8px ${fabColor}25, 0 8px 24px ${fabColor}50`
            : `0 4px 16px ${fabColor}60`,
        }}
        aria-label="Commande vocale"
      >
        <span style={styles.fabIcon}>{fabIcon}</span>
      </button>
    </>
  )
}

function WaveAnimation() {
  return (
    <div style={styles.wave}>
      <style>{`
        @keyframes md-wave {
          0%, 100% { transform: scaleY(0.3); }
          50%       { transform: scaleY(1); }
        }
      `}</style>
      {[0, 0.1, 0.2, 0.1, 0].map((delay, i) => (
        <div key={i} style={{
          ...styles.waveBar,
          animationDelay: `${delay}s`,
          background: i === 2 ? '#534AB7' : `rgba(83,74,183,${0.4 + i * 0.1})`,
        }} />
      ))}
    </div>
  )
}

function Spinner() {
  return (
    <>
      <style>{`@keyframes md-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.spinner} />
    </>
  )
}

const styles = {
  fab: {
    position: 'fixed', bottom: '82px', right: '18px',
    width: '52px', height: '52px', borderRadius: '50%',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  },
  fabIcon: { fontSize: '22px', lineHeight: 1, userSelect: 'none' },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15,10,5,0.45)',
    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    zIndex: 199, display: 'flex', alignItems: 'flex-end',
    justifyContent: 'center', paddingBottom: '152px',
  },
  card: {
    background: 'white', borderRadius: '20px', padding: '24px 28px',
    width: 'calc(100% - 48px)', maxWidth: '340px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
  },
  cardTitle: { fontSize: '17px', fontWeight: '600', color: '#1a1510', margin: 0, textAlign: 'center' },
  cardTranscript: { fontSize: '15px', color: '#534AB7', fontWeight: '500', margin: 0, textAlign: 'center', fontStyle: 'italic' },
  cardHint: { fontSize: '12px', color: '#bbb', margin: 0, textAlign: 'center' },
  statusIcon: { fontSize: '32px', fontWeight: '700', lineHeight: 1 },
  wave: { display: 'flex', alignItems: 'center', gap: '4px', height: '36px', marginBottom: '4px' },
  waveBar: { width: '4px', height: '28px', borderRadius: '2px', animation: 'md-wave 0.8s ease-in-out infinite' },
  spinner: {
    width: '32px', height: '32px',
    border: '3px solid rgba(83,74,183,0.15)', borderTopColor: '#534AB7',
    borderRadius: '50%', animation: 'md-spin 0.75s linear infinite', marginBottom: '4px',
  },
}
