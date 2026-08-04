# OpenWiki Instructions

## Scope
- Focus areas: nomad core server (Raft/FSM/RPC/scheduler)、client agent (allocrunner/taskrunner)、drivers (docker/exec/java/qemu/rawexec)、api Go client、command CLI、Ember UI
- Skip / deprioritize: 第三方 vendor 代码、生成代码（.pb.go、bindata_assetfs.go）、node_modules、ui/dist

## Terminology
- Prefer: Nomad（项目名）、Server（控制平面）、Client（数据平面/worker node agent）、Alloc（allocation 简称）、Eval（evaluation 简称）、Raft（共识）、FSM（有限状态机）
- Avoid: 不要把 Server 称为"master"；不要把 Client 等同于 API client（后者是 `api/` Go SDK）

## Audience
- Primary: coding agents (Cursor, Claude Code, Codex, Trae)
- Secondary: Nomad 贡献者与运维 onboarding

## Update preferences
- Prefer incremental updates from git diffs
- Keep pages under ~200 lines when possible
- 当源码与文档冲突时以源码为准；改源码后通过 `openwiki sync` 重新生成
