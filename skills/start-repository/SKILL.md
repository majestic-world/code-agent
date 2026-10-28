---
name: start-repository
description: Configure a repository with setup-matt-pocock-skills using the user's saved preferences for local Markdown issues, default triage labels, and AGENTS.md. Use when starting a repository with this engineering-skills setup.
---

# Start repository

Read and follow the installed `setup-matt-pocock-skills` skill, using these preselected answers:

- **Issue tracker:** Local markdown, with issues under `.scratch/<feature>/`.
- **Triage labels:** Yes, keep the default labels. Apply this only when `triage` is installed, as the setup skill requires.
- **Agent instructions:** Use the repository-root `AGENTS.md`; create it if needed, even when `CLAUDE.md` exists. Put the `Agent skills` block in `AGENTS.md` and preserve unrelated content. Leave `CLAUDE.md` unchanged.

These are the user's standing choices. Execute the setup without asking these questions again or pausing for draft approval of these choices. These preferences override the setup skill's file-selection defaults. Honor any explicit overrides in the current request.

Keep the setup skill's repository exploration, templates, and completion checks. Use its default single-context domain layout unless monorepo signals require the layout question. Ask only about unresolved choices outside the saved preferences, such as a monorepo layout or legacy-document migration.

If the setup skill is not listed, look for its `SKILL.md` in the installed skill directories, including `~/.agents/skills/setup-matt-pocock-skills/`. Read it directly to execute this requested workflow. If it cannot be found, report the missing dependency rather than recreating its workflow.
