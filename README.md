# Orchestr8

Record a desktop task once — Amazon Nova Pro turns the recording into a semantic, self-healing workflow definition that can be replayed on demand.

[![AWS Bedrock](https://img.shields.io/badge/AWS%20Bedrock-Nova%20Pro-FF9900)](https://aws.amazon.com/bedrock/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> **Status:** hackathon-born, functional prototype. The generation pipeline, REST API, and model-evaluation harness work end to end. Recording and execution happen in a companion desktop agent; the web UI's Run page is currently mocked.

## How it works

The system is built around one loop:

1. **Record once.** A desktop recorder captures a session as a timeline of raw events — clicks with coordinates and element names, individual keystrokes, drags, scrolls, window switches.
2. **Nova Pro generates the workflow.** The backend pre-groups keystroke noise, sends the simplified timeline to Amazon Nova Pro on Bedrock, and validates the model's JSON against Pydantic schemas. The result is a semantic workflow — named steps like "Type the search query", not a replayed mouse path.
3. **Execute repeatedly.** Every step carries a self-healing selector (semantic text selector with a nested coordinate fallback), a retry count, a failure policy, and inferred `WAIT` steps — so an executor survives minor UI drift and slow page loads.

A recording of a click plus eleven keystrokes comes out as two steps:

```json
{
  "step_id": "step-1",
  "action": "CLICK",
  "description": "Click the YouTube search bar",
  "selector": {
    "type": "text",
    "value": "Search",
    "fallback": { "type": "coordinates", "value": { "x": 640, "y": 120 } }
  },
  "retry_count": 3,
  "on_failure": "stop"
},
{
  "step_id": "step-2",
  "action": "TYPE_TEXT",
  "description": "Type the search query",
  "selector": null,
  "parameters": { "text": "rick astley" }
}
```

Generation is more than a prompt ([workflow_generator.py](src/core/workflow_generator.py), [bedrock_client.py](src/services/bedrock_client.py)):

- **Action grouping** — keystroke-level events are collapsed into single `TYPE_TEXT` steps *before* the model sees them, cutting token cost and eliminating the most common grouping mistake.
- **Selector discipline** — the prompt enforces hard rules (mouse actions must carry a selector, keyboard actions must have `selector: null`). The response is parsed, schema-validated, then enriched: missing selectors and coordinates are backfilled from the original event data.
- **Wait inference** — timestamp gaps over 2 s between consecutive events become explicit `WAIT` steps (plus a 1 s buffer, capped at 10 s), so workflows tolerate page loads without hardcoded sleeps.
- **Deterministic fallback** — `use_ai: false` runs the same grouping and wait-inference pipeline rule-based, with no Bedrock call. Useful as a baseline and when the model is unavailable.

## Model selection

The model wasn't picked on vibes. [evaluation/](evaluation/) is a harness that scores candidate Bedrock models — Amazon Nova Pro, Amazon Nova Lite, and Claude 3.5 Sonnet — on a rubric derived from the executor's actual failure modes:

| Metric | Weight | What it catches |
| --- | --- | --- |
| Selector accuracy | 30% | Keyboard steps with selectors, mouse steps without them |
| Element extraction | 25% | Ignoring semantic element names present in the recording |
| DRAG parameters | 15% | Drags missing end coordinates |
| Key format | 15% | Recorder artifacts (`Key.` prefixes) leaking into output |
| Action grouping | 15% | Keystroke sequences not collapsed into one step |

Each model is also measured on latency and cost per 1,000 workflows using Bedrock pricing. The harness emits an Excel side-by-side, score and cost-performance charts, and a decision report.

Nova Pro won on cost-adjusted quality: it held the strict output rules at $0.0008 / $0.0032 per 1K input/output tokens — roughly a quarter of Claude 3.5 Sonnet's price ($0.003 / $0.015) for comparable rubric scores. Nova Lite is an order of magnitude cheaper again but was less reliable at following the selector rules on complex sessions. Nova Pro's multimodal input also leaves room to feed screenshots as element context (see [test_vision_workflow.py](tests/test_vision_workflow.py)).

To rerun the comparison:

```bash
# drop recorded sessions into evaluation/test_cases/{simple,medium,complex}/
python -m evaluation.run_complete_evaluation
```

Reports land in `evaluation/results/analysis/`.

## Architecture

```text
frontend/                        React + TypeScript (Vite, shadcn/ui) — Teach and Run pages
  │  HTTP :5000
frontend/scripts/server.py       Flask bridge — starts/stops the recorder and executor
  │  POST /generate/friend-format
src/api/main.py                  FastAPI — /generate, /generate/friend-format, /health
src/core/workflow_generator.py   grouping · selector enrichment · wait inference · deterministic mode
src/services/bedrock_client.py   Nova Pro prompting and invocation (boto3, adaptive retries)
src/models/                      Pydantic contracts: SessionTimeline in, WorkflowDefinition out
src/tools/format_converter.py    converts the companion recorder's native format
evaluation/                      model-comparison harness (rubric, cost, reports)
tests/                           pytest suite
```

Everything that crosses a boundary is a Pydantic model. The API contract is `SessionTimeline` in, `WorkflowDefinition` out — the same definition the executor consumes.

| Endpoint | Description |
| --- | --- |
| `GET /health` | Bedrock connectivity check and active model id |
| `POST /generate` | `{ "session": SessionTimeline, "use_ai": true }` → `WorkflowDefinition` |
| `POST /generate/friend-format` | Same, but accepts the companion recorder's native format |

## Getting started

Prerequisites: Python 3.10+, Node 18+, an AWS account with Bedrock access in `us-east-1` (AWS Console → Bedrock → Model access → enable Amazon Nova Pro).

```bash
python -m venv venv
venv\Scripts\activate            # source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env
aws configure                    # credentials come from the standard AWS chain, not .env
uvicorn src.api.main:app --reload --port 8000
```

Recorder bridge and frontend, each in its own terminal:

```bash
cd frontend
pip install -r requirements.txt
python scripts/server.py         # http://localhost:5000
```

```bash
cd frontend
npm install
npm run dev                      # http://localhost:8080
```

Tests:

```bash
pytest tests/ -v
```

## License

MIT — see [LICENSE](LICENSE). Built by [Muhammad Masarwa](https://linkedin.com/in/muhammad-masarwa-923662206).
