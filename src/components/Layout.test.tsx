import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Layout } from './Layout';

describe('Layout', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
