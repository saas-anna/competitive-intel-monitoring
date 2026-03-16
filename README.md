# Competitive Intelligence Monitoring

A self-hosted, automated competitive intelligence monitoring system for B2B SaaS companies. Runs on n8n + changedetection.io + SearXNG (all free, all Docker), analyzed by Claude (Anthropic API).

**What it does:** Monitors your competitors across multiple data sources on a schedule, filters noise before it reaches the LLM, and delivers a structured email digest with strategic analysis tied to your company's specific situation.

**What makes it different from a news aggregator:** The system includes your company's strategy context — positioning, ICP, competitive dynamics. The LLM doesn't just summarize news; it analyzes what each signal means for *your* specific competitive situation.

**Cost:** ~$0.01-0.03 per run (Claude API only). Everything else is self-hosted.

---

## How It Works

```
Schedule (biweekly)
  → Collect signals from 6 sources in parallel
  → Filter noise (keyword matching, before LLM)
  → Deduplicate (within-run + cross-run)
  → Analyze with Claude (strategy-aware)
  → Send structured email digest
  → Update state (Google Sheets)
```

### Data Sources

| Source | What it catches | How |
|--------|----------------|-----|
| **Website change detection** | Pricing changes, positioning shifts, new features, new customer logos | Hash-based comparison of competitor URLs |
| **Browser-based monitoring** | Changes on JS-heavy or Cloudflare-protected pages (e.g., G2 reviews) | changedetection.io with Playwright |
| **News search** | Funding, acquisitions, product launches, partnerships, hiring signals | SearXNG (self-hosted) |
| **Regulatory search** | New regulations, enforcement dates, policy changes affecting your market | SearXNG with industry-specific queries |
| **Email alerts** | Press mentions, partnership announcements, community discussions | Google Alerts + F5Bot (Reddit/HN) → Gmail label |
| **Self-search** | Mentions of your own company | SearXNG |

### Tiered Monitoring

Not all competitors deserve the same attention. The system uses three tiers:

| Tier | Depth | When to use | Typical count |
|------|-------|-------------|---------------|
| **A** | Full: news (multi-language) + people search + URL monitoring + browser monitoring + alerts | Direct competitors you encounter in real sales situations | 3-5 |
| **B** | Moderate: news (English only) + URL monitoring + browser monitoring + alerts | Relevant but less immediate. Different segment or geography. | 3-5 |
| **C** | Passive only: Google Alerts + browser monitoring | Worth watching but not actively searching. Niche players, unknown scale. | 2-4 |

### Output: Tiered Email Digest

| Section | What goes here |
|---------|---------------|
| **Strategic Signals** | 1-3 items that could change a decision. Full analysis tied to your strategy. |
| **Notable Changes** | 5-10 items with one-line context + why relevant |
| **Regulatory & Market** | Industry regulation developments |
| **Background** | Everything else worth noting — no analysis, just headline + link |
| **Patterns** | Cross-run trends across competitors |
| **No Signals** | Competitors with zero activity this period |

---

## Prerequisites

**This is not a "click install and go" system.** You need to do real competitive research work before the automation has anything useful to monitor. The automation replaces the *monitoring* — not the *thinking*.

See `PREREQUISITES.md` for the full checklist and guidance on each item.

**Quick summary of what you need before building:**

1. **A competitor list with tier assignments** — Who are your actual competitors? Not who you think they are, but who you encounter in sales. Tiered by strategic relevance.

2. **Competitor URLs to monitor** — Homepage, pricing, product pages, changelog/release notes, blog. Each URL needs to be manually verified (do they return 200? is the content meaningful?). This requires digging — not every competitor has an obvious `/changelog` page.

3. **Your company's strategy context** — Positioning, ICP definition, competitive dynamics, geographic strategy. This is what turns a news aggregator into competitive intelligence.

4. **Industry-specific search terms** — What regulations matter? What keywords define your space? In what languages?

5. **Google Alerts + F5Bot setup** — One alert per competitor, all landing in a shared Gmail label.

6. **Infrastructure** — Docker running locally (n8n, changedetection.io, SearXNG). A Google Sheet for state tracking. Gmail OAuth for n8n. Anthropic API key.

---

## Repo Structure

```
competitive-intel-monitoring/
├── README.md                      ← You are here
├── PREREQUISITES.md               ← What you need before building (start here)
├── BUILD-GUIDE.md                 ← Give this to your LLM to build the system
├── METHODOLOGY.md                 ← Signal-vs-noise rules, tiering, filtering
├── LESSONS-LEARNED.md             ← What went wrong and what we learned
├── docker-compose.yml             ← One-command infrastructure setup
├── workflow/
│   └── competitive-intel.json     ← Anonymized n8n workflow (importable)
├── config/
│   └── competitors-template.js    ← Template for competitor registry
└── examples/
    └── sample-digest-output.json  ← What the LLM output looks like
```

## How to Use This Repo

**The quick version:** Send Claude (or your LLM of choice) the link to this repo and ask it to help you set up competitive monitoring for your client. It will read the prerequisites, tell you what information you need to prepare, and then build the system for you. You don't need to write any code.

**The step-by-step version:**

1. Read `PREREQUISITES.md` — do the research work first (competitor list, URLs, strategy context)
2. Run `docker-compose up -d` — starts n8n, changedetection.io, SearXNG
3. Give `BUILD-GUIDE.md` to Claude along with your completed prerequisites
4. Claude builds and configures the workflow for your specific situation
5. Test run, review output quality, activate schedule

---

## Credits

Built by [Anna Ursin](https://www.linkedin.com/in/annaursin/) at [Saas-Anna](https://www.saas-anna.com), a fractional GTM consultancy for B2B SaaS companies. Originally built for a client's competitive intelligence needs, then open-sourced as a reusable framework.

If you find this useful, a LinkedIn mention or a [GitHub star](https://github.com/saas-anna/competitive-intel-monitoring) is always appreciated.
