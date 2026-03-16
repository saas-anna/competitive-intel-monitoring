# Lessons Learned

Hard-won lessons from building and iterating on this system. Read these before building — they'll save you hours of debugging.

---

## 1. Architecture vs. quality are separate problems

The workflow architecture (nodes, connections, data flow) and signal quality (noise ratio, relevant results) are independent problems. You can have a perfectly architected workflow that produces garbage output, and a rough prototype that delivers great intelligence. Don't conflate platform migration with quality work. Solve architecture first (get data flowing end-to-end), then solve quality (are the right signals reaching the output?).

## 2. Build iteratively, not architecturally

Don't design all nodes, all connections, and all code before testing a single data path.

**What works:** Get Schedule → Metadata → one HTTP fetch → Process → email working first. Then add sources one at a time. Each addition is testable in isolation.

**What doesn't:** Design the full 26-node system upfront, build everything, then debug everything at once. When something fails, you don't know which of 26 nodes caused it.

## 3. Test each data source individually

Before integrating a data source into the pipeline, test it in isolation:
- Does this URL return HTTP 200? (Not 301, not 404, not a Cloudflare challenge page)
- Does this API response parse correctly?
- Does this search query return relevant results?
- Does this page have actual content, or is it a JS shell that loads dynamically?

Broken URLs, Cloudflare blocks, and response parsing bugs are only discovered after the full pipeline is assembled if you skip this step.

## 4. Pre-LLM filtering is non-negotiable

LLMs always produce plausible output regardless of input quality. You can send an LLM 50% noise and it will produce a professional-looking digest — complete with reasonable-sounding analysis of irrelevant real estate articles. The output **looks fine**. The only way to catch this: measure noise ratio independently (count irrelevant items ÷ total items).

Simple keyword matching (competitor name OR industry keyword in title+summary) catches 30-40% of items as noise. This costs nothing and should be in every CI pipeline.

## 5. Monitored URLs break silently

Competitor URLs return 404 and nobody notices because the LLM still produces output — it just has less data. Build in:
1. Error counting in stats (display `url_errors` in the digest header)
2. Periodic URL health checks (curl each URL, verify HTTP 200)
3. A threshold that flags when too many sources fail

In our case, 7 of 24 URLs were returning 404 before we caught it.

## 6. Search queries need domain-specific context

A bare competitor name query like `"Monday"` returns articles about the day of the week, motivational quotes, and restaurant specials. Adding context keywords eliminates 100% of that noise at the source:
- Before: `"CompanyName" news`
- After: `"CompanyName" AND ("your-industry" OR "relevant-term" OR "another-term")`

For non-English markets, use local language industry terms too. Budget 15 minutes to test each query manually in SearXNG before hardcoding.

## 7. G2 requires browser-based monitoring

Cloudflare captcha blocks all server-side HTTP requests to G2 (returns 403). Atom feeds, direct HTTP, API calls — none work from a server. The only way to monitor G2 pages is browser-based monitoring (changedetection.io with Playwright). It runs a real browser that passes Cloudflare's checks.

## 8. Gmail API: use search syntax, not label IDs

Gmail's `labelIds` parameter requires internal IDs (like `Label_123456`) that change unpredictably and are hard to find. Use `q: "label:your-label-name"` instead — it uses display names (spaces become hyphens) and is more robust for automation.

## 9. The first run is baseline only

No URL change detection happens on the first run — it captures content hashes for future comparison. Tell stakeholders not to expect change detection results until the second run. Cross-run pattern detection needs 3+ runs to be useful.

## 10. LLM analysis is only as good as the strategy context

Generic strategy context produces generic analysis. If your strategy context says "we sell software to businesses," the LLM can't tell you whether a competitor's geographic expansion matters to you specifically. Include positioning, ICP segments, competitive dynamics, and geographic strategy. Update it when your strategy changes.

---

## Replication Checklist

When setting up for a new company:

1. Copy the n8n workflow and adapt the `COMPETITORS` array + strategy context
2. Set up changedetection.io watches for competitor URLs (especially JS-heavy pages)
3. Create Google Alerts (one per competitor) + F5Bot keywords
4. Create a Gmail label and configure the filter
5. Create a Google Sheet with the 4 required tabs
6. Test each data source individually (URLs, search queries, Gmail, changedetection.io)
7. Run once manually, check noise ratio (<10% is the target)
8. Activate schedule only after quality is confirmed
