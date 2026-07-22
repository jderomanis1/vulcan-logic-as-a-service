![Vulcan Logic as a Service — terminal-style banner with a wireframe salute and the readout: probability of success 0.0417%](assets/vlaas-social-preview.png)

# Vulcan Logic as a Service

[![Test & Deploy](https://github.com/jderomanis1/vulcan-logic-as-a-service/actions/workflows/deploy.yml/badge.svg)](https://github.com/jderomanis1/vulcan-logic-as-a-service/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A free API dispensing original Vulcan-register logic pronouncements.**
In the spirit of [No as a Service](https://noasaservice.com/). Cloudflare Worker. No auth. No rate limit. No mercy.

**Live:** https://vulcan-logic-as-a-service.joederomanis.workers.dev

---

## The signature demo

```
$ curl 'https://vulcan-logic-as-a-service.joederomanis.workers.dev/logic?mode=mccoy'
```

> **Spock:** Your reasoning contains seventeen assumptions. None of them survive scrutiny.

```json
{
  "phrase": "Your reasoning contains seventeen assumptions. None of them survive scrutiny.",
  "category": "verdict",
  "probability_of_success": "5.7407%",
  "rebuttal": "At the end of a long day, no is still just a word. I've heard it from better-credentialed people than you, in worse rooms, with less to work with. I've outlasted all of them."
}
```

> **McCoy:** At the end of a long day, no is still just a word. I've heard it from better-credentialed people than you, in worse rooms, with less to work with. I've outlasted all of them.

---

## Endpoints

### `GET /logic`

Returns a random Vulcan-register pronouncement.

| Parameter | Type | Description |
|---|---|---|
| `category` | string | Filter: `verdict` `probability` `fascinating` `emotion` `advice` |
| `mode` | string | `mccoy` adds a McCoy rebuttal field and `X-Dammit: im-a-doctor-not-an-api` |
| `format` | string | `text` returns plain text instead of JSON |

```bash
# Default
curl https://vulcan-logic-as-a-service.joederomanis.workers.dev/logic
# → {"phrase":"Emotions of this intensity typically precede decisions of diminished quality.",
#    "category":"emotion","probability_of_success":"2.8819%"}

# Filter by category
curl 'https://vulcan-logic-as-a-service.joederomanis.workers.dev/logic?category=advice'
# → {"phrase":"Proceed. But understand that I am tracking the outcome closely.",
#    "category":"advice","probability_of_success":"1.3555%"}

# McCoy mode
curl 'https://vulcan-logic-as-a-service.joederomanis.workers.dev/logic?mode=mccoy'
# → {..., "rebuttal":"I've never once shrunk a goal until the math liked it..."}

# Plain text
curl 'https://vulcan-logic-as-a-service.joederomanis.workers.dev/logic?format=text'
# → Do not confuse the map for the territory. The map has an error you are about to walk into.
```

**Error — unknown category (400):**
```json
{"error":"That category is illogical.","valid_categories":["verdict","probability","fascinating","emotion","advice"]}
```

**Error — unknown mode (400):**
```json
{"error":"Unknown mode. The only known antidote to logic is McCoy."}
```

---

### `GET /assess?claim=<text>`

Assesses a claim with Vulcan severity. **`claim` values must be percent-encoded** (e.g. spaces as `+` or `%20`).

| Parameter | Type | Description |
|---|---|---|
| `claim` | string | **Required.** Max 280 characters. Percent-encode special characters. |
| `mode` | string | `mccoy` adds a rebuttal |
| `format` | string | `text` for plain text |

```bash
curl 'https://vulcan-logic-as-a-service.joederomanis.workers.dev/assess?claim=my+sprint+will+finish+on+time'
```

```json
{
  "claim": "my sprint will finish on time",
  "verdict": "After analysis, the claim 'my sprint will finish on time' is illogical.",
  "reasoning": "Logic permits no exceptions. This claim requests several.",
  "probability_of_success": "3.0257%"
}
```

**With McCoy:**
```bash
curl 'https://vulcan-logic-as-a-service.joederomanis.workers.dev/assess?claim=this+will+work&mode=mccoy'
```
```json
{
  "claim": "this will work",
  "verdict": "After analysis, the claim 'this will work' is illogical.",
  "reasoning": "Logic permits no exceptions. This claim requests several.",
  "probability_of_success": "7.3139%",
  "rebuttal": "The reasoning is sound and the answer is no. In my experience, no is not always the last thing that happens. Sometimes it's the first draft."
}
```

**Errors:**

| Status | Condition | Body |
|---|---|---|
| 400 | Missing `claim` | `{"error":"A claim is required. Logic cannot assess a vacuum."}` |
| 400 | Empty `claim` | same |
| 413 | `claim` > 280 chars | `{"error":"Brevity is logical. Your claim is not."}` |

---

### `GET /categories`

Returns all categories and their phrase counts.

```bash
curl https://vulcan-logic-as-a-service.joederomanis.workers.dev/categories
```
```json
{
  "categories": [
    {"name":"verdict","count":60},
    {"name":"probability","count":50},
    {"name":"fascinating","count":45},
    {"name":"emotion","count":45},
    {"name":"advice","count":50}
  ]
}
```

---

### `GET /health`

```bash
curl https://vulcan-logic-as-a-service.joederomanis.workers.dev/health
# → {"status":"functioning within normal parameters"}
```

---

### Standard headers (all responses)

| Header | Value |
|---|---|
| `Access-Control-Allow-Origin` | `*` |
| `X-Live-Long` | `and-prosper` |
| `X-Dammit` | `im-a-doctor-not-an-api` *(mode=mccoy only)* |

---

## One-liner integrations

**bash alias** — add to `~/.bashrc` or `~/.zshrc`:
```bash
alias spock='curl -s "https://vulcan-logic-as-a-service.joederomanis.workers.dev/logic" | jq -r .phrase'
alias mccoy='curl -s "https://vulcan-logic-as-a-service.joederomanis.workers.dev/logic?mode=mccoy" | jq -r "[.phrase, .rebuttal] | join(\"\n---\n\")"'
```

**Python one-liner:**
```python
python3 -c "import urllib.request,json; d=json.loads(urllib.request.urlopen('https://vulcan-logic-as-a-service.joederomanis.workers.dev/logic').read()); print(d['phrase'])"
```

**GitHub Actions — post on failure:**
```yaml
- name: Consult Logic on failure
  if: failure()
  run: |
    curl -s "https://vulcan-logic-as-a-service.joederomanis.workers.dev/assess?claim=this+build+will+pass&mode=mccoy" \
      | jq -r '"Spock: \(.verdict)\nMcCoy: \(.rebuttal)"'
```

**Slack incoming webhook — daily standup motivator:**
```bash
PHRASE=$(curl -s "https://vulcan-logic-as-a-service.joederomanis.workers.dev/logic?category=advice" | jq -r .phrase)
curl -s -X POST "$SLACK_WEBHOOK" \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"*Vulcan Standup Wisdom:* $PHRASE\"}"
```

---

## Contributing phrases

All 250 phrases and 100 McCoy rebuttals are in `src/phrases.json` and `src/rebuttals.json`.
PRs adding new entries are welcome — the bar is register fidelity and originality.

**Schema — phrase:**
```json
{ "id": 251, "category": "verdict", "phrase": "Your conclusion is not wrong. It is merely unsupported by anything." }
```

**Schema — rebuttal:**
```json
{ "id": 101, "category": "advice", "rebuttal": "I've been told the logical path is clear. I've also been told the weather was clear the day the tree fell on the ambulance." }
```

**Rules:**
- `phrase` ≤ 160 characters; `rebuttal` ≤ 200 characters
- Vulcan register (precise, deadpan, faintly superior) for phrases; McCoy voice (direct, emotional, clinical-but-human) for rebuttals
- **No scripted Star Trek dialogue** — not even a close paraphrase. Original words only.
- No duplicate text (case-insensitive)
- `id` must be unique and sequential

**Workflow:**
```bash
git checkout -b add-phrases
# edit src/phrases.json or src/rebuttals.json
npm run validate   # catches schema errors, dupes, length, minimum counts
npm test           # full suite must stay green
git commit -m "Add N phrases: category"
```

The validation script enforces minimums per category and will fail the PR if anything is malformed.

---

## Running locally

```bash
npm install
npm test          # validate + vitest
npm run dev       # wrangler dev → http://localhost:8787
npm run deploy    # push to Cloudflare (requires CLOUDFLARE_API_TOKEN in env)
```

---

## Disclaimer

*This is an independent fan project created as a parody/homage. It is not affiliated with, endorsed by, or connected to Paramount Global, CBS Studios, or any rights holders of the Star Trek franchise. All phrases are entirely original writing; no scripted Star Trek dialogue has been used or paraphrased. "Star Trek" and related marks are trademarks of Paramount. This project is non-commercial and intended solely for humor and developer joy.*
