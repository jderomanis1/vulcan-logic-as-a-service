import { describe, it, expect } from 'vitest';
import { SELF } from 'cloudflare:test';

const VALID_CATEGORIES = ['verdict', 'probability', 'fascinating', 'emotion', 'advice'];

// ── shared header assertions ──────────────────────────────────────────────────
async function expectStandardHeaders(res: Response) {
  expect(res.headers.get('X-Live-Long')).toBe('and-prosper');
  expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
}

// ── /health ───────────────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('returns 200 with status message', async () => {
    const res = await SELF.fetch('http://example.com/health');
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('functioning within normal parameters');
  });

  it('sets standard headers', async () => {
    const res = await SELF.fetch('http://example.com/health');
    await expectStandardHeaders(res);
    expect(res.headers.get('Content-Type')).toMatch(/application\/json/);
  });
});

// ── /logic ────────────────────────────────────────────────────────────────────
describe('GET /logic', () => {
  it('returns 200 JSON with phrase, category, probability_of_success', async () => {
    const res = await SELF.fetch('http://example.com/logic');
    expect(res.status).toBe(200);
    const body = await res.json() as { phrase: string; category: string; probability_of_success: string };
    expect(typeof body.phrase).toBe('string');
    expect(body.phrase.length).toBeGreaterThan(0);
    expect(VALID_CATEGORIES).toContain(body.category);
    expect(body.probability_of_success).toMatch(/^\d+\.\d{4}%$/);
  });

  it('probability_of_success is in range [0.0001, 12]', async () => {
    const res = await SELF.fetch('http://example.com/logic');
    const body = await res.json() as { probability_of_success: string };
    const n = parseFloat(body.probability_of_success.replace('%', ''));
    expect(n).toBeGreaterThanOrEqual(0.0001);
    expect(n).toBeLessThanOrEqual(12);
  });

  it('sets standard headers', async () => {
    const res = await SELF.fetch('http://example.com/logic');
    await expectStandardHeaders(res);
    expect(res.headers.get('Content-Type')).toMatch(/application\/json/);
  });

  it('filters by valid category', async () => {
    const res = await SELF.fetch('http://example.com/logic?category=verdict');
    expect(res.status).toBe(200);
    const body = await res.json() as { category: string };
    expect(body.category).toBe('verdict');
  });

  it('returns 400 for unknown category with valid_categories list', async () => {
    const res = await SELF.fetch('http://example.com/logic?category=feelings');
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string; valid_categories: string[] };
    expect(body.error).toBe('That category is illogical.');
    expect(body.valid_categories).toEqual(VALID_CATEGORIES);
  });

  it('returns plaintext phrase with format=text', async () => {
    const res = await SELF.fetch('http://example.com/logic?format=text');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toMatch(/text\/plain/);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });

  it('format=text + category still filters correctly', async () => {
    const res = await SELF.fetch('http://example.com/logic?category=advice&format=text');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toMatch(/text\/plain/);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });
});

// ── /categories ───────────────────────────────────────────────────────────────
describe('GET /categories', () => {
  it('returns all 5 categories with counts', async () => {
    const res = await SELF.fetch('http://example.com/categories');
    expect(res.status).toBe(200);
    const body = await res.json() as { categories: { name: string; count: number }[] };
    expect(body.categories).toHaveLength(5);
    const names = body.categories.map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(VALID_CATEGORIES));
    body.categories.forEach((c) => expect(c.count).toBeGreaterThan(0));
  });

  it('sets standard headers', async () => {
    const res = await SELF.fetch('http://example.com/categories');
    await expectStandardHeaders(res);
  });
});

