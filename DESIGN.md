# FA interface direction

Status: implemented as a local prototype in `public/`, with a Node server and local report storage. Interaction proposals below describe the intended model; README.md records the prototype's practical limits. Browser visual verification was unavailable in the implementation session.

The user's subsequent priority is dated research and a logical timeline. Display report date, information cutoff, and market-price date prominently, with exact save/import times in IST. Provide a query-wide chronological view and retain external Thesis Ledger history as an explicitly read-only snapshot. Remove marketing language, decorative company metrics, and fictional example reports from the active interface. Keep navigation and headings compact so the date context and actual report content lead.

## Authority and intent

Product requirements live in [PRODUCT.md](PRODUCT.md). The user selected the industrial-brutalist-ui skill to develop the interface further. This document applies its Swiss Industrial Print archetype consistently to FA's local report workspace.

The goal is a research instrument that makes substantial analysis easy to read, revisit, refine, and combine. Typography and visible structure carry the identity. The report remains the primary artifact throughout the workflow.

## Visual world

- Use one light substrate throughout: documentation paper with carbon-black text.
- Anchor content to visible grid tracks and continuous rules. Use square corners throughout.
- Pair oversized, heavy company headings with compact monospaced metadata and comfortable report prose.
- Use red as the single accent, sparingly, with explicit text explaining its meaning.
- Keep interface labels literal: Companies, Reports, Revisions, Sources, Compare, Synthesize.
- Use real document identifiers, dates, and revision numbers when available. Never invent telemetry, prices, or timestamps as decoration.
- Omit decorative trademark symbols, military insignia, scanlines, flicker, and textures over report text.
- Use flat surfaces without gradients, shadows, translucency, floating cards, or rounded pills.

## Tokens

| Role | Value | Use |
| --- | --- | --- |
| Paper | `#F4F4F0` | Main canvas and reading surface |
| Secondary paper | `#EAE8E3` | Navigation, table headers, and quiet controls |
| Ink | `#111111` | Text, structural rules, and icons |
| Muted ink | `#61615C` | Secondary labels; never disabled-looking body copy |
| Hazard red | `#E61919` | Action emphasis and labeled exceptions |
| Major rule | `2px solid #111111` | Workspace and section boundaries |
| Minor rule | `1px solid #111111` | Table rows and panel divisions |
| Corner radius | `0` | All panels, fields, controls, and dialogs |
| Spacing | `4, 8, 12, 16, 24, 32, 48, 64px` | Consistent layout rhythm |

Use a heavy grotesque such as Archivo Black for company headings, a readable sans such as IBM Plex Sans for prose and controls, and IBM Plex Mono for metadata and numeric tables. Bundle selected font files locally when implementing; network font loading should not be required to use the local app. System sans and monospace are the fallbacks.

Company headings may use `clamp(2rem, 4vw, 4rem)`, tight tracking, and uppercase styling. Keep navigation and operational headings compact. Body copy is mixed case at 16–18px with roughly 1.6 line height and a 65–78 character reading measure. Use 12–14px uppercase metadata and tabular numerals; do not shrink essential controls to fit a dense layout.

## Workspace structure

The following interaction model is proposed for implementation. It does not settle the open stack, storage, or agent-integration decisions in PRODUCT.md.

Desktop layout:

1. A compact top bar identifies FA and exposes persistent Library/Context visibility controls and Import Markdown.
2. A left rail groups reports by company or research query, with its own scroll region. Reports form a list with title, type, revision, and report date when known.
3. The main pane presents the selected report: company heading, report title, revision metadata, section index, and readable analysis.
4. A right context pane stays in place, with its own scroll region, for the section index, date history, and agent handoff. Either side pane can close to give the report more room. Visibility preferences survive reloads; narrow screens use one drawer at a time.

Use a desktop grid with a roughly 240px navigation rail and a flexible reading region. Open the optional 300–360px context pane only when space permits. At narrower widths, use drawers or dedicated views instead of compressing three panes.

The first viewport should establish the company, report identity, revision, thesis, and available report actions. Avoid decorative dashboard metrics that push the analysis below the fold.

## Primary workflows

### Read and refine one report

Open a company, select a report, and read its current revision. A follow-up in the terminal produces an update to that report. Preserve the report's full content and identity across revisions.

Proposed update behavior: keep the current reading position stable, announce that a newer revision is available, and offer Open latest and View changes. Do not replace visible paragraphs while the user is reading. Show a concise change summary alongside the full revised report.

