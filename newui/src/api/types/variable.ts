export interface VariableItem {
  Key: string;
  Value: string;
  Path: string;
}

export interface Variable {
  Namespace: string;
  Path: string;
  Items: Record<string, VariableItem>;
  CreateTime: number;
  ModifyTime: number;
  ModifyIndex: number;
  Lock: VariableLock;
}

export interface VariableLock {
  TTL: string;
  MaxLockDelay: string;
  LockHeld: boolean;
  LockHeldBy: string;
  Version: number;
}

export interface VariableListStub {
  Namespace: string;
  Path: string;
  CreateTime: number;
  ModifyTime: number;
  ModifyIndex: number;
}
