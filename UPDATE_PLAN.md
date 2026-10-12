# Current implementation scope

The product remains a local, provider-independent financial research library. Preserve every user report, original body, revision, source relationship, and date. GitHub repository: public `2531prasad/FA`.

Implement in this order:

1. Separate shared browser-safe logic and a data client from the Node server. Build a relative-path static GitHub Pages viewer. Hosted exports exclude reports by default; the user explicitly approved including the reports on the hosted site on 13 October 2026. Static hosting cannot run the local write/Git API.
2. Add explicit new-report versus revise-existing intent for dropped/pasted Markdown, an editor with recoverable browser drafts, and a review of content/date changes before saving. Preserve optimistic revision checks and warn on stale recovered drafts.
3. Add a provider-neutral synthesis packet using exact pinned source revisions, a versioned prompt, source date ranges and missing-date flags. Financial agreements/contradictions stay unassessed; no heuristic claims of agreement or contradiction.
4. Expose actual Git status and deliberate remote check, reviewed commit/push of report data, and clean fast-forward pull. Pause API report writes during Git mutations; no silent merge, force push, automatic publication, or unreviewed staging of app code.
5. Add report-body search, explicit historical matches, safe text highlighting, and bounded word differences. Keep the existing industrial print design and independently scrollable hideable sidebars.

Date rules: source dates stay pinned. Mixed market dates stay distinct. A source cutoff range describes coverage, not a single uniform as-of date. Compilation/save timestamps are actual instants; an effective report date must be explicit. Unknown dates remain unknown.

Verification: persistence/API/date tests, static build at a repository subpath, actual Git operations in isolated local repositories, unchanged original report checksums, browser verification through the supported in-app browser if available. Use no production-data test mutations.
