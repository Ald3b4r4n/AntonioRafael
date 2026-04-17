import { describe, it, expect } from 'vitest';

describe('Test infrastructure', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('supports jsdom environment', () => {
    const el = document.createElement('div');
    el.textContent = 'hello';
    expect(el.textContent).toBe('hello');
  });

  it('has jest-dom matchers available', () => {
    const el = document.createElement('button');
    el.setAttribute('disabled', '');
    document.body.appendChild(el);
    expect(el).toBeDisabled();
    document.body.removeChild(el);
  });
});
