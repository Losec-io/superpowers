# Superpowers (Losec-io Fork)

A lean fork of [obra/superpowers](https://github.com/obra/superpowers), pinned at **v5.1.0** and extended with token-efficient features. Supports **Claude Code** and **Codex** only.

## Why This Fork?

The upstream Superpowers v6.0+ introduced significant overhead that makes it impractical for real-world use:

- **3-6x more tokens per task** — 5-round fix loops, unified heavy reviewer (~8KB prompt), plan-scoped workspaces, and rationalization tables
- **Much slower execution** — pre-flight plan scans, file-based handoffs, progress ledgers, scoped re-reviews after every fix round
- **SDD SKILL.md bloat** — grew from 279 lines (v5.1.0) to ~700 lines (v6.2.0), with supporting files ballooning from 8KB to 28KB

This fork keeps v5.1.0's lean workflow and adds targeted improvements inspired by [pcvelz/superpowers](https://github.com/pcvelz/superpowers):

| | v5.1.0 (this fork) | v6.2.0 (upstream) |
|---|---|---|
| **Workflow** | plan → dispatch → implement → 2 quick reviews → done | plan → pre-flight → dispatch → implement → file handoff → unified review → fix loop (1-5 rounds) → re-review → final branch review → done |
| **Reviewers** | 2 lightweight (spec 61 lines + quality 25 lines) | 1 heavy unified (7,816 bytes) + whole-branch final |
| **Fix loop** | None | 5 rounds + adjudication |
| **Token cost** | Baseline | 3-6x baseline |

## Supported Platforms

| Platform | Status |
|----------|--------|
| **Claude Code** | Fully supported |
| **Codex CLI / App** | Fully supported |

Other platforms (Gemini CLI, Cursor, Copilot CLI, etc.) are not maintained in this fork.

## Installation

### Claude Code

```bash
/plugin install --source url https://github.com/Losec-io/superpowers.git
```

### Codex CLI

```bash
/plugins
# Search for "superpowers" and install
```

### Codex App

In the Codex app, click on Plugins in the sidebar → find `Superpowers` → click `+` to install.

## The Workflow

```
plan → dispatch → implement → 2 quick reviews → done
```

1. **brainstorming** — Refines ideas through questions, explores alternatives, saves design document
2. **using-git-worktrees** — Creates isolated workspace on new branch, verifies clean test baseline
3. **writing-plans** — Breaks work into bite-sized tasks (2-5 min each) with exact file paths, complete code, and model tier tags
4. **subagent-driven-development** — Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality)
5. **test-driven-development** — Enforces RED-GREEN-REFACTOR cycle
6. **requesting-code-review** — Reviews against plan, reports issues by severity
7. **finishing-a-development-branch** — Verifies tests, presents merge/PR/keep options

## What's New in This Fork

### Model Routing (Token Optimization)

Opt-in per-task model tier routing with platform-aware config. Create `docs/superpowers/model-routing.json`:

```json
{
  "claude": {"mechanical": "inherit", "standard": "inherit", "frontier": "inherit"},
  "codex": {"mechanical": "inherit", "standard": "inherit", "frontier": "inherit"}
}
```

- **mechanical** — simple tasks (1-2 files, clear spec)
- **standard** — integration tasks (multi-file coordination)
- **frontier** — architecture/design judgment

All default to `inherit` (session model). Customize per platform to save tokens:
```json
{
  "claude": {"mechanical": "sonnet", "standard": "inherit", "frontier": "inherit"},
  "codex": {"mechanical": "gpt-5.6-luna", "standard": "gpt-5.6-terra", "frontier": "inherit"}
}
```

Tasks are tagged with `modelTier` during plan writing. A `PreToolUse` hook (Claude Code) and `SubagentStart` hook (Codex) enforce the correct model on every subagent dispatch. Disable with `SUPERPOWERS_ROUTING_GUARD=0`.

### Codex Native Agents

Custom agent TOML definitions in `agents/` for Codex's native subagent system:

| Agent | Role | Sandbox |
|-------|------|---------|
| `implementer` | Single-task TDD implementation with self-review | `workspace-write` |
| `spec-reviewer` | Skeptical spec compliance verification | `read-only` |
| `code-quality-reviewer` | Code quality, tests, architecture review | `read-only` |

Use with `spawn_agent(agent_type="implementer", ...)` in Codex CLI/App. The `SubagentStart` hook enforces model routing automatically.

### Cross-Session Messaging

Skills are aware of Claude Code's cross-session messaging (`SendMessage`/`ListAgents`). When running parallel worktrees or long-running plans, sessions can notify each other of breaking changes, completed tasks, or status updates.

### Platform-Neutral Prompts

All SDD prompt templates work on both Claude Code (`Task` tool) and Codex (`spawn_agent`). Tool references use platform-neutral language with explicit mappings.

## Skills Library

**Testing**
- **test-driven-development** — RED-GREEN-REFACTOR cycle (includes testing anti-patterns reference)

**Debugging**
- **systematic-debugging** — 4-phase root cause process
- **verification-before-completion** — Ensure it's actually fixed

**Collaboration**
- **brainstorming** — Socratic design refinement
- **writing-plans** — Detailed implementation plans with model tier tagging
- **executing-plans** — Batch execution with checkpoints
- **dispatching-parallel-agents** — Concurrent subagent workflows with cross-session coordination
- **requesting-code-review** — Pre-review checklist
- **receiving-code-review** — Responding to feedback
- **using-git-worktrees** — Parallel development branches
- **finishing-a-development-branch** — Merge/PR decision workflow
- **subagent-driven-development** — Fast iteration with two-stage review

**Meta**
- **writing-skills** — Create new skills following best practices
- **using-superpowers** — Introduction to the skills system

## Philosophy

- **Token efficiency** — Use the least tokens that produce correct results
- **Lean workflow** — No unnecessary review rounds, fix loops, or overhead
- **Test-Driven Development** — Write tests first, always
- **Systematic over ad-hoc** — Process over guessing
- **Evidence over claims** — Verify before declaring success

## License

MIT License — see LICENSE file for details.

Based on [obra/superpowers](https://github.com/obra/superpowers) by Jesse Vincent.

## Links

- **Issues**: https://github.com/Losec-io/superpowers/issues
- **Upstream**: https://github.com/obra/superpowers
