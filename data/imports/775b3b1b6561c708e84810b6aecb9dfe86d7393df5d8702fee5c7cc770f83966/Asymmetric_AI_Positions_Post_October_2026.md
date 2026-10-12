# Asymmetric AI positions after October 2026

**Prepared:** 12 October 2026, India time.  
**Information cutoff:** 11 October 2026. **Prices:** 9 October US regular-session closes.  
**Mandate:** concentrated compounding; select exceptional payoffs, not a diversified AI basket.  
**Benchmark supplied by investor:** approximately 55% historical account XIRR. Accepted as reported; not recalculated here.

## 1. Investment conclusion

**NVDA remains my first candidate for incremental capital. AVGO is the next major thesis, conditional on customer financing risk. MU deserves substantially more investigation than a simple “memory becomes efficient” argument allows.**

**ANET is a strong business with a difficult entry valuation.** It can outperform operationally while missing your return objective. TSM is the cleanest manufacturing exposure across competing accelerators, but carries a different return ceiling and Taiwan failure mode. VRT is the preferred power/cooling architecture bet; current price already demands substantial growth.

Confidence: **moderate** in this research ordering; **low** in precise future returns. Current operating results are stronger evidence than any three-year model.

| Research priority | Candidate | Specific asymmetric thesis | What stops this becoming an immediate large-position recommendation |
|---|---|---|---|
| 1 | **NVDA** | Continues capturing integrated compute, networking and software economics as inference and replacement demand expand | Existing earnings must remain durable; customer financing and custom silicon can undermine the apparent valuation |
| 2 | **AVGO** | Captures custom-accelerator proliferation plus Ethernet silicon; can earn from customers seeking alternatives to Nvidia | Concentrated programmes, stock compensation and material equipment-financing backstop |
| 3 | **MU** | HBM, server DRAM and inference storage demand outlast supply additions; scarcity earnings prove more durable than expected | Extraordinary current margins could be cyclical; cheap-looking earnings can collapse |
| 4 | **TSM** | Leading-node and packaging manufacturing content persists whichever accelerator designer wins | Heavy reinvestment, geography and already-large earnings base |
| 5 | **VRT** | More power/cooling content per rack; retrofit demand and new electrical architecture expand addressable work | High earnings hurdle, execution, competition and campus delays |
| 6 | **ANET** | Open Ethernet extends from scale-out into scale-up; operational software preserves systems-level value | Expensive current earnings; openness can also commoditize hardware and weaken software capture |
| 7 | **CRDO** | Connectivity content grows faster than accelerator counts; successful adaptation across copper and optics | High starting multiple, customer concentration and changing interconnect architecture |
| 8 | **SNDK** | Agent memory and inference workloads drive enterprise NAND demand; contracting changes sustain pricing | Much of recent growth is pricing; the potential downside is much larger than a secular-storage narrative implies |

**ALAB, WDC, STX and FIX:** research or entry-price watchlist, not compulsory additions.  
**AMD:** retain its distinct challenger thesis only if execution and per-share economics justify it; owning NVDA does not make every GPU challenger cheap.

This ordering combines business economics, present valuation burden and evidence quality. It is not a prediction that these stocks will appreciate in this exact order. No basket allocation is implied.

The largest correction to the earlier supply-chain ranking: **receiving capex, retaining profit and offering a good stock entry are three different tests.**

## 2. Evidence rules

- **Reported financials:** company releases and filings. High confidence that these are the disclosed figures; unaudited quarterly reports can change.
- **Partnerships:** high confidence an agreement was announced. Delivery volume, economics and ultimate customer profitability remain separate questions.
- **Product performance and roadmaps:** attributed to the company. A vendor benchmark is not universal real-world performance.
- **Technical mechanisms:** original research and manufacturer documentation.
- **Investment conclusions:** my deductions, not analyst consensus.
- **Price data:** market histories only. No brokerage ratings or analyst price targets used.

A CEO saying a product has strong economics establishes management's claim. It does not establish every customer's realized return on investment. Likewise, GW commitments, financing announcements and IPO proceeds are not interchangeable with shipped equipment, recognized revenue or collected cash.

## 3. Fix the technology premises before choosing stocks

| Premise | Assessment | Consequence for investment selection |
|---|---|---|
| Smaller process nodes improve efficiency | **Directionally correct; high confidence.** Gains are finite and workload-dependent; the node label is not a proportional cost-saving formula | Favor suppliers preserving value per useful workload, not simply selling more nominal compute |
| Old chips depreciate and newer chips replace them | **Correct economically; replacement timing uncertain.** Accounting depreciation, used-market prices and useful life differ | Platform suppliers can benefit; leveraged owners of obsolete equipment can suffer |
| New, efficient chips create new capex | **Conditional.** Customers replace when incremental economics beat continuing to use installed capacity | Verify utilization, workload economics and funding, not just annual product launches |
| Power demand does not scale like chip performance | **Correct per operation; incomplete in aggregate** | More compute per watt can increase the economic value of scarce site power; rack density can rise |
| Memory becomes more efficient | **Correct per workload; not a forecast of total memory purchases** | Evaluate concurrent sessions, context length, bandwidth and memory tiers alongside compression |
| Storage requirements keep rising | **Plausible direction, moderate confidence; not an unlimited guarantee** | Persistent bytes, retention policies, bytes per drive and price per byte determine supplier revenue |
| Whatever AI lab wins, infrastructure suppliers win | **Often true technologically; false financially if customer spending fails** | Architecture neutrality does not remove common exposure to AI funding and utilization |

### 3.1 Efficiency can increase demand, but this must be demonstrated

A useful accounting identity:

**Compute required = completed tasks × tokens per task × operations per token.**

**Installed capacity required = compute required ÷ useful throughput per device ÷ achievable utilization**, with time units held consistent.

If useful throughput rises 4× and workload rises 10×, required device-equivalent capacity rises 2.5×. If workload rises only 2×, it falls to 0.5×. Those are different investment worlds.

