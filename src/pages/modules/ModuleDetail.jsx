import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

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
      setForm({ ...data.champs, ...data.credentials, lien_direct: data.lien_direct })
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
        champs, credentials,
        lien_direct: form.lien_direct || null,
        updated_at: new Date().toISOString()
      }).eq('id', data.id)
    } else {
      await supabase.from('modules_data').insert({
        user_id: session.user.id,
        groupe: groupeId,
        module: moduleId,
        label: config.label,
        champs, credentials,
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
    <div style={{...s.container, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#bbb', fontSize:'13px'}}>Chargement...</div>
    </div>
  )

  return (
    <div style={s.container}>
      <div style={s.topbar}>
        <button onClick={() => navigate('/')} style={s.back}>←</button>
        <div style={s.titleWrap}>
          <div style={{...s.groupTag, background: config.bgLight, color: config.color}}>
            {config.groupLabel}
          </div>
          <div style={s.title}>{config.label}</div>
        </div>
        <button onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')} style={s.editBtn}>
          {mode === 'edit' ? '✕' : '✏️'}
        </button>
      </div>

      {/* ACCES DIRECT */}
      {data?.lien_direct && mode === 'view' && (
        <div style={{...s.accessCard, borderColor: config.color + '40'}}>
          <div style={s.accessLeft}>
            <div style={{...s.accessIcon, background: config.bgLight}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={config.color} strokeWidth="2" strokeLinecap="round">
                <path d={config.icon}/>
              </svg>
            </div>
            <div>
              <div style={s.accessTitle}>Accès direct</div>
              <div style={s.accessUrl}>{data.lien_direct.replace('https://', '').split('/')[0]}</div>
            </div>
          </div>
          <button onClick={handleOpenLink}
            style={{...s.accessBtn, background: config.color}}>
            Ouvrir →
          </button>
        </div>
      )}

      {mode === 'view' ? (
        <div style={s.viewWrap}>
          {!data ? (
            <div style={s.empty}>
              <div style={{fontSize:'40px', marginBottom:'12px'}}>📋</div>
              <div style={s.emptyTitle}>Aucune information</div>
              <div style={s.emptySub}>Appuie sur ✏️ pour renseigner ce module</div>
              <button onClick={() => setMode('edit')}
                style={{...s.saveBtn, background: config.color, marginTop:'16px'}}>
                Renseigner maintenant
              </button>
            </div>
          ) : (
            <div style={s.fields}>
              {config.fields.filter(f => !f.sensitive).map(f => (
                <div key={f.key} style={s.fieldRow}>
                  <div style={s.fieldLabel}>{f.label}</div>
                  <div style={s.fieldValue}>{data.champs?.[f.key] || '—'}</div>
                </div>
              ))}
              {config.fields.filter(f => f.sensitive).length > 0 && (
                <div style={s.credentialsWrap}>
                  <div style={s.credTitle}>🔐 Identifiants (chiffrés)</div>
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
        <div style={s.formWrap}>
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

          <button onClick={handleSave} disabled={saving}
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
        { key: 'fournisseur', label: 'Fournisseur', placeholder: 'EDF, Engie...' },
        { key: 'numero_client', label: 'Numero client', placeholder: '123456789' },
        { key: 'montant_mensuel', label: 'Montant mensuel (€)', placeholder: '80', type: 'number' },
        { key: 'prelevement_le', label: 'Prelevement le', placeholder: '5 du mois' },
        { key: 'date_fin_contrat', label: 'Fin de contrat', type: 'date' },
        { key: 'login', label: 'Identifiant espace client', sensitive: true, placeholder: 'email ou ID' },
        { key: 'password', label: 'Mot de passe', sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'charges-operateur': {
      label: 'Operateur Tel / Internet', groupLabel: 'Mes charges',
      color: '#534AB7', bgLight: '#EEEDFE',
      icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 4a2 2 0 0 1 2-2h4',
      fields: [
        { key: 'operateur', label: 'Operateur', placeholder: 'SFR, Orange, Free...' },
        { key: 'numero_ligne', label: 'Numero de ligne', placeholder: '06 XX XX XX XX' },
        { key: 'forfait', label: 'Forfait', placeholder: 'Ex: 100Go 5G' },
        { key: 'montant_mensuel', label: 'Montant mensuel (€)', placeholder: '20', type: 'number' },
        { key: 'date_fin_engagement', label: 'Fin engagement', type: 'date' },
        { key: 'login', label: 'Identifiant espace client', sensitive: true, placeholder: 'email ou ID' },
        { key: 'password', label: 'Mot de passe', sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'charges-impots': {
      label: 'Impots', groupLabel: 'Mes charges',
      color: '#534AB7', bgLight: '#EEEDFE',
      icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
      fields: [
        { key: 'numero_fiscal', label: 'Numero fiscal', placeholder: '0 000 000 000 000' },
        { key: 'montant_mensuel', label: 'Prelevement mensuel (€)', placeholder: '150', type: 'number' },
        { key: 'date_declaration', label: 'Date declaration annuelle', type: 'date' },
        { key: 'login', label: 'Identifiant impots.gouv.fr', sensitive: true, placeholder: 'Numero fiscal' },
        { key: 'password', label: 'Mot de passe', sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'assurances-secu': {
      label: 'Securite Sociale', groupLabel: 'Assurances',
      color: '#D85A30', bgLight: '#FAECE7',
      icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
      fields: [
        { key: 'numero_secu', label: 'Numero de securite sociale', placeholder: '1 XX XX XX XXX XXX XX' },
        { key: 'caisse', label: 'Caisse rattachement', placeholder: 'CPAM de...' },
        { key: 'medecin_traitant', label: 'Medecin traitant', placeholder: 'Dr ...' },
        { key: 'login', label: 'Identifiant ameli.fr', sensitive: true, placeholder: 'Numero secu' },
        { key: 'password', label: 'Mot de passe', sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'assurances-mutuelle': {
      label: 'Mutuelle', groupLabel: 'Assurances',
      color: '#D85A30', bgLight: '#FAECE7',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      fields: [
        { key: 'assureur', label: 'Assureur', placeholder: 'Harmonie, MGEN...' },
        { key: 'numero_adherent', label: 'Numero adherent', placeholder: '123456' },
        { key: 'cotisation', label: 'Cotisation mensuelle (€)', placeholder: '60', type: 'number' },
        { key: 'date_renouvellement', label: 'Renouvellement', type: 'date' },
        { key: 'login', label: 'Identifiant espace adherent', sensitive: true, placeholder: 'email' },
        { key: 'password', label: 'Mot de passe', sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'assurances-biens': {
      label: 'Maison / Vehicule', groupLabel: 'Assurances',
      color: '#D85A30', bgLight: '#FAECE7',
      icon: 'M1 3h15v13H1zM16 8h4l3 5v3h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
      fields: [
        { key: 'assureur', label: 'Assureur', placeholder: 'AXA, MAIF...' },
        { key: 'numero_police', label: 'Numero de police', placeholder: '123456789' },
        { key: 'bien_assure', label: 'Bien assure', placeholder: 'Maison, Voiture...' },
        { key: 'prime_annuelle', label: 'Prime annuelle (€)', placeholder: '400', type: 'number' },
        { key: 'echeance', label: 'Echeance annuelle', type: 'date' },
        { key: 'login', label: 'Identifiant espace client', sensitive: true, placeholder: 'email' },
        { key: 'password', label: 'Mot de passe', sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'documents-identite': {
      label: 'Pieces d identite', groupLabel: 'Documents',
      color: '#5F5E5A', bgLight: '#F1EFE8',
      icon: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM8 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-4h4m-4 4h2',
      fields: [
        { key: 'cni_numero', label: 'Numero CNI', placeholder: 'XXXXXXXXX' },
        { key: 'cni_expiration', label: 'Expiration CNI', type: 'date' },
        { key: 'passeport_numero', label: 'Numero passeport', placeholder: 'XX0000000' },
        { key: 'passeport_expiration', label: 'Expiration passeport', type: 'date' },
        { key: 'permis_numero', label: 'Numero permis', placeholder: 'XXXXXXXXX' },
        { key: 'permis_expiration', label: 'Expiration permis', type: 'date' },
      ]
    },
    'documents-fidelite': {
      label: 'Cartes fidelite', groupLabel: 'Documents',
      color: '#5F5E5A', bgLight: '#F1EFE8',
      icon: 'M2 5h20v14H2zM2 10h20',
      fields: [
        { key: 'enseigne', label: 'Enseigne', placeholder: 'Leclerc, Sephora...' },
        { key: 'numero', label: 'Numero carte', placeholder: '1234567890123' },
        { key: 'points', label: 'Points / Solde', placeholder: '250 points' },
      ]
    },
    'documents-justifs': {
      label: 'Justificatifs', groupLabel: 'Documents',
      color: '#5F5E5A', bgLight: '#F1EFE8',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6',
      fields: [
        { key: 'type', label: 'Type de document', placeholder: 'Facture, quittance...' },
        { key: 'emetteur', label: 'Emetteur', placeholder: 'EDF, propriétaire...' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'notes', label: 'Notes', placeholder: 'Details...' },
      ]
    },
    'portefeuille-cb': {
      label: 'Cartes bancaires', groupLabel: 'Portefeuille',
      color: '#1D9E75', bgLight: '#E1F5EE',
      icon: 'M2 5h20v14H2zM2 10h20',
      fields: [
        { key: 'banque', label: 'Banque', placeholder: 'BNP, Credit Agricole...' },
        { key: 'derniers_chiffres', label: '4 derniers chiffres', placeholder: '4242', type: 'number' },
        { key: 'type', label: 'Type', placeholder: 'Visa, Mastercard...' },
        { key: 'expiration', label: 'Expiration', placeholder: 'MM/AA' },
      ]
    },
    'portefeuille-placements': {
      label: 'Placements', groupLabel: 'Portefeuille',
      color: '#1D9E75', bgLight: '#E1F5EE',
      icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      fields: [
        { key: 'etablissement', label: 'Etablissement', placeholder: 'Banque, assureur...' },
        { key: 'type', label: 'Type', placeholder: 'Livret A, PEL, PEA...' },
        { key: 'solde', label: 'Solde (€)', placeholder: '5000', type: 'number' },
        { key: 'taux', label: 'Taux (%)', placeholder: '3', type: 'number' },
      ]
    },
    'portefeuille-budget': {
      label: 'Budget', groupLabel: 'Portefeuille',
      color: '#1D9E75', bgLight: '#E1F5EE',
      icon: 'M3 3h18v18H3zM3 9h18M9 21V9',
      fields: [
        { key: 'revenus', label: 'Revenus mensuels (€)', placeholder: '2500', type: 'number' },
        { key: 'charges_fixes', label: 'Charges fixes (€)', placeholder: '1200', type: 'number' },
        { key: 'budget_courses', label: 'Budget courses (€)', placeholder: '400', type: 'number' },
        { key: 'budget_loisirs', label: 'Budget loisirs (€)', placeholder: '200', type: 'number' },
      ]
    },
    'organisation-rdvs': {
      label: 'Mes RDVs', groupLabel: 'Organisation',
      color: '#BA7517', bgLight: '#FAEEDA',
      icon: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
      fields: [
        { key: 'prochain_rdv', label: 'Prochain RDV', placeholder: 'Medecin, banque...' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'heure', label: 'Heure', type: 'time' },
        { key: 'lieu', label: 'Lieu', placeholder: 'Adresse...' },
        { key: 'notes', label: 'Notes', placeholder: 'Preparation...' },
      ]
    },
    'organisation-notes': {
      label: 'Mes notes', groupLabel: 'Organisation',
      color: '#BA7517', bgLight: '#FAEEDA',
      icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
      fields: [
        { key: 'titre', label: 'Titre', placeholder: 'Ma note...' },
        { key: 'contenu', label: 'Contenu', placeholder: 'Ecris ici...' },
        { key: 'tags', label: 'Tags', placeholder: 'pro, perso, idee...' },
      ]
    },
    'organisation-rappels': {
      label: 'A ne pas oublier', groupLabel: 'Organisation',
      color: '#BA7517', bgLight: '#FAEEDA',
      icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
      fields: [
        { key: 'tache', label: 'Tache', placeholder: 'Ce que je ne dois pas oublier...' },
        { key: 'priorite', label: 'Priorite', placeholder: 'Haute, Moyenne, Basse' },
        { key: 'date_limite', label: 'Date limite', type: 'date' },
        { key: 'notes', label: 'Notes', placeholder: 'Details...' },
      ]
    },
    'loisirs-jeux': {
      label: 'Mes jeux', groupLabel: 'Mes loisirs',
      color: '#7F77DD', bgLight: '#EEEDFE',
      icon: 'M2 6h20v12H2zM12 12h.01M7 12h.01M17 12h.01',
      fields: [
        { key: 'titre', label: 'Titre du jeu', placeholder: 'Nom du jeu...' },
        { key: 'plateforme', label: 'Plateforme', placeholder: 'PS5, PC, Switch...' },
        { key: 'statut', label: 'Statut', placeholder: 'En cours, Termine, A faire' },
        { key: 'note', label: 'Ma note /10', placeholder: '8', type: 'number' },
      ]
    },
    'loisirs-licences': {
      label: 'Licences / Abonnements', groupLabel: 'Mes loisirs',
      color: '#7F77DD', bgLight: '#EEEDFE',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
      fields: [
        { key: 'service', label: 'Service', placeholder: 'Netflix, Spotify...' },
        { key: 'prix_mensuel', label: 'Prix mensuel (€)', placeholder: '10', type: 'number' },
        { key: 'compte', label: 'Compte email', placeholder: 'email@...' },
        { key: 'renouvellement', label: 'Renouvellement', type: 'date' },
        { key: 'login', label: 'Identifiant', sensitive: true, placeholder: 'email' },
        { key: 'password', label: 'Mot de passe', sensitive: true, type: 'password', placeholder: '••••••••' },
      ]
    },
    'loisirs-souvenirs': {
      label: 'Mes souvenirs', groupLabel: 'Mes loisirs',
      color: '#7F77DD', bgLight: '#EEEDFE',
      icon: 'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
      fields: [
        { key: 'titre', label: 'Titre du souvenir', placeholder: 'Vacances, evenement...' },
        { key: 'lieu', label: 'Lieu', placeholder: 'Ou etais-tu ?' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'personnes', label: 'Avec qui', placeholder: 'Noms...' },
        { key: 'emotion', label: 'Note emotionnelle', placeholder: 'Ce que tu as ressenti...' },
      ]
    },
  }

  return configs[`${groupeId}-${moduleId}`] || {
    label: moduleId, groupLabel: groupeId,
    color: '#534AB7', bgLight: '#EEEDFE',
    icon: 'M12 2v20M2 12h20', fields: []
  }
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
  editBtn: { background: 'none', border: 'none', fontSize: '16px',
    cursor: 'pointer', padding: '4px 8px' },
  accessCard: { margin: '12px 14px', background: 'white', borderRadius: '14px',
    padding: '12px 14px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', border: '1.5px solid',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  accessLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  accessIcon: { width: '36px', height: '36px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center' },
  accessTitle: { fontSize: '12px', fontWeight: '600', color: '#1a1510' },
  accessUrl: { fontSize: '10px', color: '#bbb', marginTop: '1px' },
  accessBtn: { padding: '7px 14px', borderRadius: '10px', border: 'none',
    color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  viewWrap: { padding: '12px 14px' },
  empty: { textAlign: 'center', padding: '40px 24px' },
  emptyTitle: { fontSize: '16px', fontWeight: '600', color: '#1a1510', marginBottom: '6px' },
  emptySub: { fontSize: '12px', color: '#bbb', lineHeight: '1.5' },
  fields: { background: 'white', borderRadius: '14px',
    overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  fieldRow: { padding: '11px 14px', borderBottom: '1px solid rgba(0,0,0,0.05)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { fontSize: '11px', color: '#888', fontWeight: '500' },
  fieldValue: { fontSize: '12px', color: '#1a1510', fontWeight: '500',
    textAlign: 'right', maxWidth: '180px' },
  credentialsWrap: { background: '#f7f5f0', padding: '8px 14px' },
  credTitle: { fontSize: '10px', color: '#bbb', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' },
  formWrap: { padding: '14px' },
  formField: { marginBottom: '12px' },
  formLabel: { fontSize: '11px', fontWeight: '600', color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 13px', borderRadius: '11px',
    border: '1px solid rgba(0,0,0,0.1)', fontSize: '13px',
    background: 'white', outline: 'none',
    fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
    color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    marginTop: '4px' },
}