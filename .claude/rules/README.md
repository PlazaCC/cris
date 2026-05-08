# .claude/rules/

Path-specific rules for Claude Code, loaded automatically based on file context.

## How it works

- Files **without** a `paths` frontmatter field load at every session start (same as `CLAUDE.md`)
- Files **with** a `paths` field load only when Claude opens or edits a matching file

## Format

```markdown
---
paths:
  - clients/web/src/features/**
  - clients/web/src/lib/adapters/**
---

- Rule line 1
- Rule line 2
```

## File naming

Lowercase, hyphens, describes the scope: `web-adapters.md`, `cms-controllers.md`, etc.

## Reference

- [Claude Code memory docs](https://code.claude.com/docs/en/memory)
- Project's `CLAUDE.md` for always-on Claude rules
- `create-rule` skill for guidance on which file to use
