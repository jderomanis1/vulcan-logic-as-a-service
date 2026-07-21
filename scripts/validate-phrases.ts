import phrases from '../src/phrases.json' with { type: 'json' };

type Category = 'verdict' | 'probability' | 'fascinating' | 'emotion' | 'advice';
type Phrase = { id: number; category: Category; phrase: string };

const VALID_CATEGORIES: Category[] = ['verdict', 'probability', 'fascinating', 'emotion', 'advice'];
const MIN_COUNTS: Record<Category, number> = { verdict: 60, probability: 50, fascinating: 45, emotion: 45, advice: 50 };
const MAX_LENGTH = 160;

const data = phrases as Phrase[];
const errors: string[] = [];

// Schema
data.forEach((p, i) => {
  if (typeof p.id !== 'number') errors.push(`[${i}] id is not a number`);
  if (!VALID_CATEGORIES.includes(p.category)) errors.push(`[${i}] invalid category: ${p.category}`);
  if (typeof p.phrase !== 'string' || p.phrase.trim() === '') errors.push(`[${i}] phrase is empty or not a string`);
  if (p.phrase.length > MAX_LENGTH) errors.push(`[${i}] phrase too long (${p.phrase.length} chars): ${p.phrase.slice(0, 60)}…`);
});

// Unique ids
const ids = data.map((p) => p.id);
const dupeIds = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupeIds.length) errors.push(`Duplicate ids: ${[...new Set(dupeIds)].join(', ')}`);

// No duplicate phrases (case-insensitive)
const normalized = data.map((p) => p.phrase.toLowerCase().trim());
const dupePhrases = normalized.filter((p, i) => normalized.indexOf(p) !== i);
if (dupePhrases.length) errors.push(`Duplicate phrases (${dupePhrases.length}): ${dupePhrases[0].slice(0, 60)}…`);

// Category counts
const counts = Object.fromEntries(VALID_CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
data.forEach((p) => counts[p.category]++);
VALID_CATEGORIES.forEach((c) => {
  if (counts[c] < MIN_COUNTS[c]) errors.push(`Category '${c}' has ${counts[c]} phrases (need ≥${MIN_COUNTS[c]})`);
});

if (errors.length) {
  console.error('Validation FAILED:');
  errors.forEach((e) => console.error('  ✗', e));
  process.exit(1);
}

console.log('Validation passed ✓');
VALID_CATEGORIES.forEach((c) => console.log(`  ${c}: ${counts[c]}`));
console.log(`  total: ${data.length}`);
