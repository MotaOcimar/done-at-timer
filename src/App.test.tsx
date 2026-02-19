import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders main sections', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /You will be done at/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Plan your routine/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What's next?/i)).toBeInTheDocument();
  });
});
