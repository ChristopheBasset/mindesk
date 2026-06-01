import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

const THEMES = ['Santé', 'Impôts', 'Argent', 'Identité', 'Logement', 'Famille', 'Autres']

export default function DirectNumeros({ session }) {
  const navigate = useNavigate()
  const [numeros, setNumeros] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

  // état du formulaire d'ajout
  const [showForm, setShowForm] = useState(false)
  const [fLabel, setFLabel] = useState('')
  const [fValue, setFValue] = useState('')
  const [fTheme, setFTheme] = useState('')
  const [saving, setSaving] = useState(false)

  const charger = () => {
    supabase
      .from('identifiants')
      .select('*')
      .order('theme', { ascending: true })
      .order('label', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setNumeros(data)
        setLoading(false)
      })
  }

  useEffect(() => { charger() }, [])

  const copier = async (valeur, id) => {
    try {
      await navigator.clipboard.writeText(valeur)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (e) {}
  }

  const enregistrer = async () => {
    if (!fLabel.trim() || !fValue.trim()) return
    setSaving(true)
    const { error } = await supabase.from('identifiants').insert({
      user_id: session.user.id,
      label: fLabel.trim(),
      value: fValue.trim(),
      theme: fTheme || 'Autres',
    })
    setSaving(false)
    if (!error) {
      setFLabel(''); setFValue(''); setFTheme('')
      setShowForm(false)
      charger()
    }
  }

  const parTheme = numeros.reduce((acc, n) => {
    const t = n.theme || 'Autres'
    ;(acc[t] = acc[t] || []).push(n)
    return acc
  }, {})

  return (
    <div style={s.container}>

      <div style={s.header}>
        <button onClick={() => navigate('/')} style={s.back}>←</button>
        <div style={s.title}>Mes numéros</div>
        <button onClick={() => setShowForm(v => !v)} style={s.addBtn}>
          {showForm ? '✕' : '+ Ajouter'}
        </button>
      </div>

      <div style={s.scroll}>

        {showForm && (
          <div style={s.form}>
            <input
              style={s.input}
              placeholder="Libellé (ex. N° de sécu)"
              value={fLabel}
              onChange={e => setFLabel(e.target.value)} />
            <input
              style={s.input}
              placeholder="Numéro / valeur"
              value={fValue}
              onChange={e => setFValue(e.target.value)} />
            <select
              style={s.input}
              value={fTheme}
              onChange={e => setFTheme(e.target.value)}>
              <option value="">Choisir un thème…</option>
              {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              style={{ ...s.saveBtn, opacity: (!fLabel.trim() || !fValue.trim() || saving) ? 0.5 : 1 }}
              disabled={!fLabel.trim() || !fValue.trim() || saving}
              onClick={enregistrer}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        )}

        {loading && <div style={s.muted}>Chargement…</div>}

        {!loading && numeros.length === 0 && !showForm && (
          <div style={s.empty}>
            Aucun numéro enregistré.<br />
            Appuie sur « + Ajouter » en haut pour créer ton premier.
          </div>
        )}

        {Object.entries(parTheme).map(([theme, items]) => (
          <div key={theme} style={s.group}>
            <div style={s.groupTitle}>{theme}</div>
            {items.map(n => (
              <div key={n.id} style={s.row}>
                <div style={s.rowInfo}>
                  <div style={s.rowLabel}>{n.label}</div>
                  <div style={s.rowValue}>{n.value}</div>
                </div>
                <button
                  onClick={() => copier(n.value, n.id)}
                  style={{ ...s.copyBtn, ...(copiedId === n.id ? s.copyBtnOk : {}) }}>
                  {copiedId === n.id ? 'Copié ✓' : 'Copier'}
                </button>
              </div>
            ))}
          </div>
        ))}

      </div>

      <BottomNav />
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', paddingBottom: '70px',
    background: '#f7f5f0', fontFamily: 'system-ui, sans-serif' },
  header: { padding: '12px 14px', display: 'flex', alignItems: 'center',
    gap: '10px', background: '#f7f5f0' },
  back: { width: '32px', height: '32px', borderRadius: '50%',
    background: 'white', border: '1px solid rgba(0,0,0,0.07)',
    color: '#534AB7', fontSize: '18px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: '18px', fontWeight: '700', color: '#1a1510', flex: 1 },
  addBtn: { padding: '7px 12px', borderRadius: '9px',
    border: '1px solid rgba(83,74,183,0.25)', background: 'rgba(83,74,183,0.08)',
    color: '#534AB7', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  scroll: { overflowY: 'auto', padding: '0 14px' },
  form: { background: 'white', borderRadius: '12px', padding: '14px',
    marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' },
  input: { width: '100%', padding: '11px 12px', borderRadius: '10px',
    border: '1px solid rgba(0,0,0,0.12)', fontSize: '15px',
    fontFamily: 'system-ui, sans-serif', background: '#fafafa', boxSizing: 'border-box' },
  saveBtn: { padding: '12px', borderRadius: '10px', border: 'none',
    background: '#534AB7', color: 'white', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer' },
  muted: { color: '#bbb', fontSize: '13px', padding: '20px', textAlign: 'center' },
  empty: { color: '#888', fontSize: '13px', padding: '24px 12px',
    textAlign: 'center', lineHeight: '1.6' },
  group: { marginBottom: '18px' },
  groupTitle: { fontSize: '11px', fontWeight: '700', color: '#999',
    margin: '8px 0', textTransform: 'capitalize' },
  row: { background: 'white', borderRadius: '12px', padding: '12px 14px',
    marginBottom: '8px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.04)' },
  rowInfo: { flex: 1, minWidth: 0 },
  rowLabel: { fontSize: '11px', color: '#888', marginBottom: '3px' },
  rowValue: { fontSize: '15px', fontWeight: '600', color: '#1a1510',
    fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' },
  copyBtn: { padding: '7px 12px', borderRadius: '9px',
    border: '1px solid rgba(83,74,183,0.25)', background: 'transparent',
    color: '#534AB7', fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' },
  copyBtnOk: { color: '#1D9E75', borderColor: 'rgba(29,158,117,0.35)' },
}