Token volume alone can mislead. Longer reasoning traces may increase tokens without proportional customer willingness to pay. The right measure is **profitable, useful work at an acceptable service level**.

Nvidia markets Rubin as delivering up to a 10× reduction in inference token cost under its stated comparison. That supports the existence of major efficiency improvements; it does not establish a 10× improvement across every deployed workload. [2]

**My inference:** the winning supplier either captures expanding demand, preserves a share of customer savings, or enables a scarce resource to do more profitable work. Efficiency alone guarantees none of those.

### 3.2 A node shrink is not a free lunch

TSMC's A16 documentation targets approximately 15–20% lower power at the same speed versus N2P, or 8–10% higher speed at the same voltage, with up to 1.10× density. These are alternative comparison conditions, not gains to multiply indiscriminately. [3]

Costs also include wafer pricing, yields, packaging, memory, networking and cooling. A designer can spend efficiency gains on a larger chip, higher clocks or more functionality. A more efficient operation need not mean a lower-power rack.

**Deduction:** TSM can capture increasingly sophisticated silicon manufacturing, but wafer demand does not mechanically equal FLOP growth. NVDA/AVGO must demonstrate system economics that justify their price.

### 3.3 Replacement is attractive for suppliers and dangerous for financiers

A rational owner replaces hardware when:

**Incremental revenue + operating savings + sale value of retired equipment > new equipment cost + migration cost + disruption cost.**

Already-purchased equipment is a sunk cost. Old GPUs can remain productive on less demanding work, especially where power is affordable and latency requirements are relaxed.

Under a fixed MW allocation, however, better useful throughput per watt can make replacement attractive even if old hardware still works. The opportunity cost of occupying scarce electrical capacity rises.

**Investment split:** the designer may earn on successive generations while the equipment owner suffers shrinking rental rates and residual values. A supplier guaranteeing equipment leases partly inherits the owner's risk. That last point is especially relevant to AVGO.

### 3.4 Memory efficiency and memory demand can rise together

PagedAttention improves allocation and sharing of KV-cache memory. DeepSeek-V3 uses Multi-head Latent Attention and a mixture-of-experts architecture to improve inference/training economics. These establish real efficiency mechanisms. [4][5]

They do not establish falling aggregate memory demand.

A simplified conventional KV-cache footprint is proportional to:

**Concurrent sequences × context length × layers × KV heads × head dimension × bytes per element × 2.**

Architecture changes, compression, shared prefixes and cache eviction alter this formula. Nevertheless, concurrency and context can expand faster than memory intensity falls.

Also:

- Low active parameter counts in an MoE model do not imply that only those active parameters need to be stored across the serving system.
- Memory **capacity**, **bandwidth** and **latency** are separate bottlenecks.
- Better memory utilization may permit more users on existing hardware before new purchases are needed.
- Conversely, more sessions, larger contexts and more reasoning can increase aggregate purchases.

**Deduction:** do not dismiss HBM or DRAM using software efficiency alone. Do not assume perpetual shortages either.

### 3.5 Storage has several economically different tiers

| Tier | Purpose | Relevant exposure | Main pitfall |
|---|---|---|---|
| HBM | Fast accelerator-local model/state access | MU and qualified HBM suppliers | Not a substitute for every storage tier |
| Server DRAM / attached memory | CPU work, buffering and selected state/cache workloads | MU; selected memory-connectivity suppliers | Software may reduce allocation waste |
| Enterprise NAND / SSD | Fast persistent data and selected cache/offload workloads | SNDK, MU | Offloading trades capacity cost against latency and bandwidth |
| HDD / object storage | Bulk datasets, checkpoints, media and archives | WDC, STX | More bytes can coincide with fewer drives or falling dollars per byte |

Not every reasoning token or ephemeral cache entry is retained. Checkpoint frequency, deduplication, compression and deletion policy matter.

**Storage revenue ≈ purchased bytes × price per byte.**

Illustration: purchased capacity grows 50%, price per byte falls 30%; revenue rises only **5%**. More data is not automatically more supplier profit.

## 4. Where capex becomes shareholder cash

**Supplier economic capture ≈ deployment volume × content per deployment × market share × retained margin.**

Then subtract the cost of sustaining the business: internal capex, working capital, taxes, financing losses and shareholder dilution.

Three further distinctions:

1. **Content vs quantity:** revenue per rack can rise while the number of racks falls.
2. **Accounting vs cash:** reported earnings can include investment gains; cash flow can benefit temporarily from advances and working-capital movements.
3. **Growth vs per-share growth:** a larger business can disappoint shareholders if issuance and acquisition costs absorb the gain.

A server assembler's invoice includes purchased components. Foundry and memory payments are nested upstream in that invoice. Do not add every supply-chain revenue figure as if it were a separate slice of hyperscaler spending.

### Selected latest reported evidence