Keep revision history accessible through the report header. Historical revisions clearly show that they are historical. Comparison should reveal additions, removals, and changed conclusions without requiring users to reconstruct a chat.

Whether changes are staged for approval, applied automatically, or edited directly in the UI remains an implementation decision.

### Work with multiple reports

Allow any number of distinct reports under one company. Present them as rows with visible names and revision metadata rather than a long row of tabs. Do not assume that two reports are the maximum.

Select two or more reports to Compare or Synthesize. Comparison aligns analysis sections when possible and labels missing sections rather than implying agreement.

### Create a super report

Proposed flow: select source reports, review the exact source revisions, provide an optional synthesis objective, and start synthesis through the chosen agent integration.

Create the result as a distinct report. Retain the source reports and make their relationships visible from the result. A synthesis should identify shared conclusions, disagreements, unresolved questions, and the evidence behind them. It should not silently turn conflicting assumptions into one confident conclusion.

If a source report subsequently changes, identify the super report as based on an earlier revision and offer a deliberate regeneration action. Exact synthesis behavior and provenance storage remain open decisions.

## Report content

Render the actual analysis structure; avoid forcing every report into a fixed template. A useful optional starting outline is thesis, business context, financial performance, valuation, risks, open questions, and sources. This outline is a design proposal, not a confirmed financial methodology.

Display currencies, units, periods, source dates, and assumptions beside the figures they qualify. Missing data remains visibly missing. Separate reported facts, estimates, and the author's interpretation through clear labels.

Use tables for comparable figures and aligned values. Use charts only when real report data supports them. Include source links and reference locations when supplied by the agent. There is no requirement for a live market feed.

## States and feedback

- Empty workspace: explain how to create or import the first report through the configured terminal workflow. Do not populate it with fabricated companies or market values.
- Report in progress: preserve the last complete revision and show actual task status. Avoid fictional percentages or streamed fragments presented as complete analysis.
- Update available: identify the new revision and offer a stable transition to it.
- Failed update: keep the existing report readable and identify the failed operation with a retry action when supported.
- Merge conflict: identify the affected report and competing revisions; require a deliberate resolution rather than silently overwriting content.
- No sources supplied: state the absence directly without implying the analysis has been verified.

## Accessibility and responsive behavior

Use semantic landmarks, a skip link, real buttons and links, visible keyboard focus, and logical heading order. Mark the current report with more than color. Expose update announcements without stealing focus. Controls should remain comfortable to target and work without hover.

Use dark ink for routine small text. Check contrast for accent treatments during implementation; red should not become the default color for financial numbers. Distinguish gains, losses, warnings, and selection with words and symbols as well as styling.

On small screens, prioritize the active report. Company navigation, sources, and revision details open separately. Let wide data tables scroll within their own region. Preserve text zoom and reading measure. Keep decorative motion out of the reading experience and respect reduced-motion preferences.

## Next implementation decisions

- The prototype uses the user-selected plain HTML/CSS/JavaScript and Node stack.
- Reports persist as JSON with full revision content; the CLI publishes UTF-8 Markdown through the local API.
- Revision writes use optimistic concurrency and are serialized within one server process.
- The active library contains the user's imported reports only. Any terminal agent can use the shared instructions and CLI/API; browser imports accept dropped files and pasted Markdown without provider integration.
- Synthesis creates an attributed source compilation for subsequent agent refinement, rather than generating conclusions itself.

Build the report workspace first. Its minimum useful flow is company list → current report → updated revision → comparison → super report with source relationships.

## Implemented report and synchronization controls

Preserve the industrial print identity and independent scrolling panes. Functional text has an 11px minimum. The header Git status opens explicit remote check, reviewed commit/push, and clean fast-forward pull. On the static viewer, replace write controls with the published-library state and show the export instant separately from research dates.

Revision editing is a main-pane task: inherited dates, one revised file or full pasted Markdown, recoverable browser drafts, required change summary, date callouts, and a word-level review before saving. Stale drafts need deliberate review against the latest saved revision. New-report versus revise-existing intent remains explicit in Import Markdown. Search can include bodies and labeled historical revision matches. Inline changes use both text decoration and color; large changes may be grouped to bound work.

Synthesis assembles exact source revisions. Copy its structured packet to any agent; do not present unassessed agreements/contradictions as conclusions. Mixed source dates remain distinct. An effective compilation date is optional and explicit; actual save time never implies current evidence.
