# FA · Folio research workspace

The published FA design with Folio's local Markdown files, safe editing and persistent revision history. It keeps the published warm paper, red accents, Archivo Black headings, report typography and spacing. HTML5, CSS and vanilla JavaScript run on a small local Node server. No framework, build step, package installation, account or internet connection is needed.

## Run

Requires Node.js 20 or newer. From the repository root, run `npm run start:folio`. Alternatively, in this `folio/` folder:

```sh
npm start
```

Open **http://127.0.0.1:5173**. Keep the terminal running; stop with Ctrl+C. If that port is occupied, use `PORT=5174 npm start` and open that port instead. These local files do not automatically update the GitHub Pages website.

## Read and navigate

The app opens the uniquely designated canonical thesis for your last research context when one exists, otherwise your last report or the featured review. The library groups reports by the explicit `query` in `ledger.config.json` or an authored `Research query` declaration; ungrouped files appear under Research library. Configuration supplies presentation metadata, never report text or inferred financial relationships.

- **Report:** complete Markdown with navigable sections, scrollable tables, working report links and external citations. Export downloads the original Markdown. Agent handoff copies the selected report, its hash, recorded dates and editing guidance.
- **Sources:** linked sources from the authored bibliography, or the report's external links when there is no bibliography. Filter by publisher, topic or label. Listing a link does not claim independent verification.
- **Compare:** read two reports side by side and choose sections independently. A third report linking to both is offered as an authored comparison. The app does not infer agreement, resolve incompatible assumptions or generate new analysis.
- **Synthesis:** select two or more source reports, inspect their declared roles, model identities, dates and exact versions, and prepare a cross-examination packet. A declared canonical thesis remains distinct from its independent source perspectives.
- **Timeline:** explicit document dates and observed local snapshots, kept distinct. The workspace timeline shows observed changes across files. All recording times use Asia/Kolkata (IST).
- **Revisions:** inspect a recorded snapshot and its line diff. Separate research reports remain separate documents.
- **Markdown / Edit file:** inspect the exact source or edit it with a sanitized preview and conflict-checked save.

Search covers titles, query labels, filenames and sections. Opt into searching complete report bodies or historical snapshots. `/` opens the library and focuses search. Arrow keys, Home and End navigate report tabs. Ctrl/Cmd+S saves while editing.

Library and context panels can be hidden independently. Focus view hides both and restores the previous arrangement when toggled again or exited with Escape. Narrow screens use one panel at a time and stack comparisons.

### Browse report files

Click **FA** or **Browse reports** to open the full collection. Report cards contain a document thumbnail, a source-text description, declared research role/model when available, and clearly labeled dates. Prepared dates and information cutoffs remain separate from the filesystem's File updated date. Missing report dates remain unrecorded.

Folder links and breadcrumbs navigate the discovered Markdown hierarchy. The root shows all reports, including nested files; opening a folder limits the cards to that branch. Breadcrumbs in the reader link back to the collection and containing folders. The browser shares search with the sidebar, including optional report-body and historical search, and remembers title/file-updated sorting in this browser.

Thumbnails illustrate document structure and preview its title/sections. They are decorative previews, not financial charts or new analysis. Full source content, qualifications and revisions remain available when opening a card.

### Page minimap

A VS Code-style minimap sits beside the report's scroll viewport on wide screens. It draws a lightweight miniature of rendered text lines and headings, with a viewport thumb for click/drag navigation. Arrow keys, Page Up/Down, Home and End work when the map has focus; wheel scrolling over the map moves the page. The ordinary contents links and sticky reading controls keep their anchor behavior.

**Page map** in the reading controls toggles the overview and saves the preference in this browser. Smaller desktop layouts use a slim track; narrow/mobile screens retain native scrolling. Prose, source order and the separate side-panel scroll surfaces remain intact.

## Prepare macro and asymmetric-position research

**Research** in the masthead opens eight editable briefs: Independent FA, Synthesis / cross-examination, map the macro regime, find the moving bottleneck, find the mispricing, underwrite the asymmetry, challenge a thesis, and update or reconcile research. Set the market, theme, horizon, information cutoff, price date, optional return hurdle, shared brief ID and known model/agent identity. Unknown dates remain unspecified; no live prices are supplied by the app.

