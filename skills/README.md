# @volverjs/zod-vue-i18n — Claude Code skills

This repository ships an installable [Claude Code](https://docs.claude.com/en/docs/claude-code)
plugin that helps agents integrate `@volverjs/zod-vue-i18n` into a Vue 3 application.

## Available skills

| Skill | Invoke | What it does |
| ----- | ------ | ------------ |
| [`volverjs-zod-vue-i18n`](./volverjs-zod-vue-i18n/SKILL.md) | `/volverjs-zod-vue-i18n:volverjs-zod-vue-i18n` (auto-loads on relevant requests) | Guides setup for both entry points (Zod 3 `setErrorMap` and Zod 4 `z.config`), loading the bundled locale files, custom error messages via `params.i18n`, custom labels on any validation with `makeZodI18nLabel`, per-field `WithPath` labels, pluralization, the `zDate` helper, common gotchas, and a full message-key reference. |

## Install

The repo is its own plugin marketplace. From Claude Code:

```text
/plugin marketplace add volverjs/zod-vue-i18n
/plugin install volverjs-zod-vue-i18n@volverjs-zod-vue-i18n
```

The skill then loads automatically when you ask things like "translate my Zod
errors with vue-i18n in this Vue app" or "add @volverjs/zod-vue-i18n and make the
form validation messages localized".

## Manual install (without the plugin manager)

Copy the skill into your project or user skills directory:

```bash
# project-local
cp -r skills/volverjs-zod-vue-i18n .claude/skills/volverjs-zod-vue-i18n
# or user-wide
cp -r skills/volverjs-zod-vue-i18n ~/.claude/skills/volverjs-zod-vue-i18n
```

## Layout

```text
.claude-plugin/
  plugin.json        # plugin manifest
  marketplace.json   # marketplace catalog (the repo hosts itself)
skills/
  volverjs-zod-vue-i18n/
    SKILL.md         # the skill
    references/
      message-keys.md  # full key reference (Zod 3 & Zod 4)
```
