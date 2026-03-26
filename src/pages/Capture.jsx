import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

export default function Capture({ session }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null)
  const [text, setText] = useState('')
  const [tag, setTag] = useState('general')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    let image_url = null

    if (mode === 'photo' && image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('captures')
        .upload(fileName, image)
      if (!uploadError) {
        const { data } = supabase.storage.from('captures').getPublicUrl(fileName)
        image_url = data.publicUrl
      }
    }

    const { error } = await supabase.from('captures').insert({
      user_id: session.user.id,
      type: mode,
      content: text,
      image_url,
      tag
    })

    if (!error) {
      setSuccess(true)
      setText('')
      setImage(null)
      setTimeout(() => {
        setSuccess(false)
        setMode(null)
        navigate('/')
      }, 1500)
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.topbar}>
        <button onClick={() => navigate('/')} style={styles.back}>←</button>
        <div style={styles.title}>Capture rapide</div>
        <div style={{ width: 32 }} />
      </div>

      {!mode && (
        <div style={styles.choiceWrap}>
          <p style={styles.choiceTitle}>Que veux-tu capturer ?</p>
          <button
            style={{...styles.bigBtn, background: 'linear-gradient(135deg, #c0715a, #d4896e)'}}
            onClick={() => setMode('photo')}>
            <span style={styles.bigIcon}>📸</span>
            <div>
              <div style={styles.bigLabel}>Photo souvenir</div>
              <div style={styles.bigSub}>Resto, objet, fringue, lieu...</div>
            </div>
          </button>
          <button
            style={{...styles.bigBtn, background: 'linear-gradient(135deg, #5a8ab5, #7aaac8)'}}
            onClick={() => setMode('idea')}>
            <span style={styles.bigIcon}>💡</span>
            <div>
              <div style={styles.bigLabel}>Idee flash</div>
              <div style={styles.bigSub}>Avant de l oublier !</div>
            </div>
          </button>
        </div>
      )}

      {mode && (
        <div style={styles.formWrap}>
          {mode === 'photo' && (
            <div style={styles.photoZone}>
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  style={styles.preview}
                  alt="preview"
                />
              ) : (
                <label style={styles.photoLabel}>
                  <span style={{ fontSize: '40px' }}>📸</span>
                  <span style={styles.photoHint}>Appuyer pour choisir une photo</span>
                  <input
                    type="file" accept="image/*" capture="environment"
                    style={{ display: 'none' }}
                    onChange={e => setImage(e.target.files[0])}
                  />
                </label>
              )}
            </div>
          )}

          <textarea
            style={styles.textarea}
            placeholder={mode === 'photo' ? 'Ajoute une note (lieu, contexte...)' : 'Tape ton idee...'}
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
          />

          <div style={styles.tagRow}>
            {tags.map(t => (
              <button
                key={t.value}
                onClick={() => setTag(t.value)}
                style={{...styles.tagBtn, ...(tag === t.value ? styles.tagActive : {})}}>
                {t.label}
              </button>
            ))}
          </div>

          {success && (
            <div style={styles.successMsg}>Capture sauvegardee !</div>
          )}

          <button
            onClick={handleSave}
            disabled={loading || (!text && !image)}
            style={{
              ...styles.saveBtn,
              opacity: (!text && !image) ? 0.5 : 1
            }}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

const tags = [
  { value: 'general',  label: 'General'  },
  { value: 'resto',    label: 'Resto'    },
  { value: 'shopping', label: 'Shopping' },
  { value: 'projet',   label: 'Projet'   },
  { value: 'idee',     label: 'Idee'     },
]

const styles = {
  container: { minHeight: '100vh', paddingBottom: '70px',
    background: 'linear-gradient(160deg, #e8f0f8 0%, #f7ede8 55%, #f2e4dc 100%)',
    fontFamily: 'system-ui, sans-serif' },
  topbar: { background: 'rgba(255,255,255,0.8)', padding: '12px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(180,140,120,0.12)' },
  back: { background: 'none', border: 'none', fontSize: '20px',
    cursor: 'pointer', color: '#5a8ab5', padding: '4px 8px' },
  title: { fontSize: '16px', fontWeight: '600', color: '#2a2320' },
  choiceWrap: { padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  choiceTitle: { fontSize: '14px', color: '#b0a090', marginBottom: '8px', textAlign: 'center' },
  bigBtn: { border: 'none', borderRadius: '16px', padding: '18px 16px',
    display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
    color: 'white', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' },
  bigIcon: { fontSize: '32px' },
  bigLabel: { fontSize: '16px', fontWeight: '600', textAlign: 'left' },
  bigSub: { fontSize: '12px', opacity: 0.85, textAlign: 'left', marginTop: '2px' },
  formWrap: { padding: '16px' },
  photoZone: { background: 'rgba(255,255,255,0.8)', borderRadius: '16px',
    marginBottom: '12px', overflow: 'hidden', minHeight: '180px',
    display: 'flex', alignItems: 'center', justifyContent: 'center' },
  photoLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '8px', cursor: 'pointer', padding: '24px' },
  photoHint: { fontSize: '13px', color: '#b0a090' },
  preview: { width: '100%', maxHeight: '250px', objectFit: 'cover' },
  textarea: { width: '100%', padding: '12px', borderRadius: '12px',
    border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '14px',
    background: 'rgba(255,255,255,0.9)', outline: 'none', resize: 'none',
    marginBottom: '12px', fontFamily: 'system-ui, sans-serif',
    boxSizing: 'border-box' },
  tagRow: { display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '16px' },
  tagBtn: { padding: '6px 12px', borderRadius: '16px',
    border: '1.5px solid rgba(0,0,0,0.1)', background: 'white',
    fontSize: '12px', color: '#8a7a70', cursor: 'pointer' },
  tagActive: { background: '#5a8ab5', color: 'white', border: '1.5px solid #5a8ab5' },
  saveBtn: { width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #c0715a, #5a8ab5)',
    color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  successMsg: { textAlign: 'center', color: '#7aaa80', fontWeight: '600',
    marginBottom: '12px', fontSize: '14px' }
}