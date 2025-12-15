export type ChunkId = string;

export type SourceType = "github:pr" | "github:issue" | "slack" | "code" | "ticket" | "doc";

export interface Chunk {
  id: ChunkId;
  title: string;
  summary: string;
  sourceType: SourceType;
  sourceRef?: string;
  weight: number;
  component?: string;
  tags?: string[];
  activityScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Edge {
  from: ChunkId;
  to: ChunkId;
  rationale?: string;
}

export interface Signal {
  id: string;
  chunkId: ChunkId;
  type: "commit" | "issue" | "discussion" | "doc";
  title: string;
  url?: string;
  ts: string;
  meta?: Record<string, unknown>;
}

export interface Graph {
  chunks: Record<ChunkId, Chunk>;
  edges: Edge[];
}

export interface ClosureSolution {
  closure: ChunkId[];
  totalWeight: number;
  size: number;
  penalty?: number;
}
