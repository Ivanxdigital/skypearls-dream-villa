import { retrieveDocuments } from './retrieveDocuments';
import { ChatState } from '@/lib/langgraph/state';

jest.mock('@/lib/vector-store', () => ({
  vectorStore: {
    similaritySearch: jest.fn()
  }
}));

const { vectorStore } = require('@/lib/vector-store');

describe('retrieveDocuments', () => {
  const baseState: ChatState = {
    messages: [],
    question: 'What villas are available?'
  };

  it('returns documents and lastRetrieval on happy path', async () => {
    const mockDocs = [
      { pageContent: 'Villa 1 details' },
      { pageContent: 'Villa 2 details' }
    ];
    vectorStore.similaritySearch.mockResolvedValueOnce(mockDocs);
    const result = await retrieveDocuments(baseState);
    expect(result.documents).toEqual(mockDocs);
    expect(typeof result.lastRetrieval).toBe('string');
  });

  it('handles vector store errors gracefully', async () => {
    vectorStore.similaritySearch.mockRejectedValueOnce(new Error('Vector error'));
    await expect(retrieveDocuments(baseState)).rejects.toThrow('Vector error');
  });

  it('returns empty array if question is empty', async () => {
    vectorStore.similaritySearch.mockResolvedValueOnce([]);
    const result = await retrieveDocuments({ ...baseState, question: '' });
    expect(result.documents).toEqual([]);
  });
}); 