# Build Guide

**Give this file to your LLM (Claude, GPT-4, etc.) along with your completed prerequisites.** The LLM builds the n8n workflow for your specific situation.

---

## Step 0: Collect Prerequisites from the User

Before building anything, you need to collect the strategic inputs. The user may not have these ready — walk them through it conversationally. Don't dump a checklist. Ask one topic at a time, explain why you need it, and confirm before moving on.

**Competitor list (the foundation — everything depends on this):**
Ask who they actually compete with in real sales situations. Not 50 names from a market report — the 5-10 companies their prospects mention when they say "we're also looking at..." Push back if they list more than 15 (creates noise) or fewer than 5 (misses things). Then help them assign tiers: the 3-5 they compete with head-to-head are Tier A (deep monitoring), 3-5 they see occasionally are Tier B (moderate), and 2-4 peripheral players are Tier C (passive — only caught if they make news).

**Competitor URLs (what pages to watch for changes):**
For each Tier A and B competitor, you need specific URLs to monitor. Help them find: homepage, pricing page, blog, changelog/release notes, customers page, careers page. Common mistake: people guess paths like `/changelog` without checking. Every URL must return HTTP 200 — verify before adding. Check sitemap.xml and website footers for pages not in the main navigation.

**Strategy context (what makes this intelligence, not just news):**
Ask them to describe in 200-400 words: what the company does, who they sell to, what they win on, what they lose on, and what they're worried about. This is what the AI uses to explain *why* a signal matters. If this is vague ("we sell software to businesses"), the output will be generic. Push for specifics.

**Industry keywords (noise filtering):**
Ask what 5-10 terms define their industry. These are used to filter out irrelevant search results. Common mistake: a competitor called "Monday" returns articles about the day of the week. Industry keywords ensure only relevant results get through.

**Regulatory terms (if applicable):**
Ask if there are regulations affecting their market. Not every industry has these — skip if not relevant.

**Noise exclusion terms:**
Ask if any competitor names could mean something else (e.g., a company named after a common word). These terms filter out false positives.

Once you have all inputs, move to the technical build below. See `PREREQUISITES.md` for the full detailed checklist.

---

## For the LLM: What You're Building

You are building an n8n workflow that monitors competitors and delivers a biweekly email digest with strategic competitive intelligence. The user has completed their prerequisites (competitor list, URLs, strategy context, search terms) and needs you to configure the included workflow template for their specific situation.

### Architecture Overview

```
Schedule Trigger (1st + 15th of month, 9 AM UTC)
  → Run Metadata (set dates, sheet ID)
  → Read Google Sheets (State + PreviousSignals tabs)
  → Ensure Flow nodes (handle empty sheets)
  → Read Gmail Alerts (Google Alerts + F5Bot)
  → [Parallel] Build Request List + Fetch CD Watches
  → Fetch URLs (HTTP Request, batch)
  → Process Results (merge all sources into signals)
  → Dedup Signals (within-run Jaccard + cross-run comparison)
  → Build LLM Prompt (strategy context + signals + noise rules)
  → Call Claude API (Anthropic, structured JSON output)
  → Parse LLM Response (validate required sections)
  → [Parallel] Build HTML Email → Send via Gmail
  → [Parallel] Prepare State Updates → Write to Google Sheets (3 tabs)
```

> **Note:** This workflow uses Claude (Anthropic API) for analysis. It can be adapted to other LLMs by modifying the "Call Claude API" node — see [Customization Guide](#changing-the-llm) below.

### What the Workflow Does

1. **Collects signals** from 6 sources in parallel:
   - Direct URL monitoring (MD5 hash comparison against stored baselines)
   - Changedetection.io (browser-based monitoring for JS-heavy pages)
   - Gmail alerts (Google Alerts + F5Bot via shared label)
   - News search (SearXNG, depth varies by competitor tier)
   - Regulatory search (industry-specific queries via SearXNG)
   - Self-search (mentions of your own company)

2. **Filters noise** before the LLM sees it:
   - Pre-LLM keyword filter: each news signal must mention the competitor name/domain OR an industry keyword
   - Regulatory exclusion list: filters out off-topic results (crypto, politics, etc.)
   - Within-run deduplication: merges same event across sources (Jaccard similarity > 0.5)
   - Cross-run deduplication: suppresses signals that appeared in previous 2 runs

3. **Analyzes with Claude** using your strategy context:
   - Scores signals against your positioning, ICP, and competitive dynamics
   - Categorizes into Strategic Signals / Notable Changes / Regulatory / Background
   - Identifies cross-run patterns

4. **Delivers an HTML email digest** with tiered sections

5. **Persists state** in Google Sheets (URL hashes, previous signals, history log)

---

## Step-by-Step Setup

### Step 1: Infrastructure

Run `docker-compose up -d` from the repo root. This starts:
- **n8n** on port 5678 (workflow automation)
- **changedetection.io** on port 5555 (browser-based monitoring)
- **SearXNG** on port 8888 (privacy-respecting search)
- **Playwright Chrome** (headless browser for changedetection.io)

Verify all containers are running: `docker ps` should show 4 containers.

**SearXNG configuration:** After first start, SearXNG needs its search engines enabled. Open `http://localhost:8888/preferences` and enable the news engines you want (Google News, Bing News, DuckDuckGo). Alternatively, edit the SearXNG settings file in the Docker volume to enable engines and JSON output format by default.

### Step 2: Import the Workflow

1. Open n8n at `http://localhost:5678`
2. Go to Workflows → Import from File
3. Import `workflow/competitive-intel.json`
4. The workflow will appear with placeholder values that you need to fill in

### Step 3: Set Up Credentials in n8n

You need three credentials configured in the n8n UI:

**Google Sheets (Service Account):** Add a Google Sheets API credential using service account authentication. Paste your JSON key.

**Gmail (OAuth2):** Add a Gmail OAuth2 credential. Requires a Google Cloud project with Gmail API enabled. See [n8n Gmail credential docs](https://docs.n8n.io/integrations/builtin/credentials/google/) for setup.

**Anthropic API (Header Auth):** Add a Header Auth credential. Name: `x-api-key`, Value: your Anthropic API key.

### Step 4: Configure the Workflow

Open each node and replace placeholder values:

#### Node: "Run Metadata"
Replace `YOUR_GOOGLE_SHEET_ID` with your actual Google Sheet ID (the long string in the Sheet URL).

#### Node: "Build Request List"
This is the main configuration node. Replace the entire `COMPETITORS` array with your actual competitors. Use this structure:

```javascript
const COMPETITORS = [
  // Tier A: Deep monitoring (3-5 competitors)
  {
    name: 'Actual Competitor Name',
    altNames: ['Alt Name', 'Product Name'],
    tier: 'A',
    domain: 'competitor.com',
    urls: [
      'https://www.competitor.com',
      'https://www.competitor.com/pricing',
      'https://www.competitor.com/blog',
      // Add more verified URLs
    ],
    people: ['CEO Name', 'CPO Name'],
    languages: ['en'],  // Add local language if relevant
  },
  // ... more Tier A competitors

  // Tier B: Moderate monitoring (3-5 competitors)
  {
    name: 'Another Competitor',
    altNames: [],
    tier: 'B',
    domain: 'another.com',
    urls: [
      'https://www.another.com',
      'https://www.another.com/pricing',
    ],
    people: [],
    languages: ['en'],
  },
  // ... more Tier B competitors

  // Tier C: Passive only (2-4 competitors)
  {
    name: 'Peripheral Competitor',
    altNames: [],
    tier: 'C',
    domain: 'peripheral.com',
    urls: [],      // No URLs for Tier C
    people: [],
    languages: [],
  },
];
```

Also replace in the same node:
- **Search queries**: Update the SearXNG query patterns with your industry terms
- **Self-search queries**: Replace `[Your Company]` with your actual company name
- **Local language terms**: If your market isn't English-only, add local language search terms

#### Node: "Process Results"
Replace the keyword arrays:

```javascript
const INDUSTRY_KEYWORDS = [
  // Replace with YOUR industry keywords. Examples:
  // Project management: 'project planning', 'resource allocation', 'gantt', 'agile'
  // HR tech: 'talent acquisition', 'employee engagement', 'HRIS', 'onboarding'
  // Cybersecurity: 'compliance', 'risk management', 'governance', 'audit', 'penetration testing'
];

const REGULATORY_EXCLUDE = [
  // Terms that cause false positives for YOUR industry
  'stablecoin', 'cryptocurrency',
  // ... terms that share names with your competitors but mean something else
];
```

#### Node: "Build LLM Prompt"
Replace the strategy context section in the system prompt:

```
## Strategy Context

[Your Company] is a [description] platform positioned as [positioning]
between [expensive enterprise alternative] and [basic alternative].
Key differentiator: [what makes you unique].

Market: [geographic focus]. Primary ICP: [segments with characteristics].
Entry use cases: [how customers first buy].

Competitive position: [what you win on]. [What you're worried about].
[Key regulatory or market tailwinds].
```

Also replace:
- **Competitor Tiers section**: List your actual competitors organized by tier
- **Company name**: Replace all `[Your Company]` references

#### Node: "Build HTML Email"
Replace `[Your Company]` in the email subject and footer.

#### Node: "Send Digest Email"
Replace `your@email.com` with your actual recipient email. Add multiple recipients by separating with commas.

#### All Google Sheets Nodes
Replace `YOUR_GOOGLE_SHEET_ID` in every Google Sheets node (there are 7 of them).

#### Node: "Read Gmail Alerts"
Update the label filter to match your Gmail label name. Use `q: "label:your-label-name"` format (spaces become hyphens).

#### Node: "Fetch CD Watches"
Replace `YOUR_CHANGEDETECTION_API_KEY` with your changedetection.io API key (found in changedetection.io Settings).

### Step 5: Set Up Changedetection.io Watches

1. Open changedetection.io at `http://localhost:5555`
2. Add watches for competitor pages that are JS-heavy or Cloudflare-protected
3. Use the Playwright browser option for each watch
4. Good candidates: G2 review pages, pricing pages behind JS frameworks, single-page apps

### Step 6: Set Up Google Sheet

Create a Google Sheet with exactly 4 tabs (case-sensitive names):
- **State** — columns: Competitor, URL, Type, ContentHash, LastChecked, LastChanged
- **PreviousSignals** — columns: Date, Title, Competitor, Source, SignalType, Summary
- **History** — columns: Timestamp, Competitor, Title, Type, Category, Date
- **Changedetection** — (optional, for manual tracking)

Share the sheet with your service account email as Editor.

### Step 7: Test Run

1. Click "Execute Workflow" in n8n (manual run)
2. Check each node's output for errors
3. Common issues:
   - **Google Sheets "not found"**: Sheet ID is wrong, or not shared with service account
   - **Gmail "unauthorized"**: OAuth token expired, re-authenticate in credentials
   - **SearXNG connection refused**: Docker container not running, check `docker ps`
   - **URL fetch errors**: Some competitor URLs return 403/404 — remove broken URLs
4. Review the email output for noise. If >10% of signals are irrelevant, tighten your keyword lists
5. The first run establishes URL hash baselines — no URL changes will be detected until the second run

### Step 8: Activate

Once the test run looks good:
1. Set the Schedule Trigger to your desired cadence (default: 1st and 15th at 9 AM UTC)
2. Toggle the workflow to Active
3. Monitor the first 2-3 automated runs, then adjust cadence if needed

---

## Customization Guide

### Changing the Schedule

Edit the "Schedule Trigger" node. The cron expression `0 9 1,15 * *` means "9 AM UTC on the 1st and 15th." Change to:
- Weekly: `0 9 * * 1` (every Monday at 9 AM)
- Monthly: `0 9 1 * *` (1st of each month)

### Adding a New Competitor

1. Add to the `COMPETITORS` array in "Build Request List" with appropriate tier
2. Add Google Alerts for the company name
3. If Tier A/B: verify URLs return HTTP 200
4. If JS-heavy pages: add to changedetection.io
5. Update the competitor tiers in the "Build LLM Prompt" system prompt

### Removing a Competitor

1. Remove from `COMPETITORS` array in "Build Request List"
2. Remove from competitor tiers in "Build LLM Prompt"
3. Remove Google Alerts and F5Bot keywords

### Changing the LLM

The workflow uses Claude (Anthropic API) via HTTP Request. To use a different LLM:
1. Update the "Call Claude API" node URL and headers
2. Adjust the request body format for your LLM's API
3. Update "Parse LLM Response" if the response format differs

### Adding Recipients

Edit the "Send Digest Email" node. Separate multiple emails with commas.

---

## Tuning Your First Runs

The first run establishes baselines — no URL changes will be detected. The real tuning starts with run 2-3.

**After each of your first 3 runs:**
1. Open the Process Results node output in n8n
2. Read each signal title. Is it genuinely about a competitor or your industry?
3. Count relevant vs. irrelevant signals. Your target: >90% relevant
4. If noise is high:
   - Add terms to `REGULATORY_EXCLUDE` for off-topic results
   - Tighten search queries with more specific industry context
   - Add missing competitor alt-names that aren't being matched
5. Review the email output — is the LLM analysis tied to your strategy, or generic?
   - If generic: your strategy context needs more specifics

Cross-run pattern detection needs 3+ runs to be useful. Don't expect the "Patterns" section to be meaningful until run 4-5.

---

## Troubleshooting

### "No signals" on every run
- Check SearXNG is running (`curl http://localhost:8888`)
- Check your search queries actually return results (test in SearXNG UI)
- Check Gmail label exists and has emails tagged

### High noise ratio
- Tighten `INDUSTRY_KEYWORDS` in Process Results
- Add terms to `REGULATORY_EXCLUDE`
- Make search queries more specific (add industry context keywords)

### URL monitoring shows no changes
- First run is baseline only — wait for second run
- Check URLs return 200: `curl -s -o /dev/null -w "%{http_code}" "URL"`
- Minor copy edits trigger detection — the LLM filters for significance

### Changedetection.io shows no results
- Verify Docker containers are running: `docker ps`
- Check API key is correct
- Verify watches are configured in the changedetection.io UI
- Check `http://localhost:5555/api/v1/watch` returns data

### Gmail alerts not appearing
- Verify the Gmail label exists and emails are tagged
- Check the label name matches (spaces become hyphens in `q:` syntax)
- Re-authenticate Gmail OAuth if token expired
