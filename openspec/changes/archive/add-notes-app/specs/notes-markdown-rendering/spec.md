## ADDED Requirements

### Requirement: GitHub-flavored Markdown rendering

The editor SHALL support GitHub-flavored Markdown constructs (tables, task lists, strikethrough, autolinks) rendered live in the WYSIWYG editor via Tiptap extensions.

#### Scenario: Render GFM constructs

- **WHEN** the owner types a table, a task list, or strikethrough text
- **THEN** the editor renders them as a formatted table, checkbox list, and struck-through text respectively, live as the owner types

### Requirement: Syntax-highlighted code blocks

Non-mermaid fenced code blocks SHALL display with syntax highlighting powered by shiki (`github-dark` theme). While the block is being actively edited, the raw code is shown (editable); when the block loses focus, the highlighted display is restored.

#### Scenario: Highlight a fenced code block

- **WHEN** the owner writes a fenced code block with a language identifier and clicks away
- **THEN** the block is rendered with language-appropriate syntax highlighting via shiki

#### Scenario: Plain fenced block without language

- **WHEN** the note contains a fenced code block with no language identifier
- **THEN** the block renders as a monospaced plain-text block without failing

#### Scenario: Click to edit highlighted block

- **WHEN** the owner clicks a shiki-highlighted code block
- **THEN** the block switches to editable mode showing the raw code with ProseMirror cursor support

### Requirement: Mermaid diagram rendering

The preview SHALL detect fenced code blocks tagged `mermaid` and render them as diagrams using the `mermaid` package, instead of as code.

#### Scenario: Render a valid mermaid diagram

- **WHEN** the note contains a ` ```mermaid ` fenced block with valid diagram syntax
- **THEN** the preview renders the corresponding diagram in place of the code block

#### Scenario: Invalid mermaid syntax

- **WHEN** a ` ```mermaid ` block contains invalid syntax
- **THEN** the preview shows an inline error indication for that block without crashing the rest of the preview

### Requirement: Images out of scope

The MVP SHALL NOT provide image upload or embedding support.

#### Scenario: No image upload affordance

- **WHEN** the editor UI is inspected
- **THEN** there is no control for uploading or attaching images
