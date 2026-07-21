import phrases from './phrases.json';
import assessments from './assessments.json';

type Category = 'verdict' | 'probability' | 'fascinating' | 'emotion' | 'advice';
type Phrase = { id: number; category: Category; phrase: string };

const VALID_CATEGORIES: Category[] = ['verdict', 'probability', 'fascinating', 'emotion', 'advice'];
const PHRASES = phrases as Phrase[];
const ASSESSMENTS = assessments as string[];

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

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: stdHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
  });
}

function text(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: stdHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }),
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const isText = url.searchParams.get('format') === 'text';

    // GET /health
    if (url.pathname === '/health') {
      const status = 'functioning within normal parameters';
      return isText ? text(status) : json({ status });
    }

    // GET /logic[?category=X][&format=text]
    if (url.pathname === '/logic') {
      const catParam = url.searchParams.get('category');
      let pool = PHRASES;

      if (catParam !== null) {
        if (!VALID_CATEGORIES.includes(catParam as Category)) {
          return json({ error: 'That category is illogical.', valid_categories: VALID_CATEGORIES }, 400);
        }
        pool = PHRASES.filter((p) => p.category === catParam);
      }

      const picked = pick(pool);
      return isText
        ? text(picked.phrase)
        : json({ phrase: picked.phrase, category: picked.category, probability_of_success: pseudoProbability() });
    }

    // GET /categories
    if (url.pathname === '/categories') {
      const categories = VALID_CATEGORIES.map((name) => ({
        name,
        count: PHRASES.filter((p) => p.category === name).length,
      }));
      return isText
        ? text(categories.map((c) => `${c.name}: ${c.count}`).join('\n'))
        : json({ categories });
    }

    // GET /assess?claim=<string>
    if (url.pathname === '/assess') {
      const raw = url.searchParams.get('claim');

      if (raw === null || raw.trim() === '') {
        const err = { error: 'A claim is required. Logic cannot assess a vacuum.' };
        return isText ? text(err.error, 400) : json(err, 400);
      }

      if (raw.length > 280) {
        const err = { error: 'Brevity is logical. Your claim is not.' };
        return isText ? text(err.error, 413) : json(err, 413);
      }

      const claim = escapeHtml(raw);
      const verdict = `After analysis, the claim '${claim}' is illogical.`;
      const reasoning = pick(ASSESSMENTS);
      const probability_of_success = pseudoProbability();

      return isText
        ? text(`${verdict}\n${reasoning}`)
        : json({ claim, verdict, reasoning, probability_of_success });
    }

    // 404
    return json({ error: 'The requested resource does not exist. A predictable outcome.' }, 404);
  },
} satisfies ExportedHandler;
