import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

const LIENS_PREDEFINIS = {
  'charges-energie': [
    { label: 'EDF',             url: 'https://particulier.edf.fr/fr/accueil/espace-client/tableau-de-bord.html' },
    { label: 'Engie',           url: 'https://particuliers.engie.fr/espace-client' },
    { label: 'Total Energies',  url: 'https://www.totalenergies-particuliers.fr/espace-client' },
    { label: 'Ekwateur',        url: 'https://app.ekwateur.fr' },
  ],
  'charges-operateur': [
    { label: 'SFR',             url: 'https://www.sfr.fr/mon-espace-sfr' },
    { label: 'Orange',          url: 'https://espaceclient.orange.fr' },
    { label: 'Free Mobile',     url: 'https://mobile.free.fr/account' },
    { label: 'Bouygues',        url: 'https://www.bouyguestelecom.fr/mon-compte' },
    { label: 'Free Fibre',      url: 'https://adsl.free.fr/login.pl' },
  ],
  'charges-impots': [
    { label: 'Impots.gouv',     url: 'https://cfspart.impots.gouv.fr' },
  ],
  'assurances-secu': [
    { label: 'Ameli',           url: 'https://assure.ameli.fr' },
  ],
  'assurances-mutuelle': [
    { label: 'Harmonie',        url: 'https://www.harmonie-mutuelle.fr/espace-client' },
    { label: 'MGEN',            url: 'https://www.mgen.fr/mon-espace-perso' },
    { label: 'Malakoff',        url: 'https://www.malakoffhumanis.com/espace-client' },
    { label: 'Alan',            url: 'https://alan.com/fr-fr' },
    { label: 'April',           url: 'https://www.april.fr/espace-client' },
  ],
  'assurances-biens': [
    { label: 'AXA',             url: 'https://www.axa.fr/mon-espace-client' },
    { label: 'MAIF',            url: 'https://www.maif.fr/espace-client' },
    { label: 'MACIF',           url: 'https://www.macif.fr/assurance/particuliers/espace-client' },
    { label: 'Groupama',        url: 'https://www.groupama.fr/espace-client' },
    { label: 'Allianz',         url: 'https://www.allianz.fr/espace-client' },
  ],
  'portefeuille-cb': [
    { label: 'BNP Paribas',     url: 'https://mabanque.bnpparibas.com' },
    { label: 'Credit Agricole', url: 'https://www.credit-agricole.fr/ca-languedoc/particulier.html' },
    { label: 'Societe Generale',url: 'https://particuliers.societegenerale.fr' },
    { label: 'LCL',             url: 'https://monespace.lcl.fr' },
    { label: 'Boursorama',      url: 'https://www.boursorama.com/mon-espace' },
    { label: 'Revolut',         url: 'https://app.revolut.com' },
    { label: 'Fortuneo',        url: 'https://www.fortuneo.fr/espace-client' },
  ],
  'loisirs-licences': [
    { label: 'Netflix',         url: 'https://www.netflix.com/browse' },
    { label: 'Spotify',         url: 'https://www.spotify.com/fr/account' },
    { label: 'Disney+',         url: 'https://www.disneyplus.com/fr-fr' },
    { label: 'Canal+',          url: 'https://www.canalplus.com/espace-client' },
    { label: 'Amazon Prime',    url: 'https://www.amazon.fr/gp/css/homepage.html' },
    { label: 'Apple TV+',       url: 'https://tv.apple.com' },
    { label: 'YouTube Premium', url: 'https://www.youtube.com/premium' },
  ],
}

