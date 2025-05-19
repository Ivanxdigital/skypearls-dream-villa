import { MemorySaver } from "@langchain/langgraph-checkpoint";
// For SQLite or Postgres, use the appropriate package if needed:
// import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
// import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

// Choose the appropriate checkpointer based on environment
export function createCheckpointer(threadId: string) {
  console.log("[checkpointer] Creating checkpointer for thread:", threadId);
  
  if (process.env.NODE_ENV === "production") {
    // TODO: Use a persistent saver for production, e.g. SqliteSaver or PostgresSaver
    return new MemorySaver();
  } else {
    // Use in-memory persistence for development
    console.log("[checkpointer] Using InMemorySaver for development");
    return new MemorySaver();
  }
} 