# CLAUDE.md

Standing rules for every task in this repo.

## WORKFLOW

- Every task ends the same way: run the tests the task names, then spawn a reviewer subagent that has NOT seen your work. Give it only the task text and `git diff`, and have it check the diff against the task's requirements and the rules below. Fix anything it finds, then re-run the tests.
- Then stop and print ONE report:

  ```
  STATUS: READY or NEEDS DECISION
  Files changed (git diff --stat)
  Tests: each one, its exit code, one line of result
  Reviewer findings and what you fixed
  Anything you did not test, or a decision you need from me
  ```

- Commit only when I type "approve" in this session. Stage only the files the task changed, by name. Never `git add -A` or `git add .`. Use a one-line commit message describing the change.
- Never push, never deploy, never touch Netlify's deploy lock. Those are manual and done by me.

## PROJECT RULES

- Never write the workshop's suburb, street or postal code into any tracked file, comment or commit message. The terms live in the gitignored `.hidden-terms` file; never stage it.
- The hero video and intro animation are untouched unless a task explicitly says otherwise.
- Netlify's Prerender extension stays OFF (this is an SSR prerender build). The site-wide noindex stopgap in `netlify.toml` and the edge function stay until the go-live rebuild.
- After any commit, `npm run verify` against the live site reports STALE until the next deploy. That is correct; do not try to work around it.
- Performance comparisons: build, run `npm run preview`, and run Lighthouse mobile 5 times on each side. Compare medians, never single runs.
- Windows machine, PowerShell. The prerender is server-side rendering (scripts/prerender.mjs) and launches no browser. Checklist items 2-11 (Playwright postinstall) and 2-16 (Edge launch) do not apply to this build.
- .env is tracked and the repo is public. Never put a token, key or password in any .env file. NETLIFY_AUTH_TOKEN is set as a Windows user environment variable, outside the repo.