| Company / period | Disclosed result | Evidence interpretation |
|---|---|---|
| NVDA, Q2 FY2027 | Revenue **$96.22B**, +106%; gross margin **75.0%**; GAAP EPS **$2.46**, adjusted EPS **$2.22** | Exceptional current capture; assess sustainable operating earnings [1] |
| AVGO, Q3 FY2026 | Revenue **$29.59B**; AI semiconductor revenue **$16.7B**, +221%; FCF **$13.67B**; GAAP/adjusted EPS **$2.68/$3.32** | Large, demonstrated custom-chip/network economics; consolidated results include software [8] |
| ANET, Q2 2026 | Revenue **$3.04B**, +37.7%; GAAP operating margin **45.4%**; GAAP EPS **$0.95** | High systems/software capture, not a commodity-switch margin [6] |
| TSM, Q2 2026 | USD revenue **$40.20B**, +33.7%; operating margin **60.3%**; EPS **$4.31 per ADR** | Manufacturing moat earns substantial profit; factory investment still matters [10] |
| VRT, Q2 2026 | Revenue **$3.27B**, +24%; adjusted operating margin **22.6%**; FY2026 GAAP EPS guidance **$5.82–$5.92** | Real operating leverage; guidance remains prospective [13] |
| CRDO, Q1 FY2027 | Revenue **$479M**, +114.7%; GAAP/adjusted EPS **$0.67/$1.20** | Strong growth; adjustment gap matters [11] |
| ALAB, Q2 2026 | Revenue **$392.4M**, +104%; GAAP operating margin **22.7%**, adjusted **39.1%**; adjusted EPS **$0.80** | Expanding fabric opportunity; substantial expense adjustments [12] |
| MU, FY2026 / Q4 | FY GAAP EPS **$74.33**; Q4 revenue **$54.23B**, GAAP operating margin **80.7%** | Exceptional disclosed scarcity economics, not a margin to assume forever [15] |
| SNDK, FY2026 / Q4 | FY adjusted EPS **$70.88**; Q4 revenue **$8.97B**, gross margin **84.6%**; approximately two-thirds of sequential revenue growth from pricing | Pricing durability is central to the thesis [17] |
| WDC, Q4 FY2026 | GAAP EPS **$8.21**, adjusted **$3.56**; revenue **$3.75B**, +44% | Large earnings-quality difference; headline P/E can mislead [18] |
| STX, Q4 FY2026 | GAAP EPS **$5.58**, revenue **$3.63B**, gross margin **52.3%** | Strong bulk-storage economics; density and cycle still matter [19] |
| FIX, Q2 2026 | Revenue **$3.27B**; EPS **$12.53**; backlog **$14.06B**; H1 EPS **$23.03** | Specialist execution can earn substantial value; backlog is not completed profit [20] |
| AMD, Q2 2026 | Revenue **$11.54B**; GAAP/adjusted EPS **$1.38/$1.66**; GAAP operating margin **17%** | Challenger traction is real; margin gap versus NVDA remains material [21] |

### Rebuilt valuation screen

Automated market-data P/E fields can lag new disclosures or reflect accounting gains. Therefore the screen below explicitly shows the earnings denominator.

**Quarter × 4 is a run rate, not a forecast, trailing P/E or normalized cycle estimate.** Different accounting bases are labeled and must not be compared blindly.

| Stock | Close, USD | Explicit annual earnings denominator | Price / denominator |
|---|---:|---|---:|
| NVDA | 229.28 | Q2 adjusted EPS × 4 = **8.88** | **25.8×** |
| AVGO | 361.54 | Q3 GAAP × 4 = **10.72**; adjusted × 4 = **13.28** | **33.7× / 27.2×** |
| ANET | 216.74 | Q2 GAAP EPS × 4 = **3.80** | **57.0×** |
| TSM | 453.31 | Q2 IFRS EPS per ADR × 4 = **17.24** | **26.3×** |
| VRT | 242.78 | FY2026 guided GAAP midpoint **5.87**; adjusted midpoint **6.70** | **41.4× / 36.2×** |
| MU | 1,029.00 | Actual FY2026 GAAP EPS **74.33** | **13.8×** |
| SNDK | 1,581.82 | Actual FY2026 adjusted EPS **70.88** | **22.3×** |
| CRDO | 216.55 | Q1 GAAP EPS × 4 = **2.68** | **80.8×** |
| ALAB | 342.21 | Q2 adjusted EPS × 4 = **3.20** | **106.9×** |
| WDC | 397.28 | Q4 adjusted EPS × 4 = **14.24** | **27.9×** |
| STX | 783.00 | Q4 GAAP EPS × 4 = **22.32** | **35.1×** |
| AMD | 608.10 | Q2 adjusted EPS × 4 = **6.64** | **91.6×** |
| FIX | 1,715.69 | H1 actual EPS × 2 = **46.06** | **37.2×** |

Prices: [25]. Earnings: sources in preceding table.

**NVDA earnings-quality nuance:** Q2 includes approximately $7.77B of gains from equity securities. Its adjusted results remove specified investment-related effects; starting FY2027 they retain stock compensation. [1] That makes this adjusted denominator more useful than an unexamined headline GAAP P/E.

**AVGO/CRDO/ALAB/AMD adjusted earnings are different animals.** Expense exclusions can remove real shareholder costs. Examine stock compensation, actual share-count growth and acquisition costs before using those figures as owner earnings.

**MU and SNDK:** reported margins are sufficiently exceptional that normalized pricing deserves more weight than the displayed low multiple.  
**WDC:** GAAP net income is boosted by items outside recurring product economics; use reconciliations rather than treating $8.21 as a repeatable quarterly EPS. [18]

## 5. Competing worlds: identify the right winner

These scenarios are **not mutually exclusive** and are not an exhaustive list of every possible future. They cover the main mechanisms needed to challenge the thesis.

