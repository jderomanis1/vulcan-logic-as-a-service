import phrases from './phrases.json';
import assessments from './assessments.json';
import rebuttals from './rebuttals.json';
import { landingHtml } from './landing';

type Category = 'verdict' | 'probability' | 'fascinating' | 'emotion' | 'advice';
type RebuttalCat = Category | 'assessment';
type Phrase = { id: number; category: Category; phrase: string };
type Rebuttal = { id: number; category: RebuttalCat; rebuttal: string };

const VALID_CATEGORIES: Category[] = ['verdict', 'probability', 'fascinating', 'emotion', 'advice'];
const PHRASES = phrases as Phrase[];
const ASSESSMENTS = assessments as string[];
const REBUTTALS = rebuttals as Rebuttal[];

function pseudoProbability(): string {
  return (Math.random() * 11.9999 + 0.0001).toFixed(4) + '%';
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function stdHeaders(extra: Record<string, string> = {}): HeadersInit {
  return { 'Access-Control-Allow-Origin': '*', 'X-Live-Long': 'and-prosper', ...extra };
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: stdHeaders({ 'Content-Type': 'application/json; charset=utf-8', ...extra }),
  });
}

function text(body: string, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(body, {
    status,
    headers: stdHeaders({ 'Content-Type': 'text/plain; charset=utf-8', ...extra }),
  });
}

function pickRebuttal(cat: RebuttalCat): string {
  return pick(REBUTTALS.filter((r) => r.category === cat)).rebuttal;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';
    const method = request.method;

    // OPTIONS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: stdHeaders({
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        }) as Record<string, string>,
      });
    }

    // Method guard
    if (method !== 'GET' && method !== 'HEAD') {
      return json(
        { error: 'That method is illogical. GET is the only rational choice.' },
        405,
        { Allow: 'GET, HEAD' },
      );
    }

    const isText = url.searchParams.get('format') === 'text';
    const modeParam = url.searchParams.get('mode')?.toLowerCase() ?? null;
    const isMcCoy = modeParam === 'mccoy';
    const badMode = modeParam !== null && !isMcCoy;
    const mccoyHdr = isMcCoy ? { 'X-Dammit': 'im-a-doctor-not-an-api' } : {};

    // GET /
    if (path === '/') {
      return new Response(landingHtml(url.origin), {
        headers: stdHeaders({ 'Content-Type': 'text/html; charset=utf-8' }) as Record<string, string>,
      });
    }

    // GET /health
    if (path === '/health') {
      const status = 'functioning within normal parameters';
      return isText ? text(status) : json({ status });
    }

    // GET /logic[?category=X][&mode=mccoy][&format=text]
    if (path === '/logic') {
      if (badMode) {
        const err = { error: 'Unknown mode. The only known antidote to logic is McCoy.' };
        return isText ? text(err.error, 400) : json(err, 400);
      }
      const catParam = url.searchParams.get('category')?.toLowerCase() ?? null;
      let pool = PHRASES;

      if (catParam !== null) {
        if (!VALID_CATEGORIES.includes(catParam as Category)) {
          return json({ error: 'That category is illogical.', valid_categories: VALID_CATEGORIES }, 400);
        }
        pool = PHRASES.filter((p) => p.category === catParam);
      }

      const picked = pick(pool);
      const rebuttal = isMcCoy ? pickRebuttal(picked.category) : undefined;
      if (isText) {
        const out = isMcCoy ? `${picked.phrase}\n${rebuttal}` : picked.phrase;
        return text(out, 200, mccoyHdr);
      }
      return json(
        { phrase: picked.phrase, category: picked.category, probability_of_success: pseudoProbability(), ...(isMcCoy && { rebuttal }) },
        200,
        mccoyHdr,
      );
    }

    // GET /categories
    if (path === '/categories') {
      const categories = VALID_CATEGORIES.map((name) => ({
        name,
        count: PHRASES.filter((p) => p.category === name).length,
      }));
      return isText
        ? text(categories.map((c) => `${c.name}: ${c.count}`).join('\n'))
        : json({ categories });
    }

    // GET /assess?claim=<string>[&mode=mccoy][&format=text]
    if (path === '/assess') {
      if (badMode) {
        const err = { error: 'Unknown mode. The only known antidote to logic is McCoy.' };
        return isText ? text(err.error, 400) : json(err, 400);
      }
      const raw = url.searchParams.get('claim');

      if (raw === null || raw.trim() === '') {
        const err = { error: 'A claim is required. Logic cannot assess a vacuum.' };
        return isText ? text(err.error, 400) : json(err, 400);
      }

      const sanitized = raw.replace(/\0/g, '').replace(/\r\n|\r|\n/g, ' ');

      if (sanitized.length > 280) {
        const err = { error: 'Brevity is logical. Your claim is not.' };
        return isText ? text(err.error, 413) : json(err, 413);
      }

      const claim = escapeHtml(sanitized);
      const verdict = `After analysis, the claim '${claim}' is illogical.`;
      const reasoning = pick(ASSESSMENTS);
      const probability_of_success = pseudoProbability();
      const rebuttal = isMcCoy ? pickRebuttal('assessment') : undefined;

      if (isText) {
        const out = isMcCoy ? `${verdict}\n${reasoning}\n${rebuttal}` : `${verdict}\n${reasoning}`;
        return text(out, 200, mccoyHdr);
      }
      return json(
        { claim, verdict, reasoning, probability_of_success, ...(isMcCoy && { rebuttal }) },
        200,
        mccoyHdr,
      );
    }

    // 404
    return json({ error: 'The requested resource does not exist. A predictable outcome.' }, 404);
  },
} satisfies ExportedHandler;
