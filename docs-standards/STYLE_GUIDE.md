# Product docs style guide

Use this file as the source of truth for writing, terminology, and formatting decisions in the product documentation.

Apply these rules to documentation work unless a page explicitly opts out.

## Scope

Use this guide for decisions about:

- Voice and tone
- Terminology and branding
- Headings, links, lists, code formatting, and UI elements
- File conventions
- Vale-aligned writing rules

Use `CONTENT_ARCHITECTURE.md` for page types, navigation decisions, and page templates.

These prose rules (voice, em dashes, filler words, and so on) apply to every file an agent writes in this repo, including `.agents/skills/*.md`, `AGENTS.md`, and `skill.md`, not only reader-facing `.mdx` pages. The Vale exemption those files get (`.valeignore`, `.vale.ini`) covers vocabulary and terminology false positives from intentionally naming disallowed terms; it is not a license to ignore the style rules when writing new prose there.

## Voice and tone

The documentation follows the Google developer documentation style guide as a baseline, with the overrides below. Use American English spelling and phrasing, not British variants: "toward" not "towards," "color" not the British spelling.

- Use active voice.
- Use present tense. Do not use "will" to describe behavior.
- Address the reader as "you."
- Write for the user, not the product. Describe what users can do, expect, and achieve, not what features do internally. This applies to actions and to behavioral descriptions.
  - Product-focused (avoid): "This feature allows data export."
  - User-focused (preferred): "Export your data."
  - Product-focused (avoid): "Example Platform mounts your workspace into the sandbox."
  - User-focused (preferred): "Your project files stay on your host, even when the agent runs in a sandbox."
- Avoid internal implementation terms such as `system prompt` unless the page is explicitly about internals or troubleshooting.
- Keep the tone direct, concise, and professional.
- Use contractions sparingly.
- Avoid em dashes. Use them only when no reasonable restructuring works.
- Avoid parentheses when possible. Rewrite the sentence if you need to add essential information.
- Avoid filler words such as `simply`, `just`, `easily`, `obviously`, and `clearly`.
- Avoid cliches and inflated language.

## Terminology and branding

### Product capitalization

Always use the correct capitalization for product names.

| Use | Not |
|-----|-----|
| Example Platform | <code>example platform</code>, Example Platform AI |
| Example Platform Console | `Console`, `Admin Console`, <code>example platform console</code> |
| Example Platform Enterprise Assistant | <code>example platform enterprise assistant</code>  |
| Example Platform Chat | <code>example platform chat</code>  |
| VS Code | `VSCode`, `vscode` |

### Preferred terminology

Use the most specific term available.

| Concept | Use | Avoid |
|---------|-----|-------|
| `settings.yaml` approvals | Tool permissions | Permissions |
| Referring to AI interaction | with the model | with the AI |
| Named model families | models | LLMs |
| Product relationship with a customer | deployment | instance |
| One running copy of the product on a deployment | instance | deployment |
| IDE chat area | chat panel | chat window, chat interface, chat input |
| Overlay UI elements such as modals and slide-in panels | dialog | modal, drawer, pane, panel |
| IDE input area | prompt input box | chat input field |
| Selection controls | checkbox | check box |
| Product admin UI | Example Platform Console | Console |

Do not use:

- `frontier models` or `foundational models`; use `foundation models`
- `Example Platform Installer`; use `the installer`
- `enhanced context`; it is deprecated, use the specific context feature name
- `code generation`; describe the specific capability instead (for example, "write code" or "generate a function")
- bare `using` when `by using` or `that uses` is clearer

### Terminology safety

Choose terminology users can rely on across pages and product surfaces.

- Prefer the established term in this guide when one exists.
- Do not silently normalize inconsistent product terminology unless you can verify the intended canonical term.
- Do not replace a specific term with a broader but less accurate one just to make the sentence read more smoothly.
- Avoid internal, ambiguous, or overloaded terms unless the page is explicitly about internals or troubleshooting.
- If multiple terms appear to refer to different scopes or concepts, preserve the distinction or flag the inconsistency instead of collapsing them together.

### Inclusive language

Use inclusive alternatives.

| Use | Not |
|-----|-----|
| allowlist | whitelist |
| blocklist | blacklist |
| primary | master |
| secondary | slave |

## Headings

- Use sentence case.
- Do not add trailing punctuation.
- Do not use bold text as a heading substitute. Exceptions:
  - Use bold labels (`**Prerequisites**`, `**Steps**`, `**Next steps**`) within task sections on pages with multiple procedures. This keeps these labels out of the page TOC and avoids sidebar clutter.
  - Use bold labels instead of a fourth-level heading or deeper when the subsection does not need to appear in the TOC.
