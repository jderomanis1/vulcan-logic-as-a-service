# Changelog

## v1.0.0 — 2026-07-22

Initial public release.

### Added

- **`GET /logic`** — returns a random Vulcan-register pronouncement with `phrase`, `category`, and `probability_of_success`
- **`GET /logic?category=<name>`** — filters by `verdict`, `probability`, `fascinating`, `emotion`, or `advice`
- **`GET /logic?format=text`** — plain-text response
- **`GET /logic?mode=mccoy`** — adds McCoy `rebuttal` field and `X-Dammit: im-a-doctor-not-an-api` header
- **`GET /assess?claim=<text>`** — Vulcan assessment of a user-supplied claim (max 280 chars); returns `claim`, `verdict`, `reasoning`, `probability_of_success`; HTML-escapes `<`, `>` in output
- **`GET /assess?mode=mccoy`** — adds McCoy rebuttal to assessment
- **`GET /categories`** — lists all 5 categories with phrase counts
- **`GET /health`** — liveness check
- **`GET /`** — dark retro-terminal landing page with interactive logic terminal, category chips, McCoy toggle, and copyable curl examples
- **250 original Vulcan-register phrases** across 5 categories (60 verdict, 50 probability, 45 fascinating, 45 emotion, 50 advice)
- **100 original McCoy-voice rebuttals** across 6 categories (including `assessment`)
- **Validation script** (`scripts/validate-phrases.ts`) enforcing schema, uniqueness, length, and per-category minimums — runs before every test
- **GitHub Actions CI/CD** — push to `main` runs tests then deploys to Cloudflare Workers
- Standard CORS (`Access-Control-Allow-Origin: *`) and `X-Live-Long: and-prosper` on all responses
