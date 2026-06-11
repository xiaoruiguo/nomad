# AGENTS.md — Nomad Development Guide

## Quick Start

```sh
make bootstrap          # Install all build + lint deps
make dev                # Build dev binary → ./bin/nomad
make test               # Run unit tests (no retry)
make check              # Run all linters
```

Go version: 1.26.4 (per `.go-version`). `gcc-go` is NOT supported.

## Build Commands

- `make dev` — builds for current platform with tags `hashicorpmetrics,ui` (or `NOMAD_NO_UI=1` to skip UI)
- `make dev-static` — CGO_ENABLED=0 build (no CGO, limited drivers)
- `make dev-ui` — builds with Ember UI baked in (runs `ember-dist` + `static-assets` first)
- Binary output: `./bin/nomad` and `$GOBIN/nomad`
- Dev build also runs `hclfmt` automatically
- Windows builds add `timetzdata` tag automatically

## Build Tags (order matters)

| Tag | Purpose |
|-----|---------|
| `hashicorpmetrics` | Always on (default in GNUmakefile) |
| `ui` | Embed web UI (default unless `NOMAD_NO_UI=1`) |
| `codegen_generated` | Auto-added in CI (`CI=true`) |
| `release` | Release builds |
| `ent` | Enterprise build (community uses `//go:build !ent` stubs) |

## Test Commands

```sh
make test                                     # Unit tests, no retry on failure
make test-nomad                               # Unit tests, retry failures 3x
GOTEST_GROUP=quick make test-nomad            # Only quick (non-core) packages
GOTEST_GROUP=nomad make test-nomad            # Core server packages
GOTEST_GROUP=client make test-nomad           # Client packages
go test -tags "hashicorpmetrics" ./scheduler/...  # Single package directly
make test-nomad-module GOTEST_MOD=api         # Test api/ submodule
make e2e-test                                 # E2E tests (needs cluster + NOMAD_E2E=1)
make integration-test                         # Vault compat (NOMAD_E2E_VAULTCOMPAT=1)
make integration-test-consul                  # Consul compat (NOMAD_E2E_CONSULCOMPAT=1)
```

Test groups are defined in `ci/test-core.json`. `make missing` checks for uncovered packages.

## Testing Conventions

- Assert library: `github.com/shoenig/test/must` (prefer `must.*`), refactor `testify` if encountered
- Every `Test*` starts with `ci.Parallel(t)`
- Env vars: `t.Setenv`, temp dirs: `t.TempDir`, ports: `ci.PortAllocator.Grab()`
- Logger: `helper/testlog.HCLogger` bound to `*testing.T`
- API package tests require a pre-built Nomad binary (`make dev` first)

## Lint & Code Quality

```sh
make check            # Full lint suite (golangci-lint + hclogvet + misspell + proto + hclfmt + pkg isolation + go.mod)
make checkscripts     # shellcheck on scripts/
make hclfmt           # Format .hcl/.nomad/.tf files
make tidy             # Tidy all go.mod files (uses go-modtool)
```

`make check` enforces:
1. `golangci-lint` on root + `api/`
2. `hclogvet` for logger usage
3. `misspell` on website content
4. Proto files in sync (`buf breaking` + `make proto` diff check)
5. HCL files formatted
6. **Package isolation** (see below)
7. `go.mod` tidy
8. `raftutil` message type mapping in sync

## Package Isolation (enforced by `make check`)

- `api/` **cannot** import `github.com/hashicorp/nomad/` internal packages (has own go.mod)
- `jobspec2/` cannot import `github.com/hashicorp/nomad/` (may import `/api`)
- `command/` cannot import `nomad/structs`

## Code Generation

```sh
make generate-all     # Generate structs + protobufs
make generate-structs # go generate across all packages
make proto            # buf protobuf compilation (config: tools/buf/)
```

Generated file patterns:
- `*.pb.go` — protobuf generated
- `*.generated.go` — codegen tag gated files
- `*_string.go` — `stringer` generated
- `bindata_assetfs.go` — UI static assets (in `command/agent/`)
- `nomad/msgtypes.go` — raft message type mapping (via `go generate ./helper/raftutil/`)

When adding new Raft message types, add to `nomad/structs/structs.go` MessageType constants, then run `go generate ./...` to update `msgtypes.go`.

