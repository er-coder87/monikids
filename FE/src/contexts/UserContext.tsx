import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '../services/ApiClient'

interface User {
  id: string
  email: string
  name: string
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (googleUser: { email: string; name: string; accessToken: string }) => Promise<void>
  logout: () => Promise<void>
}

interface ValidateTokenResponse {
  user: User
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login<{ user: User }>(email, password)

      if (response.error) throw new Error(response.error)
      if (!response.data?.user) throw new Error('No user data received')

      setUser(response.data.user)
      setIsAuthenticated(true)
    } catch (error) {
      throw error
    }
  }

  const loginWithGoogle = async (googleUser: { email: string; name: string; accessToken: string }) => {
    try {
      const response = await apiClient.post<{ user: User }>('/auth/google', {
        googleUser: {
          email: googleUser.email,
          name: googleUser.name
        },
        accessToken: googleUser.accessToken
      })

      if (response.error) throw new Error(response.error)
      if (!response.data?.user) throw new Error('No user data received')

      setUser(response.data.user)
      setIsAuthenticated(true)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const validateToken = async () => {
    try {
      const response = await apiClient.validateToken<ValidateTokenResponse>()

      if (response.error) throw new Error(response.error)
      if (response.data?.user) {
        setUser(response.data.user)
        setIsAuthenticated(true)
      }
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    validateToken()
  }, [])

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      loginWithGoogle,
      logout
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}