| Plausible world | What makes it happen | Best-positioned research candidates | Exposure that may disappoint | Observation that discriminates |
|---|---|---|---|---|
| Profitable inference expands faster than efficiency | More paying workloads and agent tasks outweigh cheaper execution | NVDA; AVGO; selected connectivity suppliers | High capex does not rescue suppliers losing share | Paid usage, utilization and repeat deployments grow together |
| Custom accelerators gain share | Stable, high-volume workloads justify specialized systems | AVGO; TSM; ANET where open Ethernet is adopted | NVDA's percentage share can fall even as its revenue grows | Commissioned custom-chip capacity and cash earnings |
| Nvidia retains integrated platform leadership | Flexibility, developer ecosystem and system economics outweigh component alternatives | NVDA; qualified upstream suppliers | ANET where Nvidia wins the network bundle | System wins, margins and customer renewals |
| Open fabrics replace proprietary islands | Hyperscalers want heterogeneous compute and interoperable networks | ANET; AVGO; architecture-qualified CRDO/ALAB products | Generic switch hardware if openness removes pricing power | Paid system/software capture, not merely standards membership |
| MW supply constrains expansion | Permitting/grid access is slower than compute demand | Efficient compute; VRT retrofits; qualified electrical suppliers | New-campus contractors where projects stall | Refresh orders rise inside fixed power envelopes |
| Memory remains the binding bottleneck | Capacity/bandwidth demand exceeds yield and supply growth | MU and qualified HBM suppliers | Commodity memory producers failing qualifications | Volume, mix, contracted demand and normalized margins |
| Cache/state shifts into cheaper tiers | Economics tolerate offloading with adequate latency | MU; SNDK; selected memory-connectivity suppliers | HBM intensity per task can fall | Actual deployed tiering and storage revenue |
| Persistent multimodal/enterprise data expands | More useful datasets, media, checkpoints and retention | WDC/STX for bulk; SNDK/MU for hot data | High-priced storage names where $/byte falls faster | Exabytes and retained profit rise together |
| Optics displaces copper/DSP-intensive designs | Reach, bandwidth density and power justify new interconnects | Qualified laser/photonics suppliers; adaptable AVGO/CRDO/ALAB | Products bypassed by CPO or linear-drive architectures | Shipped designs and changing component bill of materials |
| Edge/local inference absorbs some workload | Distillation, privacy and device economics favor local execution | Selected CPU/accelerator/IP vendors; NVDA only where its platform wins | Cloud suppliers if local execution substitutes for paid cloud work | Device content and deployment economics; not product announcements |
| Funding and capex stall | Model monetization or financing falls short | No universal AI hardware winner; cash-rich survivors may gain share later | Financed custom racks, speculative landlords, cyclical suppliers | Cancellations, receivable aging, rental prices and utilization |

**Important:** bottlenecks move. A memory bottleneck solved by tiering can become a network/storage bottleneck. A network bottleneck solved by optical integration can remove a supplier's existing product. Owning “connectivity” is not enough; identify the product retained in the next design.

## 6. Core company theses and failure conditions

### NVDA — first candidate for incremental capital

**Thesis:** a programmable, integrated infrastructure platform can preserve pricing even as raw compute becomes cheaper. Hardware generations create an opportunity to renew economically valuable capacity, especially under power constraints.

**Potential expectation gap:** treating current profits as a brief procurement spike may undervalue recurring replacement and broad profitable inference. This is a hypothesis about market expectations, not something today's P/E proves.

**Successful path:** useful demand compounds; systems deliver competitive cost per task; software migration remains costly; networking and orchestration preserve platform value.

**Failure:** customers can deliver similar useful work materially cheaper on competing stacks, utilization disappoints, or a meaningful part of demand depends on financing that does not repay.

**Monitor:** recurring customer spending, receivables versus collected cash, inventory versus actual deployment, gross margin through product transitions, and per-share operating earnings.

**Judgment:** strongest current research priority. Business durability **moderate-high confidence**; valuation advantage over ANET/ALAB **high confidence on this explicit screen**; 55% future return **low confidence**.

Keeping an existing position and adding new money are separate decisions. Original purchase price has no bearing on the forward payoff of the next dollar.

### AVGO — strongest custom-silicon alternative, with credit exposure

**Thesis:** heterogeneous accelerators create demand for custom design, network silicon and system integration. Broadcom can participate when customers reduce reliance on Nvidia.

**Potential expectation gap:** investors may undercount the network and implementation value accompanying custom silicon. Conversely, they may overcount gross rack invoices as high-margin semiconductor content.

**Critical filing fact:** the Q3 10-Q describes a five-year lease backstop with maximum potential undiscounted liability of approximately **$29B** after full deployment. Default exposure incorporates an 85% obligation measure and equipment recovery values. No backstop payments were made as of the filing. [9]

**Deduction:** chip obsolescence and customer default are correlated risks, not independent ones. A default occurring during a glut can coincide with weak equipment resale values.

**Successful path:** programmes ship, customers pay, design wins repeat across generations, and per-share cash generation persists after compensation costs.

**Failure:** a concentrated programme disappoints, customer financing forces capital support, or semiconductor/software cash generation masks deteriorating AI economics.

**Monitor:** financed versus ordinary sales; additional guarantees; customer concentration; receivables; stock issuance; software cash flow separately from AI economics.

**Judgment:** second research priority; technology route **moderate-high confidence**, clean shareholder cash capture **moderate confidence**, terminal valuation **low confidence**.

### ANET — strong open-fabric thesis; price is the obstacle

**Primary development:** on 7 October Arista announced open Ethernet rack-scale architectures for scale-up and scale-out, with partners including AMD, Broadcom, Meta and Microsoft. Designs include up to 144 accelerators per rack, cross-rack expansion and support for alternative network operating systems. [7]

**Thesis:** standardized fabrics can expand Arista's role beyond conventional scale-out networking. Operational reliability and a common software environment can remain valuable in heterogeneous clusters.

**Counterargument:** the same openness enabling adoption permits alternative operating systems and disaggregated hardware. Arista must retain differentiated value, not merely help grow an open standard.

**Successful path:** the addressable networking role expands; customer adoption turns into revenue; pricing and software value persist.

**Failure:** Nvidia's networking bundle wins, customers bypass premium systems, or earnings grow strongly but the starting multiple contracts.

**Judgment:** business thesis **moderate-high confidence**; attractive fresh asymmetry at current price **low-moderate confidence**. Better entry or materially stronger earnings evidence can move it above VRT/TSM.

### TSM — manufacturing content across rival architectures

**Thesis:** customized chip diversity can strengthen the manufacturer supplying advanced process and packaging rather than requiring one accelerator designer to dominate.

**Expectation gap to investigate:** how much manufacturing/packaging content per useful system rises, net of density, yield improvements and the cost of expanded capacity.

**Successful path:** leading technology remains differentiated; capacity stays utilized; richer mix offsets factory investment and overseas cost pressure.

