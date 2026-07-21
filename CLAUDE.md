# Spock as a Service
Free joke API returning original Vulcan-style logic pronouncements.
Modeled on "No as a Service." Cloudflare Worker, TypeScript, no framework.

## Non-negotiables
- ALL phrases are original writing. NEVER include actual Star Trek dialogue,
  scripted quotes, or close paraphrases. Vulcan *register*, original *words*.
- Keep the core Worker under 200 lines. This is a joke API, not a platform.
- Every increment: write/update tests first (Vitest), run `npm test`, then implement.
- No new dependencies without asking. Current allowed: wrangler, vitest,
  @cloudflare/vitest-pool-workers, typescript.

## Commands
- `npm test` — run Vitest
- `npm run dev` — wrangler dev (local)
- `npm run deploy` — wrangler deploy

## Style
- TypeScript strict mode. No `any`.
- Responses: JSON default, `?format=text` for plaintext, CORS `*` always.
- Humor register: precise, deadpan, faintly superior, never mean.
  Pseudo-precise probabilities ("0.0417%") are the signature joke.
