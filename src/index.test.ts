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

  it('sets X-Dammit-Jim header', async () => {
    const res = await SELF.fetch('http://example.com/logic?mode=mccoy');
    expect(res.headers.get('X-Dammit-Jim')).toBeTruthy();
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

  it('sets X-Dammit-Jim header', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=test&mode=mccoy');
    expect(res.headers.get('X-Dammit-Jim')).toBeTruthy();
  });

  it('unknown mode returns 400 with McCoy error', async () => {
    const res = await SELF.fetch('http://example.com/assess?claim=test&mode=bones');
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Unknown mode. The only known antidote to logic is McCoy.');
  });
});
