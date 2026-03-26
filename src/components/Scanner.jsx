import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export default function Scanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result && scanning) {
        setScanning(false)
        onScan(result.getText())
      }
    }).catch(err => {
      setError('Impossible d acceder a la camera')
    })

    return () => {
      try { reader.reset() } catch(e) {}
    }
  }, [])

  return (
    <div style={s.overlay}>
      <style>{`
        @keyframes scanAnim {
          0% { top: 10px; }
          50% { top: calc(100% - 10px); }
          100% { top: 10px; }
        }
      `}</style>

      <div style={s.header}>
        <button onClick={onClose} style={s.closeBtn}>✕ Fermer</button>
        <div style={s.title}>Scanner une carte</div>
        <div style={{width: 80}} />
      </div>

      <div style={s.videoWrap}>
        <video ref={videoRef} style={s.video} autoPlay muted playsInline />

        <div style={s.scanFrame}>
          <div style={{...s.corner, top: 0, left: 0,
            borderTop: '3px solid #534AB7', borderLeft: '3px solid #534AB7'}} />
          <div style={{...s.corner, top: 0, right: 0,
            borderTop: '3px solid #534AB7', borderRight: '3px solid #534AB7'}} />
          <div style={{...s.corner, bottom: 0, left: 0,
            borderBottom: '3px solid #534AB7', borderLeft: '3px solid #534AB7'}} />
          <div style={{...s.corner, bottom: 0, right: 0,
            borderBottom: '3px solid #534AB7', borderRight: '3px solid #534AB7'}} />
          <div style={s.scanLine} />
        </div>

        <div style={s.overlay2} />
      </div>

      <div style={s.hint}>
        {error
          ? <span style={{color: '#E24B4A'}}>{error}</span>
          : 'Pointe la camera vers le code-barres de ta carte'
        }
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: '#000', zIndex: 1000, display: 'flex',
    flexDirection: 'column', fontFamily: 'system-ui, sans-serif' },
  header: { padding: '16px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', background: 'rgba(0,0,0,0.9)',
    borderBottom: '1px solid rgba(255,255,255,0.1)' },
  closeBtn: { background: 'none', border: 'none', color: 'white',
    fontSize: '14px', cursor: 'pointer', padding: '4px 8px' },
  title: { fontSize: '16px', fontWeight: '600', color: 'white' },
  videoWrap: { flex: 1, position: 'relative', overflow: 'hidden' },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  overlay2: { position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.4)' },
  scanFrame: { position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '260px', height: '160px',
    zIndex: 10 },
  corner: { position: 'absolute', width: '24px', height: '24px' },
  scanLine: { position: 'absolute', left: '8px', right: '8px',
    height: '2px', background: 'rgba(83,74,183,0.9)',
    animation: 'scanAnim 2s ease-in-out infinite',
    boxShadow: '0 0 8px rgba(83,74,183,0.6)' },
  hint: { padding: '20px 24px', textAlign: 'center',
    color: 'rgba(255,255,255,0.65)', fontSize: '13px',
    background: 'rgba(0,0,0,0.9)', lineHeight: '1.5' },
}