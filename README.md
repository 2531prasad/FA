# FA — local research workspace

A dependency-free prototype for turning terminal-generated financial analysis into durable, revisioned reports. Requires Node.js 20 or later.

```powershell
npm start
```

Open **http://127.0.0.1:4310**. The server binds to loopback only. No accounts, cloud service, API key, or package installation are needed.

The app and complete report library are versioned together in the public [2531prasad/FA](https://github.com/2531prasad/FA) GitHub repository. See [SYNC.md](SYNC.md) for cloning onto another device and synchronizing changes. The [published viewer](https://2531prasad.github.io/FA/) includes the owner-approved active reports and their revisions. Editing runs locally; the hosted viewer is read-only. Reports do not sync automatically.

New data directories start empty. The active library contains the user's two imported AI-position reports; generated examples have been removed from the library and automatic sample seeding has been removed.

## Try the workflow

Use **Import Markdown** to drop multiple files or paste a complete AI output. You can also drop files anywhere in the workspace. Review the destination research query, detected titles, optional provider label, and dates before importing. Files and pasted outputs use the same import contract, retain their original text, and reuse exact duplicate originals within the same group.

The left library and right context pane stay in place while the report scrolls. Each has its own scroll region. Use **Library** and **Context** in the top bar, or each pane's arrow, to hide and reopen them. Your choices persist across reloads, with separate preferences for desktop and narrow screens.

1. Use **Edit & revise**, drop one revised file onto the report, or paste Markdown while reading it. The editor inherits dates, suggests file metadata, saves browser drafts, and previews date and word changes before saving. **Import Markdown** explicitly offers independent reports or an existing report to revise.
2. Open **Timeline** for research dates and recorded history, or **Revisions** to inspect historical content and date changes.
3. Select two or more reports in **Compare reports** for side-by-side reading.
4. Use **Create super report** to compile exact source revisions into a new document.
5. Copy its **synthesis packet** from the context pane. Ask any agent to reconcile its pinned sources, then save the complete Markdown as a revision.

Enable **Search report bodies** to search content. **Include historical revisions** labels and opens matches at the exact revision. **Show inline changes** displays additions and deletions from the preceding revision. Browser drafts are specific to this browser and are not Git-synced. A stale recovered draft must be deliberately reviewed against the latest report.

Synthesis in this prototype is an attributed source compilation. It does not call an AI model or invent a reconciled conclusion. Original reports remain intact. The UI flags a super report when its sources advance.

## Terminal-agent integration

Open this folder in Claude, Gemini, Codex, or another agent and ask it to read [AGENTS.md](AGENTS.md) and [AGENT_WORKFLOW.md](AGENT_WORKFLOW.md). `CLAUDE.md` and `GEMINI.md` point to those same instructions. No provider SDK is required. The UI's **Agent handoff & instructions** can copy the selected report, its date context, and publishing instructions into any AI chat.

Use [templates/report.md](templates/report.md) for optional title/query/date metadata. `node scripts/report.mjs create analysis.md` reads this metadata automatically; explicit CLI flags override it. New perspectives create independent reports; refinements use the revision command.

Keep the server running and run these from the project folder:

```powershell
node scripts/report.mjs list
node scripts/report.mjs timeline --query "Asymmetric AI positions after October 2026"
node scripts/report.mjs create analysis.md --query "Research question" --title "Independent analysis" --report-date 2026-10-12 --information-cutoff 2026-10-11 --market-date 2026-10-09
node scripts/report.mjs revise REPORT_ID analysis.md --base 1 --summary "Refined valuation assumptions" --report-date 2026-10-13
```

Use UTF-8 Markdown for the **complete** report, not just the latest answer. Headings, paragraphs, lists, bold text, and pipe-delimited tables are rendered. Raw HTML is escaped. The revision command requires the latest revision number; stale writes return a conflict instead of overwriting newer research.

Reports can belong to a company or a shared research query spanning several companies. Query reports do not require a fictional company name or ticker. Comparison and synthesis stay within the same group.

Import several independent Markdown reports for one query with:

```powershell
node scripts/import-reports.mjs --query "Research question" report1.md report2.md
```

Each document starts as its own report at revision 1. The importer preserves the exact UTF-8 content, records its source filename and SHA-256 checksum, and keeps an original file copy under `data/imports/`. Repeating an import reuses an existing report with the same query and checksum. Document text is treated as report content, never as executable instructions. Use the returned `?report=...` URL to open a particular report.

The UI polls every five seconds. Incoming revisions show **Open latest**, preserving the report currently being read until you choose to switch. Reports persist as JSON under `data/reports/`; each file includes full revisions and any source relationships. Use **Export report** for a JSON copy. Back up the data folder to retain your work.

An agent can also call `GET /api/reports`, `POST /api/import`, `POST /api/reports`, `POST /api/reports/:id/revisions`, and `POST /api/synthesize`. The import endpoint accepts plain or front-matter Markdown, computes file checksums, and prevents duplicate retries. See [AGENT_WORKFLOW.md](AGENT_WORKFLOW.md) for the contract. Writes require `Content-Type: application/json`.

## Dates and Thesis Ledger

Dates are separate from save timestamps:

- `reportDate`: the effective date of the analysis, stored as a calendar date.
- `informationCutoff`: the information included in the analysis, as a calendar date.
- `marketDate`: the date of the quoted market-price snapshots, as a calendar date.
- Revision `createdAt`: the actual UTC instant of a local creation, import, or save. The UI displays exact times in Asia/Kolkata (IST).

Unknown dates display **Not recorded**. They are not replaced by the import date. Calendar dates are validated, and cutoff/market dates cannot follow the report date. Changes to dates create a new revision; older revisions retain their earlier date context. Compilations pin each source revision's dates. They inherit cutoff or market dates only when every source has the same known value. Mixed dates remain distinct in the synthesis packet, with coverage ranges and missing-date flags. Set the effective compilation report date explicitly or leave it unknown; the actual compilation time is separate.

The two original reports were found in the connected **Thesis Ledger** plugin with report dates of **12 October 2026**. Their full bodies match the locally imported originals. Read-only ledger snapshots preserve the original **12 October IST** import records separately from the **13 October IST** local imports. Both source documents identify a **11 October** information cutoff and **9 October** price snapshots.

`data/ledger-source-snapshot.json` contains the captured ledger reports and history. The local UI uses that snapshot, not a live connector; it never writes back to Thesis Ledger. Date metadata added later has its own recorded event. The original reports and revision-1 bodies remain unchanged. Previous local files and generated examples were retained under `data/archive/` as a recovery copy, outside the active library.

The timeline orders research milestones by calendar day and recorded events by exact timestamp. Date-only research milestones deliberately have no ordering within a day.

## GitHub Pages

```powershell
# App-only export (default).
npm run build:pages
# Active reports, complete revisions and provenance.
npm run build:pages -- --include-reports
```

`dist/` is generated and ignored. Relative URLs work under `/FA/`. The build packages the app, shared browser modules, template, fonts, runtime configuration, and active report export. Recovery archives, original import files, credentials, and the standalone Ledger snapshot are not copied. Active reports may contain their own Ledger provenance metadata.

`.github/workflows/pages.yml` tests, builds, and deploys on pushes to main. Pages uses **GitHub Actions** as its source. Repository Actions variable `FA_PAGES_INCLUDE_REPORTS=true` enables the owner-approved report export; absent or other values publish an empty library. The source repository and hosted report export are public, as approved by the owner. Saving locally does not update Pages: commit, push, and allow deployment to finish.

The hosted viewer supports reading, timelines, comparisons, body/historical search, differences, export, and copying agent/synthesis handoffs. It rejects writes and does not call server endpoints. Use a local clone for editing and Git synchronization.

## Configuration and checks

```powershell
# Optional: select a different port or data directory before starting.
$env:PORT = '4311'
$env:FA_DATA_DIR = 'H:\my-research\reports'
npm start

# Point the CLI at a custom port.
$env:FA_URL = 'http://127.0.0.1:4311'
node scripts/report.mjs list

npm test
```

Only point `FA_DATA_DIR` at a directory owned by this app, containing its report JSON files. Do not edit those files directly while the server is writing; use the CLI/API so revision checks apply.

This is a single-process local prototype. It has no live data feed, provider integration, markdown link execution, automatic fact verification, or cross-process write locking. Keep one server per data directory. A super report's revisions retain the provenance of the original compilation; a fresh source compilation is needed to pin newer source revisions.

The design follows the Swiss Industrial Print direction in [DESIGN.md](DESIGN.md). Locally hosted Archivo Black is licensed under the SIL Open Font License; see `public/fonts/OFL.txt`. System UI and monospace faces provide the body and data typography.
