# Weekly docs changelog

This weekly workflow finds reader-facing documentation pull requests merged during the previous seven days. It gives a model bounded evidence from those changes, validates the returned pull request and documentation links, and formats a short update for Slack.

The workflow excludes repository maintenance files and focuses the summary on what changed for readers. Manual runs default to a dry run.

Files:

- [Workflow example](workflow.yml)
- [Implementation](weekly-docs-changelog.mjs)
- [Tests](weekly-docs-changelog.test.mjs)
- [Shared helpers](../shared/docs-automation-lib.mjs)

The original workflow ran weekly. This generic copy is not connected to GitHub, a model endpoint, or Slack, and the adapted files have not been executed in this portfolio.
