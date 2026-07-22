## ADDED Requirements

### Requirement: GitHub-flavored Markdown rendering

The preview SHALL render Markdown using `react-markdown` with GitHub-flavored Markdown extensions (tables, task lists, strikethrough, autolinks).

#### Scenario: Render GFM constructs

- **WHEN** the note contains a table, a task list, or strikethrough text
- **THEN** the preview renders them as a formatted table, checkbox list, and struck-through text respectively

### Requirement: Syntax-highlighted code blocks

The preview SHALL render fenced code blocks with syntax highlighting using `shiki`.

#### Scenario: Highlight a fenced code block

- **WHEN** the note contains a fenced code block with a language identifier
- **THEN** the preview renders the code with language-appropriate syntax highlighting

#### Scenario: Plain fenced block without language

- **WHEN** the note contains a fenced code block with no language identifier
- **THEN** the preview renders it as a monospaced code block without failing

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
