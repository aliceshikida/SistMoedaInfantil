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

/** URL absoluta da API para inferir o host onde o Express serve `/uploads` (fora de `/api`). */
function normalizeAbsoluteApiUrl(raw) {
  const s = String(raw ?? '').trim()
  if (!s || s.startsWith('/')) return ''
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  return `https://${s}`
}

/** Origem do backend (scheme + host [+ porta]) a partir de `VITE_API_URL`, ex. `https://api.onrender.com/api` → `https://api.onrender.com`. */
function backendOriginFromViteApiUrl() {
  const normalized = normalizeAbsoluteApiUrl(import.meta.env.VITE_API_URL)
  if (!normalized) return ''
  try {
    return stripTrailingSlashes(new URL(normalized).origin)
  } catch {
    return ''
  }
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

  const fromViteApi = backendOriginFromViteApiUrl()
  if (fromViteApi) return fromViteApi

  const base = getApiBaseURL()
  if (import.meta.env.PROD && !fromViteApi && !explicit && base.includes('localhost')) {
    console.warn(
      '[SME] Build de produção sem VITE_API_URL absoluta do backend — as fotos em /uploads não vão carregar. No Vercel, define VITE_API_URL (ex. https://teu-api.onrender.com/api) e faz redeploy.',
    )
  }
  if (!base.startsWith('/')) {
    try {
      return stripTrailingSlashes(new URL(base).origin)
    } catch {
      return stripTrailingSlashes('http://localhost:4000')
    }
  }

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return stripTrailingSlashes(window.location.origin)
  }

  if (import.meta.env.PROD && typeof window !== 'undefined') {
    console.warn(
      '[SME] Fotos /uploads: em produção defina VITE_API_URL como URL absoluta do backend (ex. https://teu-api.onrender.com/api) ou VITE_PUBLIC_FILES_ORIGIN (ex. https://teu-api.onrender.com). Com só `/api` relativo, as imagens não vêm do Vercel.',
    )
  }

  return typeof window !== 'undefined' ? stripTrailingSlashes(window.location.origin) : ''
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
