# Methodology

How the system decides what's signal and what's noise. These rules are embedded in the workflow's LLM prompt and pre-LLM filters.

---

## Tiered Monitoring

Not all competitors deserve the same monitoring effort. The system uses three tiers:

| Tier | Who | Search depth | Typical count |
|------|-----|-------------|---------------|
| **A** | Direct competitors you encounter in real sales situations. Active threat to your ICP segments. | Full: multi-language news, people-specific search, URL monitoring, browser monitoring, alerts | 3-5 |
| **B** | Relevant but less immediate. Different primary segment or geography, but worth tracking. | Moderate: English-only news, URL monitoring, browser monitoring, alerts | 3-5 |
| **C** | Peripheral. Niche players, unknown scale, wrong segment. Worth catching if they make noise. | Passive: Google Alerts + browser monitoring only. No active API calls. | 2-4 |

**Total: 10-15 competitors across all tiers.** More than 15 creates noise. Fewer than 8 misses things.

### Tier assignment criteria

- **Tier A:** You compete head-to-head in real deals. They target the same ICP segments. You've lost deals to them.
- **Tier B:** You see them occasionally. Different geography or segment, but they could move into your space. Activation signals matter (new funding, hiring in your region).
- **Tier C:** You know they exist. Customers rarely mention them. Only worth surfacing if something significant happens (acquisition, major pivot).

### Promoting/demoting

When a Tier B competitor starts appearing in your sales cycles, promote to A. When a Tier A competitor pivots away from your market, demote to B. Tier C exists as a safety net — promote to B if you want active monitoring.

---

## Signal-vs-Noise Rules

### Website Changes

**Signal (include):**
- Positioning or tagline shift
- Target audience language change (SMB to enterprise, or vice versa)
- GTM model shift (free trial → request demo, or vice versa)
- New product/feature prominently placed
- New customer logos, especially in your ICP segments
- New partnership or integration highlighted
- Geographic/language expansion (new language version of site)
- Pricing model change (per-seat to per-org, flat to usage-based)
- Tier restructuring, price changes
- Free tier added or removed

**Noise (exclude):**
- CTA button text tweaks
- Design/layout changes without messaging changes
- Blog post rotation in widgets
- Minor copy edits
- Image swaps, footer updates, cookie banners

### News

**Signal (include):**
- Funding rounds, acquisitions, mergers
- Product launches with specific features
- Geographic expansion (new offices, hiring in new markets)
- Major customer wins in your ICP segments
- Leadership changes
- Partnership or channel announcements (especially consulting firms, technology alliances)
- Hiring patterns that signal strategy (SDR hires = outbound push, regional sales = geographic expansion)

**Noise (exclude):**
- Generic "top N tools" listicles
- Market sizing reports (Background section only)
- Conference attendance without substantive announcements
- Routine blog posts
- Republished press releases

### Regulatory

**Signal (include):**
- New enforcement dates or deadlines
- National implementation milestones
- Policy changes affecting your ICP's buying behavior
- Enforcement actions or penalties

**Noise (Background only):**
- General commentary without new information
- Market forecasts
- Academic analysis without concrete implications

### Review Aggregation (G2, etc.)

Individual reviews are noise. Patterns are signal:
- 3+ reviews sharing a theme → report the PATTERN
- Review directly references your company or key differentiators → report it
- Sentiment shifted vs. previous run → report the shift
- Otherwise → note the count in Background

---

## Pre-LLM Filtering

Two filtering layers run **before** signals reach the LLM. This is critical — LLMs produce plausible output regardless of input quality, so noise must be removed upstream.

### Layer 1: News Relevance Filter

For `news_search` signals, the article title + summary must mention either:
- The competitor name, alternative name, or domain, **OR**
- At least one industry keyword from your keyword list

If neither condition is met, the signal is dropped. This prevents articles about completely unrelated topics that happen to match a competitor name (e.g., a company called "Monday" returning results about the day of the week).

### Layer 2: Regulatory Relevance Filter

For `regulatory` signals:
1. **Exclude** if the title+summary contains any term from the exclusion list (crypto, politics, etc.)
2. **Include only if** the title+summary contains at least one regulatory/compliance keyword

### Why Pre-LLM Filtering Matters

Without pre-LLM filtering, a typical run might send 40+ signals to the LLM with 50%+ noise. The LLM will dutifully analyze every signal — including real estate articles and sports match results — producing professional-looking analysis of irrelevant content. The only way to catch this is to measure noise ratio independently. Simple keyword matching costs nothing and eliminates most noise at the source.

---

## Deduplication

### Within-Run Dedup

The same event often appears in multiple sources (news search + Google Alert + page change). The system uses Jaccard word similarity (threshold > 0.5) to identify duplicates within a single run and merges them into one signal with all source links preserved.

### Cross-Run Dedup

The system maintains a 2-run window of previous signals (stored in Google Sheets). New signals are compared against this window using Jaccard similarity (threshold > 0.45). Previously reported signals are suppressed unless they contain substantially new information (summary similarity < 0.3), in which case they're prefixed with "Update:".

---

## Output Format

The digest is structured into tiered sections, each serving a different purpose:

| Section | What goes here | Items |
|---------|---------------|-------|
| **Strategic Signals** | Signals that could change a decision. Full analysis tied to your strategy. | 1-3 max |
| **Notable Changes** | Headline + one-line context + why relevant | 5-10 |
| **Regulatory & Market** | Industry regulation developments | Variable |
| **Background** | Everything else worth noting — no analysis, just headline + link | Variable |
| **Patterns** | Cross-run trends across competitors | Variable |
| **No Signals** | Competitors with zero activity this period | List |

### What's NOT in the digest
- Action items or recommendations (the reader draws their own conclusions)
- Forced analysis on signals that don't have a clear strategic tie
- Individual reviews (aggregated into patterns)
- Noise dressed up as Background

### Signal Merging

When the same event appears from multiple sources, it becomes ONE signal with all source links combined. The LLM is explicitly instructed to do this. A funding round mentioned in news, a Google Alert, and a homepage change should be one Strategic Signal with three source links, not three separate items.

---

## Strategy Context

The strategy context is what transforms a news aggregator into competitive intelligence. Without it, the LLM produces generic summaries. With it, the LLM analyzes what each signal means for **your specific situation**.

### What to Include (200-400 words)

- **What you do** — your product, market, positioning
- **Key differentiators** — what makes you different from alternatives
- **ICP definition** — who you sell to, company size, industry, roles
- **Geographic strategy** — where you are now, where you're expanding
- **Competitive dynamics** — what you win against, what you lose against, why
- **Entry use cases** — how customers first buy
- **Strategic gaps** — what you don't know, what you're worried about

### Keep It Updated

The analysis quality degrades when strategy context is stale. Review after any strategic shift: new ICP definition, positioning change, market expansion, new product launch.