- For task headings, use a bare imperative verb: "Create an agent" not "Creating an agent." In mixed conceptual/procedural pages, "How to" is also acceptable: "How to switch modes."
- For concept and reference headings, use a noun phrase: "Overview," "Connection types."
- Avoid gerunds at the start of any heading.

Always capitalize these terms where appropriate: `API`, `CLI`, `GPU`, `JSON`, `LLM`, `MCP`, `SDK`, `UI`, `YAML`.

## Links

- Use descriptive link text.
- Do not use `click here`, `here`, or `this link`.
- Format links as `[link text](url)` with no extra spaces.
- For internal links, use root-relative paths without file extensions: `/section/page-name`, not `./page-name.mdx`.
- Use `navigate to` for product UI paths such as **Security > API Keys**. Use `go to` for URLs or other non-UI destinations.

## Lists

- Leave a blank line before and after a list when it sits between paragraphs.
- Keep list items parallel when possible.
- Use a colon after a label in a list, not an em dash: `- **Label**: Description`, not `- **Label** — Description`. This applies to both bulleted and numbered lists. Capitalize the first word after the colon.
- To indicate that a list item requires an admin role, add `(requires the \`tenant-admin\` role)` at the end of the item: `- Set or change the URL of your API server (requires the \`tenant-admin\` role)`.

## Tables

- Make table column labels match the content in the cells.
- Prefer user-focused labels such as `What it's for` and `When to use it` when the table helps readers choose between options.

## UI elements

- Bold labeled UI elements.
- If an element is not labeled in the UI, refer to it by a generic description and do not use bold text.
- Match the product UI labels exactly.
- Preserve exact UI labels, command names, setting names, and well-known file type names even if a generic style or Vale rule suggests different wording. For example, preserve exact labels such as **Execute commands without asking**.
- Format navigation paths in bold with a greater-than sign, for example **View > Command Palette**.
- Format user-entered text in backticks.
- Format command identifiers and field labels in backticks only when they are literal command names or field names.
- For checkboxes, use **select** to turn on and **clear** to turn off. Do not use `check`, `uncheck`, or `tick`.
- Format error messages in code font: `Failed to retrieve login options for this email`.
- Treat frontmatter status tags such as `BETA` as metadata, not reader-facing prose.

### Acronyms and abbreviations

- Expand unfamiliar acronyms on first use in reader-facing prose when the expansion helps the reader.
- After first use on a page, you do not need to repeat the expansion.
- Do not force expansion of widely understood file formats, protocol names, or other standard technical terms when the meaning is already clear in context.
- Preserve required product and technical terms such as `MCP`, `SCIM`, `SSE`, `PNG`, `JPEG`, `CSV`, `JSON`, and `YAML` when they are the established term in the UI or docs.
- In page `title` and `sidebarTitle`, you may use established abbreviations such as `CLI`, `API`, and `MCP` when they make titles easier to scan and match common product language. In running prose, follow the expansion guidance above.

### Permissions and roles

Permissions and roles appear in the UI as labeled checkboxes and selectable items. Format them differently depending on context:

- When describing the UI action of enabling a permission, use bold: "Select **Auto Approve Commands**."
- When referring to having or requiring a permission, use backticks: "If you have the `Auto Approve Commands` permission, you can skip manual approval for matching tools."
- When referring to having or requiring a role, use backticks: "You belong to a team with the `tenant-admin` role."

Examples:

- Click **Command Palette**.
- Enter `<branch-name>` in the prompt box.
- To restore a previous version of a file, click **Restore** next to the version number in the chat panel.
- Select **Auto Approve Commands** to allow agents to run commands without asking for approval.
- If you have the `Auto Approve Commands` permission, you can skip manual approval for matching tools.
- You have the `Create Agent` permission.
- You belong to a team with the `tenant-admin` role.
- Click the ellipsis (**…**) in the row for the role you want to edit and select **Edit Role**.
- In the user's row, click the <Icon icon="pencil-line" iconType="solid" /> Edit icon.
- Use "the search field" for an unlabeled field, not "the **Search** field."

## Code and commands

### Code blocks

- Always add a language identifier to fenced code blocks.
- Use copy-pasteable examples.
- Use Mintlify code block titles when a title helps users distinguish syntax, examples, variants, or command purpose.

  Correct:

  ````markdown
  ```bash title="Example: Start an interactive session"
  pool -C <project-path>
  ```
  ````