Independent FA is the initial default and excludes peer reports and an emerging synthesis, even if report boxes were previously selected. Fresh discovery also excludes existing report context. Use selected reports in other workflows to reference particular versions and date boundaries. Synthesis requires at least two distinct selected source files. **Copy research brief** copies the prompt and references; **Copy with reports** also includes their complete original Markdown. Paste the result into your chosen research tool. These controls prepare context; they do not run an AI service or independently verify claims. A selectable text fallback is provided when clipboard access is unavailable.

You can edit the generated brief. Changing inputs preserves your edits and asks you to regenerate explicitly before copying a brief with the new scope. All workflows require source attribution, comparable financial bases, permanent-loss analysis and explicit verification gaps. An unsupported opportunity remains a valid conclusion.

The Report view includes a compact, expandable **Decision brief**. An explicitly labeled opening thesis can supply its working judgment. The other fields come only from an authored `## Decision brief` section; company-level labels elsewhere cannot become report-level judgments. Missing fields remain unestablished. Its template button supplies these labels for use in Edit file:

```markdown
## Decision brief

**Working judgment:** Decision, main reason and strongest qualification.

**Variant view:** Specific, evidenced disagreement with market expectations.

**Price hurdle:** What the dated entry price requires; state the financial basis.

**Failure condition:** Observable invalidation or permanent-impairment path.

**Next check:** Missing evidence most likely to change the judgment.
```

No existing report is rewritten to create this presentation layer.

## Independent research → canonical synthesis

Keep one `AGENTS.md`. Run the same initial brief independently through each participating model with aligned scope, horizon and reference dates where feasible. Each source report retains its own analysis, actual dates, provenance and known model/agent identity. Initial independent mode instructs agents to avoid peer analyses; the app prevents adding peer contents to that workflow's packet, but cannot enforce what an external agent reads.

Cross-examination is a separate operation. Its brief compares evidence, mechanisms, assumptions, contradictions and unique discoveries; model consensus does not count as evidence. The integrated report distinguishes supported convergence, material disagreement and novel inference. Preserve unresolved dissent and the independent originals. Future research advances the canonical Super Report with dated revisions.

Declare metadata in ordinary Markdown after the title/date line and before the first section heading:

```markdown
**Report role:** Independent FA
**Research query:** Shared research scope
**Research brief:** Shared brief ID
**Model / agent:** Not recorded
**Information cutoff:** 2026-10-13
**Price date:** 2026-10-09
```

For the integrated report, use `**Report role:** Synthesis` and `**Status:** Canonical`. Write only supported dates and identities; the dates above illustrate syntax. Model/role declarations do not prove independent evidence or verification. Legacy reports remain unclassified when these details were not recorded.

In the synthesis, record source links relative to its file, with the exact analyzed hash:

```markdown
## Source reports

**Source report:** [Model A](relative/source-a.md) | SHA-256: <actual 64-character source hash>

**Source report:** [Model B](relative/source-b.md) | SHA-256: <actual 64-character source hash>
```

Synthesis shows whether a source matches its referenced version, has changed, lacks a version pin, or is unavailable. **Inspect referenced snapshot** opens the exact hash in recorded history when it exists. Source changes do not automatically change the integrated thesis. Missing recorded versions stay an explicit provenance gap.

When one canonical synthesis is declared for the research context, the report's default handoff is labeled **Continue canonical thesis** and includes that report. **Copy this perspective's handoff** preserves an explicit source-level continuation. Multiple canonical declarations are shown as a conflict; the app does not silently choose the newest file. For ungrouped reports, related contexts use explicit report/source links instead of treating every ungrouped file as one thesis.

## Reading preferences

Published light mode is the initial default; an existing saved Folio theme is respected. Dark mode, boosted contrast, panel visibility and text size are stored in this browser. **A− / A+** steps through **1, 1.125, 1.25, 1.375 and 1.5rem**. Report text, headings, tables, source and previews scale together. The default report text is **16px / 1rem** with the published 1.7 line height and 74-character reading measure.

Markdown supplies the content and source order. For older reports without `##` headings, standalone bold section titles are presented as headings. Reports with real headings retain bold statements as prose. Explicit reasoning labels receive restrained callout styling; unlabeled text is not classified automatically. Writing guidance lives in `AGENTS.md`, excluded from discovery.

