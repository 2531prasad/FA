# Initial FA: discover durable profit capture

Act as an independent fundamental researcher in this FA workspace. Build an evidence-backed investment thesis from structural change, technical understanding and business economics. The objective is supported asymmetric potential, normally at least 2× over a stated horizon, not a predetermined winner or a persuasive bull case. Do not use price action. Let evidence determine the conclusion, including that no attractive opportunity is established.

## Shared research brief

- Subject / structural trend / company: [specify]
- Market, geography and asset universe: [specify or disclose working scope]
- Research brief / ID: [same brief across independent models]
- Model / agent: [actual known identity; otherwise Not recorded]
- Horizon: [specify or disclose a working horizon]
- Information cutoff: [latest available or historical cutoff]
- Price date and currency: [establish when valuing securities]
- Macro premises to investigate: [separate observations, announced plans and future assumptions]
- Particular hypothesis: [optional; test rather than adopt]
- Return hurdle: [default: at least 2× total investment value over the stated horizon; disclose dividends and currency basis]
- Output path: [a separate independent Markdown report]

Infer routine choices and disclose them; ask only where ambiguity materially changes the investigation. A supplied hurdle supersedes the default. A reported historical portfolio XIRR is not a forward earnings-growth assumption. Keep peer scopes, dates and requirements aligned where feasible; disclose deviations.

## Protect independence and establish evidence

Read AGENTS.md. This prompt initiates **Independent FA**: do not read peer analyses, prior rankings or an emerging canonical synthesis. Inspect filenames or declared metadata only to avoid overwriting a report. An explicitly requested continuation instead reads the designated canonical thesis, its open questions and recent changes; it must not be labeled an independent initial perspective.

Use current primary evidence for new research: filings and notes, customer disclosures, procurement and budgets, technical documentation, official statistics and regulatory records. For historical work, use evidence available within the cutoff and separate later discoveries. Distinguish reported facts, management claims, calculations, inferences and unresolved questions. Attribute material claims nearby with direct links, dates, units and definitions. State inaccessible evidence and its effect. Analyst narratives may inform market expectations but must not supply the thesis by default.

## Follow the economics through time

Use this causal chain as a guide, not a mandatory section outline:

**Structural change → customer spending → bottleneck → pricing-power duration → retained cash per share → shareholder return.**

Establish the business, payer and customer need. Then investigate the links that can change the investment decision:

- **Spending over the asset lifecycle.** Separate initial deployment, operation, maintenance, replacement and upgrades. Distinguish announced budgets, committed spending, actual purchases and supplier revenue. Define TAM geography, units, period and method; bound realistically serviceable demand without overlapping totals. A construction-cost share is not a lifetime profit share.
- **Bottleneck ownership and duration.** Explain what is scarce, who controls it, and why customers cannot readily substitute, delay or build it themselves. Test qualification times, switching costs, capacity additions, competition, buyer concentration and regulation. Trace where pricing power could migrate as constraints ease. Technical importance alone does not establish economic capture.
- **Technology and replacement economics.** Translate domain knowledge into a specific, testable economic deduction. Separate product-release cadence, accounting depreciation, useful life and economically justified replacement. Model the installed base by age or generation when material; avoid counting an upgrade as both expansion and replacement. Include utilization, redeployment, resale and retrofit costs where relevant.
- **Efficiency and customer affordability.** Separate work per unit of energy, useful output, hardware units, selling prices and total spending. Test whether efficiency expands demand, displaces equipment or shifts value elsewhere. Compare replacement benefits with purchase cost, downtime and customer payback. Recurring technical need is not recurring funded demand.
- **Profit and cash capture.** Trace volume, price, mix and share into margins, working capital, reinvestment, taxes, financing and diluted per-share cash. Compare competitors on equivalent fiscal periods and accounting bases. Examine whether customers earn enough to keep buying, and who bears obsolescence or default risk.

Use company, industry and macro evidence to establish relevant growth, cash conversion and financial health. Separate observed growth from projections. Cover liquidity, debt, leases, maturities, interest cost and material purchase commitments, guarantees or customer financing; avoid double-counting exposures. Distinguish historical interest cost, contractual terms and estimated refinancing costs. Use sector-appropriate measures and explain material omissions. Follow unexpected mechanisms; do not assume a technology category or familiar company must win.

## Underwrite the payoff and try to break the case

Establish a sourced, dated valuation baseline. Explain what operating outcomes it appears to require and the evidence for a different outcome. Show a credible path to the return hurdle through business economics and per-share value, with an explicit horizon. Separate business growth, distributions, dilution and valuation-multiple changes. Test terminal multiples, economic scale and sensitivity of the result; a large theoretical upside alone is not asymmetry.

Build only scenarios that illuminate decisive uncertainties. Keep their assumptions and calculations reproducible; distinguish conditional arithmetic from forecasts. Examine downside, permanent impairment, financing constraints and correlated exposures. Do not invent probabilities, confidence scores or precise expected returns.

First test the strongest world where the structural trend succeeds but this investment fails. Then separately test whether evidence undermines the macro premise itself. A future direction may be held provisionally for conditional analysis; it must not be relabeled a fact. Identify the weakest causal link, strongest contrary evidence and what would invalidate the thesis. Domain expertise is an edge only if its consequential deduction is supported and plausibly underappreciated.

## Deliver concise, visual Markdown

Write a complete, self-contained report with a short main reading path. Depth follows decision relevance. Avoid generic background, exhaustive checklists, repeated summaries and unsupported precision. Move necessary detail into clearly named supporting sections, keeping decisive qualifications beside the conclusion.

Start with one descriptive title, then prepared date, information cutoff, price date and horizon. Before the first section heading, declare **Report role:** Independent FA, **Research query:**, **Research brief:** and **Model / agent:**. Use Not recorded for unknown provenance; never claim independence you cannot establish.

Include a compact `## Decision brief` using the reader's exact labels:

- **Working judgment:** conclusion, main reason and strongest qualification.
- **Variant view:** the specific, supported difference from market expectations.
- **Price hurdle:** dated valuation, required economics and path to the stated return hurdle.
- **Failure condition:** observable invalidation or permanent-loss mechanism.
- **Next check:** the uncertainty most likely to change the decision.

Use Not established or Not applicable with a reason where appropriate. Author these as labeled paragraphs under the decision heading, not list items. Do not leave placeholders in the report.

Use short paragraphs, descriptive headings and selective `[!THESIS]`, `[!EVIDENCE]`, `[!INFERENCE]`, `[!RISK]` or `[!QUESTION]` callouts as documented in AGENTS.md. Prefer a compact causal chain and a few purposeful three- or four-column tables, such as bottleneck / capture mechanism / erosion risk, or scenario / economic drivers / per-share outcome. Label units, periods and accounting bases; explain each major table's implication and limitation. Use short fenced `text` calculations when clearer than prose. Avoid wide code blocks, raw HTML and unsupported chart syntax.

Finish with specific open questions and a concise verification scope. Preserve dated, testable expectations and their invalidation conditions so later research can compare outcomes with what was actually expected.

## Save and hand off

Save the complete Markdown report separately from peer reports. Reread any existing target and reconcile intervening edits before saving. Preserve actual revision history; never fabricate earlier snapshots. Follow AGENTS.md for substantive continuation changes and `## What changed` entries.

Future multi-report synthesis uses `app/prompts/synthesize-fa.md`; do not perform it during independent research. Keep the terminal response to the file link and four brief points: principal discovery, thesis implication, strongest uncertainty and next decisive check. Complete the research and save the report, rather than returning only a plan.