## State Store Critical Rules

1. **Immutability**: Objects from `StateStore` must be `.Copy()` before mutation
2. **Determinism**: Never generate random IDs or `time.Now()` in FSM/StateStore — pass as parameters from RPC handler
3. **Write skew**: Each data field should ideally be written by one component

## Architecture (Core Flow)

```
Read:  Client → HTTP API → RPC → StateStore
Write: Client → HTTP API → RPC → Raft → FSM → StateStore
```

### Key Components

| Component | Package | Key Files |
|-----------|---------|-----------|
| **Server** | `nomad/` | `server.go` (2379 lines), `leader.go`, `rpc.go` |
| **FSM** | `nomad/` | `fsm.go` (3405 lines) — Raft state machine |
| **State Store** | `nomad/state/` | `state_store.go` — memdb MVCC |
| **Structs** | `nomad/structs/` | `structs.go` — RPC/state type definitions |
| **Eval Broker** | `nomad/` | `eval_broker.go` — priority queue, at-least-once delivery |
| **Worker** | `nomad/` | `worker.go` — dequeues evals, runs scheduler |
| **Plan Apply** | `nomad/` | `plan_apply.go` — optimistic plan verification + Raft apply |
| **Scheduler** | `scheduler/` | `generic_sched.go`, `scheduler_system.go`, `scheduler_sysbatch.go` |
| **Client** | `client/` | `client.go` (3610 lines) |
| **Alloc Runner** | `client/allocrunner/` | `alloc_runner.go` — manages one allocation + hooks |
| **Task Runner** | `client/allocrunner/taskrunner/` | `task_runner.go` — manages one task, invokes driver |
| **HTTP API** | `command/agent/` | `http.go`, `*_endpoint.go` |
| **Agent** | `command/agent/` | `agent.go` — wires Server+Client+HTTP |
| **CLI** | `command/` | `commands.go`, `meta.go`, individual cmd files |
| **Public API** | `api/` | Independent go.mod, HTTP client SDK |
| **Job Spec Parser** | `jobspec2/` | HCL2 parser, may only import `api/` |
| **Driver Interfaces** | `plugins/drivers/` | `driver.go`, `plugin.go` |
| **Built-in Drivers** | `drivers/` | `docker/`, `exec/`, `rawexec/`, `java/`, `qemu/` |

### Eval Lifecycle

1. Event triggers Eval → `EvalBroker.Enqueue()`
2. Worker dequeues eval → runs appropriate `Scheduler.Process()`
3. Scheduler produces `Plan` → submitted to `PlanQueue`
4. `planApply` goroutine verifies plan against latest state → applies via Raft
5. On partial apply or failure → creates follow-up eval (blocked/failed)

### Scheduler Types

| Type | File | Reconciler |
|------|------|------------|
| service | `generic_sched.go` | Cluster reconciler (`scheduler/reconciler/`) |
| batch | `generic_sched.go` | Same as service |
| system | `scheduler_system.go` | Node reconciler |
| sysbatch | `scheduler_sysbatch.go` | Node reconciler |

Scheduling pipeline: reconcile → feasibility check → fit → score/rank → plan submission

## Changelog

Every PR needs a `.changelog/` entry:
```sh
make cl              # Create new changelog entry interactively
make changelog       # Merge all entries (release time)
```

## Enterprise / Community Split

Files named `*_ce.go` contain community edition implementations. Enterprise features use `//go:build ent` tags. When working on a feature, check both `_ce.go` and the enterprise counterpart.

## Key Dependencies

- **Raft**: `hashicorp/raft`, `raft-boltdb/v2`, `raft-wal`, `raft-autopilot`
- **State**: `hashicorp/go-memdb` (MVCC in-memory DB)
- **Discovery**: `hashicorp/serf`, `hashicorp/memberlist`
- **Encoding**: `hashicorp/go-msgpack/v2`, `net-rpc-msgpackrpc/v2`
- **CLI**: `hashicorp/cli`
- **HCL**: `hashicorp/hcl/v2`

## Windows Dev Notes

- Windows builds add `timetzdata` tag
- Some tests require root/admin — use `go test` for specific packages and let CI handle the rest
- `ulimit` equivalent: increase file handle limits if needed
- `vendor/` directory can cause build errors — `rm -r vendor` or `make clean`
