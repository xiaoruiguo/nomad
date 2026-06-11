export interface ACLToken {
  ID: string;
  AccessorID: string;
  Name: string;
  Type: string;
  Policies: string[];
  Roles: ACLTokenRoleLink[];
  SecretID: string;
  Global: boolean;
  CreateTime: number;
  ModifyTime: number;
  ExpirationTime: string;
  Description: string;
  Hash: string;
  CreateIndex: number;
  ModifyIndex: number;
}

export interface ACLTokenRoleLink {
  ID: string;
  Name: string;
}

export interface ACLPolicy {
  Name: string;
  Description: string;
  Rules: string;
  CreateIndex: number;
  ModifyIndex: number;
  Hash: string;
}

export interface ACLRolePolicyLink {
  Name: string;
}

export interface ACLRole {
  ID: string;
  Name: string;
  Description: string;
  Policies: ACLRolePolicyLink[];
  Hash: string;
  CreateIndex: number;
  ModifyIndex: number;
}

export interface ACLAuthMethod {
  Name: string;
  Type: string;
  Description: string;
  Default: boolean;
  Config: Record<string, unknown>;
  CreateIndex: number;
  ModifyIndex: number;
}

export interface ACLBindingRule {
  ID: string;
  AuthMethod: string;
  Selector: string;
  BindName: string;
  BindType: string;
  Description: string;
  CreateIndex: number;
  ModifyIndex: number;
}

export interface ACLLoginRequest {
  AuthMethodName: string;
  Token: ACLToken;
}

export interface OIDCAuthURLRequest {
  AuthMethodName: string;
  ClientNonce: string;
  RedirectUri: string;
  Meta: Record<string, string>;
}

export interface OIDCAuthURLResponse {
  AuthURL: string;
  ClientNonce: string;
}

export interface OIDCCompleteAuthRequest {
  AuthMethodName: string;
  ClientNonce: string;
  Code: string;
  State: string;
  RedirectUri: string;
}

export interface OIDCCompleteAuthResponse {
  Token: ACLToken;
}

export interface ACLTokenListStub {
  ID: string;
  AccessorID: string;
  Name: string;
  Type: string;
  Policies: string[];
  Roles: ACLTokenRoleLink[];
  Global: boolean;
  CreateTime: number;
  ExpirationTime: string;
  CreateIndex: number;
  ModifyIndex: number;
}

export interface OneTimeToken {
  OneTimeSecretID: string;
  SecretID: string;
  AccessorID: string;
  ExpiresAt: string;
}
