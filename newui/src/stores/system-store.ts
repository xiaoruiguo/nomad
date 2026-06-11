import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgentSelf } from '@/api/types/agent'

interface Namespace {
  Name: string
  Description: string
  Quota: string
  Meta: Record<string, string>
  CreateIndex: number
  ModifyIndex: number
}

interface License {
  LicenseID: string
  CustomerID: string
  InstallationID: string
  IssueTime: string
  StartTime: string
  ExpirationTime: string
  TerminationTime: string
  NonProduction: boolean
  Product: string
  Flags: Record<string, unknown>
  Modules: string[]
  Features: string[]
}

interface SystemState {
  regions: string[]
  activeRegion: string | null
  namespaces: Namespace[]
  activeNamespace: string | null
  license: License | null
  agent: AgentSelf | null
  fuzzySearchEnabled: boolean
}

interface SystemActions {
  setRegions: (regions: string[]) => void
  setActiveRegion: (region: string | null) => void
  setNamespaces: (ns: Namespace[]) => void
  setActiveNamespace: (ns: string | null) => void
  setLicense: (license: License | null) => void
  setAgent: (agent: AgentSelf | null) => void
  checkFuzzySearch: () => Promise<void>
}

type SystemStore = SystemState & SystemActions

export const useSystemStore = create<SystemStore>()(
  persist(
    (set) => ({
      regions: [],
      activeRegion: null,
      namespaces: [],
      activeNamespace: null,
      license: null,
      agent: null,
      fuzzySearchEnabled: false,

      setRegions: (regions) => set({ regions }),

      setActiveRegion: (activeRegion) => set({ activeRegion }),

      setNamespaces: (namespaces) => set({ namespaces }),

      setActiveNamespace: (activeNamespace) => set({ activeNamespace }),

      setLicense: (license) => set({ license }),

      setAgent: (agent) => set({ agent }),

      checkFuzzySearch: async () => {
        try {
          const { getNomadClient } = await import('@/api/client')
          const client = getNomadClient()
          await client.post('/v1/search/fuzzy', {
            Context: 'jobs',
            Text: 'test',
          })
          set({ fuzzySearchEnabled: true })
        } catch {
          set({ fuzzySearchEnabled: false })
        }
      },
    }),
    {
      name: 'nomad-system',
      partialize: (state) => ({
        activeRegion: state.activeRegion,
        activeNamespace: state.activeNamespace,
      }),
    }
  )
)

export type { Namespace, License, SystemState, SystemActions }
