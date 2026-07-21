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
