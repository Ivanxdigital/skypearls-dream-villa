import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatGate } from './ChatGate.js';
import { LeadInfo } from '../types.js';

// Mock child components
const MockLeadForm = jest.fn(({ isOpen, onOpenChange, onSubmit }) => {
  // Simulate form submission when needed
  // To keep it simple, we can trigger onSubmit from the test itself if needed
  // or by finding a mock button within this mock component.
  return isOpen ? (
    <div data-testid="lead-form">
      <button onClick={() => onSubmit({ firstName: 'Test', email: 'test@example.com', phone: '12345', sendTranscript: true })}>Submit Mock Form</button>
      <button onClick={() => onOpenChange(false)}>Close Mock Form</button>
    </div>
  ) : null;
});

const MockChatPanel = jest.fn(({ leadInfo, isOpen, onOpenChange }) => {
  return isOpen ? (
    <div data-testid="chat-panel">
      <p>Chatting with {leadInfo.firstName}</p>
      <button onClick={() => onOpenChange(false)}>Close Mock Chat</button>
    </div>
  ) : null;
});

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const renderChatGate = () => {
  return render(
    <ChatGate>
      {(leadInfo, chatOpen, setChatOpen) => (
        <MockChatPanel leadInfo={leadInfo} isOpen={chatOpen} onOpenChange={setChatOpen} />
      )}
    </ChatGate>
  );
};

const testLead: LeadInfo = {
  firstName: 'Stored',
  email: 'stored@example.com',
  phone: '00000',
  sendTranscript: false,
};

describe('ChatGate', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    MockLeadForm.mockClear();
    MockChatPanel.mockClear();
    // jest.clearAllMocks(); // Clears all mocks including localStorage if not careful
  });

  test('renders FAB and no form/chat panel initially', () => {
    renderChatGate();
    expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument();
    expect(screen.queryByTestId('lead-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
  });

  test('FAB click without leadInfo shows LeadForm', () => {
    renderChatGate();
    const fab = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(fab);
    expect(screen.getByTestId('lead-form')).toBeInTheDocument();
    // expect(MockLeadForm).toHaveBeenCalledWith(expect.objectContaining({ isOpen: true }), {});
  });

  test('LeadForm submission sets leadInfo, saves to localStorage, closes form, and opens ChatPanel', async () => {
    renderChatGate();
    const fab = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(fab); // Open LeadForm

    // Simulate form submission (assuming LeadForm calls onSubmit prop)
    // In our mock, we need to find the mock submit button and click it.
    const mockLeadFormSubmitButton = screen.getByText('Submit Mock Form');
    fireEvent.click(mockLeadFormSubmitButton);

    await waitFor(() => {
      expect(screen.queryByTestId('lead-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      expect(screen.getByText('Chatting with Test')).toBeInTheDocument(); // 'Test' is from mock submission
    });

    const expectedLeadInfo = { firstName: 'Test', email: 'test@example.com', phone: '12345', sendTranscript: true };
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('skypearls_lead', JSON.stringify(expectedLeadInfo));
    // Check if FAB text changed to "Close chat"
    expect(screen.getByRole('button', { name: /close chat/i })).toBeInTheDocument();
  });

  test('loads leadInfo from localStorage and FAB click opens ChatPanel directly', async () => {
    mockLocalStorage.setItem('skypearls_lead', JSON.stringify(testLead));
    renderChatGate();
    
    const fab = screen.getByRole('button', { name: /open chat/i }); // FAB text should be open chat initially
    fireEvent.click(fab);

    await waitFor(() => {
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      expect(screen.getByText(`Chatting with ${testLead.firstName}`)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('lead-form')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close chat/i })).toBeInTheDocument(); // FAB updated
  });

  test('FAB click when chat is open closes ChatPanel', async () => {
    mockLocalStorage.setItem('skypearls_lead', JSON.stringify(testLead));
    renderChatGate();
    
    const fabOpen = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(fabOpen); // Open chat

    await waitFor(() => {
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });

    const fabClose = screen.getByRole('button', { name: /close chat/i });
    fireEvent.click(fabClose); // Close chat

    await waitFor(() => {
      expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument(); // FAB updated
  });

  test('closing LeadForm via its own mechanism (not submit) does not open chat if no leadInfo', async () => {
    renderChatGate();
    const fab = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(fab); // Open LeadForm
    expect(screen.getByTestId('lead-form')).toBeInTheDocument();

    const mockLeadFormCloseButton = screen.getByText('Close Mock Form');
    fireEvent.click(mockLeadFormCloseButton);

    await waitFor(() => {
        expect(screen.queryByTestId('lead-form')).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument();
  });
}); 