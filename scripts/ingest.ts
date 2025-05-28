import { config } from 'dotenv';
config();

import fs from 'fs/promises';
import path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

async function deleteExistingData(pineconeIndex: any, namespace: string) {
  console.log(`🗑️  Deleting existing data in namespace '${namespace}'...`);
  
  try {
    // Delete all vectors in the namespace
    await pineconeIndex.namespace(namespace).deleteAll();
    console.log(`✓ Successfully deleted all existing data in namespace '${namespace}'`);
  } catch (error) {
    console.error(`Failed to delete existing data:`, error);
    throw error;
  }
}

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

  // Initialize Pinecone
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
  const namespace = 'default';

  // Delete existing data first
  await deleteExistingData(pineconeIndex, namespace);

  // Read all villa markdown files
  const villasDir = path.join(process.cwd(), 'docs', 'villas');
  const files = await fs.readdir(villasDir);
  const villaFiles = files.filter((f) => f.endsWith('.md'));
  if (villaFiles.length === 0) {
    throw new Error('No villa markdown files found in docs/villas');
  }

  console.log(`📄 Found ${villaFiles.length} villa files to process:`, villaFiles);

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
    console.log(`📝 Processed ${file}: ${chunks.length} chunks`);
  }

  console.log(`🔄 Total chunks to ingest: ${allChunks.length}`);

  // Embed and upsert to Pinecone
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY!,
  });

  console.log(`🚀 Starting ingestion to Pinecone...`);

  await PineconeStore.fromDocuments(
    allChunks.map((c) => ({ pageContent: c.content, metadata: c.metadata })),
    embeddings,
    {
      pineconeIndex,
      namespace,
    }
  );

  console.log('✅ Ingestion complete - all data has been refreshed!');
}

main().catch((err) => {
  console.error('❌ Ingestion failed:', err);
  process.exit(1);
}); 