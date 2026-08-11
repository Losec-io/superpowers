# Superpowers — Losec-io Fork

You have **superpowers** installed — a lean agentic skills framework for planning, TDD, debugging, model routing, and collaboration workflows. This fork supports **Claude Code** and **Codex** only.

## Instruction Priority

1. **User's explicit instructions** (CLAUDE.md, AGENTS.md, direct requests) — highest priority
2. **Superpowers skills** — override default system behavior
3. **Default system prompt** — lowest priority

## Quick Start

Before any task, invoke `superpowers:using-superpowers` to understand the skills system. If even a 1% chance a skill applies, invoke it.

## Available Skills

| Skill | When to use |
|-------|-------------|
| `brainstorming` | Before any creative work — features, components, modifications |
| `writing-plans` | When you have a spec, before touching code |
| `subagent-driven-development` | Executing plans with independent tasks |
| `executing-plans` | Batch execution with checkpoints |
| `dispatching-parallel-agents` | Concurrent subagent workflows |
| `test-driven-development` | RED-GREEN-REFACTOR cycle |
| `systematic-debugging` | 4-phase root cause process |
| `requesting-code-review` | Pre-review checklist |
| `receiving-code-review` | Responding to review feedback |
| `using-git-worktrees` | Parallel development branches |
| `finishing-a-development-branch` | Merge/PR decision workflow |
| `verification-before-completion` | Evidence before claims |
| `large-codebase-support` | Monorepos, sparse checkout, scoped CLAUDE.md |
| `writing-skills` | Create or modify skills |

## Custom Agents

Agent definitions in `agents/` for both platforms:

**Claude Code** (`.md` with YAML frontmatter):
- `implementer` — TDD implementation with self-review
- `spec-reviewer` — Skeptical spec compliance verification
- `code-quality-reviewer` — Code quality and architecture review

**Codex** (`.toml` with sandbox modes):
- `implementer` — workspace-write sandbox
- `spec-reviewer` — read-only sandbox
- `code-quality-reviewer` — read-only sandbox

## Saved Workflows

Reusable workflow scripts in `workflows/`:
- `deep-review` — Multi-dimensional code review with adversarial verification
- `sweep-and-fix` — Find and fix patterns across many files in parallel

## Model Routing

Configure `docs/superpowers/model-routing.json` for per-task model tier routing:

```json
{
  "claude": {"mechanical": "sonnet", "standard": "inherit", "frontier": "inherit"},
  "codex": {"mechanical": "gpt-5.6-luna", "standard": "gpt-5.6-terra", "frontier": "inherit"}
}
```

Hooks enforce routing on every agent dispatch. Disable with `SUPERPOWERS_ROUTING_GUARD=0`.

## Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| `session-start` | SessionStart | Injects using-superpowers at session start |
| `pre-agent-model-routing` | PreToolUse, SubagentStart | Enforces model tier routing |
| `stop` | Stop | Quality gate — uncommitted changes, unfinished tasks |

## CLI Tools

Helper scripts in `bin/` (added to PATH):
- `sp-routing` — Show, validate, or query model routing config
- `sp-worktree` — Create, list, or clean up git worktrees

## Tool Mapping

Skills use Claude Code tool names. Codex users: see `skills/using-superpowers/references/codex-tools.md` for equivalents.

## Philosophy

- **Token efficiency** — least tokens that produce correct results
- **Lean workflow** — plan → dispatch → implement → 2 quick reviews → done
- **Test-Driven Development** — write tests first, always
- **Evidence over claims** — verify before declaring success