**Failure:** geography disrupts production, customers slow spending together, competitors close the technology gap, or factory costs absorb gains.

**Monitor:** wafer and packaging utilization, yield, net capital spending, return on invested capital and geography-specific margin pressure.

**Judgment:** strongest architecture-neutral manufacturing candidate. Technology thesis **high confidence**; 55% shareholder compounding **low confidence**.

### VRT — density and retrofit thesis, not just rising electricity use

**Primary development:** Vertiv's announced 800 VDC collaboration targets new power designs for dense AI systems; the disclosed portfolio timing aligned with later Nvidia platforms. Timing is a plan, not a verified installation count. [14]

**Thesis:** equipment per rack/MW and integration complexity can increase even when electricity per task decreases. Existing sites may need electrical/thermal retrofits to use newer systems.

**Successful path:** content rises; services and integration create repeat revenue; factory capacity and execution preserve margins.

**Failure:** orders were pulled forward, installations slip, competitors standardize cheaper solutions, or campus constraints reduce realized revenue.

**Monitor:** organic growth versus acquisitions; order conversion; working capital; service attachment; realized margins on new architectures.

**Judgment:** preferred power/cooling research name. Structural relevance **high confidence**; current stock asymmetry **moderate-low confidence**.

### MU — memory scarcity must be distinguished from secular growth

**Primary product evidence:** Micron describes HBM4 production with higher bandwidth and improved power efficiency versus HBM3E. Its latest results also identify SSD shipments for KV-cache applications. [15][16]

**Thesis:** different tiers can all grow if concurrent workloads and context/state expand fast enough. HBM can occupy capacity that would otherwise make conventional memory, while qualification and yields slow supply response.

**Potential expectation gap:** scarcity may persist longer than a standard memory-cycle framework expects. That needs proof through supply plans, qualifications and enforceable customer economics.

**Failure:** software reduces intensity faster than demand expands; supply/yields catch up; pricing reverses; current margins normalize sharply.

**Monitor:** bit shipments separately from price; qualified share; capacity additions; contract protections; product mix; free cash flow after factory investment.

**Judgment:** serious concentrated-bet candidate, not a defensive holding. Demand thesis **moderate-high confidence**; persistence of present margins **low confidence**.

### CRDO / ALAB — highest growth sensitivity, high entry burden

**Thesis:** chips become useful only when connected to memory, devices and other accelerators. Connectivity content can grow faster than device counts.

Credo reports a portfolio spanning copper and optical connectivity. Astera's latest release identifies the Scorpio fabric-switch ramp as a major next growth driver. These are disclosed business directions, not guarantees of durable design wins. [11][12]

**Successful path:** more content per system, broader customers and successful adoption into the next architecture; growth outruns compensation and valuation compression.

**Failure:** integrated switches, optical redesigns or shorter electrical paths remove components; one customer changes its design; stock issuance consumes growth.

**Judgment:** conditional satellite candidates, with **moderate** technology confidence and **low** confidence in attractive entry asymmetry. Smaller business size does not cancel the starting valuation.

## 7. Storage, optics and construction: selective extensions

### SNDK versus WDC versus STX

**SNDK:** stronger direct NAND/hot-storage route, with a powerful pricing-cycle component. New contracting arrangements deserve scrutiny: duration, minimum volume, price protection and cancellation terms matter more than an agreement count.

**WDC:** bulk-storage candidate with a lower price burden than STX on the rebuilt recent-quarter screen. This does not prove superior technology or a better normalized valuation.

**STX:** distinct HAMR/density thesis. Density can reduce cost per TB and improve supplier economics if pricing/share preserve the benefit; it can also reduce units needed for a given byte-growth rate.

**My ordering for further storage work:** SNDK for hot-tier demand/pricing; WDC first for bulk-storage valuation comparison; STX when evidence justifies its relative premium. These are different bets, not three mandatory positions.

### Optical components: LITE / COHR

Nvidia announced separate multiyear optics partnerships and **$2B investments each** in Lumentum and Coherent in March 2026. [23][24]

**Deduction:** optical capacity is strategic enough to secure with capital. That does not establish attractive stock entry or ownership of the eventual profit pool.

The important distinction is **scarce lasers/materials/manufacturing** versus a component whose function gets integrated away. Co-packaged optics can grow while disrupting existing pluggable-transceiver or DSP economics.

**Status:** significant research candidates; no fresh buy recommendation without a reconciled valuation and product-specific capture model. Do not infer customer demand from Nvidia's equity investment alone.

### Specialist construction: FIX

**Thesis:** prefabrication, skilled labor and coordinated mechanical/electrical delivery can be scarce. Early project work and integrated execution may earn more than generic construction.

**Failure:** peak margins normalize, labor/cost overruns emerge, or project advances temporarily flatter cash conversion.

**Status:** useful non-chip thesis, but current price requires unusually strong earnings continuation. Construction exposure should earn its slot through pricing and execution scarcity, not “AI needs buildings.”

### ASML and other upstream tools

ASML's Q2 release reports **€9.3B sales** and **€2.9B net income**, with management linking its outlook to customer capacity and technology investment. [22]

**Thesis:** leading-node manufacturing expansion and greater process complexity can support equipment demand.

**Limitation:** tool spending is the foundry/memory manufacturer's capex, not an additional direct slice of a hyperscaler's equipment invoice. Capacity timing, customer concentration and restrictions matter.

**Status:** formidable technology exposure, but not automatically the fastest per-share compounding route from present valuation. AMAT, LRCX and KLAC require separate process-intensity and valuation work before inclusion.

### Other power/materials names

ETN, Schneider, APH, MPWR, GE Vernova and specialist installers remain relevant categories for additional underwriting. Generic copper, steel, cement and server assembly are lower priority for this mandate unless a specific scarcity or valuation gap is demonstrated.

This report does not establish their current contract exposure or purchase prices. Listing categories is not a claim that their stocks offer current asymmetry.

