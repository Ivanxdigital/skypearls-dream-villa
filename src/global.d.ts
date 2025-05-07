import { PineconeStore } from '@langchain/pinecone';

declare global {
  // eslint-disable-next-line no-var
  var _envLoaded: boolean | undefined;
  // eslint-disable-next-line no-var
  var _skypearlsVectorStore: PineconeStore | undefined;
}

// Adding this empty export statement to satisfy the 'isolatedModules' flag.
// If this file only contains type declarations, TypeScript might complain
// when 'isolatedModules' is true. This makes it a module.
export {}; 