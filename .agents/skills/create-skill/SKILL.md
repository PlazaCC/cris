---
name: create-skill
description: 'Create a new agent skill (SKILL.md) in .agents/skills/ following skills.sh best practices for this project. Use when: creating a skill, adding a skill, building a reusable workflow, packaging domain knowledge as a skill, or someone says "crie um skill", "create a skill", "new skill". Writes to .agents/skills/ — Windows junctions propagate automatically to .claude/skills/, .opencode/skills/, .github/skills/.'
argument-hint: 'Describe what the skill should do or its name'
---

# Create Skill

Creates a well-structured `SKILL.md` in `.agents/skills/<name>/`, which propagates automatically to all agents via Windows junctions (`.claude/skills/`, `.opencode/skills/`, `.github/skills/`).

## Project Conventions

- **Canonical directory**: `.agents/skills/<name>/SKILL.md` — only write here
- **Junctions auto-propagate**: `.claude/skills/`, `.opencode/skills/`, `.github/skills/` all point to `.agents/skills/`
- **skills.sh tracking**: Skills installed via `npx skills add` are tracked in `skills-lock.json`. Local/custom skills are NOT tracked there — they live only in `.agents/skills/`
- **Node 22 / Yarn 4.9.2** — use `npx` commands with `--prefer-offline` when calling skills CLI

## When to Create a Local Skill vs Install from skills.sh

| Use local skill                          | Install from skills.sh           |
| ---------------------------------------- | -------------------------------- |
| Project-specific workflow                | Generic reusable capability      |
| Domain knowledge unique to this codebase | Community-maintained tool        |
| No equivalent exists on skills.sh        | Already exists with 1k+ installs |

For finding existing skills, use the `find-skills` skill first.

## Procedure

### Step 1 — Gather Requirements

Determine from the user's request or conversation:

- **Name**: lowercase, hyphens only, 1-64 chars (e.g., `deploy-preview`, `seed-cms`)
- **Trigger phrases**: when should the agent auto-load this skill? List 4-6 specific trigger phrases for the `description` field
- **Workflow steps**: what are the ordered steps the agent should follow?
- **Assets needed**: scripts, reference docs, templates?

If unclear, ask:

1. What task should this skill automate?
2. What words would a user say to trigger it?
3. Any scripts or reference files to bundle?

### Step 2 — Create the Skill File

Create `.agents/skills/<name>/SKILL.md` with this structure:

```markdown
---
name: <skill-name> # Must match folder name exactly
description: 'What it does. Use when: <trigger phrase 1>, <trigger phrase 2>, <trigger phrase 3>. Max 1024 chars.'
argument-hint: 'Short hint shown when invoked as /skill-name'
---

# Skill Title

One-sentence summary of what this skill accomplishes.

## When to Use

- Specific trigger condition 1
- Specific trigger condition 2

## Procedure

1. Step one (be explicit)
2. Step two
3. Validation / done criteria

## References

- [script](./scripts/example.sh) — only if bundling scripts
```

### Step 3 — Validate

Before saving, verify:

- [ ] `name` in frontmatter **exactly matches** the folder name
- [ ] `description` contains keyword-rich trigger phrases (use "Use when: ..." pattern)
- [ ] Body has explicit step-by-step procedure (not just descriptions)
- [ ] No name collision with existing skills — check `.agents/skills/` directory
- [ ] File is at `.agents/skills/<name>/SKILL.md` (not in `.claude/` or `.github/` directly)

### Step 4 — Confirm

After creating the file:

1. List `.agents/skills/` to confirm the new folder appears
2. Remind the user that junctions propagate automatically — no extra steps needed
3. If the skill is local (not from skills.sh), note it won't appear in `skills-lock.json`

## Frontmatter Reference

| Field                      | Required | Notes                                        |
| -------------------------- | -------- | -------------------------------------------- |
| `name`                     | Yes      | Lowercase, hyphens, must match folder        |
| `description`              | Yes      | Discovery surface — include trigger keywords |
| `argument-hint`            | No       | Hint shown for `/skill-name` invocation      |
| `user-invocable`           | No       | `false` to hide from slash commands          |
| `disable-model-invocation` | No       | `true` for slash-only skills                 |

## Anti-patterns to Avoid

- **Vague description**: "A helpful skill" → agent won't discover it
- **Name mismatch**: `name: create-skill` in a folder called `skill-creator/`
- **Writing to `.claude/skills/` directly**: Always write to `.agents/skills/` — junctions handle the rest
- **Monolithic SKILL.md**: >500 lines → extract to `./references/` subfolder
- **Missing procedure**: Description without ordered steps → agent produces inconsistent results
