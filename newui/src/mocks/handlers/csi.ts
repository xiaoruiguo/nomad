import { http, HttpResponse } from 'msw'
import type { CSIVolume, CSIPlugin } from '@/api/types/csi'

const volumesStore = new Map<string, CSIVolume>()
const pluginsStore = new Map<string, CSIPlugin>()

function seedVolumes(): void {
  if (volumesStore.size > 0) return
  const vol: CSIVolume = {
    ID: 'data-vol-1',
    Namespace: 'default',
    Name: 'data-vol-1',
    ExternalID: 'ext-vol-1',
    Capacity: 10737418240,
    CapacityMin: 0,
    CapacityMax: 0,
    AccessMode: 'single-node-writer',
    AttachmentMode: 'file-system',
    MountOptions: { FsType: 'ext4', MountFlags: [] },
    Topology: [],
    RequestedTopologies: [],
    Provider: 'aws-ebs',
    ProviderID: 'aws-ebs-1',
    ControllerRequired: true,
    ControllersExpected: 1,
    ControllersHealthy: 1,
    NodeExpandRequired: false,
    PluginID: 'aws-ebs',
    Allocations: [],
    ReadAllocs: {},
    WriteAllocs: {},
    ScheduledFlexibly: false,
    CreateIndex: 1,
    ModifyIndex: 1,
    Schedulable: true,
    Health: 'healthy',
    Status: 'available',
  }
  volumesStore.set('data-vol-1', vol)
}

function seedPlugins(): void {
  if (pluginsStore.size > 0) return
  const plugin: CSIPlugin = {
    ID: 'aws-ebs',
    Provider: 'aws.ebs.csi.driver',
    ProviderVersion: '1.0.0',
    ControllerInfo: {
      SupportsReadOnlyAttach: true,
      SupportsAttach: true,
      SupportsDetach: true,
      SupportsMultiNode: false,
      SupportsExpand: true,
      RequiresExternalAttach: false,
    },
    NodeInfo: [],
    Allocations: [],
    CreateIndex: 1,
    ModifyIndex: 1,
  }
  pluginsStore.set('aws-ebs', plugin)
}

seedVolumes()
seedPlugins()

export const csiHandlers = [
  http.get('/v1/volumes', () => {
    const volumes = Array.from(volumesStore.values())
    return HttpResponse.json(volumes, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),

  http.get('/v1/volume/csi/:id', ({ params }) => {
    const { id } = params
    const volume = volumesStore.get(id as string)
    if (!volume) {
      return HttpResponse.json({ error: 'volume not found' }, { status: 404 })
    }
    return HttpResponse.json(volume, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),

  http.get('/v1/plugins', () => {
    const plugins = Array.from(pluginsStore.values())
    return HttpResponse.json(plugins, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),

  http.get('/v1/plugin/csi/:id', ({ params }) => {
    const { id } = params
    const plugin = pluginsStore.get(id as string)
    if (!plugin) {
      return HttpResponse.json({ error: 'plugin not found' }, { status: 404 })
    }
    return HttpResponse.json(plugin, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),
]