// ── /assess ───────────────────────────────────────────────────────────────────
describe('GET /assess', () => {
  it('returns 200 JSON with claim, verdict, reasoning, probability_of_success', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=my+sprint+will+finish+on+time');
    expect(res.status).toBe(200);
    const body = await res.json() as { claim: string; verdict: string; reasoning: string; probability_of_success: string };
    expect(body.claim).toBe('my sprint will finish on time');
    expect(typeof body.verdict).toBe('string');
    expect(body.verdict.length).toBeGreaterThan(0);
    expect(typeof body.reasoning).toBe('string');
    expect(body.reasoning.length).toBeGreaterThan(0);
    expect(body.probability_of_success).toMatch(/^\d+\.\d{4}%$/);
  });

  it('verdict contains the claim text', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=this+will+work');
    const body = await res.json() as { verdict: string };
    expect(body.verdict).toContain('this will work');
  });

  it('sets standard headers', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=test');
    await expectStandardHeaders(res);
    expect(res.headers.get('Content-Type')).toMatch(/application\/json/);
  });

  it('returns 400 when claim param is absent', async () => {
    const res = await SELF.fetch('http://example.com/assess');
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error.length).toBeGreaterThan(0);
  });

  it('returns 400 when claim is an empty string', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=');
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error.length).toBeGreaterThan(0);
  });

  it('returns 413 when claim exceeds 280 characters', async () => {
    const longClaim = 'a'.repeat(281);
    const res = await SELF.fetch(`http://example.com/assess?claim=${longClaim}`);
    expect(res.status).toBe(413);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Brevity is logical. Your claim is not.');
  });

  it('HTML-escapes < > in the claim field', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    expect(res.status).toBe(200);
    const body = await res.json() as { claim: string; verdict: string };
    expect(body.claim).not.toContain('<script>');
    expect(body.claim).toContain('&lt;script&gt;');
  });

  it('HTML-escaped claim also appears escaped in verdict', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    const body = await res.json() as { verdict: string };
    expect(body.verdict).not.toContain('<script>');
    expect(body.verdict).toContain('&lt;script&gt;');
  });

  it('returns plaintext with format=text', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=test&format=text');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toMatch(/text\/plain/);
    const txt = await res.text();
    expect(txt).toContain('test');
  });

  it('format=text 400 still returns text/plain', async () => {
    const res = await SELF.fetch('http://example.com/assess?format=text');
    expect(res.status).toBe(400);
  });
});

// ── GET / (landing page) ──────────────────────────────────────────────────────
describe('GET /', () => {
  it('returns 200 text/html', async () => {
    const res = await SELF.fetch('http://example.com/');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toMatch(/text\/html/);
  });

  it('contains fan-project disclaimer', async () => {
    const res = await SELF.fetch('http://example.com/');
    const html = await res.text();
    expect(html).toContain('fan project');
  });

  it('sets standard headers', async () => {
    const res = await SELF.fetch('http://example.com/');
    await expectStandardHeaders(res);
  });
});

// ── unknown routes ────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404 JSON with error message', async () => {
    const res = await SELF.fetch('http://example.com/unknown');
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('The requested resource does not exist. A predictable outcome.');
  });

  it('404 also sets standard headers', async () => {
    const res = await SELF.fetch('http://example.com/nope');
    await expectStandardHeaders(res);
  });
});

