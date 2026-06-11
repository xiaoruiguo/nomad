export interface AgentMemberTags {
  Region: string;
  Datacenter: string;
  Role: string;
  Version: string;
  Bootstrap: string;
  Expect: string;
  RaftVsn: string;
  MinRaftVsn: string;
  Build: string;
  Port: string;
  SerfLanPort: string;
  SerfWanPort: string;
  WanJoinPort: string;
  Vsn: string;
  Id: string;
  NonVoter: string;
  RaftProtocol: string;
  UpgradeVersion: string;
  UpgradeTag: string;
  UpgradeURL: string;
  Nd: string;
  Np: string;
  X: string;
}

export interface AgentMember {
  Name: string;
  Addr: string;
  Port: number;
  Tags: AgentMemberTags;
  Status: string;
  ProtocolMin: number;
  ProtocolMax: number;
  ProtocolCur: number;
  DelegateMin: number;
  DelegateMax: number;
  DelegateCur: number;
}

export interface AgentServer {
  ID: string;
  RPCMinPort: number;
  RPCMaxPort: number;
  Region: string;
  Datacenter: string;
  Name: string;
  Address: string;
  SerfPort: number;
  Bootstrap: boolean;
  Status: string;
  Leader: boolean;
  Raft: string;
  Build: string;
  Version: string;
}

export interface AgentHealth {
  Server: AgentServerHealth;
  Serf: AgentSerfHealth;
  Raft: AgentRaftHealth;
}

export interface AgentServerHealth {
  Healthy: boolean;
  Message: string;
}

export interface AgentSerfHealth {
  Healthy: boolean;
  Message: string;
}

export interface AgentRaftHealth {
  Healthy: boolean;
  Message: string;
}

export interface AgentSelf {
  Config: Record<string, unknown>;
  Member: AgentMember;
  Stats: Record<string, Record<string, string>>;
  DebugConfig: Record<string, unknown>;
}

export interface AgentCoordinate {
  Node: string;
  Coord: AgentCoordinateValue;
}

export interface AgentCoordinateValue {
  Adjustment: number;
  Error: number;
  Height: number;
  Vec: number[];
}
