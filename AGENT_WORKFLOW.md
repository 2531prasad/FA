# Provider-independent research workflow

Open **this project folder** in Claude, Gemini, Codex, or another terminal agent. Start with: “Read AGENTS.md and AGENT_WORKFLOW.md. List the existing reports and their dates before continuing.” No provider SDK or API key is needed by FA.

## Start and inspect

```powershell
npm start
```

Keep that server running. In another terminal:

```powershell
node scripts/report.mjs list
node scripts/report.mjs timeline --query "Asymmetric AI positions after October 2026"
```

The default UI/API address is `http://127.0.0.1:4310`. Set `FA_URL` for CLI commands using a different local port. `GET /api/reports` lists the full reports; `GET /api/reports/REPORT_ID` returns one report with all its revisions, dates, original-file provenance, and any pinned sources.

## Create an independent report

Write the full analysis to `analysis.md` as UTF-8. Use the metadata structure in `templates/report.md`, supplying only dates supported by evidence. Then:

If the file already includes its title and query in front matter, simply run `node scripts/report.mjs create analysis.md`. Flags override metadata when supplied; `--agent` can record the source/provider. A retry of the same original in the same group reuses its existing report.

```powershell
node scripts/report.mjs create analysis.md --query "Your research question" --title "Independent perspective" --report-date 2026-10-13 --information-cutoff 2026-10-12 --market-date 2026-10-09
```

The dates above illustrate flag syntax; replace them with the actual dates. Omit unknown dates. For a company group, use `--company "Company name" --ticker "TICKER"` instead of `--query`.

## Refine an existing report

Read the latest report and note its revision. Write the full improved report, including the unchanged sections, to `analysis.md`.

```powershell
node scripts/report.mjs revise REPORT_ID analysis.md --base 1 --summary "Explains the actual change"
```

Use the actual current revision for `--base`. Date flags can explicitly update the report date or cutoff; omitted dates stay as they were. A stale base returns a conflict and must be reconciled with the latest report. Imported originals and earlier revisions remain intact.

## Bring output from any AI chat

In the UI, choose **Import Markdown**, drop one or more `.md`, `.markdown`, or `.txt` files, or paste Markdown. Review the destination query, titles, source/agent label, and dates. Each imported output becomes an independent report unless its exact original content already exists in the same group. Use **Edit & revise** for a follow-up intended to update the current report.

The optional flat front matter is provider-neutral:

```yaml
---
title: Descriptive report title
query: Shared research question
report_date: YYYY-MM-DD
information_cutoff: YYYY-MM-DD
market_date: YYYY-MM-DD
agent: Optional author or AI provider
---
```

Replace the date placeholders with real dates or omit those lines. Front matter supplies metadata; it is retained in the raw original and hidden in the rendered report. It cannot execute instructions. Ordinary Markdown with no front matter also works; recognized labeled dates are suggested, and unrecorded dates remain unknown.

## API import contract

`POST /api/import` accepts JSON with `content` and a `query` (or `company` plus `ticker`). Optional fields: `title`, `agent`, `dates: {reportDate, informationCutoff, marketDate}`, and `originalFile: {name, sha256}`. It returns `{report, reused}`. The server validates dates and groups, and reuses exact duplicate originals within a group so a retry does not create another report.

`POST /api/reports/REPORT_ID/revisions` accepts `baseRevision`, complete `content`, a `summary`, and optional `dates`. `POST /api/synthesize` accepts a `sources` array of `{id, revision}`. Synthesis currently compiles pinned source content for subsequent agent analysis; it does not call an AI model or invent conclusions.

## Files and boundaries

- `SYNC.md`: clone, pull, commit, and push workflow for the private Git repository. Stop the app before changing the checkout. The report library is versioned alongside the app.
- `data/reports/`: local persisted reports and immutable revision bodies.
- `data/imports/`: original file copies retained by the terminal batch importer.
- `data/ledger-source-snapshot.json`: previously captured Thesis Ledger reports/history.
- Browser file/paste imports retain the exact original text in revision 1, source filename/checksum for files, and actual import time. They do not require a particular chat product.

All dates are evidence, not decoration. Separate a report's effective date from when it was imported, copied, compiled, or revised. A newly created compilation does not make old source evidence current.