- Do not remove useful code block titles during cleanup. If a title is malformed, convert it to `title="..."` syntax instead of removing it.
- Use sentence case for code block titles. If the title starts with a label such as `Example:`, capitalize the first word after the colon.

### Commands

- Do not include a `$` prompt in commands.
- Comment expected output instead of mixing it into the command.
- Use bullets instead of a code block for flags, options, or reference lists when users are not meant to copy the whole block as a command.

### Placeholders

Use angle brackets to indicate values that users must replace. Use lowercase with hyphens for placeholder names. Do not use `your-` in placeholder names. Angle brackets already indicate that the reader must replace the value. Use surrounding prose when you need to clarify ownership, such as "Replace `<api-key>` with your API key."

Correct:

```bash
git checkout <branch-name>
Authorization: Bearer <api-key>
kubectl get pods -n <namespace>
```
Do not use all-caps placeholders.

Incorrect:

```bash
git checkout BRANCH-NAME
Authorization: Bearer <API_KEY>
```

For deployment hostnames and API domains, use the standard placeholders in [Deployment placeholders](#deployment-placeholders).

### Environment variables

Use uppercase with underscores for environment variable names.

Correct:

```bash
export EXAMPLE_API_KEY="<api-key>"
export BASE_URL="https://<api-domain>"
```

### Inline code

Wrap file names, directory names, commands, config keys, and literal values in backticks.

Also use inline code for permission names, role names, and file extensions (`.csv`, `.json`).

- Avoid starting a sentence with inline code unless there is no clearer rewrite. Prefer opening with the user action or outcome, then introduce the command name later in the sentence.
- Use backticks for literal flags and keys, such as `--oidc-client-secret`. Do not use backticks for conceptual value types such as issuer URL, client ID, client secret, or redirect URL unless they appear as literal UI labels or field names.

### Example values

- Use fake example identifiers that are syntactically valid. For example, use a valid UUID-shaped value such as `123e4567-e89b-12d3-a456-426614174000` rather than inserting invalid characters into the identifier.

## Keyboard shortcuts

- Use backticks around keyboard shortcuts.
- Use plus signs between keys, for example `Ctrl+Shift+P`.
- Use full key names and apply them consistently: `Command`, `Ctrl`, `Option`, `Enter`, `Return`.
- When shortcuts differ by platform, list macOS first and label each platform explicitly.
- Do not use slash shorthand such as `Ctrl/Cmd+Shift+P`.

Example:

- Open the Command Palette by pressing `Command+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows and Linux), or click **View > Command Palette**.

## Images

- Always include alt text.

## Ordinals and usage details

- Spell out `first` through `ninth` in running text.
- Use numerals for `10th` and above.
- Use correct storage-unit capitalization: `KB`, `MB`, `GB`, `TB`, `PB`, `EB`, `ZB`, `Gbps`.
- Write file format names in uppercase without backticks: CSV, JSON, YAML. Use backticks for literal file extensions: `.csv`, `.json`, `.yaml`.

## Deployment placeholders

When documenting user-provided values, use these standard placeholders consistently across all docs:

| Placeholder | Use for |
|-------------|---------|
| `<product-hostname>` | Generic product deployment hostname when the page does not need to distinguish web and API hosts |
| `<web-hostname>` | Product web hostname, such as the `webHost` value in deployment configuration |
| `<api-hostname>` | Product API hostname, such as the `apiHost` value in deployment configuration |
| `<api-domain>` | Customer-facing API domain or hostname |
| `<tenant-id>` | Tenant or organization identifier |
| `<namespace>` | Kubernetes namespace |
| `<branch-name>` | Git branch name |
| `<api-key>` | Authentication token or API key |

Do not use generic placeholders such as `<hostname>` or `<domain>` without qualification. Do not use on-premises or deployment-specific hostnames as general examples.

## File conventions

- Documentation files use `.mdx` and live at the repo root.
- Use lowercase hyphenated file names.
- Do not apply style rules to `/legal` or `/support` if those paths have style checks disabled.

## Writing checklist

Before finalizing a docs change, confirm that:

- The page uses active voice, present tense, and second person
- Headings use sentence case and no trailing punctuation
- Terminology matches this guide
- UI labels use bold text and unlabeled UI is described generically
- Keyboard shortcuts use backticks and platform-specific formatting
- Links are descriptive
- Code fences include language identifiers
- Commands omit `$`
- Placeholders use angle brackets with lowercase hyphenated names: `<branch-name>`, not `BRANCH-NAME`
