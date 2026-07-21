import phrases from '../src/phrases.json' with { type: 'json' };
import rebuttals from '../src/rebuttals.json' with { type: 'json' };

type Category = 'verdict' | 'probability' | 'fascinating' | 'emotion' | 'advice';
type RebuttalCat = Category | 'assessment';
type Phrase = { id: number; category: Category; phrase: string };
type Rebuttal = { id: number; category: RebuttalCat; rebuttal: string };

const VALID_CATEGORIES: Category[] = ['verdict', 'probability', 'fascinating', 'emotion', 'advice'];
const VALID_REBUTTAL_CATS: RebuttalCat[] = [...VALID_CATEGORIES, 'assessment'];
const MIN_PHRASE_COUNTS: Record<Category, number> = { verdict: 60, probability: 50, fascinating: 45, emotion: 45, advice: 50 };
const MIN_REBUTTAL_COUNTS: Record<RebuttalCat, number> = { verdict: 15, probability: 15, fascinating: 15, emotion: 15, advice: 15, assessment: 15 };

const errors: string[] = [];

// ── phrases.json ──────────────────────────────────────────────────────────────
const phraseData = phrases as Phrase[];

phraseData.forEach((p, i) => {
  if (typeof p.id !== 'number') errors.push(`phrases[${i}] id is not a number`);
  if (!VALID_CATEGORIES.includes(p.category)) errors.push(`phrases[${i}] invalid category: ${p.category}`);
  if (typeof p.phrase !== 'string' || p.phrase.trim() === '') errors.push(`phrases[${i}] phrase is empty or not a string`);
  if (p.phrase.length > 160) errors.push(`phrases[${i}] too long (${p.phrase.length} chars): ${p.phrase.slice(0, 60)}…`);
});

const phraseIds = phraseData.map((p) => p.id);
const dupePhraseIds = phraseIds.filter((id, i) => phraseIds.indexOf(id) !== i);
if (dupePhraseIds.length) errors.push(`phrases: duplicate ids: ${[...new Set(dupePhraseIds)].join(', ')}`);

const normalizedPhrases = phraseData.map((p) => p.phrase.toLowerCase().trim());
const dupePhrases = normalizedPhrases.filter((p, i) => normalizedPhrases.indexOf(p) !== i);
if (dupePhrases.length) errors.push(`phrases: ${dupePhrases.length} duplicate text(s): ${dupePhrases[0].slice(0, 60)}…`);

const phraseCounts = Object.fromEntries(VALID_CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
phraseData.forEach((p) => phraseCounts[p.category]++);
VALID_CATEGORIES.forEach((c) => {
  if (phraseCounts[c] < MIN_PHRASE_COUNTS[c]) errors.push(`phrases: category '${c}' has ${phraseCounts[c]} (need ≥${MIN_PHRASE_COUNTS[c]})`);
});

// ── rebuttals.json ────────────────────────────────────────────────────────────
const rebuttalData = rebuttals as Rebuttal[];

rebuttalData.forEach((r, i) => {
  if (typeof r.id !== 'number') errors.push(`rebuttals[${i}] id is not a number`);
  if (!VALID_REBUTTAL_CATS.includes(r.category)) errors.push(`rebuttals[${i}] invalid category: ${r.category}`);
  if (typeof r.rebuttal !== 'string' || r.rebuttal.trim() === '') errors.push(`rebuttals[${i}] rebuttal is empty or not a string`);
  if (r.rebuttal.length > 200) errors.push(`rebuttals[${i}] too long (${r.rebuttal.length} chars): ${r.rebuttal.slice(0, 60)}…`);
});

const rebuttalIds = rebuttalData.map((r) => r.id);
const dupeRebuttalIds = rebuttalIds.filter((id, i) => rebuttalIds.indexOf(id) !== i);
if (dupeRebuttalIds.length) errors.push(`rebuttals: duplicate ids: ${[...new Set(dupeRebuttalIds)].join(', ')}`);

const normalizedRebuttals = rebuttalData.map((r) => r.rebuttal.toLowerCase().trim());
const dupeRebuttals = normalizedRebuttals.filter((r, i) => normalizedRebuttals.indexOf(r) !== i);
if (dupeRebuttals.length) errors.push(`rebuttals: ${dupeRebuttals.length} duplicate text(s): ${dupeRebuttals[0].slice(0, 60)}…`);

const rebuttalCounts = Object.fromEntries(VALID_REBUTTAL_CATS.map((c) => [c, 0])) as Record<RebuttalCat, number>;
rebuttalData.forEach((r) => rebuttalCounts[r.category]++);
VALID_REBUTTAL_CATS.forEach((c) => {
  if (rebuttalCounts[c] < MIN_REBUTTAL_COUNTS[c]) errors.push(`rebuttals: category '${c}' has ${rebuttalCounts[c]} (need ≥${MIN_REBUTTAL_COUNTS[c]})`);
});

// ── report ────────────────────────────────────────────────────────────────────
if (errors.length) {
  console.error('Validation FAILED:');
  errors.forEach((e) => console.error('  ✗', e));
  process.exit(1);
}

console.log('Validation passed ✓');
console.log('  phrases:');
VALID_CATEGORIES.forEach((c) => console.log(`    ${c}: ${phraseCounts[c]}`));
console.log(`    total: ${phraseData.length}`);
console.log('  rebuttals:');
VALID_REBUTTAL_CATS.forEach((c) => console.log(`    ${c}: ${rebuttalCounts[c]}`));
console.log(`    total: ${rebuttalData.length}`);
