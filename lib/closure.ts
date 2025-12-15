import { spawnSync } from "child_process";
import path from "path";
import { ClosureSolution, Graph } from "./types";

const solverPath = path.join(process.cwd(), "scripts", "closure_solver.py");

const runPythonSolver = (graph: Graph, size?: number): ClosureSolution => {
  const args = [solverPath];
  if (typeof size === "number") {
    args.push("--size", String(size));
  }

  const result = spawnSync("python3", args, {
    input: JSON.stringify(graph),
    encoding: "utf-8",
    maxBuffer: 5 * 1024 * 1024,
  });

  if (result.error) {
    throw new Error(`Python solver failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Python solver exited with code ${result.status}: ${result.stderr}`);
  }

  const parsed = JSON.parse(result.stdout || "{}") as ClosureSolution;
  if (!parsed || !Array.isArray(parsed.closure)) {
    throw new Error("Python solver returned invalid payload.");
  }
  return parsed;
};

export const maximumWeightClosure = (graph: Graph): ClosureSolution => runPythonSolver(graph);

export const solveClosureBySize = (graph: Graph, k: number): ClosureSolution => {
  const solution = runPythonSolver(graph, k);
  if (solution.size === 0 && Object.keys(graph.chunks).length > 0) {
    const best = maximumWeightClosure(graph);
    const sorted = best.closure
      .map((id) => graph.chunks[id])
      .filter(Boolean)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, k > 0 ? k : 1)
      .map((chunk) => chunk.id);
    const totalWeight = sorted.reduce((acc, id) => acc + (graph.chunks[id]?.weight ?? 0), 0);
    return { closure: sorted, totalWeight, size: sorted.length, penalty: solution.penalty };
  }
  return solution;
};
