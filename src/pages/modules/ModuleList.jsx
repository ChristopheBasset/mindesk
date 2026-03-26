import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

const LIST_CONFIGS = {
  'charges-operateur': {
    label: 'Operateurs', groupLabel: 'Mes charges',
    color: '#534AB7', bgLight: '#EEEDFE',
    icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 4a2 2 0 0 1 2-2h4',
    addLabel: 'Ajouter un operateur',
    itemLabel: (item) => item.champs?.operateur || 'Operateur',
    itemSub: (item) => item.champs?.type_forfait || '',
    fields: [
      { key: 'operateur',    label: 'Operateur',           placeholder: 'SFR, Orange, Free...' },
      { key: 'type_forfait', label: 'Type',                placeholder: 'Mobile, Box, Fibre...' },
      { key: 'numero_ligne', label: 'Numero de ligne',     placeholder: '06 XX XX XX XX' },
      { key: 'forfait',      label: 'Forfait',             placeholder: '100Go 5G' },
      { key: 'montant',      label: 'Montant mensuel (€)', placeholder: '20', type: 'number' },
      { key: 'fin_engagement', label: 'Fin engagement',   type: 'date' },
      { key: 'login',        label: 'Identifiant',         sensitive: true, placeholder: 'email' },
      { key: 'password',     label: 'Mot de passe',        sensitive: true, type: 'password', placeholder: '••••••••' },
    ],
    presets: [
      { label: 'SFR',          url: 'https://www.sfr.fr/mon-espace-sfr' },
      { label: 'Orange',       url: 'https://espaceclient.orange.fr' },
      { label: 'Free Mobile',  url: 'https://mobile.free.fr/account' },
      { label: 'Bouygues',     url: 'https://www.bouyguestelecom.fr/mon-compte' },
      { label: 'Free Fibre',   url: 'https://adsl.free.fr/login.pl' },
      { label: 'Autre',        url: '' },
    ]
  },
  'assurances-biens': {
    label: 'Assurances biens', groupLabel: 'Assurances',
    color: '#D85A30', bgLight: '#FAECE7',
    icon: 'M1 3h15v13H1zM16 8h4l3 5v3h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    addLabel: 'Ajouter une assurance',
    itemLabel: (item) => item.champs?.assureur || 'Assurance',
    itemSub: (item) => item.champs?.bien_assure || '',
    fields: [
      { key: 'assureur',      label: 'Assureur',           placeholder: 'AXA, MAIF...' },
      { key: 'bien_assure',   label: 'Bien assure',        placeholder: 'Maison, Voiture, Moto...' },
      { key: 'numero_police', label: 'Numero de police',   placeholder: '123456789' },
      { key: 'prime',         label: 'Prime annuelle (€)', placeholder: '400', type: 'number' },
      { key: 'echeance',      label: 'Echeance',           type: 'date' },
      { key: 'login',         label: 'Identifiant',        sensitive: true, placeholder: 'email' },
      { key: 'password',      label: 'Mot de passe',       sensitive: true, type: 'password', placeholder: '••••••••' },
    ],
    presets: [
      { label: 'AXA',      url: 'https://www.axa.fr/mon-espace-client' },
      { label: 'MAIF',     url: 'https://www.maif.fr/espace-client' },
      { label: 'MACIF',    url: 'https://www.macif.fr/assurance/particuliers/espace-client' },
      { label: 'Groupama', url: 'https://www.groupama.fr/espace-client' },
      { label: 'Allianz',  url: 'https://www.allianz.fr/espace-client' },
    ]
  },
  'portefeuille-cb': {
    label: 'Cartes bancaires', groupLabel: 'Portefeuille',
    color: '#1D9E75', bgLight: '#E1F5EE',
    icon: 'M2 5h20v14H2zM2 10h20',
    addLabel: 'Ajouter une carte',
    itemLabel: (item) => item.champs?.banque || 'Banque',
    itemSub: (item) => item.champs?.type_carte ? `${item.champs.type_carte} ••••${item.champs.derniers_chiffres || ''}` : '',
    fields: [
      { key: 'banque',            label: 'Banque',              placeholder: 'BNP, Credit Agricole...' },
      { key: 'type_carte',        label: 'Type',                placeholder: 'Visa, Mastercard...' },
      { key: 'derniers_chiffres', label: '4 derniers chiffres', placeholder: '4242', type: 'number' },
      { key: 'expiration',        label: 'Expiration',          placeholder: 'MM/AA' },
      { key: 'login',             label: 'Identifiant banque',  sensitive: true, placeholder: 'email' },
      { key: 'password',          label: 'Mot de passe',        sensitive: true, type: 'password', placeholder: '••••••••' },
    ],
    presets: [
      { label: 'BNP Paribas',      url: 'https://mabanque.bnpparibas.com' },
      { label: 'Credit Agricole',  url: 'https://www.credit-agricole.fr' },
      { label: 'Societe Generale', url: 'https://particuliers.societegenerale.fr' },
      { label: 'LCL',              url: 'https://monespace.lcl.fr' },
      { label: 'Boursorama',       url: 'https://www.boursorama.com/mon-espace' },
      { label: 'Revolut',          url: 'https://app.revolut.com' },
      { label: 'Fortuneo',         url: 'https://www.fortuneo.fr/espace-client' },
    ]
  },
  'portefeuille-placements': {
    label: 'Placements', groupLabel: 'Portefeuille',
    color: '#1D9E75', bgLight: '#E1F5EE',
    icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    addLabel: 'Ajouter un placement',
    itemLabel: (item) => item.champs?.type || 'Placement',
    itemSub: (item) => item.champs?.etablissement || '',
    fields: [
      { key: 'etablissement', label: 'Etablissement', placeholder: 'Banque, assureur...' },
      { key: 'type',          label: 'Type',          placeholder: 'Livret A, PEL, PEA...' },
      { key: 'solde',         label: 'Solde (€)',     placeholder: '5000', type: 'number' },
      { key: 'taux',          label: 'Taux (%)',      placeholder: '3',    type: 'number' },
      { key: 'login',         label: 'Identifiant',   sensitive: true, placeholder: 'email' },
      { key: 'password',      label: 'Mot de passe',  sensitive: true, type: 'password', placeholder: '••••••••' },
    ],
    presets: [
      { label: 'BNP Paribas',      url: 'https://mabanque.bnpparibas.com' },
      { label: 'Credit Agricole',  url: 'https://www.credit-agricole.fr' },
      { label: 'Boursorama',       url: 'https://www.boursorama.com/mon-espace' },
      { label: 'Linxea',           url: 'https://www.linxea.com/espace-client' },
    ]
  },
  'documents-fidelite': {
    label: 'Cartes fidelite', groupLabel: 'Documents',
    color: '#5F5E5A', bgLight: '#F1EFE8',
    icon: 'M2 5h20v14H2zM2 10h20',
    addLabel: 'Ajouter une carte',
    itemLabel: (item) => item.champs?.enseigne || 'Carte',
    itemSub: (item) => item.champs?.points ? `${item.champs.points} points` : '',
    fields: [
      { key: 'enseigne', label: 'Enseigne',      placeholder: 'Leclerc, Sephora...' },
      { key: 'numero',   label: 'Numero carte',  placeholder: '1234567890123' },
      { key: 'points',   label: 'Points / Solde',placeholder: '250 points' },
      { key: 'notes',    label: 'Notes',         placeholder: 'Avantages...' },
    ],
    presets: []
  },
  'documents-justifs': {
    label: 'Justificatifs', groupLabel: 'Documents',
    color: '#5F5E5A', bgLight: '#F1EFE8',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6',
    addLabel: 'Ajouter un justificatif',
    itemLabel: (item) => item.champs?.type || 'Document',
    itemSub: (item) => item.champs?.emetteur || '',
    fields: [
      { key: 'type',     label: 'Type',    placeholder: 'Facture, quittance...' },
      { key: 'emetteur', label: 'Emetteur',placeholder: 'EDF, proprietaire...' },
      { key: 'date',     label: 'Date',    type: 'date' },
      { key: 'notes',    label: 'Notes',   placeholder: 'Details...' },
    ],
    presets: []
  },
  'loisirs-licences': {
    label: 'Licences / Abonnements', groupLabel: 'Mes loisirs',
    color: '#7F77DD', bgLight: '#EEEDFE',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
    addLabel: 'Ajouter un abonnement',
    itemLabel: (item) => item.champs?.service || 'Service',
    itemSub: (item) => item.champs?.prix_mensuel ? `${item.champs.prix_mensuel}€/mois` : '',
    fields: [
      { key: 'service',        label: 'Service',          placeholder: 'Netflix, Spotify...' },
      { key: 'prix_mensuel',   label: 'Prix mensuel (€)', placeholder: '10', type: 'number' },
      { key: 'compte',         label: 'Compte email',     placeholder: 'email@...' },
      { key: 'renouvellement', label: 'Renouvellement',   type: 'date' },
      { key: 'login',          label: 'Identifiant',      sensitive: true, placeholder: 'email' },
      { key: 'password',       label: 'Mot de passe',     sensitive: true, type: 'password', placeholder: '••••••••' },
    ],
    presets: [
      { label: 'Netflix',         url: 'https://www.netflix.com/browse' },
      { label: 'Spotify',         url: 'https://www.spotify.com/fr/account' },
      { label: 'Disney+',         url: 'https://www.disneyplus.com/fr-fr' },
      { label: 'Canal+',          url: 'https://www.canalplus.com/espace-client' },
      { label: 'Amazon Prime',    url: 'https://www.amazon.fr/gp/css/homepage.html' },
      { label: 'Apple TV+',       url: 'https://tv.apple.com' },
      { label: 'YouTube Premium', url: 'https://www.youtube.com/premium' },
    ]
  },
  'loisirs-jeux': {
    label: 'Mes jeux', groupLabel: 'Mes loisirs',
    color: '#7F77DD', bgLight: '#EEEDFE',
    icon: 'M2 6h20v12H2zM12 12h.01M7 12h.01M17 12h.01',
    addLabel: 'Ajouter un jeu',
    itemLabel: (item) => item.champs?.titre || 'Jeu',
    itemSub: (item) => item.champs?.plateforme || '',
    fields: [
      { key: 'titre',      label: 'Titre du jeu', placeholder: 'Nom du jeu...' },
      { key: 'plateforme', label: 'Plateforme',   placeholder: 'PS5, PC, Switch...' },
      { key: 'statut',     label: 'Statut',       placeholder: 'En cours, Termine, A faire' },
      { key: 'note',       label: 'Ma note /10',  placeholder: '8', type: 'number' },
    ],
    presets: []
  },
  'loisirs-souvenirs': {
    label: 'Mes souvenirs', groupLabel: 'Mes loisirs',
    color: '#7F77DD', bgLight: '#EEEDFE',
    icon: 'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
    addLabel: 'Ajouter un souvenir',
    itemLabel: (item) => item.champs?.titre || 'Souvenir',
    itemSub: (item) => item.champs?.lieu || '',
    fields: [
      { key: 'titre',     label: 'Titre du souvenir', placeholder: 'Vacances, evenement...' },
      { key: 'lieu',      label: 'Lieu',              placeholder: 'Ou etais-tu ?' },
      { key: 'date',      label: 'Date',              type: 'date' },
      { key: 'personnes', label: 'Avec qui',          placeholder: 'Noms...' },
      { key: 'emotion',   label: 'Note emotionnelle', placeholder: 'Ce que tu as ressenti...' },
    ],
    presets: []
  },
}

