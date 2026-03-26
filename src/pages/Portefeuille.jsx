import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import bwipjs from 'bwip-js'

export default function Portefeuille({ session }) {
  const navigate = useNavigate()
  const [cartes, setCartes] = useState([])
  const [mode, setMode] = useState('list') // list | add | view
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nom: '', categorie: 'fidelite', numero: '',
    emoji: '💳', couleur: '#534AB7', expire_le: '', notes: ''
  })

  useEffect(() => { loadCartes() }, [])

  const loadCartes = async () => {
    const { data } = await supabase
      .from('cartes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) setCartes(data)
  }

  const handleSave = async () => {
    if (!form.nom || !form.numero) return
    setLoading(true)
    const { error } = await supabase.from('cartes').insert({
      user_id: session.user.id,
      ...form
    })
    if (!error) {
      await loadCartes()
      setMode('list')
      setForm({ nom: '', categorie: 'fidelite', numero: '',
        emoji: '💳', couleur: '#534AB7', expire_le: '', notes: '' })
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('cartes').delete().eq('id', id)
    await loadCartes()
    setMode('list')
  }

  if (mode === 'view' && selected) {
    return <CarteView
      carte={selected}
      onBack={() => setMode('list')}
      onDelete={() => handleDelete(selected.id)}
    />
  }

  if (mode === 'add') {
    return (
      <div style={s.container}>
        <div style={s.topbar}>
          <button onClick={() => setMode('list')} style={s.back}>← Retour</button>
          <div style={s.title}>Nouvelle carte</div>
          <div style={{width: 60}} />
        </div>

        <div style={s.form}>
          <div style={s.field}>
            <div style={s.label}>Emoji</div>
            <div style={s.emojiRow}>
              {emojis.map(e => (
                <button key={e}
                  onClick={() => setForm({...form, emoji: e})}
                  style={{...s.emojiBtn,
                    background: form.emoji === e ? '#EEEDFE' : 'white',
                    border: form.emoji === e ? '2px solid #534AB7' : '1px solid rgba(0,0,0,0.08)'
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div style={s.field}>
            <div style={s.label}>Nom de la carte</div>
            <input style={s.input} placeholder="Ex: Carte Leclerc"
              value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
          </div>

          <div style={s.field}>
            <div style={s.label}>Categorie</div>
            <div style={s.catRow}>
              {categories.map(c => (
                <button key={c.value}
                  onClick={() => setForm({...form, categorie: c.value})}
                  style={{...s.catBtn,
                    background: form.categorie === c.value ? c.color + '22' : 'white',
                    border: form.categorie === c.value ? `2px solid ${c.color}` : '1px solid rgba(0,0,0,0.08)',
                    color: form.categorie === c.value ? c.color : '#888'
                  }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={s.field}>
            <div style={s.label}>Numero / Code</div>
            <input style={s.input} placeholder="Ex: 1234567890123"
              value={form.numero} onChange={e => setForm({...form, numero: e.target.value})}
              inputMode="numeric" />
          </div>

          <div style={s.field}>
            <div style={s.label}>Couleur de la carte</div>
            <div style={s.colorRow}>
              {couleurs.map(c => (
                <button key={c}
                  onClick={() => setForm({...form, couleur: c})}
                  style={{...s.colorBtn, background: c,
                    border: form.couleur === c ? '3px solid #1a1510' : '3px solid transparent'
                  }} />
              ))}
            </div>
          </div>

          <div style={s.field}>
            <div style={s.label}>Date d expiration (optionnel)</div>
            <input style={s.input} type="date"
              value={form.expire_le} onChange={e => setForm({...form, expire_le: e.target.value})} />
          </div>

          <div style={s.field}>
            <div style={s.label}>Notes (optionnel)</div>
            <textarea style={{...s.input, resize: 'none'}} rows={3}
              placeholder="Infos utiles..."
              value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>

          <button onClick={handleSave} disabled={loading || !form.nom || !form.numero}
            style={{...s.saveBtn, opacity: (!form.nom || !form.numero) ? 0.5 : 1}}>
            {loading ? 'Sauvegarde...' : 'Ajouter la carte'}
          </button>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div style={s.container}>
      <div style={s.topbar}>
        <button onClick={() => navigate('/')} style={s.back}>← </button>
        <div style={s.title}>Portefeuille</div>
        <button onClick={() => setMode('add')} style={s.addBtn}>+</button>
      </div>

      {cartes.length === 0 ? (
        <div style={s.empty}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>💳</div>
          <div style={s.emptyTitle}>Aucune carte</div>
          <div style={s.emptySub}>Ajoute tes cartes de fidelite, sante, transport...</div>
          <button onClick={() => setMode('add')} style={s.emptyBtn}>
            Ajouter ma premiere carte
          </button>
        </div>
      ) : (
        <div style={s.liste}>
          {categories.map(cat => {
            const filtered = cartes.filter(c => c.categorie === cat.value)
            if (filtered.length === 0) return null
            return (
              <div key={cat.value}>
                <div style={s.catTitle}>{cat.label}</div>
                {filtered.map(carte => (
                  <div key={carte.id}
                    onClick={() => { setSelected(carte); setMode('view') }}
                    style={{...s.carteItem, background: carte.couleur}}>
                    <div style={s.carteEmoji}>{carte.emoji}</div>
                    <div style={s.carteBody}>
                      <div style={s.carteNom}>{carte.nom}</div>
                      <div style={s.carteNum}>
                        {carte.numero.replace(/(.{4})/g, '$1 ').trim()}
                      </div>
                    </div>
                    {carte.expire_le && new Date(carte.expire_le) < new Date() && (
                      <div style={s.expiredBadge}>Expire</div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function CarteView({ carte, onBack, onDelete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current && carte.numero) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: 'code128',
          text: carte.numero,
          scale: 3,
          height: 16,
          includetext: true,
          textxalign: 'center',
        })
      } catch (e) {
        console.error('Barcode error:', e)
      }
    }
  }, [carte])

  return (
    <div style={s.container}>
      <div style={s.topbar}>
        <button onClick={onBack} style={s.back}>← Retour</button>
        <div style={s.title}>{carte.nom}</div>
        <button onClick={onDelete} style={s.deleteBtn}>🗑</button>
      </div>

      <div style={s.viewWrap}>
        <div style={{...s.carteCard, background: carte.couleur}}>
          <div style={s.carteCardEmoji}>{carte.emoji}</div>
          <div style={s.carteCardNom}>{carte.nom}</div>
          <div style={s.carteCardNum}>
            {carte.numero.replace(/(.{4})/g, '$1 ').trim()}
          </div>
          {carte.expire_le && (
            <div style={s.carteCardExp}>
              Expire le {new Date(carte.expire_le).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        <div style={s.barcodeWrap}>
          <div style={s.barcodeTitle}>Code-barres</div>
          <canvas ref={canvasRef} style={{maxWidth: '100%'}} />
        </div>

        {carte.notes && (
          <div style={s.notesWrap}>
            <div style={s.barcodeTitle}>Notes</div>
            <div style={s.notesText}>{carte.notes}</div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

const emojis = ['💳', '🏥', '🚌', '✈️', '🛒', '⚽', '📚', '🎬', '🏋️', '🔑']

const categories = [
  { value: 'fidelite',  label: 'Fidelite',  color: '#534AB7' },
  { value: 'sante',     label: 'Sante',     color: '#1D9E75' },
  { value: 'transport', label: 'Transport', color: '#378ADD' },
  { value: 'acces',     label: 'Acces',     color: '#BA7517' },
  { value: 'abonnement',label: 'Abonnement',color: '#D85A30' },
  { value: 'autre',     label: 'Autre',     color: '#888'    },
]

const couleurs = [
  '#534AB7', '#1D9E75', '#378ADD', '#D85A30',
  '#BA7517', '#E24B4A', '#2C2C2A', '#0F6E56',
]

const s = {
  container: { minHeight: '100vh', paddingBottom: '70px',
    background: '#f7f5f0', fontFamily: 'system-ui, sans-serif' },
  topbar: { background: 'white', padding: '12px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    position: 'sticky', top: 0, zIndex: 10 },
  back: { background: 'none', border: 'none', fontSize: '16px',
    cursor: 'pointer', color: '#534AB7', padding: '4px 8px' },
  title: { fontSize: '16px', fontWeight: '600', color: '#1a1510' },
  addBtn: { width: '32px', height: '32px', borderRadius: '50%', border: 'none',
    background: 'linear-gradient(135deg, #534AB7, #1D9E75)',
    color: 'white', fontSize: '20px', cursor: 'pointer' },
  deleteBtn: { background: 'none', border: 'none',
    fontSize: '18px', cursor: 'pointer', padding: '4px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '60px 24px', textAlign: 'center' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#1a1510', marginBottom: '8px' },
  emptySub: { fontSize: '13px', color: '#bbb', marginBottom: '24px', lineHeight: '1.5' },
  emptyBtn: { padding: '12px 24px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #534AB7, #1D9E75)',
    color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  liste: { padding: '12px 14px' },
  catTitle: { fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px',
    color: '#bbb', fontWeight: '600', marginBottom: '8px', marginTop: '12px' },
  carteItem: { borderRadius: '14px', padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '8px', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  carteEmoji: { fontSize: '24px' },
  carteBody: { flex: 1 },
  carteNom: { fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '2px' },
  carteNum: { fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' },
  expiredBadge: { background: 'rgba(255,255,255,0.2)', color: 'white',
    fontSize: '10px', padding: '2px 8px', borderRadius: '8px' },
  form: { padding: '16px', overflowY: 'auto' },
  field: { marginBottom: '16px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' },
  input: { width: '100%', padding: '11px 14px', borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.1)', fontSize: '14px',
    background: 'white', outline: 'none', fontFamily: 'system-ui, sans-serif' },
  emojiRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  emojiBtn: { width: '42px', height: '42px', borderRadius: '10px',
    fontSize: '20px', cursor: 'pointer' },
  catRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  catBtn: { padding: '6px 12px', borderRadius: '10px',
    fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  colorRow: { display: 'flex', gap: '8px' },
  colorBtn: { width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' },
  saveBtn: { width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #534AB7, #1D9E75)',
    color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
    marginTop: '8px' },
  viewWrap: { padding: '16px' },
  carteCard: { borderRadius: '18px', padding: '20px',
    marginBottom: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' },
  carteCardEmoji: { fontSize: '32px', marginBottom: '12px' },
  carteCardNom: { fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '6px' },
  carteCardNum: { fontSize: '14px', color: 'rgba(255,255,255,0.8)',
    letterSpacing: '2px', marginBottom: '6px' },
  carteCardExp: { fontSize: '11px', color: 'rgba(255,255,255,0.6)' },
  barcodeWrap: { background: 'white', borderRadius: '14px',
    padding: '16px', marginBottom: '12px', textAlign: 'center' },
  barcodeTitle: { fontSize: '11px', fontWeight: '600', color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' },
  notesWrap: { background: 'white', borderRadius: '14px', padding: '16px' },
  notesText: { fontSize: '13px', color: '#555', lineHeight: '1.6' },
}