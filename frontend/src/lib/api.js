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

export const api = axios.create({
  baseURL: getApiBaseURL(),
})

/**
 * URL absoluta para ficheiros na raiz do backend (`/uploads/...`), fora de `/api`.
 * Em dev sem VITE_API_URL usa o mesmo host do Vite + proxy para `/uploads`.
 */
export function resolvePublicFileUrl(relativePath) {
  if (!relativePath) return ''
  if (/^https?:\/\//i.test(relativePath)) return relativePath
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  const base = getApiBaseURL()
  if (base.startsWith('/')) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}${path}`
  }
  try {
    const origin = new URL(base).origin
    return `${origin}${path}`
  } catch {
    return `http://localhost:4000${path}`
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
