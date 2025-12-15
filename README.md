# Context Closure (prototype)

Next.js prototype that turns multi-source activity (code, issues, chat) into a weighted DAG of documentation chunks and uses an optimal-closure solver to pick the most valuable, self-contained context for updates or LLM prompts.

## Running locally
1) `npm install`  
2) Ensure `python3` is available on PATH (used by the closure solver).  
3) `npm run dev` (API routes: `/api/closure`, `/api/ingest`, `/api/query`)  
Optional: `GITHUB_TOKEN=<token> npm run dev` for higher GitHub rate limits when hitting `/api/ingest?repo=owner/name` (unauthenticated works but is limited to 60/hr).

## Core data model
- `Chunk`: bounded piece of context (id, title, summary, sourceType, weight, component, tags, timestamps, sourceRef).
- `Edge`: directed dependency `from -> to` meaning `from` relies on `to`; closures must include all dependencies.
- `Signal` (for ingestion): raw events such as GitHub issues/PRs, commits, Slack threads.
- `Graph`: `{ chunks: Record<id, Chunk>; edges: Edge[] }`.

## Optimal-closure solver
- Implemented in Python (`scripts/closure_solver.py`) and invoked from Node via `lib/closure.ts`.  
- Classic reduction of maximum-weight closure to s-t min-cut (Dinic). Positive `(weight - penalty)` edges go `source -> node`; negatives go `node -> sink`; dependency edges carry effectively infinite capacity. Nodes reachable from source form the closure.  
- `maximumWeightClosure(graph)`: unconstrained optimum.  
- `solveClosureBySize(graph, k)`: binary searches a per-node penalty to steer the closure toward size `k` (keeps dependency closure intact).  
- All chunks are bounded; closures are therefore context-window friendly.

## Ingestion
- Mock graph: always available via `/api/closure` and `/api/chunks`.  
- GitHub issues (live): `/api/ingest?repo=owner/name` uses `GITHUB_TOKEN`. Issues become chunks; weights are derived from comments + reactions for a simple v0 signal.

## Query surface
- `/api/closure?size=4`: POST a graph to this endpoint to run the solver. GET will respond with an error (no default graph).  
- `/api/ingest?repo=owner/name&size=4&per_page=50`: pull GitHub issues into a graph and solve closure for a target size. If issues are empty, falls back to open PRs; if both are empty, returns an empty graph/closure. Supports unauthenticated (60/hr) and uses `GITHUB_TOKEN` when present. `per_page` caps at 100 (first page only).  
- UI (`app/page.tsx`): minimal landing with an interactive form to run ingestion/closure on any public repo (no chunk info shown until you run a request).

## Scalability + gaps (noted for follow-up)
- Weight quality and dependency detection are fragile; v0 uses naive GitHub heuristics.  
- Graph freshness/invalidation not implemented; would need incremental ingestion and recomputation.  
- Chunking heuristics (per PR/issue) are simplistic and may over/under-split context.  
- No persistent store yet; API responses are in-memory.

## Generalization note
The same machinery works beyond LLM context: interpret chunks as tasks, weights as project utility, and `k` as available resources; the closure solver then selects the highest-value self-contained project slice. This prototype focuses on the documentation use case but keeps the solver/general structure reusable.