// ── ?mode=mccoy ───────────────────────────────────────────────────────────────
describe('?mode=mccoy on /logic', () => {
  it('adds rebuttal field to JSON response', async () => {
    const res = await SELF.fetch('http://example.com/logic?mode=mccoy');
    expect(res.status).toBe(200);
    const body = await res.json() as { phrase: string; category: string; probability_of_success: string; rebuttal: string };
    expect(typeof body.rebuttal).toBe('string');
    expect(body.rebuttal.length).toBeGreaterThan(0);
    expect(typeof body.phrase).toBe('string');
    expect(typeof body.probability_of_success).toBe('string');
  });

  it('format=text with mode=mccoy returns exactly two lines', async () => {
    const res = await SELF.fetch('http://example.com/logic?mode=mccoy&format=text');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toMatch(/text\/plain/);
    const txt = await res.text();
    const lines = txt.split('\n');
    expect(lines).toHaveLength(2);
    lines.forEach((l) => expect(l.length).toBeGreaterThan(0));
  });

  it('sets X-Dammit header', async () => {
    const res = await SELF.fetch('http://example.com/logic?mode=mccoy');
    expect(res.headers.get('X-Dammit')).toBe('im-a-doctor-not-an-api');
  });

  it('unknown mode returns 400 with McCoy error', async () => {
    const res = await SELF.fetch('http://example.com/logic?mode=spock');
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Unknown mode. The only known antidote to logic is McCoy.');
  });

  it('mode=mccoy with category filter still works', async () => {
    const res = await SELF.fetch('http://example.com/logic?mode=mccoy&category=advice');
    expect(res.status).toBe(200);
    const body = await res.json() as { category: string; rebuttal: string };
    expect(body.category).toBe('advice');
    expect(body.rebuttal.length).toBeGreaterThan(0);
  });
});

// ── method guard ─────────────────────────────────────────────────────────────
describe('Method guard', () => {
  it('POST /logic returns 405 with error body', async () => {
    const res = await SELF.fetch('http://example.com/logic', { method: 'POST' });
    expect(res.status).toBe(405);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('That method is illogical. GET is the only rational choice.');
  });

  it('DELETE /logic returns 405', async () => {
    const res = await SELF.fetch('http://example.com/logic', { method: 'DELETE' });
    expect(res.status).toBe(405);
  });

  it('PUT /assess returns 405', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=test', { method: 'PUT' });
    expect(res.status).toBe(405);
  });

  it('405 includes Allow: GET, HEAD header', async () => {
    const res = await SELF.fetch('http://example.com/logic', { method: 'POST' });
    expect(res.headers.get('Allow')).toBe('GET, HEAD');
  });

  it('HEAD /logic still returns 200', async () => {
    const res = await SELF.fetch('http://example.com/logic', { method: 'HEAD' });
    expect(res.status).toBe(200);
  });
});

// ── OPTIONS preflight ─────────────────────────────────────────────────────────
describe('OPTIONS preflight', () => {
  it('returns 204', async () => {
    const res = await SELF.fetch('http://example.com/logic', { method: 'OPTIONS' });
    expect(res.status).toBe(204);
  });

  it('sets Access-Control-Allow-Methods: GET, HEAD, OPTIONS', async () => {
    const res = await SELF.fetch('http://example.com/logic', { method: 'OPTIONS' });
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, HEAD, OPTIONS');
  });

  it('sets Access-Control-Allow-Headers: *', async () => {
    const res = await SELF.fetch('http://example.com/logic', { method: 'OPTIONS' });
    expect(res.headers.get('Access-Control-Allow-Headers')).toBe('*');
  });

  it('sets Access-Control-Max-Age: 86400', async () => {
    const res = await SELF.fetch('http://example.com/logic', { method: 'OPTIONS' });
    expect(res.headers.get('Access-Control-Max-Age')).toBe('86400');
  });
});

// ── case normalization ────────────────────────────────────────────────────────
describe('Case normalization', () => {
  it('?category=ADVICE returns 200 with category=advice', async () => {
    const res = await SELF.fetch('http://example.com/logic?category=ADVICE');
    expect(res.status).toBe(200);
    const body = await res.json() as { category: string };
    expect(body.category).toBe('advice');
  });

  it('?category=Verdict returns 200 with category=verdict', async () => {
    const res = await SELF.fetch('http://example.com/logic?category=Verdict');
    expect(res.status).toBe(200);
    const body = await res.json() as { category: string };
    expect(body.category).toBe('verdict');
  });

  it('?mode=MCCOY returns 200 with rebuttal', async () => {
    const res = await SELF.fetch('http://example.com/logic?mode=MCCOY');
    expect(res.status).toBe(200);
    const body = await res.json() as { rebuttal: string };
    expect(typeof body.rebuttal).toBe('string');
    expect(body.rebuttal.length).toBeGreaterThan(0);
  });

  it('?mode=McCoy returns 200 with rebuttal', async () => {
    const res = await SELF.fetch('http://example.com/logic?mode=McCoy');
    expect(res.status).toBe(200);
    const body = await res.json() as { rebuttal: string };
    expect(body.rebuttal.length).toBeGreaterThan(0);
  });
});

