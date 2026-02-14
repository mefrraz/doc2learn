import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiEndpoint } from '@/lib/config'

interface User {
  id: string
  email: string
  name?: string | null
  createdAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Auth methods
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
  fetchUser: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      error: null,
      
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      signInWithEmail: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(apiEndpoint('api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          })
          
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to sign in')
          }
          
          set({ user: data.user, token: data.token })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to sign in'
          set({ error: message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      signUpWithEmail: async (email, password, name) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(apiEndpoint('api/auth/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, name }),
          })
          
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to sign up')
          }
          
          set({ user: data.user, token: data.token })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to sign up'
          set({ error: message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      signOut: async () => {
        set({ isLoading: true })
        try {
          await fetch(apiEndpoint('api/auth/logout'), {
            method: 'POST',
            credentials: 'include',
          })
          set({ user: null, token: null })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to sign out'
          set({ error: message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      fetchUser: async () => {
        const { token } = get()
        if (!token) return
        
        try {
          const response = await fetch(apiEndpoint('api/auth/me'), {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            set({ user: data.user })
          } else {
            set({ user: null, token: null })
          }
        } catch (error) {
          console.error('Error fetching user:', error)
          set({ user: null, token: null })
        }
      },
      
      initialize: async () => {
        set({ isLoading: true })
        try {
          const { token } = get()
          if (token) {
            await get().fetchUser()
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
