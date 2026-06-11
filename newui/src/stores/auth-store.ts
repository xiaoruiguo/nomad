import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ACLToken, ACLPolicy, ACLAuthMethod } from '@/api/types/acl'
import { getNomadClient, setAuthToken } from '@/api/client'

interface AuthState {
  token: string | null
  tokenExpiry: number | null
  selfToken: ACLToken | null
  policies: ACLPolicy[]
  oidcAuthMethod: ACLAuthMethod | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setToken: (token: string) => void
  clearToken: () => void
  fetchSelfToken: () => Promise<void>
  fetchPolicies: () => Promise<void>
  loginWithOIDC: (authMethod: ACLAuthMethod, redirectUri: string) => Promise<void>
  completeOIDCAuth: (authMethod: string, clientNonce: string, code: string, state: string, redirectUri: string) => Promise<void>
  monitorExpiry: () => () => void
}

type AuthStore = AuthState & AuthActions

const EXPIRY_WARNING_MS = 10 * 60 * 1000

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      tokenExpiry: null,
      selfToken: null,
      policies: [],
      oidcAuthMethod: null,
      isLoading: false,
      error: null,

      setToken: (token: string) => {
        setAuthToken(token)
        set({ token, error: null })
      },

      clearToken: () => {
        setAuthToken(null)
        set({
          token: null,
          tokenExpiry: null,
          selfToken: null,
          policies: [],
          oidcAuthMethod: null,
          error: null,
        })
      },

      fetchSelfToken: async () => {
        const { token } = get()
        if (!token) return
        set({ isLoading: true, error: null })
        try {
          const client = getNomadClient()
          const { data: selfToken } = await client.get<ACLToken>('/v1/acl/token/self')
          const tokenExpiry = selfToken.ExpirationTime
            ? new Date(selfToken.ExpirationTime).getTime()
            : null
          set({ selfToken, tokenExpiry, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },

      fetchPolicies: async () => {
        const { token, selfToken } = get()
        if (!token || !selfToken) return
        set({ isLoading: true, error: null })
        try {
          const client = getNomadClient()
          const policyNames = selfToken.Policies || []
          const policies: ACLPolicy[] = []
          for (const name of policyNames) {
            try {
              const { data } = await client.get<ACLPolicy>(`/v1/acl/policy/${name}`)
              policies.push(data)
            } catch {
              // skip policies that can't be fetched
            }
          }
          set({ policies, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },

      loginWithOIDC: async (authMethod: ACLAuthMethod, redirectUri: string) => {
        set({ isLoading: true, error: null, oidcAuthMethod: authMethod })
        try {
          const nonce = crypto.randomUUID()
          const state = crypto.randomUUID()
          sessionStorage.setItem('nomad-oidc-nonce', nonce)
          sessionStorage.setItem('nomad-oidc-state', state)
          sessionStorage.setItem('nomad-oidc-method', authMethod.Name)

          const config = (authMethod.Config as Record<string, unknown>) || {}
          const issuerURL = config.OIDCDiscoveryURL as string
          const clientID = config.OIDCClientID as string

          if (!issuerURL || !clientID) {
            throw new Error('OIDC auth method missing discovery URL or client ID')
          }

          const params = new URLSearchParams({
            client_id: clientID,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: (config.OIDCScopes as string[])?.join(' ') || 'openid profile email',
            state,
            nonce,
          })

          const discoveryRes = await fetch(issuerURL)
          if (!discoveryRes.ok) throw new Error('Failed to fetch OIDC discovery document')
          const discovery = await discoveryRes.json()
          const authURL = `${discovery.authorization_endpoint}?${params.toString()}`
          window.location.href = authURL
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },

      completeOIDCAuth: async (authMethodName: string, clientNonce: string, code: string, state: string, redirectUri: string) => {
        set({ isLoading: true, error: null })
        try {
          const savedState = sessionStorage.getItem('nomad-oidc-state')
          const savedNonce = sessionStorage.getItem('nomad-oidc-nonce')
          if (savedState !== state) {
            throw new Error('OIDC state mismatch - possible CSRF attack')
          }

          const client = getNomadClient()
          const { data } = await client.post<{ Token: ACLToken }>('/v1/acl/oidc/complete-auth', {
            AuthMethod: authMethodName,
            ClientNonce: clientNonce || savedNonce || '',
            Code: code,
            State: state,
            RedirectUri: redirectUri,
          })

          const newToken = data.Token?.SecretID
          if (!newToken) throw new Error('No token received from OIDC auth')

          sessionStorage.removeItem('nomad-oidc-nonce')
          sessionStorage.removeItem('nomad-oidc-state')
          sessionStorage.removeItem('nomad-oidc-method')

          setAuthToken(newToken)
          set({ token: newToken, isLoading: false })
          await get().fetchSelfToken()
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },

      monitorExpiry: () => {
        const interval = setInterval(() => {
          const { tokenExpiry, token } = get()
          if (!token || !tokenExpiry) return

          const now = Date.now()
          const remaining = tokenExpiry - now

          if (remaining <= 0) {
            get().clearToken()
            return
          }

          if (remaining < EXPIRY_WARNING_MS) {
            window.dispatchEvent(
              new CustomEvent('nomad:notification', {
                detail: {
                  type: 'warning',
                  message: `Token expires in ${Math.ceil(remaining / 60000)} minutes`,
                },
              })
            )
          }
        }, 30000)

        return () => clearInterval(interval)
      },
    }),
    {
      name: 'nomad-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
)

export type { AuthState, AuthActions }
