# Keep the same research library across devices

Public GitHub repository: [2531prasad/FA](https://github.com/2531prasad/FA).

The repository includes the app and the entire `data/` library: current reports, all saved revisions, pinned source relationships, original Markdown files, the Thesis Ledger snapshot, and recovery archives. Archives are retained for recovery and do not appear in the active library. Installed agent skills, machine-specific hooks, credentials, temporary files, and browser preferences are excluded.

The app requires Git and Node.js 20+ on each device. It has no package dependencies to install. The owner confirmed leaving the source repository public on 13 October 2026. The owner-approved GitHub Pages export includes the active reports publicly; the complete recovery library remains in Git. Signing into your own GitHub account gives each device access; no FA account or AI-provider integration is required.

## First use on another device

Clone the public repository below. Sign into your GitHub account before pushing changes.

```powershell
git clone https://github.com/2531prasad/FA.git FA
cd FA
npm start
```

Open `http://127.0.0.1:4310`. The same report IDs, content, dates, revision history, and source relationships load directly from the cloned files. Sidebar preferences are specific to each browser.

Use the default `data/reports/` directory to share this library. A custom `FA_DATA_DIR` outside the checkout is not included in Git synchronization.

## Start work on a device

In the running local app, click the **Git status** control in the top bar. **Check remote** fetches remote state without merging. **Pull from GitHub** requires a clean checkout and performs a fast-forward pull. The server pauses report operations during these Git operations. If app files change, restart `npm start` and reload before editing. A status read alone uses cached tracking refs; **Remote unknown** means there has not been a successful remote check in this server session.

For terminal Git operations, use the stopped-server workflow below.

Stop the local server with Ctrl+C before pulling or switching branches. Commit any previous work first, then:

```powershell
git status
git pull --ff-only
npm start
```

Pulling while the server is running can replace report files underneath an active edit. Work on one device at a time when refining the same report.

## Save and send changes to the other device

The UI's **Review commit & push** lists changed `data/` files and already committed, unpushed commits. After review, **Commit reviewed reports & push** commits report data and pushes the branch. It rejects a stale review, refuses staged app files, checks for remote changes again, and retains the local commit if pushing fails. Existing unpushed commits can include app changes; they are listed explicitly. Last check/push/pull times are actual device operation times in IST, not inferred from report dates or commit dates.

A custom `FA_DATA_DIR` disables Git writes in the UI because that directory may not belong to this checkout. Browser drafts are not included in Git: save them as revisions first. Work on one device at a time when refining the same report. Resolve conflicts deliberately in a terminal; the UI never automatically merges histories.

For terminal publication:

Finish the report revision and stop the server with Ctrl+C. Then:

```powershell
git status
git add data/
git commit -m "Update research reports"
git push
```

Use `git add` with specific code/documentation paths too if you changed the app. If Git reports nothing to commit, skip the commit. On the other device, stop its app and run `git pull --ff-only` before reopening it. A report saved in the UI is saved locally immediately; it reaches another device only after commit, push, and pull.

## If both devices changed the same report

A rejected push or failed fast-forward pull means you need to reconcile the two branches. Do not force-push, discard one device's work, or edit revision numbers to conceal a conflict. Report JSON uses Git's binary merge strategy to prevent automatic line merging from corrupting the revision history; the files remain readable JSON.

Keep both branch versions. With the app stopped, inspect the report on each branch using `git show BRANCH:data/reports/REPORT_ID.json`. Choose one history as the continuing report, preserve the other perspective as a separate report through the import workflow, and publish a deliberate reconciled revision if appropriate. An agent should explain which revisions it retained before completing a manual merge. Resolve code and research independently, then run `npm test` and verify the report timeline before pushing.

## Offline transfer

You can copy a Git bundle between devices without GitHub:

```powershell
git bundle create FA.bundle --all
```

On a new device:

```powershell
git clone FA.bundle FA
cd FA
npm start
```

A bundle contains committed files only. A clone from a bundle initially points its origin at that bundle; use `git remote set-url origin https://github.com/2531prasad/FA.git` before using GitHub for later sync. Bundles are ignored so they are not committed recursively.