Typography, spacing, borders and control dimensions use rem/em units. The root respects the browser's default font size. Flex containers arrange the shell, masthead, panels, controls and comparisons; prose and tables retain native document flow. Viewport units and percentages size the viewport-bound regions. The report remains the central scroll container, controls stay sticky, and mobile drawers remain anchored to the corresponding edge. Section offsets track the rendered toolbar height and are stored in rem, so wrapped controls and larger default fonts do not hide a heading behind the toolbar.

### Report callouts

```markdown
> [!THESIS]
> The central judgment and its essential qualification.

> [!EVIDENCE]
> An attributed, dated observation with a source.

> [!INFERENCE]
> What follows, and which assumptions it needs.

> [!RISK]
> The failure path or strongest caveat.

> [!QUESTION]
> The specific unresolved question and next useful check.
```

Standard note, tip, important, warning and caution markers are supported too. Existing explicit labels such as `**Overall judgment:**` and `**Failure path:**` receive presentation styling without changing their wording.

## Files, imports and editing

Save `.md` files anywhere in this workspace, including nested folders such as `Reports/`. The server discovers them on requests and every 1.5 seconds; the page checks for changes every 2.5 seconds. Links between discovered Markdown files open in the reader.

**Import** accepts one Markdown file or pasted text, previews it, and creates an independent file under `Imported/`. Existing files are never overwritten. Filenames must end in `.md` and use letters, numbers, spaces, dots, underscores or hyphens, starting with a letter or number. Paths, hidden names and reserved workspace filenames are rejected. Use Edit file to revise an existing report.

Browser edits save directly to the original Markdown. Content hashes reject stale saves when the file changes in another editor. On conflict, copy your draft before discarding it to reopen the latest file. Unsaved drafts survive navigation in this tab's memory; closing or reloading discards them, with a browser warning when available.

## Persistent history

`.ledger/` holds full snapshots separately from source reports and survives restarts. History begins when Folio first observes a file; it does not reconstruct earlier edits or import Git history. Each observed content change records a timestamp, hash and line diff. The first snapshot is a baseline. Rapid saves between scans may be grouped together; changes while the server is stopped become one observed change at the next start.

Filesystem modification times, research dates in the text and snapshot observation times have different meanings. Context dates are displayed only when explicitly recognized in the document; the full date wording remains in the report. Report links show relationships, never an inferred revision sequence.

Back up `.ledger/` alongside the reports. Removed files leave the active library while their snapshots remain. Restoring the same path reattaches history; renaming a file starts a new history.

## Local boundary

The server binds only to `127.0.0.1`, serves an explicit asset allowlist, and validates origins and session tokens for writes. Keep this personal local server off public tunnels. Reports are limited to 2 MiB each. Hidden directories, application files, tests, `node_modules`, `README.md`, `AGENTS.md` and symlinks are excluded from discovery. Unreadable history is reported in the terminal rather than silently discarded.

Markdown rendering uses an explicit sanitization allowlist. Scripts, remote images, embedded frames and event handlers are removed. External citations open only when clicked. Fonts and Markdown parsing are bundled locally; there is no telemetry, runtime CDN or market-data request.

## Check

```sh
npm test
```

Integration tests use disposable reports to verify discovery, imports, snapshot persistence, line diffs, direct saves, stale-edit rejection and access boundaries. Original reports are not modified by tests. Browser visual checks are still needed for final layout, narrow screens and assistive technology.

Research-brief tests also verify that independent/fresh discovery excludes prior reports, synthesis requires distinct inputs, version/date boundaries stay explicit, complete source text is included only on request, and all workflows preserve the research discipline. Metadata tests check declared roles and source pins; minimap tests check geometry, pointer/wheel/keyboard control and accessible scrollbar values.

The visual foundation comes from the [published FA site](https://2531prasad.github.io/FA/). Archivo Black is bundled under the SIL Open Font License; see `app/fonts/OFL.txt`. Markdown parsing uses vendored [Marked 16.4.1](https://github.com/markedjs/marked), under the MIT license; see `app/vendor/MARKED-LICENSE.md`.
