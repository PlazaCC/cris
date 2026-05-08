---
name: create-rule
description: 'Creates or updates agent rule/instruction files for this project. Use when: create a rule, add a rule, criar uma rule, adicionar regra, update agent instructions, copilot instructions, CLAUDE.md, AGENTS.md, instruction for agent, regra para agente, update coding rules, new architectural rule.'
argument-hint: 'Describe the rule content and which agent(s) it should apply to'
---

# Create Rule

Creates or updates the correct rule/instruction file(s) for the targeted agent(s), following this project's conventions.

## Rule File Map

| Target                  | File                                          | When to use                                                     |
| ----------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| All agents (universal)  | `AGENTS.md`                                   | Setup, commands, architecture overview, project conventions     |
| Claude Code — always    | `CLAUDE.md`                                   | Claude-specific guidance, commands, architectural detail        |
| Claude Code — scoped    | `.claude/rules/<name>.md`                     | Rules scoped to specific file patterns via `paths:` frontmatter |
| GitHub Copilot (always) | `.github/copilot-instructions.md`             | Mandatory rules applied to every Copilot interaction            |
| GitHub Copilot (scoped) | `.github/instructions/<name>.instructions.md` | Rules scoped to specific file patterns via `applyTo`            |
| OpenCode                | `AGENTS.md`                                   | Loaded via `opencode.json → instructions: ["AGENTS.md"]`        |

> **Note on `.claude/rules/`**: This is the official Claude Code mechanism for modular, path-specific rules (documented at code.claude.com/docs/en/memory). Rules without a `paths` field load unconditionally alongside `CLAUDE.md`. Rules with `paths` load only when Claude works with matching files.
>
> **Note on `.agents/rules/`**: This path **does not exist** as a standard. Only `.agents/skills/` is officially supported for agents that use that directory (OpenCode, Cursor, Codex, Copilot). Do not create `.agents/rules/`.

## When to Use

- User says "crie uma rule", "create a rule", "add a rule", "adicionar regra"
- User wants to update coding standards, architectural rules, or agent behavior
- User references `CLAUDE.md`, `AGENTS.md`, or `copilot-instructions.md`
- User asks about "instructions for agent", "regra para agente"

## Procedure

### Step 1 — Determine Scope

Ask or infer from context:

1. **Which agent(s)?**
   - All agents / general → `AGENTS.md`
   - Claude Code (always) → `CLAUDE.md`
   - Claude Code (scoped to file patterns) → `.claude/rules/<name>.md`
   - GitHub Copilot (all files) → `.github/copilot-instructions.md`
   - GitHub Copilot (specific file pattern) → `.github/instructions/<name>.instructions.md`
   - OpenCode → `AGENTS.md` (same file)

2. **Is it scoped to file patterns?**
   - For Claude Code: scoped rules go in `.claude/rules/<name>.md` with `paths:` frontmatter
   - For GitHub Copilot: scoped rules go in `.github/instructions/<name>.instructions.md` with `applyTo:` frontmatter
   - If the rule applies unconditionally → use the always-applied file for the target agent

3. **Does the rule already exist elsewhere?**
   - Check if a similar rule already exists in the target file before adding a duplicate

### Step 2 — Determine Content and Format

For `AGENTS.md` or `CLAUDE.md`:

- Add to the most relevant existing section (Architecture, Key Commands, Conventions, etc.)
- Keep consistent heading level and tone with the rest of the file
- Use tables and bullet lists to stay concise — no prose paragraphs

For `.github/copilot-instructions.md`:

- Append to the relevant existing section or add a new `## <Topic>` section
- Rules should be imperative and unambiguous: "Always", "Never", "Must", "Do not"

For `.github/instructions/<name>.instructions.md` (new Copilot scoped rule):

```markdown
---
applyTo: 'glob/pattern/**/*.ts'
---

- Rule line 1
- Rule line 2
```

- `applyTo` is a glob pattern (e.g., `clients/web/src/**/*.tsx`, `**/*.test.ts`)
- File name: lowercase, hyphens, describes scope (e.g., `react-components.instructions.md`)

For `.claude/rules/<name>.md` (new Claude Code scoped rule):

```markdown
---
paths:
  - clients/web/src/features/**
  - clients/web/src/lib/adapters/**
---

- Rule line 1
- Rule line 2
```

- `paths` is an array of glob patterns — rule loads only when Claude works with matching files
- Omit `paths` entirely if the rule should always apply (equivalent to adding it to `CLAUDE.md`)
- File name: lowercase, hyphens, describes scope (e.g., `web-adapters.md`)
- Directory `.claude/rules/` must exist — create it if absent

### Step 3 — Apply the Change

1. Read the target file first to understand existing structure
2. Insert the rule in the most appropriate section
3. Do not rewrite existing content — append or insert only
4. For new Copilot scoped files: create at `.github/instructions/<name>.instructions.md`
5. For new Claude Code scoped files: create at `.claude/rules/<name>.md` (create the directory if it doesn't exist)

### Step 4 — Validate

- [ ] Rule is in the correct file for its intended agent/scope
- [ ] No duplicate rule already covers the same behavior
- [ ] Tone and formatting matches the rest of the file
- [ ] `applyTo` glob is correct (for scoped `.instructions.md` only)
- [ ] `paths` globs are correct (for scoped `.claude/rules/*.md` only)
- [ ] `AGENTS.md` and `CLAUDE.md` stay in sync for rules that apply to both

### Step 5 — Confirm

After applying:

1. Show the diff or the updated section
2. If the rule was added to `AGENTS.md`, note it applies to OpenCode and general agents too
3. If architectural, suggest updating `docs/engineering-rules.md` as the source of truth

## Anti-patterns to Avoid

- **Creating a new file when an existing section fits**: prefer updating `AGENTS.md` over creating a separate file
- **Adding rules only to `CLAUDE.md`** when they should apply to all agents — use `AGENTS.md`
- **Creating `.agents/rules/`**: this directory has no official support — do not create it; use `.claude/rules/` for Claude Code and `.github/instructions/` for Copilot scoped rules
- **Duplicating rules** across `AGENTS.md` and `CLAUDE.md` unless the content genuinely differs
- **Vague rules**: "Write good code" → useless. Be specific and imperative.
- **Overwriting entire files**: always read first, then append/insert

## References

- [AGENTS.md](../../../AGENTS.md) — universal agent instructions
- [CLAUDE.md](../../../CLAUDE.md) — Claude Code instructions
- [.claude/rules/](../../../.claude/rules/) — Claude Code path-scoped rules directory
- [copilot-instructions.md](../../../.github/copilot-instructions.md) — GitHub Copilot instructions
- [engineering-rules.md](../../../docs/engineering-rules.md) — source of truth for architecture
- [Claude Code memory docs](https://code.claude.com/docs/en/memory) — official docs for `.claude/rules/`
