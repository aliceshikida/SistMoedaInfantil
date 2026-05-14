import axios from 'axios'

function stripTrailingSlashes(s) {
  return s.replace(/\/+$/, '')
}

/** Em dev, se o front abre pelo IP da rede mas .env aponta para localhost, troca o host para o da página. */
function applyDevLanHostRewrite(url) {
  if (!import.meta.env.DEV || typeof window === 'undefined') return url
  const pageHost = window.location.hostname
  if (pageHost === 'localhost' || pageHost === '127.0.0.1') return url
  try {
    const u = new URL(url, window.location.href)
    if (u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') return url
    u.hostname = pageHost
    return stripTrailingSlashes(u.toString())
  } catch {
    return url
  }
}

function getApiBaseURL() {
  const fromEnv = import.meta.env.VITE_API_URL
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return applyDevLanHostRewrite(stripTrailingSlashes(String(fromEnv)))
  }
  return import.meta.env.DEV ? '/api' : 'http://localhost:4000/api'
}

/** Segmentos do caminho codificados (espaços e caracteres especiais no nome do ficheiro). */
function encodeUploadPath(p) {
  const parts = String(p).split('/').filter(Boolean)
  if (parts.length === 0) return '/'
  return `/${parts.map((seg) => encodeURIComponent(seg)).join('/')}`
}

/** Origem onde o Express serve `/uploads` (fora de `/api`). */
function getBackendPublicOrigin() {
  const explicit = String(import.meta.env.VITE_PUBLIC_FILES_ORIGIN || '').trim()
  if (explicit) return stripTrailingSlashes(explicit)

  const base = getApiBaseURL()
  if (base.startsWith('/')) {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      return stripTrailingSlashes(window.location.origin)
    }
    if (typeof window !== 'undefined' && import.meta.env.PROD) {
      const api = String(import.meta.env.VITE_API_URL || '').trim()
      if (!api) {
        console.warn(
          '[SME] Fotos em /uploads: defina VITE_API_URL com URL absoluta do backend (ex. https://api.teuservico.com/api) ou VITE_PUBLIC_FILES_ORIGIN (só a origem, ex. https://api.teuservico.com). Caso contrário o pedido da imagem vai para o host do site (ex. Vercel) e falha.',
        )
      }
    }
    return typeof window !== 'undefined' ? stripTrailingSlashes(window.location.origin) : ''
  }
  try {
    return new URL(base).origin
  } catch {
    return 'http://localhost:4000'
  }
}

export const api = axios.create({
  baseURL: getApiBaseURL(),
})

/**
 * URL absoluta para ficheiros na raiz do backend (`/uploads/...`), fora de `/api`.
 * Em dev, `/uploads` deve ir pelo mesmo host do Vite (proxy em vite.config.js), mesmo
 * com `VITE_API_URL` apontando para outra origem — evita falhas ao carregar `<img>`.
 */
export function resolvePublicFileUrl(relativePath) {
  if (!relativePath) return ''
  const raw = String(relativePath).trim().replace(/\\/g, '/')
  if (/^https?:\/\//i.test(raw)) return raw
  const path = raw.startsWith('/') ? raw : `/${raw}`
  const isUpload = path === '/uploads' || path.startsWith('/uploads/')
  const safePath = encodeUploadPath(path)

  if (import.meta.env.DEV && typeof window !== 'undefined' && isUpload) {
    return `${stripTrailingSlashes(window.location.origin)}${safePath}`
  }

  const origin = getBackendPublicOrigin()
  if (!origin) return safePath
  try {
    return new URL(safePath, `${origin}/`).href
  } catch {
    return `${origin}${safePath}`
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sme_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})
