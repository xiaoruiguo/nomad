import { http, HttpResponse } from 'msw'
import type { CSIVolume, CSIPlugin, AllocListStub } from '@/api/types/csi'

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
    PluginID: 'aws-ebs-csi',
    Allocations: [],
    ReadAllocs: {},
    WriteAllocs: {},
    ScheduledFlexibly: false,
    CreateIndex: 1,
    ModifyIndex: 1,
    Schedulable: true,
    Health: 'healthy',
    Status: 'available',
    nodesHealthy: 3,
    nodesExpected: 3,
    CurrentWriters: 0,
    CurrentReaders: 1,
    plainId: 'data-vol-1',
  }
  volumesStore.set('data-vol-1', vol)
}

function seedPlugins(): void {
  if (pluginsStore.size > 0) return

  const controllerAllocs: AllocListStub[] = [
    { ID: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', EvalID: 'eval-1', Name: 'web.server[0]', Namespace: 'default', NodeID: 'node-controller-1', NodeName: 'controller-node-1', JobID: 'web-server', JobType: 'service', JobVersion: 1, TaskGroup: 'server', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700000000000000000, ModifyTime: 1700000000000000000 },
    { ID: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', EvalID: 'eval-2', Name: 'web.server[1]', Namespace: 'default', NodeID: 'node-controller-1', NodeName: 'controller-node-1', JobID: 'web-server', JobType: 'service', JobVersion: 1, TaskGroup: 'server', DesiredStatus: 'run', ClientStatus: 'pending', CreateTime: 1700000100000000000, ModifyTime: 1700000100000000000 },
    { ID: 'c3d4e5f6-a7b8-9012-cdef-123456789012', EvalID: 'eval-3', Name: 'api.worker[0]', Namespace: 'default', NodeID: 'node-controller-2', NodeName: 'controller-node-2', JobID: 'api-worker', JobType: 'batch', JobVersion: 3, TaskGroup: 'worker', DesiredStatus: 'run', ClientStatus: 'failed', CreateTime: 1700000200000000000, ModifyTime: 1700000200000000000 },
  ]

  const nodeAllocs: AllocListStub[] = [
    { ID: 'd4e5f6a7-b8c9-0123-defa-234567890123', EvalID: 'eval-4', Name: 'db.primary[0]', Namespace: 'default', NodeID: 'node-worker-1', NodeName: 'worker-node-1', JobID: 'database', JobType: 'system', JobVersion: 2, TaskGroup: 'primary', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700000300000000000, ModifyTime: 1700000300000000000 },
    { ID: 'e5f6a7b8-c9d0-1234-efab-345678901234', EvalID: 'eval-5', Name: 'db.replica[0]', Namespace: 'default', NodeID: 'node-worker-2', NodeName: 'worker-node-2', JobID: 'database', JobType: 'system', JobVersion: 2, TaskGroup: 'replica', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700000400000000000, ModifyTime: 1700000400000000000 },
    { ID: 'f6a7b8c9-d0e1-2345-fabc-456789012345', EvalID: 'eval-6', Name: 'cache.redis[0]', Namespace: 'default', NodeID: 'node-worker-3', NodeName: 'worker-node-3', JobID: 'redis-cache', JobType: 'service', JobVersion: 1, TaskGroup: 'redis', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700000500000000000, ModifyTime: 1700000500000000000 },
    { ID: 'a7b8c9d0-e1f2-3456-abcd-567890123456', EvalID: 'eval-7', Name: 'cache.redis[1]', Namespace: 'default', NodeID: 'node-worker-4', NodeName: 'worker-node-4', JobID: 'redis-cache', JobType: 'service', JobVersion: 1, TaskGroup: 'redis', DesiredStatus: 'run', ClientStatus: 'lost', CreateTime: 1700000600000000000, ModifyTime: 1700000600000000000 },
    { ID: 'b8c9d0e1-f2a3-4567-bcde-678901234567', EvalID: 'eval-8', Name: 'monitor.prometheus[0]', Namespace: 'default', NodeID: 'node-worker-5', NodeName: 'worker-node-5', JobID: 'monitoring', JobType: 'system', JobVersion: 5, TaskGroup: 'prometheus', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700000700000000000, ModifyTime: 1700000700000000000 },
    { ID: 'c9d0e1f2-a3b4-5678-cdef-789012345678', EvalID: 'eval-9', Name: 'log.collector[0]', Namespace: 'default', NodeID: 'node-worker-1', NodeName: 'worker-node-1', JobID: 'logging', JobType: 'batch', JobVersion: 1, TaskGroup: 'collector', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700000800000000000, ModifyTime: 1700000800000000000 },
    { ID: 'd0e1f2a3-b4c5-6789-defa-890123456789', EvalID: 'eval-10', Name: 'backup.sched[0]', Namespace: 'default', NodeID: 'node-worker-2', NodeName: 'worker-node-2', JobID: 'backup', JobType: 'batch', JobVersion: 2, TaskGroup: 'scheduler', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700000900000000000, ModifyTime: 1700000900000000000 },
    { ID: 'e1f2a3b4-c5d6-7890-efab-901234567890', EvalID: 'eval-11', Name: 'gateway.nginx[0]', Namespace: 'default', NodeID: 'node-worker-3', NodeName: 'worker-node-3', JobID: 'gateway', JobType: 'service', JobVersion: 4, TaskGroup: 'nginx', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700001000000000000, ModifyTime: 1700001000000000000 },
    { ID: 'f2a3b4c5-d6e7-8901-fabc-012345678901', EvalID: 'eval-12', Name: 'queue.rabbitmq[0]', Namespace: 'default', NodeID: 'node-worker-4', NodeName: 'worker-node-4', JobID: 'messaging', JobType: 'service', JobVersion: 1, TaskGroup: 'rabbitmq', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700001100000000000, ModifyTime: 1700001100000000000 },
    { ID: 'a3b4c5d6-e7f8-9012-abcd-123456789012', EvalID: 'eval-13', Name: 'search.elasticsearch[0]', Namespace: 'default', NodeID: 'node-worker-5', NodeName: 'worker-node-5', JobID: 'search', JobType: 'batch', JobVersion: 3, TaskGroup: 'es-cluster', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700001200000000000, ModifyTime: 1700001200000000000 },
    { ID: 'b4c5d6e7-f8a9-0123-bcde-234567890123', EvalID: 'eval-14', Name: 'search.elasticsearch[1]', Namespace: 'default', NodeID: 'node-worker-1', NodeName: 'worker-node-1', JobID: 'search', JobType: 'batch', JobVersion: 3, TaskGroup: 'es-cluster', DesiredStatus: 'run', ClientStatus: 'running', CreateTime: 1700001300000000000, ModifyTime: 1700001300000000000 },
  ]

  const pluginAwsEbs: CSIPlugin = {
    ID: 'aws-ebs-csi',
    Provider: 'aws.ebs.csi.driver',
    Version: 'v1.10.0',
    ControllerRequired: true,
    Controllers: {
      'node-controller-1': {
        PluginID: 'aws-ebs-csi',
        AllocID: '',
        Healthy: true,
        HealthDescription: 'healthy',
        UpdateTime: '2024-11-15T10:00:00Z',
        Provider: 'aws.ebs.csi.driver',
        ProviderVersion: 'v1.10.0',
        RequiresControllerPlugin: true,
        RequiresTopologies: false,
        ControllerInfo: {
          SupportsReadOnlyAttach: true,
          SupportsAttach: true,
          SupportsDetach: true,
          SupportsMultiNode: false,
          SupportsExpand: true,
          RequiresExternalAttach: false,
        },
      },
      'node-controller-2': {
        PluginID: 'aws-ebs-csi',
        AllocID: '',
        Healthy: false,
        HealthDescription: 'connection timeout',
        UpdateTime: '2024-11-15T09:50:00Z',
        Provider: 'aws.ebs.csi.driver',
        ProviderVersion: 'v1.10.0',
        RequiresControllerPlugin: true,
        RequiresTopologies: false,
        ControllerInfo: {
          SupportsReadOnlyAttach: true,
          SupportsAttach: true,
          SupportsDetach: true,
          SupportsMultiNode: false,
          SupportsExpand: true,
          RequiresExternalAttach: false,
        },
      },
    },
    Nodes: {
      'node-worker-1': {
        PluginID: 'aws-ebs-csi',
        AllocID: '',
        Healthy: true,
        HealthDescription: 'healthy',
        UpdateTime: '2024-11-15T10:05:00Z',
        Provider: 'aws.ebs.csi.driver',
        ProviderVersion: 'v1.10.0',
        RequiresControllerPlugin: true,
        RequiresTopologies: false,
        NodeInfo: { NodeID: 'node-worker-1', MaxVolumes: 16, AccessibleTopology: { Segments: { 'topology.kubernetes.io/zone': 'us-east-1a' } } },
      },
      'node-worker-2': {
        PluginID: 'aws-ebs-csi',
        AllocID: '',
        Healthy: true,
        HealthDescription: 'healthy',
        UpdateTime: '2024-11-15T10:04:00Z',
        Provider: 'aws.ebs.csi.driver',
        ProviderVersion: 'v1.10.0',
        RequiresControllerPlugin: true,
        RequiresTopologies: false,
        NodeInfo: { NodeID: 'node-worker-2', MaxVolumes: 16, AccessibleTopology: { Segments: { 'topology.kubernetes.io/zone': 'us-east-1b' } } },
      },
      'node-worker-3': {
        PluginID: 'aws-ebs-csi',
        AllocID: '',
        Healthy: true,
        HealthDescription: 'healthy',
        UpdateTime: '2024-11-15T10:03:00Z',
        Provider: 'aws.ebs.csi.driver',
        ProviderVersion: 'v1.10.0',
        RequiresControllerPlugin: true,
        RequiresTopologies: false,
        NodeInfo: { NodeID: 'node-worker-3', MaxVolumes: 16, AccessibleTopology: { Segments: { 'topology.kubernetes.io/zone': 'us-east-1c' } } },
      },
      'node-worker-4': {
        PluginID: 'aws-ebs-csi',
        AllocID: '',
        Healthy: false,
        HealthDescription: 'unhealthy',
        UpdateTime: '2024-11-15T08:30:00Z',
        Provider: 'aws.ebs.csi.driver',
        ProviderVersion: 'v1.10.0',
        RequiresControllerPlugin: true,
        RequiresTopologies: false,
        NodeInfo: { NodeID: 'node-worker-4', MaxVolumes: 16, AccessibleTopology: { Segments: {} } },
      },
      'node-worker-5': {
        PluginID: 'aws-ebs-csi',
        AllocID: '',
        Healthy: true,
        HealthDescription: 'healthy',
        UpdateTime: '2024-11-15T10:02:00Z',
        Provider: 'aws.ebs.csi.driver',
        ProviderVersion: 'v1.10.0',
        RequiresControllerPlugin: true,
        RequiresTopologies: false,
        NodeInfo: { NodeID: 'node-worker-5', MaxVolumes: 16, AccessibleTopology: { Segments: { 'topology.kubernetes.io/zone': 'us-east-1a' } } },
      },
    },
    Allocations: [...controllerAllocs, ...nodeAllocs],
    ControllersHealthy: 1,
    ControllersExpected: 2,
    NodesHealthy: 4,
    NodesExpected: 5,
    CreateIndex: 100,
    ModifyIndex: 200,
    CreateTime: 1700000000000000000,
    ModifyTime: 1700010000000000000,
  }

  const pluginHostPath: CSIPlugin = {
    ID: 'hostpath-csi',
    Provider: 'org.democratic-csi.hostpath-driver',
    Version: 'v1.8.0',
    ControllerRequired: false,
    Controllers: {},
    Nodes: {
      'node-worker-1': {
        PluginID: 'hostpath-csi',
        AllocID: '',
        Healthy: true,
        HealthDescription: 'healthy',
        UpdateTime: '2024-11-15T10:00:00Z',
        Provider: 'org.democratic-csi.hostpath-driver',
        ProviderVersion: 'v1.8.0',
        RequiresControllerPlugin: false,
        RequiresTopologies: false,
        NodeInfo: { NodeID: 'node-worker-1', MaxVolumes: 32, AccessibleTopology: { Segments: {} } },
      },
      'node-worker-2': {
        PluginID: 'hostpath-csi',
        AllocID: '',
        Healthy: true,
        HealthDescription: 'healthy',
        UpdateTime: '2024-11-15T10:00:00Z',
        Provider: 'org.democratic-csi.hostpath-driver',
        ProviderVersion: 'v1.8.0',
        RequiresControllerPlugin: false,
        RequiresTopologies: false,
        NodeInfo: { NodeID: 'node-worker-2', MaxVolumes: 32, AccessibleTopology: { Segments: {} } },
      },
      'node-worker-3': {
        PluginID: 'hostpath-csi',
        AllocID: '',
        Healthy: true,
        HealthDescription: 'healthy',
        UpdateTime: '2024-11-15T10:00:00Z',
        Provider: 'org.democratic-csi.hostpath-driver',
        ProviderVersion: 'v1.8.0',
        RequiresControllerPlugin: false,
        RequiresTopologies: false,
        NodeInfo: { NodeID: 'node-worker-3', MaxVolumes: 32, AccessibleTopology: { Segments: {} } },
      },
    },
    Allocations: [],
    ControllersHealthy: 0,
    ControllersExpected: 0,
    NodesHealthy: 3,
    NodesExpected: 3,
    CreateIndex: 101,
    ModifyIndex: 150,
    CreateTime: 1699999000000000000,
    ModifyTime: 1700005000000000000,
  }

  pluginsStore.set('aws-ebs-csi', pluginAwsEbs)
  pluginsStore.set('hostpath-csi', pluginHostPath)
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
      headers: { 'X-Nomad-Index': '200' },
    })
  }),

  http.get('/v1/plugin/csi/:id', ({ params }) => {
    const { id } = params
    const plugin = pluginsStore.get(id as string)
    if (!plugin) {
      return HttpResponse.json({ error: 'plugin not found' }, { status: 404 })
    }
    return HttpResponse.json(plugin, {
      headers: { 'X-Nomad-Index': '200' },
    })
  }),
]
