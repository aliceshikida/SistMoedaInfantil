import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadMe() {
    try {
      const token = localStorage.getItem('sme_token')
      if (!token) return
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMe()
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      async signIn(payload) {
        const { data } = await api.post('/auth/login', payload)
        localStorage.setItem('sme_token', data.token)
        setUser(data.user)
      },
      async signOut() {
        localStorage.removeItem('sme_token')
        setUser(null)
      },
      async registerAluno(payload) {
        const { data } = await api.post('/auth/register/aluno', payload)
        localStorage.setItem('sme_token', data.token)
        setUser(data.user)
      },
      async registerEmpresa(payload) {
        const { data } = await api.post('/auth/register/empresa', payload)
        localStorage.setItem('sme_token', data.token)
        setUser(data.user)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
