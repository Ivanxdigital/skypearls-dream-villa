import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LeadForm, leadFormSchema } from './LeadForm.js'; // Added .js extension
import { LeadInfo } from '../types.js'; // Changed to relative path with .js

// Mock the onSubmit and onOpenChange functions
const mockOnSubmit = jest.fn();
const mockOnOpenChange = jest.fn();

const initialProps = {
  isOpen: true,
  onOpenChange: mockOnOpenChange,
  onSubmit: mockOnSubmit,
};

// Helper to fill form fields
const fillForm = (data: Partial<LeadInfo>) => {
  if (data.firstName !== undefined) fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: data.firstName } });
  if (data.email !== undefined) fireEvent.change(screen.getByLabelText(/email/i), { target: { value: data.email } });
  if (data.phone !== undefined) fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: data.phone } });
  // Switch is more complex to interact with directly via label for checked state if not using a role='switch' and aria-checked
  // For this example, we'll assume the default for sendTranscript is tested or we test its effect via submission data.
  // If specific switch interaction is needed, it might require a more specific selector or role.
};


describe('LeadForm', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockOnSubmit.mockClear();
    mockOnOpenChange.mockClear();
    render(<LeadForm {...initialProps} />);
  });

  test('renders all form fields and submit button', () => {
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/send chat transcript to my email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start chat/i })).toBeInTheDocument();
  });

  test('shows validation error for empty required fields on submit', async () => {
    fireEvent.click(screen.getByRole('button', { name: /start chat/i }));

    await waitFor(() => {
      expect(screen.getByText('First name is required.')).toBeInTheDocument();
      expect(screen.getByText('Invalid email address.')).toBeInTheDocument(); // Zod makes empty string invalid email
      expect(screen.getByText('Phone number is required.')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('shows validation error for invalid email format', async () => {
    fillForm({ firstName: 'Test', email: 'invalid-email', phone: '1234567890' });
    fireEvent.click(screen.getByRole('button', { name: /start chat/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('submits the form with valid data', async () => {
    const validData: LeadInfo = {
      firstName: 'John',
      email: 'john.doe@example.com',
      phone: '1234567890',
      sendTranscript: true, // Default value in form is true
    };
    fillForm(validData);
    
    // Verify the switch state (it should be checked by default)
    const switchInput = screen.getByLabelText(/send chat transcript to my email/i);
    expect(switchInput).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /start chat/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(validData);
    });
  });

  test('submits with sendTranscript set to false if unchecked', async () => {
    const data: LeadInfo = {
      firstName: 'Jane',
      email: 'jane.doe@example.com',
      phone: '0987654321',
      sendTranscript: false,
    };
    fillForm(data);

    // Uncheck the switch
    const switchInput = screen.getByLabelText(/send chat transcript to my email/i);
    expect(switchInput).toBeChecked(); // Starts checked
    fireEvent.click(switchInput); // Uncheck it
    expect(switchInput).not.toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /start chat/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(data);
    });
  });
  
  test('Zod schema validation for firstName', () => {
    const result = leadFormSchema.safeParse({ email: 'test@test.com', phone: '12345', sendTranscript: false });
    expect(result.success).toBe(false);
    if (!result.success) {
        expect(result.error.flatten().fieldErrors.firstName).toContain('First name is required.');
    }
  });

  test('Zod schema validation for email', () => {
    const result = leadFormSchema.safeParse({ firstName: 'Test', email: 'invalid', phone: '12345', sendTranscript: false });
    expect(result.success).toBe(false);
    if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain('Invalid email address.');
    }
  });

   test('Zod schema validation for phone', () => {
    const result = leadFormSchema.safeParse({ firstName: 'Test', email: 'test@test.com', phone: '123', sendTranscript: false });
    expect(result.success).toBe(false);
    if (!result.success) {
        expect(result.error.flatten().fieldErrors.phone).toContain('Phone number is required.'); // min(5)
    }
  });

  test('Zod schema allows valid data', () => {
    const result = leadFormSchema.safeParse({ firstName: 'Test', email: 'test@test.com', phone: '12345', sendTranscript: true });
    expect(result.success).toBe(true);
  });
});

// We would also need tests for the React component rendering and interaction if doing full component tests.
// For now, focusing on Zod schema unit test as per PRD task item. 