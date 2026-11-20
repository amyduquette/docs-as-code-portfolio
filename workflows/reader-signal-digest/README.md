# Reader-signal digest

This weekly workflow collects Mintlify searches, assistant conversations, page views, and visitor data. It removes likely credentials and contact details, sends a bounded evidence set to a model, and formats the result for a documentation planning channel in Slack.

The workflow treats low click-through and unanswered questions as signals to investigate rather than proof that documentation is wrong or missing. Manual runs default to a dry run.

Files:

- [Workflow example](workflow.yml)
- [Implementation](reader-signal-digest.mjs)
- [Tests](reader-signal-digest.test.mjs)
- [Shared helpers](../shared/docs-automation-lib.mjs)

The original workflow ran weekly. This generic copy is not connected to Mintlify, a model endpoint, or Slack, and the adapted files have not been executed in this portfolio.
