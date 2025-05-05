import { config } from 'dotenv';
config();

import fs from 'fs/promises';
import path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

async function main() {
  // Validate required env vars
  const requiredEnv = [
    'OPENAI_API_KEY',
    'PINECONE_API_KEY',
    'PINECONE_ENV',
    'PINECONE_INDEX',
  ];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }

  // Read all villa markdown files
  const villasDir = path.join(process.cwd(), 'docs', 'villas');
  const files = await fs.readdir(villasDir);
  const villaFiles = files.filter((f) => f.endsWith('.md'));
  if (villaFiles.length === 0) {
    throw new Error('No villa markdown files found in docs/villas');
  }

  let allChunks: { content: string; metadata: Record<string, unknown> }[] = [];
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100,
  });

  for (const file of villaFiles) {
    const filePath = path.join(villasDir, file);
    const raw = await fs.readFile(filePath, 'utf8');
    const chunks = await splitter.createDocuments([raw], [{ source: file }]);
    allChunks = allChunks.concat(chunks.map((c) => ({ content: c.pageContent, metadata: c.metadata })));
  }

  // Embed and upsert to Pinecone
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY!,
  });

  await PineconeStore.fromDocuments(
    allChunks.map((c) => ({ pageContent: c.content, metadata: c.metadata })),
    embeddings,
    {
      pineconeIndex,
      namespace: 'default',
    }
  );

  console.log('✓ Ingestion complete');
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
}); 