import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

export default function Home({ session, onLock }) {
  const navigate = useNavigate()
  const pinActive = localStorage.getItem('mindesk_pin_active') === 'true'
  const bioActive = localStorage.getItem('mindesk_biometric_active') === 'true'

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={s.container}>

      <div style={s.topbar}>
        <div style={s.topLeft}>
          <div style={s.avatar}>
            {session.user.email[0].toUpperCase()}
          </div>
          <div style={s.logo}>
            <span style={s.logoMind}>Mind</span>
            <span style={s.logoEsk}>esk</span>
          </div>
        </div>
        <div style={s.topRight}>
          <button
            onClick={() => navigate('/settings')}
            style={s.iconBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
          </button>
          <button style={s.micBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={s.aiBar}>
        <div style={s.aiDot} />
        <span style={s.aiHint}>
          <strong style={s.aiStrong}>Que cherches-tu ?</strong> — parle ou écris…
        </span>
      </div>

      <div style={s.scroll}>

        {/* BLOC 1 — ACCÈS DIRECT (transversal : attraper une info en un geste) */}
        <div style={s.sectionLabel}>Accès direct</div>
        <div style={s.directWrap}>
          {accesDirect.map(a => (
            <div
              key={a.id}
              style={s.directCard}
              onClick={() => navigate(a.to)}>
              <div style={{...s.directIcon, background: a.bg}}>{a.emoji}</div>
              <div style={s.directLabel}>{a.label}</div>
              <div style={s.directSub}>{a.sub}</div>
            </div>
          ))}
        </div>

        {/* BLOC 2 — MES DOSSIERS (organisé par thème) */}
        <div style={s.sectionLabel}>Mes dossiers</div>
        {groupes.map(groupe => (
          <div key={groupe.id} style={s.group}>
            <div style={s.groupHeader}>
              <div style={{...s.groupBar, background: groupe.color}} />
              <div style={{...s.groupTitle, color: groupe.color}}>{groupe.label}</div>
              <div style={s.groupCount}>{groupe.modules.length} modules</div>
            </div>
            <div style={s.groupGrid}>
              {groupe.modules.map(mod => (
                <div
                  key={mod.id}
                  style={s.card}
                  onClick={() => navigate(`/module/${groupe.id}/${mod.id}`)}>
                  <div style={{...s.cardStripe, background: groupe.color}} />
                  <div style={{...s.iconWrap, background: groupe.bgLight}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={groupe.color} strokeWidth="2" strokeLinecap="round">
                      <path d={mod.icon}/>
                    </svg>
                  </div>
                  <div style={s.cardLabel}>{mod.label}</div>
                  <div style={s.cardSub}>{mod.sub}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* RÉGLAGES RAPIDES (à déplacer dans une page Réglages dédiée) */}
        <div style={s.actionsWrap}>
          {!pinActive && window.innerWidth < 768 && (
            <button onClick={() => navigate('/setup-pin')} style={{...s.actionBtn, color: '#534AB7', borderColor: 'rgba(83,74,183,0.2)'}}>
              🔐 Activer le code PIN
            </button>
          )}
          {pinActive && window.innerWidth < 768 && (
            <button onClick={() => onLock()} style={{...s.actionBtn, color: '#534AB7', borderColor: 'rgba(83,74,183,0.2)'}}>
              🔒 Verrouiller
            </button>
          )}
          {!bioActive && window.innerWidth < 768 && (
            <button onClick={() => navigate('/setup-biometric')} style={{...s.actionBtn, color: '#1D9E75', borderColor: 'rgba(29,158,117,0.2)'}}>
              👆 Activer l'empreinte
            </button>
          )}
          <button onClick={handleLogout} style={s.actionBtn}>
            Déconnexion complète
          </button>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}

// BLOC 1 — raccourcis transversaux. Chaque tuile mène à une vue qui
// pioche dans plusieurs modules (ex. « Mes numéros » = Sécu + Identité + CB).
const accesDirect = [
  { id: 'call',    label: 'Appeler',     sub: 'médecin, proches',  emoji: '📞', bg: '#FAECE7', to: '/direct/appeler' },
  { id: 'numeros', label: 'Mes numéros', sub: 'sécu, fiscal, IBAN', emoji: '🔢', bg: '#EEEDFE', to: '/direct/numeros' },
  { id: 'papiers', label: 'Mes papiers', sub: 'CNI, vitale…',       emoji: '📄', bg: '#F1EFE8', to: '/direct/papiers' },
  { id: 'avenir',  label: 'À venir',     sub: 'échéances & rdv',    emoji: '📅', bg: '#E1F5EE', to: '/direct/avenir' },
]

const groupes = [
  {
    id: 'charges',
    label: 'Mes charges',
    color: '#534AB7',
    bgLight: '#EEEDFE',
    modules: [
      { id: 'energie',   label: 'Électricité', sub: 'Gaz',           icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
      { id: 'operateur', label: 'Opérateur',   sub: 'Tél / Internet', icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 4a2 2 0 0 1 2-2h4' },
      { id: 'impots',    label: 'Impôts',      sub: 'Taxes',          icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10' },
    ]
  },
  {
    id: 'assurances',
    label: 'Assurances',
    color: '#D85A30',
    bgLight: '#FAECE7',
    modules: [
      { id: 'secu',     label: 'Sécu',     sub: 'Sociale',  icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
      { id: 'mutuelle', label: 'Mutuelle', sub: 'Santé',    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
      { id: 'biens',    label: 'Maison',   sub: 'Véhicule', icon: 'M1 3h15v13H1zM16 8h4l3 5v3h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
    ]
  },
  {
    id: 'documents',
    label: 'Documents',
    color: '#5F5E5A',
    bgLight: '#F1EFE8',
    modules: [
      { id: 'identite', label: 'Identité',      sub: 'CNI, passeport', icon: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM8 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-4h4m-4 4h2' },
      { id: 'fidelite', label: 'Cartes',        sub: 'Fidélité',       icon: 'M2 5h20v14H2zM2 10h20' },
      { id: 'justifs',  label: 'Justificatifs', sub: 'Factures',       icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6' },
    ]
  },
  {
    id: 'portefeuille',
    label: 'Portefeuille',
    color: '#1D9E75',
    bgLight: '#E1F5EE',
    modules: [
      { id: 'cb',         label: 'CB',         sub: 'Cartes bancaires', icon: 'M2 5h20v14H2zM2 10h20' },
      { id: 'placements', label: 'Placements', sub: 'Épargne',          icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
      { id: 'budget',     label: 'Budget',     sub: 'Dépenses',         icon: 'M3 3h18v18H3zM3 9h18M9 21V9' },
    ]
  },
  {
    id: 'organisation',
    label: 'Organisation',
    color: '#BA7517',
    bgLight: '#FAEEDA',
    modules: [
      { id: 'rdvs',    label: 'Mes RDVs',  sub: 'Agenda',  icon: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18' },
      { id: 'notes',   label: 'Mes notes', sub: 'Mémo',    icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
      { id: 'rappels', label: 'À ne pas',  sub: 'oublier', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
    ]
  },
  {
    id: 'loisirs',
    label: 'Mes loisirs',
    color: '#7F77DD',
    bgLight: '#EEEDFE',
    modules: [
      { id: 'jeux',      label: 'Mes jeux',  sub: 'Gaming',      icon: 'M2 6h20v12H2zM12 12h.01M7 12h.01M17 12h.01' },
      { id: 'licences',  label: 'Licences',  sub: 'Abonnements', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4' },
      { id: 'souvenirs', label: 'Souvenirs', sub: 'Photos',      icon: 'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21' },
    ]
  },
]

const s = {
  container: { minHeight: '100vh', paddingBottom: '70px',
    background: '#f7f5f0', fontFamily: 'system-ui, sans-serif' },
  topbar: { padding: '10px 14px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', background: '#f7f5f0' },
  topLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #534AB7, #1D9E75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', color: 'white', fontWeight: '700' },
  logo: { fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' },
  logoMind: { color: '#534AB7' },
  logoEsk: { color: '#1D9E75' },
  topRight: { display: 'flex', gap: '8px', alignItems: 'center' },
  iconBtn: { width: '30px', height: '30px', borderRadius: '50%',
    background: 'white', border: '1px solid rgba(0,0,0,0.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  micBtn: { width: '30px', height: '30px', background: '#534AB7',
    border: 'none', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  aiBar: { margin: '4px 14px 12px', background: 'white',
    border: '1.5px solid rgba(83,74,183,0.18)', borderRadius: '12px',
    padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '8px' },
  aiDot: { width: '7px', height: '7px', borderRadius: '50%',
    background: '#534AB7', flexShrink: 0 },
  aiHint: { fontSize: '11px', color: '#bbb' },
  aiStrong: { color: '#444', fontWeight: '500' },
  scroll: { overflowY: 'auto' },

  sectionLabel: { fontSize: '11px', fontWeight: '700', color: '#999',
    padding: '0 14px', margin: '4px 0 8px' },

  directWrap: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
    gap: '7px', padding: '0 14px', marginBottom: '20px' },
  directCard: { background: 'white', borderRadius: '12px', padding: '10px 4px 11px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.04)' },
  directIcon: { width: '34px', height: '34px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '6px', fontSize: '16px' },
  directLabel: { fontSize: '10px', fontWeight: '600', color: '#1a1510', lineHeight: '1.2' },
  directSub: { fontSize: '8px', color: '#bbb', marginTop: '2px' },

  group: { padding: '0 14px', marginBottom: '16px' },
  groupHeader: { display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' },
  groupBar: { width: '3px', height: '14px', borderRadius: '2px', flexShrink: 0 },
  groupTitle: { fontSize: '11px', fontWeight: '700' },
  groupCount: { fontSize: '9px', color: '#bbb', marginLeft: 'auto' },
  groupGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '7px' },
  card: { background: 'white', borderRadius: '12px', padding: '10px 6px 12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center',
    cursor: 'pointer', position: 'relative', overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.04)', minHeight: '82px' },
  cardStripe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '2.5px' },
  iconWrap: { width: '32px', height: '32px', borderRadius: '9px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '7px', flexShrink: 0 },
  cardLabel: { fontSize: '10px', fontWeight: '600', color: '#1a1510', lineHeight: '1.2' },
  cardSub: { fontSize: '8.5px', color: '#bbb', marginTop: '2px' },
  actionsWrap: { padding: '0 14px', marginBottom: '16px',
    display: 'flex', flexDirection: 'column', gap: '8px' },
  actionBtn: { width: '100%', padding: '10px', borderRadius: '10px',
    border: '1px solid rgba(0,0,0,0.08)', background: 'transparent',
    color: '#bbb', fontSize: '12px', cursor: 'pointer' },
}
