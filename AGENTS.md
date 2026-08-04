<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

# Agent Instructions

<!-- OPENWIKI:START -->

## OpenWiki

本仓库使用 OpenWiki 维护面向 Agent 的代码文档。请先阅读 `openwiki/quickstart.md`，再按其中链接进入架构、工作流、领域概念、运维、集成、测试与源码地图。

需要仓库上下文时，优先读 OpenWiki 页面，而不是全库扫描。除非用户明确要求，不要手改生成页；应改源码后重新生成文档。

<!-- OPENWIKI:END -->