## 8. What 55% requires

At 55% annual compounding:

| Horizon | Required capital multiple |
|---|---:|
| 3 years | **3.72×** |
| 5 years | **8.95×** |
| 7 years | **21.49×** |

This is a selection hurdle, not a reason to invent optimistic forecasts. Future price CAGR differs from your historical account XIRR when cash flows, dividends, currency or taxes differ. Models below use USD price returns.

For a simple EPS model:

**Future price / current price = EPS growth factor × exit P/E / starting P/E.**

At an unchanged multiple, 55% stock CAGR requires approximately 55% EPS CAGR. At a lower exit multiple, earnings must grow faster. At a higher exit multiple, the result increasingly depends on rerating.

### Three-year reverse underwriting

**Assumed exit multiples below are judgment inputs, not forecasts or comparable-quality claims.** Some remain demanding. Baselines use the explicitly labeled denominators in Section 4.

| Stock | Assumed exit P/E | Annual EPS needed for 55% price CAGR over 3 years | Implied EPS CAGR from screen baseline |
|---|---:|---:|---:|
| NVDA | 35× | **24.39** | **40%** |
| AVGO | 35× adjusted | **38.47** | **43%** |
| ANET | 45× GAAP | **17.94** | **68%** |
| TSM | 30× IFRS / ADR | **56.27** | **48%** |
| VRT | 35× GAAP | **25.83** | **64%** |
| MU | 20× GAAP | **191.59** | **37%** |
| SNDK | 20× adjusted | **294.52** | **61%** |
| CRDO | 55× GAAP | **14.66** | **76%** |
| ALAB | 55× adjusted | **23.17** | **94%** |
| WDC | 28× adjusted | **52.84** | **55%** |
| STX | 30× GAAP | **97.19** | **63%** |
| AMD | 45× adjusted | **50.32** | **96%** |
| FIX | 30× GAAP | **212.97** | **67%** |

Rounded growth percentages do not imply statistical precision. The arithmetic is high confidence; these earnings paths are not.

**What this reveals:**

- NVDA and AVGO have lower EPS growth hurdles than ANET/ALAB at these chosen multiples.
- MU's hurdle looks lower because current earnings already include extraordinary pricing economics.
- AMD needs much more than “wins some GPU share.” Per-share profits must expand dramatically.
- A high-growth stock bought at a high multiple can require a more extreme outcome than a larger incumbent bought cheaper.

**Scale check:** before accepting any bull EPS, convert it into total earnings using a realistic future diluted share count, then into revenue using sustainable margins. A spreadsheet can generate a 4× stock outcome that requires implausible industry-wide spending.

For example, NVDA's approximately $24.4 EPS hurdle, with roughly 24.3B shares, means about **$593B annual net income**. At a hypothetical 50% net margin, that would require roughly **$1.19T annual revenue**. The share count is based on the disclosed latest quarter; future share counts and margins are assumptions. [1]

That is possible to model; it is a very large economic claim. The attractiveness of today's multiple does not eliminate it.

## 9. Three-year scenario model

**These are conditional sensitivity cases, not calibrated probabilities or price targets.** Central cases are working underwriting judgments. Confidence: **low** in numerical outcomes, **moderate** in the relative burden imposed by entry valuation.

Each case specifies terminal annual EPS and terminal P/E. Figures exclude dividends, taxes, FX and transaction costs. EPS must be achieved **per diluted share**, incorporating future issuance or buybacks. Adjusted-EPS cases additionally require scrutiny of excluded compensation costs.

| Stock | Bear: terminal EPS × P/E → price; price CAGR | Central: terminal EPS × P/E → price; price CAGR | Bull: terminal EPS × P/E → price; price CAGR |
|---|---|---|---|
| NVDA | 8.00 × 20 → **160; −11%** | 19.51 × 30 → **585; +37%** | 29.97 × 35 → **1,049; +66%** |
| AVGO | 12.00 × 22 → **264; −10%** | 32.67 × 30 → **980; +39%** | 49.45 × 35 → **1,731; +69%** |
| ANET | 4.00 × 30 → **120; −18%** | 8.35 × 40 → **334; +16%** | 12.82 × 50 → **641; +44%** |
| TSM | 17.00 × 18 → **306; −12%** | 33.67 × 25 → **842; +23%** | 47.31 × 30 → **1,419; +46%** |
| VRT | 5.50 × 22 → **121; −21%** | 12.90 × 30 → **387; +17%** | 19.81 × 40 → **792; +48%** |
| MU | 30.00 × 12 → **360; −30%** | 100.00 × 18 → **1,800; +21%** | 200.00 × 22 → **4,400; +62%** |
| SNDK | 40.00 × 12 → **480; −33%** | 150.00 × 18 → **2,700; +20%** | 300.00 × 22 → **6,600; +61%** |
| CRDO | 2.50 × 30 → **75; −30%** | 7.35 × 45 → **331; +15%** | 13.17 × 65 → **856; +58%** |
| ALAB | 4.00 × 30 → **120; −30%** | 9.76 × 45 → **439; +9%** | 25.60 × 55 → **1,408; +60%** |
| WDC | 10.00 × 15 → **150; −28%** | 31.29 × 25 → **782; +25%** | 48.06 × 30 → **1,442; +54%** |
| STX | 15.00 × 18 → **270; −30%** | 43.59 × 28 → **1,221; +16%** | 75.33 × 35 → **2,637; +50%** |

### Inputs behind the central and bull cases

