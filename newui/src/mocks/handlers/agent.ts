import { http, HttpResponse } from 'msw'
import type { AgentSelf, AgentMember, AgentServer } from '@/api/types/agent'

const agentSelf: AgentSelf = {
  Config: {
    Region: 'global',
    Datacenter: 'dc1',
    Name: 'nomad-1',
    Server: true,
    Version: '1.7.0',
  },
  Member: {
    Name: 'nomad-1',
    Addr: '10.0.0.1',
    Port: 4646,
    Tags: {
      Region: 'global',
      Datacenter: 'dc1',
      Role: 'nomad',
      Version: '1.7.0',
      Bootstrap: 'false',
      Expect: '3',
      RaftVsn: '3',
      MinRaftVsn: '3',
      Build: '1.7.0',
      Port: '4646',
      SerfLanPort: '4648',
      SerfWanPort: '4647',
      WanJoinPort: '4647',
      Vsn: '4',
      Id: 'nomad-1',
      NonVoter: 'false',
      RaftProtocol: '3',
      UpgradeVersion: '',
      UpgradeTag: '',
      UpgradeURL: '',
      Nd: '5',
      Np: 'default',
      X: '',
    },
    Status: 'alive',
    ProtocolMin: 1,
    ProtocolMax: 5,
    ProtocolCur: 5,
    DelegateMin: 1,
    DelegateMax: 5,
    DelegateCur: 5,
  },
  Stats: {
    runtime: {
      goroutines: '120',
      cpu_usage: '2.5',
      memory_usage: '256MB',
    },
    nomad: {
      server: 'true',
      leader: 'true',
      raft_peers: '3',
    },
  },
  DebugConfig: {},
}

const members: AgentMember[] = [
  agentSelf.Member,
  {
    Name: 'nomad-2',
    Addr: '10.0.0.2',
    Port: 4646,
    Tags: {
      ...agentSelf.Member.Tags,
      Id: 'nomad-2',
      Role: 'nomad',
    },
    Status: 'alive',
    ProtocolMin: 1,
    ProtocolMax: 5,
    ProtocolCur: 5,
    DelegateMin: 1,
    DelegateMax: 5,
    DelegateCur: 5,
  },
  {
    Name: 'nomad-3',
    Addr: '10.0.0.3',
    Port: 4646,
    Tags: {
      ...agentSelf.Member.Tags,
      Id: 'nomad-3',
      Role: 'nomad',
    },
    Status: 'alive',
    ProtocolMin: 1,
    ProtocolMax: 5,
    ProtocolCur: 5,
    DelegateMin: 1,
    DelegateMax: 5,
    DelegateCur: 5,
  },
]

const servers: AgentServer[] = [
  {
    ID: 'nomad-1',
    RPCMinPort: 4646,
    RPCMaxPort: 4646,
    Region: 'global',
    Datacenter: 'dc1',
    Name: 'nomad-1',
    Address: '10.0.0.1',
    SerfPort: 4648,
    Bootstrap: false,
    Status: 'alive',
    Leader: true,
    Raft: 'Voter',
    Build: '1.7.0',
    Version: '1.7.0',
  },
  {
    ID: 'nomad-2',
    RPCMinPort: 4646,
    RPCMaxPort: 4646,
    Region: 'global',
    Datacenter: 'dc1',
    Name: 'nomad-2',
    Address: '10.0.0.2',
    SerfPort: 4648,
    Bootstrap: false,
    Status: 'alive',
    Leader: false,
    Raft: 'Voter',
    Build: '1.7.0',
    Version: '1.7.0',
  },
  {
    ID: 'nomad-3',
    RPCMinPort: 4646,
    RPCMaxPort: 4646,
    Region: 'global',
    Datacenter: 'dc1',
    Name: 'nomad-3',
    Address: '10.0.0.3',
    SerfPort: 4648,
    Bootstrap: false,
    Status: 'alive',
    Leader: false,
    Raft: 'Voter',
    Build: '1.7.0',
    Version: '1.7.0',
  },
]

export const agentHandlers = [
  http.get('/v1/agent/self', () => {
    return HttpResponse.json(agentSelf, {
      headers: { 'X-Nomad-Index': '5' },
    })
  }),

  http.get('/v1/agent/members', () => {
    return HttpResponse.json(members, {
      headers: { 'X-Nomad-Index': '5' },
    })
  }),

  http.get('/v1/agent/servers', () => {
    return HttpResponse.json(servers, {
      headers: { 'X-Nomad-Index': '5' },
    })
  }),
]
