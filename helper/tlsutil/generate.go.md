# generate.go 代码说明文档

> 文件路径：[tlsutil/generate.go](file:///d:/claude/nomad/helper/tlsutil/generate.go)
> 总行数：365 行
> 所属包：`tlsutil`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **TLS 工具子包**（`helper/tlsutil`），实现 TLS 配置和证书管理工具，支持证书生成、TLS 版本控制、密码套件配置和区域间 TLS 包装器。

## 2. 类型定义

### CAOpts

**定义位置**：[L65](file:///d:/claude/nomad/helper/tlsutil/generate.go#L65)

**类型**：struct

```go
	Signer crypto.Signer
	Serial *big.Int
	Days int
	PermittedDNSDomains []string
	Country string
	PostalCode string
	Province string
	Locality string
	StreetAddress string
	Organization string
	OrganizationalUnit string
	Name string
```

**关联方法**（1 个）：`IsCustom`

### CertOpts

**定义位置**：[L80](file:///d:/claude/nomad/helper/tlsutil/generate.go#L80)

**类型**：struct

```go
	Signer crypto.Signer
	CA string
	Serial *big.Int
	Name string
	Days int
	DNSNames []string
	IPAddresses []net.IP
	ExtKeyUsage []x509.ExtKeyUsage
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GenerateSerialNumber` | - | - | `*big.Int, error` | [L25](file:///d:/claude/nomad/helper/tlsutil/generate.go#L25) |
| `GeneratePrivateKey` | - | - | `crypto.Signer, string, error` | [L35](file:///d:/claude/nomad/helper/tlsutil/generate.go#L35) |
| `pemEncodeKey` | - | `key []byte, blockType string` | `string, error` | [L56](file:///d:/claude/nomad/helper/tlsutil/generate.go#L56) |
| `IsCustom` | `c *CAOpts` | - | `bool` | [L93](file:///d:/claude/nomad/helper/tlsutil/generate.go#L93) |
| `GenerateCA` | - | `opts CAOpts` | `string, string, error` | [L105](file:///d:/claude/nomad/helper/tlsutil/generate.go#L105) |
| `GenerateCert` | - | `opts CertOpts` | `string, string, error` | [L208](file:///d:/claude/nomad/helper/tlsutil/generate.go#L208) |
| `keyID` | - | `raw interface{}` | `[]byte, error` | [L262](file:///d:/claude/nomad/helper/tlsutil/generate.go#L262) |
| `ParseCert` | - | `pemValue string` | `*x509.Certificate, error` | [L284](file:///d:/claude/nomad/helper/tlsutil/generate.go#L284) |
| `parseCert` | - | `pemValue string` | `*x509.Certificate, error` | [L298](file:///d:/claude/nomad/helper/tlsutil/generate.go#L298) |
| `ParseSigner` | - | `pemValue string` | `crypto.Signer, error` | [L314](file:///d:/claude/nomad/helper/tlsutil/generate.go#L314) |
| `Verify` | - | `caString string, certString string, dns string` | `error` | [L345](file:///d:/claude/nomad/helper/tlsutil/generate.go#L345) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `crypto` | 标准库 |
| `crypto/ecdsa` | 标准库 |
| `crypto/elliptic` | 标准库 |
| `crypto/rand` | 标准库 |
| `crypto/rsa` | 标准库 |
| `crypto/sha256` | 标准库 |
| `crypto/x509` | 标准库 |
| `crypto/x509/pkix` | 标准库 |
| `encoding/pem` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `math/big` | 标准库 |
| `net` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **加密安全**：使用 Go crypto 标准库实现加密、签名或 TLS 通信

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [generate_test.go](file:///d:/claude/nomad/helper/tlsutil/generate_test.go) | 对应测试文件 |