| Stock | Central EPS assumption | Bull EPS assumption |
|---|---|---|
| NVDA | 30% EPS CAGR from 8.88 run rate | 50% |
| AVGO | 35% adjusted EPS CAGR from 13.28 | 55% |
| ANET | 30% GAAP EPS CAGR from 3.80 | 50% |
| TSM | 25% IFRS EPS CAGR from 17.24 | 40% |
| VRT | 30% GAAP EPS CAGR from 5.87 guide midpoint | 50% |
| CRDO | 40% GAAP EPS CAGR from 2.68 | 70% |
| ALAB | 45% adjusted EPS CAGR from 3.20 | 100% |
| WDC | 30% adjusted EPS CAGR from 14.24 | 50% |
| STX | 25% GAAP EPS CAGR from 22.32 | 50% |
| MU / SNDK | Explicit terminal EPS reflecting possible price/mix normalization | Higher explicit EPS requiring durable demand, capacity and pricing economics |

**These growth inputs are assumptions, not company guidance.** One-quarter annualization can overstate or understate the true starting capacity. Q3 ramps could make ALAB's baseline conservative; peak scarcity could make memory baselines dangerously optimistic.

Bear outcomes shown are not worst cases. Default, geopolitical disruption or lost architecture relevance can produce much larger losses.

### Entry price can create the asymmetry

Under the same central earnings and exit multiples:

**Entry price supporting 55% three-year CAGR = central terminal price ÷ 3.723875.**

| Candidate | Approximate entry implied by that particular central case, USD |
|---|---:|
| NVDA | **157** |
| AVGO | **263** |
| ANET | **90** |
| TSM | **226** |
| VRT | **104** |
| MU | **483** |
| CRDO | **89** |
| ALAB | **118** |

These are sensitivity outputs, **not buy orders, fair values or promises of a pullback**. Stronger evidence can raise the earnings input; a price reset can lower the required earnings claim. Either can improve asymmetry.

**No current candidate clears 55% in every reasonable central case.** Concentration does not change that arithmetic.

## 10. How to concentrate without merely multiplying the same dependency

NVDA + AMD + AVGO + ANET + CRDO + ALAB can look diversified by ticker while remaining one bet on funded AI deployments. Correlation can rise precisely when financing tightens.

For this mandate, every extra name should have a specific job:

| Position role | Candidate example | Independent claim required |
|---|---|---|
| Primary compounding thesis | NVDA | Integrated platform continues turning useful demand into per-share earnings |
| Rival architecture capture | AVGO | Custom silicon economics exceed financing and concentration costs |
| Moving bottleneck | MU **or** SNDK | Demand/pricing/capacity thesis distinct from simply buying more accelerators |
| Open-fabric expansion | ANET | New networking role plus durable systems/software capture |
| Electrical/thermal transition | VRT | Content and retrofit economics justify current earnings hurdle |
| High-risk design-win optionality | CRDO **or** ALAB | Specific design architecture, qualification and per-share upside |

This is a menu, not a six-position portfolio. A three-position book can fit the goal if evidence is strong enough. Exact weights require current exposure, liquidity needs and acceptable impairment; this report does not silently assume those.

A useful concentration rule is mechanical:

**Maximum position fraction = acceptable total-book permanent loss from this thesis ÷ plausible permanent loss fraction in this position.**

Illustration: willing to lose 10% of the book from one failed thesis, with a modeled 60% permanent position loss → approximately **17% position weight**. That is arithmetic, not a recommended limit; use your own loss budget and stress correlated failures.

With multiple stocks relying on the same customer/funding outcome, apply that budget to the **combined exposure**, not separately to each ticker.

Leverage is a separate instrument thesis. Daily-reset leveraged ETFs introduce path dependence and financing drag; exceptional underlying-business growth does not automatically imply an attractive long-term leveraged payoff.

## 11. Quarterly evidence and rotation rules

### Demand and financing

- Track funded deployments and commissioned capacity, not announced GW totals.
- Separate ordinary purchases from lease-backed, vendor-financed or equity-linked demand.
- Watch customer utilization, rental rates, receivable aging and order cancellations.
- Treat lab fundraising as improved ability to pay existing obligations; establish incremental equipment demand separately.

### Architecture and product capture

- NVDA: useful performance per watt/task, software migration economics and integrated network share.
- AVGO: repeat custom designs, customer economics and backstop changes.
- ANET: adoption into scale-up, system/software revenue and margin retention under open NOS choice.
- CRDO/ALAB: components retained in new electrical/optical designs; new customers and actual shipped content.
- VRT: electrical/thermal content, retrofit wins and installation cash conversion.
- Memory/storage: capacity, bandwidth, bit/exabyte volume, pricing, yields and qualified product mix.

### Shareholder economics

- Compare earnings growth with diluted share-count growth.
- Reconcile non-GAAP expenses to actual shareholder costs.
- Separate working-capital cash releases from recurring cash generation.
- Normalize memory/storage margins rather than extrapolating the latest shortage quarter.
- Rebuild valuation from issuer figures after every earnings release.

### Add, hold, rotate

| Action | Evidence needed |
|---|---|
| **Add** | A lower price or better demonstrated earnings path improves forward payoff without increasing failure probability materially |
| **Hold** | Operational thesis persists and current price still offers acceptable forward return |
| **Reduce / rotate** | Price captures the probable upside; a superior independently underwritten payoff appears; or common exposure exceeds the loss budget |
| **Exit** | Structural capture breaks, funding quality deteriorates materially, or the investment instrument fails the intended holding strategy |

Do not rotate from a cheaper proven winner to a more expensive speculative name just because it is smaller. Do not defend a winner solely because it produced your historical XIRR.

## 12. Final decision statement

**Keep NVDA as the first thesis to underwrite for new capital. Investigate AVGO's financing exposure before treating it as an equally clean supplier bet. Promote MU into serious consideration, with explicit margin-normalization cases. Keep ANET on a demanding price/earnings watch rather than equating an excellent networking business with automatic asymmetry.**

TSM and VRT can earn concentrated positions through specific manufacturing and infrastructure economics. They are optional theses, not ballast. CRDO/ALAB require exceptional adoption and per-share growth; their smaller starting businesses are already priced accordingly.