export default function ModuleDetail({ session }) {
  const navigate = useNavigate()
  const { groupeId, moduleId } = useParams()
  const [data, setData] = useState(null)
  const [mode, setMode] = useState('view')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  const config = getModuleConfig(groupeId, moduleId)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data } = await supabase
      .from('modules_data')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('groupe', groupeId)
      .eq('module', moduleId)
      .single()
    if (data) {
      setData(data)
      setForm({
        ...data.champs,
        ...data.credentials,
        lien_direct: data.lien_direct
      })
    }
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

    if (data) {
      await supabase.from('modules_data').update({
        champs,
        credentials,
        lien_direct: form.lien_direct || null,
        updated_at: new Date().toISOString()
      }).eq('id', data.id)
    } else {
      await supabase.from('modules_data').insert({
        user_id: session.user.id,
        groupe: groupeId,
        module: moduleId,
        label: config.label,
        champs,
        credentials,
        lien_direct: form.lien_direct || null,
      })
    }

    await loadData()
    setMode('view')
    setSaving(false)
  }

  const handleOpenLink = () => {
    if (data?.lien_direct) {
      window.open(data.lien_direct, '_blank')
    }
  }

  if (loading) return (
    <div style={{...s.container, display: 'flex',
      alignItems: 'center', justifyContent: 'center'}}>
      <div style={{color: '#bbb', fontSize: '13px'}}>Chargement...</div>
    </div>
  )

  return (
    <div style={s.container}>

      {/* TOPBAR */}
      <div style={s.topbar}>
        <button onClick={() => navigate('/')} style={s.back}>←</button>
        <div style={s.titleWrap}>
          <div style={{...s.groupTag,
            background: config.bgLight, color: config.color}}>
            {config.groupLabel}
          </div>
          <div style={s.title}>{config.label}</div>
        </div>
        <button
          onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
          style={s.editBtn}>
          {mode === 'edit' ? '✕' : '✏️'}
        </button>
      </div>

      {/* ACCES DIRECT */}
      {data?.lien_direct && mode === 'view' && (
        <div style={{...s.accessCard, borderColor: config.color + '40'}}>
          <div style={s.accessLeft}>
            <div style={{...s.accessIcon, background: config.bgLight}}>
              <svg width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke={config.color}
                strokeWidth="2" strokeLinecap="round">
                <path d={config.icon}/>
              </svg>
            </div>
            <div>
              <div style={s.accessTitle}>Acces direct</div>
              <div style={s.accessUrl}>
                {data.lien_direct.replace('https://', '').split('/')[0]}
              </div>
            </div>
          </div>
          <button
            onClick={handleOpenLink}
            style={{...s.accessBtn, background: config.color}}>
            Ouvrir →
          </button>
        </div>
      )}

      {/* MODE VIEW */}
      {mode === 'view' ? (
        <div style={s.viewWrap}>
          {!data ? (
            <div style={s.empty}>
              <div style={{fontSize: '40px', marginBottom: '12px'}}>📋</div>
              <div style={s.emptyTitle}>Aucune information</div>
              <div style={s.emptySub}>
                Appuie sur ✏️ pour renseigner ce module
              </div>
              <button
                onClick={() => setMode('edit')}
                style={{...s.saveBtn,
                  background: config.color, marginTop: '16px'}}>
                Renseigner maintenant
              </button>
            </div>
          ) : (
            <div style={s.fields}>
              {config.fields.filter(f => !f.sensitive).map((f, i) => (
                <div key={f.key} style={{
                  ...s.fieldRow,
                  borderBottom: i < config.fields.filter(x => !x.sensitive).length - 1
                    ? '1px solid rgba(0,0,0,0.05)' : 'none'
                }}>
                  <div style={s.fieldLabel}>{f.label}</div>
                  <div style={s.fieldValue}>
                    {data.champs?.[f.key] || '—'}
                  </div>
                </div>
              ))}
              {config.fields.filter(f => f.sensitive).length > 0 && (
                <div style={s.credentialsWrap}>
                  <div style={s.credTitle}>🔐 Identifiants</div>
                  {config.fields.filter(f => f.sensitive).map(f => (
                    <div key={f.key} style={s.fieldRow}>
                      <div style={s.fieldLabel}>{f.label}</div>
                      <div style={s.fieldValue}>
                        {data.credentials?.[f.key] ? '••••••••' : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      ) : (

        /* MODE EDIT */
        <div style={s.formWrap}>

          {/* CHAMPS NORMAUX */}
          {config.fields.map(f => (
            <div key={f.key} style={s.formField}>
              <div style={s.formLabel}>
                {f.sensitive && '🔐 '}{f.label}
              </div>
              <input
                style={s.input}
                type={f.type || 'text'}
                placeholder={f.placeholder || ''}
                value={form[f.key] || ''}
                onChange={e => setForm({...form, [f.key]: e.target.value})}
              />
            </div>
          ))}

          {/* LIENS PREDEFINIS */}
          {LIENS_PREDEFINIS[`${groupeId}-${moduleId}`] && (
            <div style={s.formField}>
              <div style={s.formLabel}>🔗 Choisir le service</div>
              <div style={s.presetRow}>
                {LIENS_PREDEFINIS[`${groupeId}-${moduleId}`].map(p => (
                  <button
                    key={p.label}
                    onClick={() => setForm({...form, lien_direct: p.url})}
                    style={{
                      ...s.presetBtn,
                      background: form.lien_direct === p.url
                        ? config.color : 'white',
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

          {/* LIEN DIRECT MANUEL */}
          <div style={s.formField}>
            <div style={s.formLabel}>🔗 Lien direct (espace client)</div>
            <input
              style={s.input}
              type="url"
              placeholder="https://..."
              value={form.lien_direct || ''}
              onChange={e => setForm({...form, lien_direct: e.target.value})}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{...s.saveBtn, background: config.color}}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>

        </div>
      )}

      <BottomNav />
    </div>
  )
}

function getModuleConfig(groupeId, moduleId) {
  const configs = {
    'charges-energie': {
      label: 'Electricite / Gaz', groupLabel: 'Mes charges',
      color: '#534AB7', bgLight: '#EEEDFE',
      icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      fields: [
        { key: 'fournisseur',      label: 'Fournisseur',           placeholder: 'EDF, Engie...' },
        { key: 'numero_client',    label: 'Numero client',         placeholder: '123456789' },
        { key: 'montant_mensuel',  label: 'Montant mensuel (€)',   placeholder: '80', type: 'number' },
        { key: 'prelevement_le',   label: 'Prelevement le',        placeholder: '5 du mois' },
        { key: 'date_fin_contrat', label: 'Fin de contrat',        type: 'date' },
        { key: 'login',            label: 'Identifiant',           sensitive: true, placeholder: 'email ou ID' },
        { key: 'password',         label: 'Mot de passe',          sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'charges-operateur': {
      label: 'Operateur Tel / Internet', groupLabel: 'Mes charges',
      color: '#534AB7', bgLight: '#EEEDFE',
      icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 4a2 2 0 0 1 2-2h4',
      fields: [
        { key: 'operateur',           label: 'Operateur',              placeholder: 'SFR, Orange...' },
        { key: 'numero_ligne',        label: 'Numero de ligne',        placeholder: '06 XX XX XX XX' },
        { key: 'forfait',             label: 'Forfait',                placeholder: '100Go 5G' },
        { key: 'montant_mensuel',     label: 'Montant mensuel (€)',    placeholder: '20', type: 'number' },
        { key: 'date_fin_engagement', label: 'Fin engagement',         type: 'date' },
        { key: 'login',               label: 'Identifiant',            sensitive: true, placeholder: 'email' },
        { key: 'password',            label: 'Mot de passe',           sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'charges-impots': {
      label: 'Impots', groupLabel: 'Mes charges',
      color: '#534AB7', bgLight: '#EEEDFE',
      icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
      fields: [
        { key: 'numero_fiscal',    label: 'Numero fiscal',             placeholder: '0 000 000 000 000' },
        { key: 'montant_mensuel',  label: 'Prelevement mensuel (€)',   placeholder: '150', type: 'number' },
        { key: 'date_declaration', label: 'Date declaration annuelle', type: 'date' },
        { key: 'login',            label: 'Identifiant',               sensitive: true, placeholder: 'Numero fiscal' },
        { key: 'password',         label: 'Mot de passe',              sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'assurances-secu': {
      label: 'Securite Sociale', groupLabel: 'Assurances',
      color: '#D85A30', bgLight: '#FAECE7',
      icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
      fields: [
        { key: 'numero_secu',      label: 'Numero secu',          placeholder: '1 XX XX XX XXX XXX XX' },
        { key: 'caisse',           label: 'Caisse rattachement',  placeholder: 'CPAM de...' },
        { key: 'medecin_traitant', label: 'Medecin traitant',     placeholder: 'Dr ...' },
        { key: 'login',            label: 'Identifiant ameli',    sensitive: true, placeholder: 'Numero secu' },
        { key: 'password',         label: 'Mot de passe',         sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'assurances-mutuelle': {
      label: 'Mutuelle', groupLabel: 'Assurances',
      color: '#D85A30', bgLight: '#FAECE7',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      fields: [
        { key: 'assureur',            label: 'Assureur',                placeholder: 'Harmonie, MGEN...' },
        { key: 'numero_adherent',     label: 'Numero adherent',         placeholder: '123456' },
        { key: 'cotisation',          label: 'Cotisation mensuelle (€)',placeholder: '60', type: 'number' },
        { key: 'date_renouvellement', label: 'Renouvellement',          type: 'date' },
        { key: 'login',               label: 'Identifiant',             sensitive: true, placeholder: 'email' },
        { key: 'password',            label: 'Mot de passe',            sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'assurances-biens': {
      label: 'Maison / Vehicule', groupLabel: 'Assurances',
      color: '#D85A30', bgLight: '#FAECE7',
      icon: 'M1 3h15v13H1zM16 8h4l3 5v3h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
      fields: [
        { key: 'assureur',       label: 'Assureur',             placeholder: 'AXA, MAIF...' },
        { key: 'numero_police',  label: 'Numero de police',     placeholder: '123456789' },
        { key: 'bien_assure',    label: 'Bien assure',          placeholder: 'Maison, Voiture...' },
        { key: 'prime_annuelle', label: 'Prime annuelle (€)',   placeholder: '400', type: 'number' },
        { key: 'echeance',       label: 'Echeance annuelle',    type: 'date' },
        { key: 'login',          label: 'Identifiant',          sensitive: true, placeholder: 'email' },
        { key: 'password',       label: 'Mot de passe',         sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'documents-identite': {
      label: 'Pieces d identite', groupLabel: 'Documents',
      color: '#5F5E5A', bgLight: '#F1EFE8',
      icon: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM8 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-4h4m-4 4h2',
      fields: [
        { key: 'cni_numero',            label: 'Numero CNI',          placeholder: 'XXXXXXXXX' },
        { key: 'cni_expiration',        label: 'Expiration CNI',      type: 'date' },
        { key: 'passeport_numero',      label: 'Numero passeport',    placeholder: 'XX0000000' },
        { key: 'passeport_expiration',  label: 'Expiration passeport',type: 'date' },
        { key: 'permis_numero',         label: 'Numero permis',       placeholder: 'XXXXXXXXX' },
        { key: 'permis_expiration',     label: 'Expiration permis',   type: 'date' },
      ]
    },
    'documents-fidelite': {
      label: 'Cartes fidelite', groupLabel: 'Documents',
      color: '#5F5E5A', bgLight: '#F1EFE8',
      icon: 'M2 5h20v14H2zM2 10h20',
      fields: [
        { key: 'enseigne', label: 'Enseigne',      placeholder: 'Leclerc, Sephora...' },
        { key: 'numero',   label: 'Numero carte',  placeholder: '1234567890123' },
        { key: 'points',   label: 'Points / Solde',placeholder: '250 points' },
      ]
    },
    'documents-justifs': {
      label: