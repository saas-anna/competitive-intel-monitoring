// Competitor Registry Template
//
// Copy this structure into your n8n Build Request List code node.
// Fill in your actual competitors, URLs, and people.
//
// IMPORTANT: Every URL must be verified before adding.
// Run: curl -s -o /dev/null -w "%{http_code}" "https://competitor.com/pricing"
// Only add URLs that return 200.

const COMPETITORS = [
  // === TIER A: Deep monitoring (3-5 competitors) ===
  // These are your direct, active threats. Full search depth.
  {
    name: 'Competitor Alpha',        // Primary company name
    altNames: ['Alpha Platform'],     // Alternative names, product names, former names
    tier: 'A',
    domain: 'competitor-alpha.com',   // For pre-LLM noise filtering
    urls: [
      'https://www.competitor-alpha.com',           // Homepage - positioning changes
      'https://www.competitor-alpha.com/pricing',    // Pricing page
      'https://www.competitor-alpha.com/blog',       // Blog / news
      // Add more: /changelog, /customers, /integrations, /careers
    ],
    people: ['Jane Smith'],           // CEO, CPO, CRO - for people-specific news search
    languages: ['en'],                // Search languages. Add local language if relevant.
  },
  {
    name: 'Competitor Beta',
    altNames: [],
    tier: 'A',
    domain: 'competitor-beta.com',
    urls: [
      'https://www.competitor-beta.com',
      'https://www.competitor-beta.com/pricing',
    ],
    people: [],
    languages: ['en'],
  },
  // Add 1-3 more Tier A competitors...

  // === TIER B: Moderate monitoring (3-5 competitors) ===
  // Relevant but less immediate. English-only news search.
  {
    name: 'Competitor Gamma',
    altNames: [],
    tier: 'B',
    domain: 'competitor-gamma.com',
    urls: [
      'https://www.competitor-gamma.com',
      'https://www.competitor-gamma.com/pricing',
    ],
    people: [],
    languages: ['en'],
  },
  // Add 2-4 more Tier B competitors...

  // === TIER C: Passive monitoring (2-4 competitors) ===
  // No active API calls. Only caught by Google Alerts / changedetection.io.
  {
    name: 'Competitor Delta',
    altNames: [],
    tier: 'C',
    domain: 'competitor-delta.com',
    urls: [],       // No URLs for Tier C - passive only
    people: [],
    languages: [],
  },
  // Add 1-3 more Tier C competitors...
];


// === SEARCH CONFIGURATION ===

// Industry keywords for pre-LLM noise filtering.
// A signal must mention the competitor name/domain OR one of these keywords.
const INDUSTRY_KEYWORDS = [
  // English terms - replace with your industry
  'your-industry',
  'compliance',
  'risk management',
  // Add 5-10 keywords that define your space
];

// Local language keywords (if your market isn't English-only)
const LOCAL_LANGUAGE_KEYWORDS = [
  // e.g., German: 'Risikomanagement', 'Datenschutz'
  // e.g., French: 'gestion des risques', 'conformité'
];

// Terms that cause false positives - signals containing these are filtered out
const NOISE_EXCLUDE_TERMS = [
  // Add terms that share names with your competitors but mean something else
  // e.g., if competitor is called "Monday": 'day of the week', 'weekly calendar'
  // e.g., if competitor is called "Zendesk" but you're not in support: 'customer support', 'helpdesk'
];

// Regulatory search queries (2-3 focused queries)
const REGULATORY_QUERIES = [
  // Replace with regulations relevant to your industry
  // e.g., 'AI Act GDPR compliance "data protection" regulation 2025 2026'
  // e.g., '"project management" OR "work management" software market 2025 2026'
];

// Self-search queries (how to find mentions of your own company)
const SELF_SEARCH_QUERIES = [
  // e.g., '"Your Company Name"', '"yourcompany.com"'
];
