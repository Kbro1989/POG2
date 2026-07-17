# .github/workflows

GitHub Actions workflow definitions for Gemini-driven automation.

## Files
- `gemini-dispatch.yml` — Event router for PR/issue/comment triggers; extracts command and dispatches reusable workflows.
- `gemini-invoke.yml` — Reusable workflow that runs Gemini CLI for issue/PR requests.
- `gemini-plan-execute.yml` — Reusable workflow enabling approved plan execution and PR creation.
- `gemini-review.yml` — Reusable workflow that runs Gemini PR review and posts findings.
- `gemini-triage.yml` — Reusable workflow that analyzes an issue and selects labels.
- `gemini-scheduled-triage.yml` — Hourly scheduled workflow that finds untriaged issues and labels them.