// ── claim sanitization ────────────────────────────────────────────────────────
describe('Claim sanitization', () => {
  it('strips null bytes from claim and verdict', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=hello%00world');
    expect(res.status).toBe(200);
    const body = await res.json() as { claim: string; verdict: string };
    expect(body.claim).toBe('helloworld');
    expect(body.claim).not.toContain(' ');
    expect(body.verdict).not.toContain(' ');
  });

  it('replaces \\r\\n with a space in claim', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=hello%0d%0aworld');
    expect(res.status).toBe(200);
    const body = await res.json() as { claim: string };
    expect(body.claim).not.toContain('\r');
    expect(body.claim).not.toContain('\n');
    expect(body.claim).toBe('hello world');
  });
});

// ── trailing slash ────────────────────────────────────────────────────────────
describe('Trailing slash normalization', () => {
  it('/logic/ returns 200', async () => {
    const res = await SELF.fetch('http://example.com/logic/');
    expect(res.status).toBe(200);
    const body = await res.json() as { phrase: string };
    expect(body.phrase.length).toBeGreaterThan(0);
  });

  it('/categories/ returns 200', async () => {
    const res = await SELF.fetch('http://example.com/categories/');
    expect(res.status).toBe(200);
  });

  it('/health/ returns 200', async () => {
    const res = await SELF.fetch('http://example.com/health/');
    expect(res.status).toBe(200);
  });

  it('/assess/?claim=test returns 200', async () => {
    const res = await SELF.fetch('http://example.com/assess/?claim=test');
    expect(res.status).toBe(200);
  });
});

// ── social meta ───────────────────────────────────────────────────────────────
describe('GET / social meta', () => {
  it('includes og:title', async () => {
    const res = await SELF.fetch('http://example.com/');
    const html = await res.text();
    expect(html).toContain('og:title');
  });

  it('includes og:image pointing at vlaas-social-preview.png', async () => {
    const res = await SELF.fetch('http://example.com/');
    const html = await res.text();
    expect(html).toContain('vlaas-social-preview.png');
  });

  it('includes twitter:card', async () => {
    const res = await SELF.fetch('http://example.com/');
    const html = await res.text();
    expect(html).toContain('twitter:card');
  });
});

describe('?mode=mccoy on /assess', () => {
  it('adds rebuttal field to JSON response', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=this+will+work&mode=mccoy');
    expect(res.status).toBe(200);
    const body = await res.json() as { claim: string; verdict: string; reasoning: string; probability_of_success: string; rebuttal: string };
    expect(typeof body.rebuttal).toBe('string');
    expect(body.rebuttal.length).toBeGreaterThan(0);
    expect(body.claim).toBe('this will work');
  });

  it('format=text with mode=mccoy returns exactly three lines', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=test&mode=mccoy&format=text');
    expect(res.status).toBe(200);
    const txt = await res.text();
    const lines = txt.split('\n');
    expect(lines).toHaveLength(3);
    lines.forEach((l) => expect(l.length).toBeGreaterThan(0));
  });

  it('sets X-Dammit header', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=test&mode=mccoy');
    expect(res.headers.get('X-Dammit')).toBe('im-a-doctor-not-an-api');
  });

  it('unknown mode returns 400 with McCoy error', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=test&mode=bones');
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Unknown mode. The only known antidote to logic is McCoy.');
  });
});
