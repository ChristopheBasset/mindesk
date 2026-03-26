const RP_NAME = 'Mindesk'
const RP_ID = window.location.hostname

// Convertit base64url en ArrayBuffer
function base64urlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return buffer
}

// Convertit ArrayBuffer en base64url
function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Enregistre une nouvelle empreinte
export async function registerBiometric(userId, userEmail) {
  try {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: RP_NAME, id: RP_ID },
        user: {
          id: new TextEncoder().encode(userId),
          name: userEmail,
          displayName: userEmail,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
      }
    })

    const credentialId = bufferToBase64url(credential.rawId)
    const publicKey = bufferToBase64url(credential.response.getPublicKey
      ? credential.response.getPublicKey()
      : credential.response.attestationObject)

    return { credentialId, publicKey }
  } catch (err) {
    console.error('WebAuthn register error:', err)
    throw err
  }
}

// Vérifie l'empreinte
export async function verifyBiometric(credentialId) {
  try {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: RP_ID,
        allowCredentials: [{
          id: base64urlToBuffer(credentialId),
          type: 'public-key',
        }],
        userVerification: 'required',
        timeout: 60000,
      }
    })

    return !!assertion
  } catch (err) {
    console.error('WebAuthn verify error:', err)
    throw err
  }
}

// Vérifie si WebAuthn est supporté
export function isBiometricSupported() {
  return !!(navigator.credentials && window.PublicKeyCredential)
}