**The edge to pursue:** capture of profitable workload growth, refresh economics under scarce power, custom silicon proliferation, memory tiering and changing interconnect architecture—bought at a price that does not already require the exceptional outcome.

No theorem guarantees a successful stock outcome. Confidence: **moderate** in the identified mechanisms and relative research priorities; **low** in three-year magnitudes and continued 55% account returns.

## Sources

All operating and technical sources below are issuer disclosures or original research. Quote sources are used only for observed market prices. Analyst opinions, ratings and targets did not enter the ranking.

1. [Nvidia Q2 FY2027 results, 26 August 2026](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027).
2. [Nvidia Rubin platform announcement and stated performance comparison](https://nvidianews.nvidia.com/news/rubin-platform-ai-supercomputer).
3. [TSMC A16 technology specifications](https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_A16).
4. [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437).
5. [PagedAttention / vLLM original research](https://arxiv.org/abs/2309.06180).
6. [Arista Q2 2026 results, 4 August 2026](https://www.arista.com/en/company/news/press-release/24401-pr-20260804).
7. [Arista rack-scale scale-up/scale-out announcement, 7 October 2026](https://www.arista.com/en/company/news/press-release/24818-pr-20261007).
8. [Broadcom Q3 FY2026 results, 2 September 2026](https://investors.broadcom.com/news-releases/news-release-details/broadcom-inc-announces-third-quarter-fiscal-year-2026-financial).
9. [Broadcom Q3 10-Q, period ended 2 August 2026; backstop and compensation disclosures](https://www.sec.gov/Archives/edgar/data/1730168/000173016826000080/avgo-20260802.htm).
10. [TSMC Q2 2026 earnings release, 16 July 2026](https://investor.tsmc.com/english/encrypt/files/encrypt_file/reports/2026-07/a80d7933be643644081584087731f73b22ea5a2c/2Q26%20EarningsRelease.pdf).
11. [Credo Q1 FY2027 results, 1 September 2026](https://investors.credosemi.com/news-events/news/news-details/2026/Credo-Technology-Group-Holding-Ltd-Reports-First-Quarter-of-Fiscal-Year-2027-Financial-Results/default.aspx).
12. [Astera Labs Q2 2026 results, 4 August 2026](https://ir.asteralabs.com/news-releases/news-release-details/astera-labs-reports-second-quarter-2026-financial-results).
13. [Vertiv Q2 2026 results and FY2026 guidance, 29 July 2026](https://investors.vertiv.com/news/news-details/2026/Vertiv-Reports-Strong-Second-Quarter-2026-with-Diluted-EPS-Growth-of-53-Adjusted-Diluted-EPS-Growth-of-60-Raises-Full-Year-2026-Guidance-Across-All-Key-Metrics/default.aspx).
14. [Vertiv 800 VDC architecture collaboration and disclosed timing](https://www.vertiv.com/en-in/about/news-and-events/news-releases/from-vision-to-readiness-vertiv-collaborates-with-nvidia-to-advance-800-vdc-platform-designs-to-power-the-next-generation-of-ai-factories/).
15. [Micron Q4 and FY2026 results, 30 September 2026](https://investors.micron.com/news/press-release/2026/Micron-Technology-Inc--Reports-Record-Fiscal-Fourth-Quarter-and-Full-Year-2026-Results/default.aspx).
16. [Micron HBM product specifications](https://in.micron.com/products/memory/hbm).
17. [Sandisk Q4 FY2026 results, 5 August 2026](https://www.sandisk.com/company/newsroom/press-releases/2026/2026-08-05-sandisk-reports-fiscal-fourth-quarter-2026-financial-results).
18. [Western Digital Q4/FY2026 results, 5 August 2026](https://investor.wdc.com/news-releases/news-release-details/wd-reports-fiscal-fourth-quarter-and-fiscal-year-2026-financial).
19. [Seagate Q4/FY2026 results, 28 July 2026](https://investors.seagate.com/news/news-details/2026/Seagate-Technology-Reports-Fiscal-Fourth-Quarter-and-Fiscal-Year-2026-Financial-Results/).
20. [Comfort Systems Q2 2026 results, 23 July 2026](https://comfortsystemsusa.gcs-web.com/news-releases/news-release-details/comfort-systems-usa-reports-second-quarter-2026-results).
21. [AMD Q2 2026 results, 4 August 2026](https://ir.amd.com/news-events/press-releases/detail/1295/amd-reports-second-quarter-2026-financial-results).
22. [ASML Q2 2026 results, 15 July 2026](https://investor.asml.com/news-releases/news-release-details/q2-2026-financial-results).
23. [Nvidia/Lumentum optics partnership, 2 March 2026](https://nvidianews.nvidia.com/news/nvidia-announces-strategic-partnership-with-lumentum-to-develop-state-of-the-art-optics-technology).
24. [Nvidia/Coherent optics partnership, 2 March 2026](https://nvidianews.nvidia.com/news/nvidia-and-coherent-announce-strategic-partnership-to-develop-optics-technology-to-scale-next-generation-data-center-architecture).
25. **9 October closing-price histories:** [NVDA](https://stockanalysis.com/stocks/nvda/history/), [AVGO](https://stockanalysis.com/stocks/avgo/history/), [ANET](https://stockanalysis.com/stocks/anet/history/), [TSM](https://stockanalysis.com/stocks/tsm/history/), [VRT](https://stockanalysis.com/stocks/vrt/history/), [MU](https://stockanalysis.com/stocks/mu/history/), [CRDO](https://stockanalysis.com/stocks/crdo/history/), [ALAB](https://stockanalysis.com/stocks/alab/history/), [SNDK](https://stockanalysis.com/stocks/sndk/history/), [WDC](https://stockanalysis.com/stocks/wdc/history/), [STX](https://stockanalysis.com/stocks/stx/history/), [AMD](https://stockanalysis.com/stocks/amd/history/), [FIX](https://stockanalysis.com/stocks/fix/history/).

