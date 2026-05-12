import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

/** URL absoluta para arquivos na raiz do backend (ex.: `/uploads/...` servido fora de `/api`). */
export function resolvePublicFileUrl(relativePath) {
  if (!relativePath) return ''
  if (/^https?:\/\//i.test(relativePath)) return relativePath
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '')
  const origin = apiBase.replace(/\/api$/i, '') || 'http://localhost:4000'
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  return `${origin}${path}`
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sme_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})
