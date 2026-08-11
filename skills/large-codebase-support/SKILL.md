---
name: large-codebase-support
description: Use when working with monorepos or large codebases where context limits, slow file scans, or out-of-scope CLAUDE.md instructions are problems
context: fork
effort: medium
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Large Codebase Support

## When to Use

- Project has 10,000+ files or multiple independent subsystems
- File scans (Glob, Grep) are slow or returning too many results
- CLAUDE.md instructions from other subsystems are polluting context
- Agent needs to focus on one area without loading the entire repo

## Techniques

### 1. claudeMdExcludes — Silence Irrelevant Instructions

When a monorepo has CLAUDE.md files in directories you're not working on, exclude them:

```json
// .claude/settings.json
{
  "claudeMdExcludes": [
    "packages/mobile/**",
    "services/legacy-api/**",
    "docs/**"
  ]
}
```

Only exclude directories you are NOT touching. This reduces context noise without losing guidance for the areas you're actively editing.

### 2. worktree.sparsePaths — Load Only What You Need

For very large repos, sparse checkout limits what files are visible:

```json
// .claude/settings.json
{
  "worktree": {
    "sparsePaths": [
      "packages/core/",
      "packages/shared/",
      "tests/core/"
    ]
  }
}
```

When an agent creates a worktree (via `using-git-worktrees` or agent isolation), only these paths are checked out. The rest of the repo exists in git but is not on disk.

**When to use:** Agents that only need 2-3 packages out of 50. Cuts checkout time from minutes to seconds.

**When NOT to use:** If the agent might need to read code outside the sparse set (cross-package imports, shared types).

### 3. Per-Directory Skills — Scoped Guidance

Instead of one giant CLAUDE.md, put skills in the directories where they apply:

```
packages/
  auth/
    CLAUDE.md           ← auth-specific guidance
    skills/
      auth-testing/
        SKILL.md        ← "Use OAuth test fixtures in tests/fixtures/oauth/"
  payments/
    CLAUDE.md           ← payments-specific guidance
```

Use the `paths` frontmatter field to scope skills:

```yaml
---
name: auth-testing
description: Testing patterns for the auth package
paths: packages/auth/**
---
```

The skill only activates when the agent is working on files matching the `paths` glob.

### 4. Subsystem-Scoped Plans

When writing plans for a monorepo, scope each plan to one subsystem:

```
docs/superpowers/plans/
  2025-01-15-auth-refactor.md      ← packages/auth only
  2025-01-15-payments-migration.md ← packages/payments only
```

Never write a plan that spans unrelated subsystems — break it into separate plans during brainstorming.

### 5. Parallel Worktrees per Subsystem

For independent subsystems, run parallel agents each in their own worktree:

```
repo-main/          ← coordinator session
repo-auth/          ← auth agent worktree
repo-payments/      ← payments agent worktree
```

Each agent only sees its subsystem. Use `SendMessage` for cross-session coordination if they share interfaces.

## Configuration Checklist

When starting work on a large codebase:

1. **Check file count:** `find . -type f | wc -l` — if > 10K, consider sparse paths
2. **Check CLAUDE.md count:** `find . -name "CLAUDE.md" | wc -l` — if > 3, consider excludes
3. **Identify working area:** Which packages/directories will you touch?
4. **Configure excludes:** Add non-working directories to claudeMdExcludes
5. **Consider sparse:** If worktrees would benefit from sparse checkout, configure sparsePaths
6. **Scope plans:** Ensure each plan targets one subsystem

## Anti-Patterns

- Loading the entire monorepo when you only need one package
- Having one CLAUDE.md with rules for 15 different subsystems
- Plans that modify files across unrelated packages in the same task
- Agents scanning the whole repo when they only need `packages/core/`
