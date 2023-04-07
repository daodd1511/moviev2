import { describe, it, expect } from 'vitest';

import { formatDate, formatToYear } from '../formatDate';

describe('formatDate', () => {
  it('should format date', () => {
    expect(formatDate((new Date('2021-01-01')).toDateString())).toBe('1/1/2021');
  });
});

describe('formatToYear', () => {
    it('should format date to year', () => {
        expect(formatToYear((new Date('2021-01-01')).toDateString())).toBe(2021);
    });
});
