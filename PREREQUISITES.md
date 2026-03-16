# Prerequisites

Everything you need to prepare before the automation can be built. The automation monitors competitors — it doesn't figure out who they are or why they matter. That's your job (or your strategist's job).

**Estimated prep time:** 2-4 hours for the research, 30-60 minutes for infrastructure setup.

---

## 1. Competitor Registry (required)

You need a list of competitors with tier assignments. This is the foundation — everything else depends on it.

### How to build it

**Start from reality, not theory:**
- Who do you actually encounter in sales situations?
- Who do prospects mention when they say "we're also looking at..."?
- What do customers currently use instead of your product? (Often: Excel, SharePoint, email — the "do nothing" competitor)

**Don't start from market reports.** Gartner quadrants and G2 categories will give you 50+ names. Most are irrelevant to your specific sales motion.

### Tier assignment

| Tier | Criteria | Search depth | Count |
|------|----------|-------------|-------|
| **A** | You compete head-to-head in real deals. They target the same ICP segments. Active threat. | Full: multi-language news, people search, URL monitoring, browser monitoring, alerts | 3-5 max |
| **B** | Relevant but not immediate. Different primary segment or geography, but worth tracking for activation signals. | Moderate: English-only news, URL monitoring, browser monitoring, alerts | 3-5 |
| **C** | Peripheral. Niche players, unknown scale, wrong segment. Worth catching if they make noise, but not worth actively searching. | Passive: Google Alerts + browser monitoring only | 2-4 |

**Total: 10-15 competitors across all tiers.** More than 15 creates noise. Fewer than 8 misses things.

### Per competitor, you need

| Field | Example | Why |
|-------|---------|-----|
| Company name | Acme Corp | Search queries |
| Alternative names | AcmeSuite, Acme Platform | Some companies rebrand or have product names different from company names |
| Tier (A/B/C) | A | Controls monitoring depth |
| Domain | acme.com | Pre-LLM noise filtering (match articles against domain) |
| Key people (Tier A only) | Jane Smith (CEO), John Doe (CPO) | People-specific news search |
| Languages | en, de | Which languages to search in. English-only is fine; add local language (e.g., German) if your market requires it. |
| URLs to monitor | See URL discovery below | Change detection targets |

---

## 2. Competitor URLs (required for Tier A + B)

The URLs you monitor determine what changes you'll catch. This requires actual digging — you can't just guess paths.

### URL discovery checklist

For each Tier A and B competitor, check:

| URL type | Common paths | What it catches |
|----------|-------------|-----------------|
| **Homepage** | `/` | Positioning shifts, tagline changes, new messaging |
| **Pricing** | `/pricing`, `/plans` | Pricing model changes, tier restructuring, free tier added/removed |
| **Product/features** | `/product`, `/features`, `/platform`, `/solutions` | New capabilities, repositioning |
| **Changelog / Release notes** | `/changelog`, `/release-notes`, `/whats-new`, `/updates` | Product launches, feature releases |
| **Blog / News** | `/blog`, `/news`, `/resources` | Content strategy, announcements |
| **Customers** | `/customers`, `/case-studies` | New logos, especially in your ICP segments |
| **Careers** | `/careers`, `/jobs` | Hiring patterns signal strategy (SDR hires = outbound push, regional hiring = expansion) |
| **Integrations** | `/integrations`, `/partners` | Partnership and ecosystem changes |

### How to find non-obvious URLs

1. **Check sitemap.xml** — `https://competitor.com/sitemap.xml` often reveals pages not in the navigation
2. **Check the footer** — Status pages, release notes, developer docs often linked only from footer
3. **Check help center / knowledge base** — Product update sections, "what's new" pages
4. **Check GitHub** — Public repos with release activity (especially for developer-facing products)
5. **Google:** `site:competitor.com changelog OR "release notes" OR "what's new"`

### Verify every URL

**Do not skip this.** For each URL:
- Does it return HTTP 200? (Not 301, not 404, not a Cloudflare challenge page)
- Does it contain actual content? (Not just a React shell that loads dynamically)
- For JS-heavy pages: add to changedetection.io (browser-based) instead of direct URL monitoring

**Budget 15-30 minutes per competitor** for URL discovery and verification. It's tedious but prevents silent failures later.

---

## 3. Strategy Context (required)

This is what turns a news aggregator into competitive intelligence. Without it, the LLM produces generic summaries. With it, the LLM analyzes what each signal means for your specific situation.

### What to include

Write 200-400 words covering:

- **What you do** — One paragraph. Your product, your market, your positioning.
- **Key differentiators** — What makes you different from alternatives? What do you win on?
- **ICP definition** — Who do you sell to? Company size, industry, roles, use cases. Include win rates by segment if you have them.
- **Geographic strategy** — Where are you now? Where are you expanding?
- **Competitive dynamics** — What do you win against? What do you lose against? Why?
- **Entry use cases** — How do customers first buy? What's the initial wedge?
- **Strategic gaps** — What don't you know? What are you worried about?

### Example structure (anonymized)

```
[Company] is a modular [industry] platform positioned as [positioning statement]
between [expensive enterprise alternative] and [basic alternative].
Key differentiator: [what makes you unique].

Market: [geographic focus]. Primary ICP: [segments with characteristics].
Entry use cases: [how customers first buy].

Competitive position: [what you win on]. [What you're worried about].
[Key regulatory or market tailwinds].
```

**Keep this updated.** The analysis quality degrades when strategy context is stale. Review after any strategic shift (new ICP definition, positioning change, market expansion).

---

## 4. Industry-Specific Search Terms (required)

The system searches for competitors in the context of your industry. Generic company name searches return noise (a company called "Monday" returns articles about the day of the week).

### You need

**English industry keywords** (5-10):
- Your industry category (e.g., "project management", "cybersecurity", "HR tech", "supply chain")
- Specific frameworks or standards (e.g., "PMP", "ITIL", "SOC 2", "ISO 27001")
- Functional terms (e.g., "risk management", "resource planning", "talent acquisition")

**Local language keywords** (if your market isn't English-only):
- Translated equivalents of the above
- Industry-specific terms that don't translate directly

**Regulatory search terms** (2-3 queries):
- Specific regulations affecting your market (e.g., "AI Act", "GDPR", "DORA", "NIS2")
- Combined with time context (current/next year)

**Exclude list** (terms that cause false positives):
- Words that share names with your competitors but mean something else
- Industry terms from adjacent but irrelevant fields

---

## 5. Google Alerts + F5Bot (required)

These are passive monitoring sources that catch things search can't — press mentions, community discussions.

### Google Alerts setup (10 minutes)

1. Go to [google.com/alerts](https://www.google.com/alerts)
2. Create one alert per competitor (use company name, optionally + industry term)
3. Settings: "Weekly digest", deliver to your Gmail address
4. Create a Gmail filter: `from:googlealerts-noreply@google.com` → apply label (e.g., "Competitive Intel")

### F5Bot setup (5 minutes)

1. Go to [f5bot.com](https://f5bot.com)
2. Add keywords for competitors likely discussed on Reddit/Hacker News
3. Emails go to your Gmail address
4. Add to the same Gmail filter: `from:alerts@f5bot.com` → same label

### Gmail label

Create a dedicated Gmail label for these alerts. The workflow reads from this label.

**Important:** Use Gmail's search query syntax (`label:your-label-name`) in the workflow, not the internal label ID. This is more robust when labels are renamed.

---

## 6. G2 Review Pages (recommended)

If your competitors are listed on G2, add their review pages to changedetection.io for browser-based monitoring.

### How to find G2 slugs

- Search G2 for the competitor name
- The URL format is: `https://www.g2.com/products/{slug}/reviews`
- Not all competitors will be on G2 — skip those

**Do not attempt to fetch G2 pages via HTTP directly.** Cloudflare blocks server-side requests. Browser-based monitoring (changedetection.io with Playwright) is the only way.

---

## 7. Infrastructure (required)

### Docker containers (3)

All three run locally via Docker Compose (see `docker-compose.yml`):

| Container | What | Port |
|-----------|------|------|
| **n8n** | Workflow automation | 5678 |
| **changedetection.io** | Browser-based website monitoring | 5555 |
| **SearXNG** | Privacy-respecting meta-search | 8888 |

Plus a Playwright/Chrome container used by changedetection.io for rendering JS-heavy pages.

### Accounts & credentials

| What | Where to get it |
|------|----------------|
| **Anthropic API key** | [console.anthropic.com](https://console.anthropic.com) |
| **Gmail OAuth** | Set up in n8n UI (Google Cloud project with Gmail API enabled) |
| **Google Sheets service account** | Google Cloud Console → create service account → download JSON key → share sheet with service account email |

### Google Sheet

Create a Google Sheet with 4 tabs:
- **State** — stores content hashes for URL change detection
- **PreviousSignals** — last 2 runs of signals for cross-run deduplication
- **History** — append-only log of all signals ever detected
- **Changedetection** — (optional) structured change data

Share the sheet with your service account email as Editor.

---

## Checklist

Use this to track your progress:

- [ ] Competitor list with tier assignments (A/B/C)
- [ ] Per Tier A competitor: key people identified (CEO, CPO, CRO)
- [ ] Per Tier A+B competitor: URLs discovered, verified (HTTP 200), and listed
- [ ] Strategy context written (200-400 words)
- [ ] English industry keywords defined (5-10)
- [ ] Local language keywords defined (if applicable)
- [ ] Regulatory search terms defined (2-3 queries)
- [ ] Noise exclusion terms listed
- [ ] Google Alerts created (1 per competitor)
- [ ] F5Bot keywords added
- [ ] Gmail label created + filter configured
- [ ] G2 review page URLs identified (for competitors on G2)
- [ ] Docker installed (Docker Desktop or OrbStack)
- [ ] `docker-compose up -d` runs successfully
- [ ] Anthropic API key obtained
- [ ] Gmail OAuth configured in n8n
- [ ] Google Sheets service account created
- [ ] Google Sheet created with 4 tabs, shared with service account
- [ ] changedetection.io watches added for JS-heavy / Cloudflare-protected pages

**Once all items are checked, you're ready for `BUILD-GUIDE.md`.**
