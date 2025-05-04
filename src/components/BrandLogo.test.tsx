import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import BrandLogo from './BrandLogo';

jest.useFakeTimers();

describe('BrandLogo', () => {
  it('renders logo and text, animates on mount (happy path)', () => {
    render(<BrandLogo data-testid="brand-logo" />);
    // Logo should be in the document
    const logo = screen.getByAltText(/SkyPearls Logo Stamp/i);
    expect(logo).toBeInTheDocument();
    // Text should be present but initially hidden
    const text = screen.getByText(/SkyPearls\./i);
    expect(text).toBeInTheDocument();
    expect(text).toHaveClass('opacity-0');
    // Advance timers to trigger text animation
    act(() => {
      jest.advanceTimersByTime(700); // logo fade + delay
    });
    expect(text).toHaveClass('opacity-100');
  });

  it('does not re-animate text on re-render (edge case)', () => {
    const { rerender } = render(<BrandLogo data-testid="brand-logo" />);
    act(() => {
      jest.advanceTimersByTime(700);
    });
    const text = screen.getByText(/SkyPearls\./i);
    expect(text).toHaveClass('opacity-100');
    // Re-render
    rerender(<BrandLogo data-testid="brand-logo" />);
    expect(text).toHaveClass('opacity-100');
  });
}); 