export const LIST_MODULE_KEYS = Object.keys(LIST_CONFIGS)

export default function ModuleList({ session }) {
  const navigate = useNavigate()
  const { groupeId, moduleId } = useParams()
  const [items, setItems] = useState([])
  const [mode, setMode] = useState('list') // list | add | edit
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const config = LIST_CONFIGS[`${groupeId}-${moduleId}`]

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    const { data } = await supabase
      .from('modules_data')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('groupe', groupeId)
      .eq('module', moduleId)
      .order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const champs = {}
    const credentials = {}
    config.fields.forEach(f => {
      if (f.sensitive) credentials[f.key] = form[f.key] || ''
      else champs[f.key] = form[f.key] || ''
    })

    if (selected) {
      await supabase.from('modules_data').update({
        champs, credentials,
        lien_direct: form.lien_direct || null,
        updated_at: new Date().toISOString()
      }).eq('id', selected.id)
    } else {
      await supabase.from('modules_data').insert({
        user_id: session.user.id,
        groupe: groupeId, module: moduleId,
        label: config.label, champs, credentials,
        lien_direct: form.lien_direct || null,
      })
    }
    await loadItems()
    setMode('list')
    setSelected(null)
    setForm({})
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet element ?')) return
    await supabase.from('modules_data').delete().eq('id', id)
    await loadItems()
    setMode('list')
    setSelected(null)
  }

  const handleEdit = (item) => {
    setSelected(item)
    setForm({ ...item.champs, ...item.credentials, lien_direct: item.lien_direct || '' })
    setMode('edit')
  }

  const handleOpenLink = async (item) => {
    if (!item.lien_direct) return
    const pwd = item.credentials?.password
    if (pwd) {
      try {
        await navigator.clipboard.writeText(pwd)
        setCopiedId(item.id)
        setTimeout(() => setCopiedId(null), 3000)
      } catch (e) {}
    }
    setTimeout(() => window.open(item.lien_direct, '_blank'), 400)
  }

  if (!config) return null
  if (loading) return (
    <div style={{...s.container, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#bbb', fontSize:'13px'}}>Chargement...</div>
    </div>
  )

  // MODE LISTE
  if (mode === 'list') return (
    <div style={s.container}>
      <div style={s.topbar}>
        <button onClick={() => navigate('/')} style={s.back}>←</button>
        <div style={s.titleWrap}>
          <div style={{...s.groupTag, background: config.bgLight, color: config.color}}>
            {config.groupLabel}
          </div>
          <div style={s.title}>{config.label}</div>
        </div>
        <button onClick={() => { setSelected(null); setForm({}); setMode('add') }}
          style={s.addBtn}>+</button>
      </div>

      {items.length === 0 ? (
        <div style={s.empty}>
          <div style={{fontSize:'40px', marginBottom:'12px'}}>📋</div>
          <div style={s.emptyTitle}>Aucun element</div>
          <div style={s.emptySub}>Appuie sur + pour ajouter</div>
          <button onClick={() => { setSelected(null); setForm({}); setMode('add') }}
            style={{...s.saveBtn, background: config.color, marginTop:'16px', width:'auto', padding:'12px 24px'}}>
            {config.addLabel}
          </button>
        </div>
      ) : (
        <div style={s.listWrap}>
          {items.map(item => (
            <div key={item.id} style={s.itemCard}>
              <div style={s.itemLeft} onClick={() => handleEdit(item)}>
                <div style={{...s.itemIcon, background: config.bgLight}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={config.color} strokeWidth="2" strokeLinecap="round">
                    <path d={config.icon}/>
                  </svg>
                </div>
                <div>
                  <div style={s.itemLabel}>{config.itemLabel(item)}</div>
                  <div style={s.itemSub}>{config.itemSub(item)}</div>
                </div>
              </div>
              <div style={s.itemRight}>
                {item.lien_direct && (
                  <button onClick={() => handleOpenLink(item)}
                    style={{...s.openBtn, background: config.color}}>
                    {copiedId === item.id ? '✓' : '→'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  )

  // MODE ADD / EDIT
  return (
    <div style={s.container}>
      <div style={s.topbar}>
        <button onClick={() => { setMode('list'); setSelected(null); setForm({}) }}
          style={s.back}>←</button>
        <div style={s.titleWrap}>
          <div style={{...s.groupTag, background: config.bgLight, color: config.color}}>
            {config.groupLabel}
          </div>
          <div style={s.title}>{mode === 'edit' ? 'Modifier' : 'Ajouter'}</div>
        </div>
        {selected && (
          <button onClick={() => handleDelete(selected.id)} style={s.deleteBtn}>🗑</button>
        )}
        {!selected && <div style={{width: 40}} />}
      </div>

      <div style={s.formWrap}>
        {config.fields.map(f => (
          <div key={f.key} style={s.formField}>
            <div style={s.formLabel}>{f.sensitive && '🔐 '}{f.label}</div>
            <input style={s.input} type={f.type || 'text'}
              placeholder={f.placeholder || ''}
              value={form[f.key] || ''}
              onChange={e => setForm({...form, [f.key]: e.target.value})} />
          </div>
        ))}

        {/* LIENS PREDEFINIS */}
        {config.presets && config.presets.length > 0 && (
          <div style={s.formField}>
            <div style={s.formLabel}>🔗 Choisir le service</div>
            <div style={s.presetRow}>
              {config.presets.map(p => (
                <button key={p.label}
                  onClick={() => setForm({...form, lien_direct: p.url})}
                  style={{...s.presetBtn,
                    background: form.lien_direct === p.url ? config.color : 'white',
                    color: form.lien_direct === p.url ? 'white' : '#555',
                    border: form.lien_direct === p.url
                      ? `1.5px solid ${config.color}`
                      : '1.5px solid rgba(0,0,0,0.1)',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={s.formField}>
          <div style={s.formLabel}>🔗 Lien direct</div>
          <input style={s.input} type="url" placeholder="https://..."
            value={form.lien_direct || ''}
            onChange={e => setForm({...form, lien_direct: e.target.value})} />
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{...s.saveBtn, background: config.color}}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', paddingBottom: '70px',
    background: '#f7f5f0', fontFamily: 'system-ui, sans-serif' },
  topbar: { background: 'white', padding: '12px 14px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    position: 'sticky', top: 0, zIndex: 10 },
  back: { background: 'none', border: 'none', fontSize: '18px',
    cursor: 'pointer', color: '#534AB7', padding: '4px 8px' },
  titleWrap: { flex: 1, textAlign: 'center' },
  groupTag: { fontSize: '9px', fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: '0.8px', padding: '2px 8px', borderRadius: '6px',
    display: 'inline-block', marginBottom: '2px' },
  title: { fontSize: '15px', fontWeight: '700', color: '#1a1510' },
  addBtn: { width: '32px', height: '32px', borderRadius: '50%', border: 'none',
    background: 'linear-gradient(135deg, #534AB7, #1D9E75)',
    color: 'white', fontSize: '20px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '60px 24px' },
  emptyTitle: { fontSize: '16px', fontWeight: '600', color: '#1a1510', marginBottom: '6px' },
  emptySub: { fontSize: '12px', color: '#bbb', lineHeight: '1.5', marginBottom: '8px' },
  listWrap: { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  itemCard: { background: 'white', borderRadius: '14px', padding: '12px 14px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' },
  itemLeft: { display: 'flex', alignItems: 'center', gap: '12px',
    flex: 1, cursor: 'pointer' },
  itemIcon: { width: '36px', height: '36px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemLabel: { fontSize: '13px', fontWeight: '600', color: '#1a1510' },
  itemSub: { fontSize: '11px', color: '#bbb', marginTop: '1px' },
  itemRight: { display: 'flex', gap: '8px', alignItems: 'center' },
  openBtn: { width: '32px', height: '32px', borderRadius: '50%', border: 'none',
    color: 'white', fontSize: '14px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
  formWrap: { padding: '14px' },
  formField: { marginBottom: '12px' },
  formLabel: { fontSize: '11px', fontWeight: '600', color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 13px', borderRadius: '11px',
    border: '1px solid rgba(0,0,0,0.1)', fontSize: '13px',
    background: 'white', outline: 'none',
    fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' },
  presetRow: { display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '8px' },
  presetBtn: { padding: '6px 12px', borderRadius: '10px',
    fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  saveBtn: { width: '100%', padding: '12px', borderRadius: '12px',
    border: 'none', color: 'white', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
}
