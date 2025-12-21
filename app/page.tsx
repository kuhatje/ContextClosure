import RepoRunner from "@/app/components/RepoRunner";

export default function HomePage() {
  return (
    <main className="grid" style={{ gap: 20 }}>
      <header className="card" style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}>
        <h1 style={{ margin: 0, color: "#0b1221" }}>Sliding Context Window</h1>
        <p style={{ marginTop: 8, color: "#0b1221" }}>
          A prototype that turns noisy signals into a weighted DAG (directed, acyclic graph) of
          info chunks, then solves for the maximum-value closure you can fit in context.
        </p>
        <p style={{ marginTop: 12, color: "#0b1221" }}>
          The brains behind this system is an optimal-closure solver (solves via min-cut) that selects self-contained,
          high-utility selections ready for general context-sensitive analysis.
        </p>

        <p style={{ marginTop: 12, color: "#0b1221" }}>
Try it out for yourself!        </p>
      </header>

      <RepoRunner />
    </main>
  );
}
