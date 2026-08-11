You have **superpowers** installed — an agentic skills framework for planning, TDD, debugging, and collaboration workflows.

## Getting Started

Before any task, check if a skill applies. Use the `superpowers:using-superpowers` skill to understand the full workflow.

## Instruction Priority

1. **Your explicit instructions** (AGENTS.md, CLAUDE.md, direct requests) — highest priority
2. **Superpowers skills** — override default system behavior
3. **Default system prompt** — lowest priority

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
| `using-git-worktrees` | Parallel development branches |
| `finishing-a-development-branch` | Merge/PR decision workflow |
| `large-codebase-support` | Monorepos, sparse checkout, scoped CLAUDE.md |

## Custom Agents

This plugin provides custom agents in `agents/` for both platforms:

**Claude Code** (`.md` with YAML frontmatter):

| Agent | Tools | Description |
|-------|-------|-------------|
| `implementer` | Read, Write, Edit, Bash, Grep, Glob | Single-task TDD implementation with self-review |
| `spec-reviewer` | Read, Grep, Glob | Skeptical spec compliance verification |
| `code-quality-reviewer` | Read, Grep, Glob | Code quality, test coverage, architecture review |

**Codex** (`.toml` with sandbox modes):

| Agent | Sandbox | Description |
|-------|---------|-------------|
| `implementer` | workspace-write | Single-task TDD implementation with self-review |
| `spec-reviewer` | read-only | Skeptical spec compliance verification |
| `code-quality-reviewer` | read-only | Code quality, test coverage, architecture review |

## Saved Workflows

Reusable workflow scripts in `workflows/`:

| Workflow | Description |
|----------|-------------|
| `deep-review` | Multi-dimensional code review (correctness, security, perf, tests) with adversarial verification |
| `sweep-and-fix` | Find and fix patterns across many files in parallel |

## Model Routing

If `docs/superpowers/model-routing.json` exists, tasks are routed to the appropriate model tier. The `PreToolUse` hook (Claude Code) and `SubagentStart` hook (Codex) enforce correct models on every dispatch.

## Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| `session-start` | SessionStart | Injects using-superpowers skill at session start |
| `pre-agent-model-routing` | PreToolUse, SubagentStart | Enforces model tier routing on agent dispatch |
| `stop` | Stop | Quality gate — warns about uncommitted changes and unfinished tasks |

## CLI Tools

Helper scripts in `bin/` (added to PATH when plugin is active):

| Tool | Usage |
|------|-------|
| `sp-routing` | Show, validate, or query model routing config |
| `sp-worktree` | Create, list, or clean up git worktrees |

## Tool Mapping

See `skills/using-superpowers/references/codex-tools.md` for the full tool equivalence table between Claude Code and Codex.
