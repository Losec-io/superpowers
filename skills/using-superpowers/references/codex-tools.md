# Codex Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | Codex equivalent |
|-----------------|------------------|
| `Task` tool (dispatch subagent) | `spawn_agent` |
| Multiple `Task` calls (parallel) | Multiple `spawn_agent` calls |
| Task returns result | `wait_agent` |
| Task completes automatically | `close_agent` to free slot |
| `TodoWrite` (task tracking) | `update_plan` |
| `Skill` tool (invoke a skill) | Skills load natively — just follow the instructions |
| `Read`, `Write`, `Edit` (files) | Use your native file tools |
| `Bash` (run commands) | Use your native shell tools |
| `SendMessage` (cross-session) | Not available in Codex — use file-based coordination instead |

## Subagent Configuration

### Enable Multi-Agent

Add to your Codex config (`~/.codex/config.toml`):

```toml
[features]
multi_agent = true
```

This enables `spawn_agent`, `wait_agent`, and `close_agent` for skills like `dispatching-parallel-agents` and `subagent-driven-development`.

### Agent Config

```toml
[agents]
enabled = true
max_concurrent_threads_per_session = 4
default_subagent_model = "gpt-5.6-terra"
default_subagent_reasoning_effort = "high"
```

### Custom Agents

This plugin ships custom agent TOML files in `agents/`:

| Agent | Role | Sandbox |
|-------|------|---------|
| `implementer` | Single-task implementation with TDD and self-review | `workspace-write` |
| `spec-reviewer` | Skeptical verification: code matches spec exactly | `read-only` |
| `code-quality-reviewer` | Clean code, test quality, architecture review | `read-only` |

These agents are automatically available when the plugin is installed. Use them with `spawn_agent`:

```
spawn_agent(agent_type="implementer", prompt="Implement Task 1: ...")
spawn_agent(agent_type="spec-reviewer", prompt="Review spec compliance for Task 1...")
spawn_agent(agent_type="code-quality-reviewer", prompt="Review code quality for Task 1...")
```

### Codex Models

| Model | Tier | Use for |
|-------|------|---------|
| `gpt-5.6` | frontier | Architecture, design judgment, complex reasoning |
| `gpt-5.6-terra` | standard | Multi-file coordination, integration, reviews |
| `gpt-5.6-luna` | mechanical | Simple tasks, 1-2 files, clear spec |

### Reasoning Effort

Available levels: `ultra`, `max`, `xhigh`, `high`, `medium`, `low`

Match effort to task complexity:
- `low`/`medium` — mechanical tasks, simple file edits
- `high` — standard implementation and reviews
- `xhigh`/`max` — complex architecture, debugging
- `ultra` — only for the hardest reasoning tasks

### Model Routing

To save tokens, configure `docs/superpowers/model-routing.json`:

```json
{
  "codex": {
    "mechanical": "gpt-5.6-luna",
    "standard": "gpt-5.6-terra",
    "frontier": "inherit"
  }
}
```

Tasks tagged with `modelTier` in the plan will automatically use the mapped model. The `SubagentStart` hook enforces this.

## Built-in Agents

Codex ships three built-in agents:

| Agent | Purpose |
|-------|---------|
| `default` | General-purpose fallback |
| `worker` | Execution-focused implementation |
| `explorer` | Read-heavy exploration and research |

Use `/agent` in Codex CLI to switch between active agent threads.

## Environment Detection

Skills that create worktrees or finish branches should detect their
environment with read-only git commands before proceeding:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

- `GIT_DIR != GIT_COMMON` → already in a linked worktree (skip creation)
- `BRANCH` empty → detached HEAD (cannot branch/push/PR from sandbox)

See `using-git-worktrees` Step 0 and `finishing-a-development-branch`
Step 1 for how each skill uses these signals.

## Codex App Finishing

When the sandbox blocks branch/push operations (detached HEAD in an
externally managed worktree), the agent commits all work and informs
the user to use the App's native controls:

- **"Create branch"** — names the branch, then commit/push/PR via App UI
- **"Hand off to local"** — transfers work to the user's local checkout

The agent can still run tests, stage files, and output suggested branch
names, commit messages, and PR descriptions for the user to copy.

## Legacy Notes

- Codex builds before `rust-v0.115.0` exposed spawned-agent waiting as `wait`. Current Codex uses `wait_agent` for spawned agents.
- The `wait` name now belongs to code-mode `exec/wait`, which resumes a yielded exec cell by `cell_id`; it is not the spawned-agent result tool.
