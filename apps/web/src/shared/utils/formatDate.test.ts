import { describe, expect, it } from 'vitest';

import { formatMediumDate } from './formatDate';

describe('formatMediumDate', () => {
  it('formats an ISO timestamp as a medium date', () => {
    expect(formatMediumDate('2026-08-03T12:00:00.000Z')).toBe('Aug 3, 2026');
  });
});
