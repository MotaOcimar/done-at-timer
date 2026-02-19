import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders headline and main components', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /Done-At Timer/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /^Done-At$/i }),
    ).toBeInTheDocument(); // ArrivalDisplay
    expect(screen.getByPlaceholderText(/Task name/i)).toBeInTheDocument(); // TaskInput
  });
});
