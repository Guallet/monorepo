import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CategoryIcon, MoneyIcon } from './CategoryIcon';

describe('CategoryIcon for web', () => {
  it('renders a supported persisted icon name', () => {
    const markup = renderToStaticMarkup(
      <CategoryIcon name="IconCash" aria-label="Cash" />,
    );

    expect(markup).toContain('<svg');
    expect(markup).toContain('aria-label="Cash"');
  });

  it('falls back for an unknown persisted value', () => {
    const unknownMarkup = renderToStaticMarkup(
      <CategoryIcon name="IconNotSharedByLuna" />,
    );
    const fallbackMarkup = renderToStaticMarkup(
      <CategoryIcon name="IconQuestionMark" />,
    );

    expect(unknownMarkup).toBe(fallbackMarkup);
  });

  it('exports semantic named icons', () => {
    expect(renderToStaticMarkup(<MoneyIcon />)).toContain('<svg');
  });
});
