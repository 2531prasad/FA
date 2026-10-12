# FA

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

The user selected plain HTML/CSS/JavaScript with a lightweight Node.js server for the local prototype. No dependency installation is required. Reports are stored as local JSON files; a terminal CLI publishes Markdown content through the local API.

## Users

The initial user is the project owner, who uses AI agents in a terminal to analyze stocks and refine the analysis through follow-up questions.

## Product Purpose

Provide a locally run web UI for financial analysis produced through terminal agents. The central artifact is a persistent report that improves through follow-ups until the user is satisfied.

Success means the user can find and read the current, refined analysis without digging through a chat history. Later questions must not bury the original detailed work or reduce the report to the quality of the latest conversational exchange.

## Positioning

The defining workflow combines terminal-based AI analysis with an evolving report presented in a local web UI. It supports multiple analyses of a single company and using those reports together to produce a more comprehensive "super report."

## Operating Context

- The user requests stock or company analysis through an AI agent in a terminal.
- The resulting analysis is presented as a report in a locally run web UI.
- Follow-up questions and refinements modify the report until it is perfected.
- A company can have more than two separate analysis reports.
- Multiple reports can be used together for inference or merged into a super report.
- A shared research query can span multiple companies. The user supplied two independent reports for "Asymmetric AI positions after October 2026" as the initial reports for one query, not as revisions of each other.
- Dates and logical chronology take priority over decorative content. Distinguish the report date, information cutoff, market-price date, local import/save timestamps, and pre-existing Thesis Ledger history. Preserve the date context of historical revisions.
- The library and report-context sidebars stay persistent, scroll independently, and can each be hidden.
- The workspace is AI-provider independent. Claude, Gemini, Codex, and other agents use shared project instructions, Markdown, and the same local CLI/API.
- Import independent reports by dropping Markdown files or pasting AI Markdown, with a review of titles, research destination, and dates before saving.

## Capabilities and Constraints

These are confirmed product requirements, not implemented capabilities:

- Run locally with a web-only interface.
- Present terminal-generated financial analysis as persistent, editable reports.
- Incorporate follow-up work into the report instead of leaving improvements scattered across chat messages.
- Support multiple distinct reports for the same company, including more than two reports.
- Use multiple reports as inputs to further analysis or combine them into a super report.

Open decisions:

- Production architecture beyond the lightweight local prototype.
- Direct AI provider integration beyond CLI/API publishing.
- How report synthesis handles conflicting conclusions and identifies its source reports.
- Financial data sources, analysis methodology, and report structure.

## Evidence on Hand

The owner's workflow description is the product brief. Generated company examples and interface slogans have been removed from the active workspace. New data directories start empty.

The user supplied `asymmetric-ai-positions-post-october-2026.md` and `Asymmetric_AI_Positions_Post_October_2026.md` as two independent initial reports for the same research query. Both are imported at revision 1 with their original content and filename/checksum provenance. Original file copies are retained under `data/imports/`. Their financial claims are user-supplied report content, not facts verified by this app.

The existing Thesis Ledger plugin holds matching original bodies and immutable import records for both reports (`ai-source-a` and `ai-source-b`). Their ledger report dates are 12 October 2026; original document cutoff and price-snapshot dates are 11 and 9 October respectively. Read-only local snapshots retain this earlier history separately from later local import records. No live synchronization or ledger writes are implemented.

## Product Principles

- Keep the current analysis easy to locate and read throughout the research process.
- Make temporal context explicit; unknown dates remain unknown, and imports never masquerade as original publication dates.
- Make follow-up work improve the durable report.
- Preserve the ability to work with distinct analyses of the same company.
- Enable synthesis across reports into a more comprehensive analysis.
- Support the terminal as the analysis workflow and the local web UI as its presentation surface.

## Hosted library and update workflow

The owner approved publishing the active financial reports on GitHub Pages on 13 October 2026, and subsequently confirmed leaving the source repository public. Hosted reading, search, comparison, timelines, revision differences and handoff copying must work without the local Node API. Editing and explicit Git synchronization remain local. A saved report reaches the hosted viewer after commit, push and successful deployment.

Prioritize Markdown file/paste revisions with recoverable browser drafts and an explicit content/date review. Synthesis remains provider-independent: hand off exact pinned sources and their date limits to any agent. Do not heuristically declare financial agreements or contradictions. Unknown dates remain unknown; mixed source dates remain distinct.
