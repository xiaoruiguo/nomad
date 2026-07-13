# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Nomad is HashiCorp's workload orchestrator that manages containers, non-containerized applications across on-prem and clouds. The monorepo contains Go source for the Nomad agent server (`nomad`), client libraries/plugins/drivers configuration interfaces API clients (Go package `api`). It also includes documentation schemas validation tests e2e test suites UI code in Ember.

## Development Commands

### Build
```bash
# Develop binary with embedded static assets, tags: hashicorpmetrics ui for current platform's go env GOOS_GOARCH:
make dev NOMAD_UI_TAG="ui"  # or make without tag to exclude the bundled web interface (NOMAD_NO_UI=1)

or:

go build -tags "hashicorpmetrics [additional]" ...
```

- `dev`: Builds development binary for current platform with tags from GNUMakefile
    Default: hashicorpmetrics ui codegen_generated release; add NOMAD UI_TAG="ui" to embed static assets in the built CLI

### Test Commands (via Make)

```bash
# Run unit tests by group:
make test-nomad  # default groups = nomad client command drivers quick, with retries on flaky failures via gotestsum --rerun-fails=3: https://github.com/hashicorp/nomad/issues/26198

or directly:

go run -modfile tools/go.mod ./tools/mi ssing/main.go ci/test-core.json <group>  # List packages for a group (nomad client command drivers quick)
gotestsum --packages="..." go test ...
```

- `test-nomad`: Run unit tests in specified GOTEST_GROUP with retries on flaky failures via gotetnum; can also be invoked by e2e-test integration-test-* targets that build dev binary first

### Lint, Format and Validation
```bash
# Check code formatting (Go HCL protobuf):
make check hclfmt proto  # lint source format jobspecs + protos: https://github.com/hashicorp/nomad/issues/28183 for example CLI flags; generate Go structs via go gen erate

or:

golangci-lint run --build-tags "$(GO_TAGS)"           ## Check code style
misspell -error .                                      # Spell-checking website/content/
buf check lint / buf breaking                          proto format validation + backward compatibility checks against PROTO_COMPARE_TAG=v1.0.x+
```

## Code Architecture

### High-Level Patterns (based on existing architecture docs and directory structure)

**Agent Server Pattern:**
- Entry point via `command/agent` package's main function (`main.go`)
  - Serves gRPC API over TLS-wrapped HTTP
    RPCs for client interactions like job submission; alloc status queries scheduling evaluations etc.

### Package Organization (Go source layout)
```
nomad/*              # Core agent server logic: auth consensuus deploymentwatcher lock peers reporting state stream structs volumewatcher, scheduler with feasible/structs tests integration reconciler
client*             client plugins dynamicplugins lib hoststats serviceregistration vaultconsul fingerprint taskenv devicemanager common allochealth allocdir logmon widmgr server interfaces watchervolumenmngmt etc.

command/*           CLI subcommands: agent asset ui, test resources; includes bindata_assetfs.go for compiled static assets (ui)

drivers/            Task drivers implementations:
  docker exec java qemu mock rawexec
api/*.go             Go API client library to interact with Nomad server via gRPC HTTP wrapper

helper*              Shared utility packages across the codebase: logging constraints crypto pluginutils escapingio flatmap codec testlog raftutil tls util useragent uuid etc.
jobspec2/*           Jobspec HCL parsing and validation, separated from core agent (independent package)

plugins/            Base plugins base directory for CSI device drivers shared libraries
internal*          Internal testing components

e2e/*/               End-to-end tests by domain: ACLs containers network routing client intro job lifecycle metrics namespaces etc.
enos/**             External integration test framework modules used in CI to spin up infra and verify features.

scheduler/*         Scheduler implementation:
  feasible struct s, benchmarks (FeasibleSearch), integrations unit/reconciler
```

### Key Design Patterns from Architecture Documentation

- **Client Wrapper**: Use high-level API types (`Agent`, `Cluster`) not raw HTTP/gRPC calls for Nomad server communication - https://github.com/hashicorp/nomad/issues/28183 shows CLI flags that are wrapped by this pattern.

## Testing Approach
Unit tests: Group packages per domain (nomad client command drivers quick) using test-core.json mapping and tools/mi ssing/main.go script to list them. Integration/E2E via `make e2e-test` which builds dev binary first then runs the target's go t est; for Vault/Consul compatibility use integration-test-* targets.

## CI Pipeline
GitHub Actions workflow files define build/test pipelines under .github/workflows/. Key workflows include:
- test-e2e.yml: E2E testing with env vars like NOMAD_E2E_VAULTCOMPAT=1

See `.semgrep` for automated security scanning configuration.