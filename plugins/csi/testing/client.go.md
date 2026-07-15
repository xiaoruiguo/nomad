# client.go 代码说明文档

> 文件路径：[plugins/csi/testing/client.go](file:///d:/claude/nomad/plugins/csi/testing/client.go)
> 总行数：200 行
> 所属包：`testing`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **CSI 插件接口子包**（`plugins/csi`），定义容器存储接口（CSI）插件的客户端实现，通过 gRPC 与 CSI 控制器和节点服务通信，管理卷的创建、挂载和快照。

## 2. 类型定义

### IdentityClient

**定义位置**：[L15](file:///d:/claude/nomad/plugins/csi/testing/client.go#L15)

**中文说明**：IdentityClient 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type IdentityClient struct {
	NextErr error
	NextPluginInfo *csipbv1.GetPluginInfoResponse
	NextPluginCapabilities *csipbv1.GetPluginCapabilitiesResponse
	NextPluginProbe *csipbv1.ProbeResponse
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NextErr` | `error` | 错误信息 |
| `NextPluginInfo` | `*csipbv1.GetPluginInfoResponse` | — |
| `NextPluginCapabilities` | `*csipbv1.GetPluginCapabilitiesResponse` | — |
| `NextPluginProbe` | `*csipbv1.ProbeResponse` | — |

**关联方法**（4 个）：`Reset`, `GetPluginInfo`, `GetPluginCapabilities`, `Probe`

### ControllerClient

**定义位置**：[L50](file:///d:/claude/nomad/plugins/csi/testing/client.go#L50)

**中文说明**：ControllerClient 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ControllerClient struct {
	NextErr error
	NextCapabilitiesResponse *csipbv1.ControllerGetCapabilitiesResponse
	NextPublishVolumeResponse *csipbv1.ControllerPublishVolumeResponse
	NextUnpublishVolumeResponse *csipbv1.ControllerUnpublishVolumeResponse
	NextValidateVolumeCapabilitiesResponse *csipbv1.ValidateVolumeCapabilitiesResponse
	NextCreateVolumeResponse *csipbv1.CreateVolumeResponse
	NextExpandVolumeResponse *csipbv1.ControllerExpandVolumeResponse
	LastExpandVolumeRequest *csipbv1.ControllerExpandVolumeRequest
	NextDeleteVolumeResponse *csipbv1.DeleteVolumeResponse
	NextListVolumesResponse *csipbv1.ListVolumesResponse
	NextCreateSnapshotResponse *csipbv1.CreateSnapshotResponse
	NextDeleteSnapshotResponse *csipbv1.DeleteSnapshotResponse
	NextListSnapshotsResponse *csipbv1.ListSnapshotsResponse
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NextErr` | `error` | 错误信息 |
| `NextCapabilitiesResponse` | `*csipbv1.ControllerGetCapabilitiesResponse` | — |
| `NextPublishVolumeResponse` | `*csipbv1.ControllerPublishVolumeResponse` | — |
| `NextUnpublishVolumeResponse` | `*csipbv1.ControllerUnpublishVolumeResponse` | — |
| `NextValidateVolumeCapabilitiesResponse` | `*csipbv1.ValidateVolumeCapabilitiesResponse` | — |
| `NextCreateVolumeResponse` | `*csipbv1.CreateVolumeResponse` | — |
| `NextExpandVolumeResponse` | `*csipbv1.ControllerExpandVolumeResponse` | — |
| `LastExpandVolumeRequest` | `*csipbv1.ControllerExpandVolumeRequest` | — |
| `NextDeleteVolumeResponse` | `*csipbv1.DeleteVolumeResponse` | — |
| `NextListVolumesResponse` | `*csipbv1.ListVolumesResponse` | — |
| `NextCreateSnapshotResponse` | `*csipbv1.CreateSnapshotResponse` | — |
| `NextDeleteSnapshotResponse` | `*csipbv1.DeleteSnapshotResponse` | — |
| `NextListSnapshotsResponse` | `*csipbv1.ListSnapshotsResponse` | — |

**关联方法**（12 个）：`Reset`, `ControllerGetCapabilities`, `ControllerPublishVolume`, `ControllerUnpublishVolume`, `ValidateVolumeCapabilities`, `CreateVolume`, `ControllerExpandVolume`, `DeleteVolume`, `ListVolumes`, `CreateSnapshot`, `DeleteSnapshot`, `ListSnapshots`

### NodeClient

**定义位置**：[L144](file:///d:/claude/nomad/plugins/csi/testing/client.go#L144)

**中文说明**：NodeClient 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeClient struct {
	NextErr error
	NextCapabilitiesResponse *csipbv1.NodeGetCapabilitiesResponse
	NextGetInfoResponse *csipbv1.NodeGetInfoResponse
	NextStageVolumeResponse *csipbv1.NodeStageVolumeResponse
	NextUnstageVolumeResponse *csipbv1.NodeUnstageVolumeResponse
	NextPublishVolumeResponse *csipbv1.NodePublishVolumeResponse
	NextUnpublishVolumeResponse *csipbv1.NodeUnpublishVolumeResponse
	NextExpandVolumeResponse *csipbv1.NodeExpandVolumeResponse
	LastExpandVolumeRequest *csipbv1.NodeExpandVolumeRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NextErr` | `error` | 错误信息 |
| `NextCapabilitiesResponse` | `*csipbv1.NodeGetCapabilitiesResponse` | — |
| `NextGetInfoResponse` | `*csipbv1.NodeGetInfoResponse` | — |
| `NextStageVolumeResponse` | `*csipbv1.NodeStageVolumeResponse` | — |
| `NextUnstageVolumeResponse` | `*csipbv1.NodeUnstageVolumeResponse` | — |
| `NextPublishVolumeResponse` | `*csipbv1.NodePublishVolumeResponse` | — |
| `NextUnpublishVolumeResponse` | `*csipbv1.NodeUnpublishVolumeResponse` | — |
| `NextExpandVolumeResponse` | `*csipbv1.NodeExpandVolumeResponse` | — |
| `LastExpandVolumeRequest` | `*csipbv1.NodeExpandVolumeRequest` | — |

**关联方法**（8 个）：`Reset`, `NodeGetCapabilities`, `NodeGetInfo`, `NodeStageVolume`, `NodeUnstageVolume`, `NodePublishVolume`, `NodeUnpublishVolume`, `NodeExpandVolume`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewIdentityClient` | - | `` | `*IdentityClient` | [L23](file:///d:/claude/nomad/plugins/csi/testing/client.go#L23) |
| `Reset` | `f *IdentityClient` | `` | `` | [L27](file:///d:/claude/nomad/plugins/csi/testing/client.go#L27) |
| `GetPluginInfo` | `f *IdentityClient` | `ctx context.Context, in *csipbv1.GetPluginInfoRequest, opts ...grpc.CallOption` | `*csipbv1.GetPluginInfoResponse, error` | [L35](file:///d:/claude/nomad/plugins/csi/testing/client.go#L35) |
| `GetPluginCapabilities` | `f *IdentityClient` | `ctx context.Context, in *csipbv1.GetPluginCapabilitiesRequest, opts ...grpc.C...` | `*csipbv1.GetPluginCapabilitiesResponse, error` | [L40](file:///d:/claude/nomad/plugins/csi/testing/client.go#L40) |
| `Probe` | `f *IdentityClient` | `ctx context.Context, in *csipbv1.ProbeRequest, opts ...grpc.CallOption` | `*csipbv1.ProbeResponse, error` | [L45](file:///d:/claude/nomad/plugins/csi/testing/client.go#L45) |
| `NewControllerClient` | - | `` | `*ControllerClient` | [L67](file:///d:/claude/nomad/plugins/csi/testing/client.go#L67) |
| `Reset` | `c *ControllerClient` | `` | `` | [L71](file:///d:/claude/nomad/plugins/csi/testing/client.go#L71) |
| `ControllerGetCapabilities` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.ControllerGetCapabilitiesRequest, opts ...gr...` | `*csipbv1.ControllerGetCapabilitiesResponse, error` | [L87](file:///d:/claude/nomad/plugins/csi/testing/client.go#L87) |
| `ControllerPublishVolume` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.ControllerPublishVolumeRequest, opts ...grpc...` | `*csipbv1.ControllerPublishVolumeResponse, error` | [L91](file:///d:/claude/nomad/plugins/csi/testing/client.go#L91) |
| `ControllerUnpublishVolume` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.ControllerUnpublishVolumeRequest, opts ...gr...` | `*csipbv1.ControllerUnpublishVolumeResponse, error` | [L95](file:///d:/claude/nomad/plugins/csi/testing/client.go#L95) |
| `ValidateVolumeCapabilities` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.ValidateVolumeCapabilitiesRequest, opts ...g...` | `*csipbv1.ValidateVolumeCapabilitiesResponse, error` | [L99](file:///d:/claude/nomad/plugins/csi/testing/client.go#L99) |
| `CreateVolume` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.CreateVolumeRequest, opts ...grpc.CallOption` | `*csipbv1.CreateVolumeResponse, error` | [L103](file:///d:/claude/nomad/plugins/csi/testing/client.go#L103) |
| `ControllerExpandVolume` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.ControllerExpandVolumeRequest, opts ...grpc....` | `*csipbv1.ControllerExpandVolumeResponse, error` | [L118](file:///d:/claude/nomad/plugins/csi/testing/client.go#L118) |
| `DeleteVolume` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.DeleteVolumeRequest, opts ...grpc.CallOption` | `*csipbv1.DeleteVolumeResponse, error` | [L123](file:///d:/claude/nomad/plugins/csi/testing/client.go#L123) |
| `ListVolumes` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.ListVolumesRequest, opts ...grpc.CallOption` | `*csipbv1.ListVolumesResponse, error` | [L127](file:///d:/claude/nomad/plugins/csi/testing/client.go#L127) |
| `CreateSnapshot` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.CreateSnapshotRequest, opts ...grpc.CallOption` | `*csipbv1.CreateSnapshotResponse, error` | [L131](file:///d:/claude/nomad/plugins/csi/testing/client.go#L131) |
| `DeleteSnapshot` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.DeleteSnapshotRequest, opts ...grpc.CallOption` | `*csipbv1.DeleteSnapshotResponse, error` | [L135](file:///d:/claude/nomad/plugins/csi/testing/client.go#L135) |
| `ListSnapshots` | `c *ControllerClient` | `ctx context.Context, in *csipbv1.ListSnapshotsRequest, opts ...grpc.CallOption` | `*csipbv1.ListSnapshotsResponse, error` | [L139](file:///d:/claude/nomad/plugins/csi/testing/client.go#L139) |
| `NewNodeClient` | - | `` | `*NodeClient` | [L157](file:///d:/claude/nomad/plugins/csi/testing/client.go#L157) |
| `Reset` | `c *NodeClient` | `` | `` | [L161](file:///d:/claude/nomad/plugins/csi/testing/client.go#L161) |
| `NodeGetCapabilities` | `c *NodeClient` | `ctx context.Context, in *csipbv1.NodeGetCapabilitiesRequest, opts ...grpc.Cal...` | `*csipbv1.NodeGetCapabilitiesResponse, error` | [L172](file:///d:/claude/nomad/plugins/csi/testing/client.go#L172) |
| `NodeGetInfo` | `c *NodeClient` | `ctx context.Context, in *csipbv1.NodeGetInfoRequest, opts ...grpc.CallOption` | `*csipbv1.NodeGetInfoResponse, error` | [L176](file:///d:/claude/nomad/plugins/csi/testing/client.go#L176) |
| `NodeStageVolume` | `c *NodeClient` | `ctx context.Context, in *csipbv1.NodeStageVolumeRequest, opts ...grpc.CallOption` | `*csipbv1.NodeStageVolumeResponse, error` | [L180](file:///d:/claude/nomad/plugins/csi/testing/client.go#L180) |
| `NodeUnstageVolume` | `c *NodeClient` | `ctx context.Context, in *csipbv1.NodeUnstageVolumeRequest, opts ...grpc.CallO...` | `*csipbv1.NodeUnstageVolumeResponse, error` | [L184](file:///d:/claude/nomad/plugins/csi/testing/client.go#L184) |
| `NodePublishVolume` | `c *NodeClient` | `ctx context.Context, in *csipbv1.NodePublishVolumeRequest, opts ...grpc.CallO...` | `*csipbv1.NodePublishVolumeResponse, error` | [L188](file:///d:/claude/nomad/plugins/csi/testing/client.go#L188) |
| `NodeUnpublishVolume` | `c *NodeClient` | `ctx context.Context, in *csipbv1.NodeUnpublishVolumeRequest, opts ...grpc.Cal...` | `*csipbv1.NodeUnpublishVolumeResponse, error` | [L192](file:///d:/claude/nomad/plugins/csi/testing/client.go#L192) |
| `NodeExpandVolume` | `c *NodeClient` | `ctx context.Context, in *csipbv1.NodeExpandVolumeRequest, opts ...grpc.CallOp...` | `*csipbv1.NodeExpandVolumeResponse, error` | [L196](file:///d:/claude/nomad/plugins/csi/testing/client.go#L196) |

## 5. 核心方法详解

### NewIdentityClient()

**签名**：`func NewIdentityClient() *IdentityClient`

**位置**：[L23](file:///d:/claude/nomad/plugins/csi/testing/client.go#L23)

**中文说明**：创建并返回一个新的 IdentityClient 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*IdentityClient` | — |

### NewControllerClient()

**签名**：`func NewControllerClient() *ControllerClient`

**位置**：[L67](file:///d:/claude/nomad/plugins/csi/testing/client.go#L67)

**中文说明**：创建并返回一个新的 ControllerClient 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ControllerClient` | — |

### NewNodeClient()

**签名**：`func NewNodeClient() *NodeClient`

**位置**：[L157](file:///d:/claude/nomad/plugins/csi/testing/client.go#L157)

**中文说明**：创建并返回一个新的 NodeClient 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NodeClient` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `google.golang.org/grpc` | 标准库 |
| `github.com/container-storage-interface/spec/lib/go/csi` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **gRPC 通信**：使用 gRPC 进行进程间通信
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|

