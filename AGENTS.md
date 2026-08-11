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

## Custom Agents

This plugin provides custom agents in `agents/`:

- **implementer** — focused single-task implementation with TDD and self-review
- **spec-reviewer** — skeptical spec compliance verification (read-only)
- **code-quality-reviewer** — code quality, test coverage, architecture review (read-only)

## Model Routing

If `docs/superpowers/model-routing.json` exists, tasks are routed to the appropriate model tier. See `references/codex-tools.md` for configuration.

## Tool Mapping

See `skills/using-superpowers/references/codex-tools.md` for the full tool equivalence table between Claude Code and Codex.
