import { describe, expect, it } from 'vitest';

import { assertNonNull, assertNonNullWithReturn } from '../assertNonNull';
describe('.assertNonNull(x)', () => {
    it('should throw an error if x is null', () => {
        expect(() => assertNonNull(null)).toThrow();
    });
    it('should throw an error if x is undefined', () => {
        expect(() => assertNonNull(undefined)).toThrow();
    });
    it('should not throw an error if x is not null or undefined', () => {
        expect(() => assertNonNull(0)).not.toThrow();
        expect(() => assertNonNull('')).not.toThrow();
        expect(() => assertNonNull(false)).not.toThrow();
    });
});

describe('.assertNonNullWithReturn(x)', () => {
    it('should throw an error if x is null', () => {
        expect(() => assertNonNullWithReturn(null)).toThrow();
    });
    it('should throw an error if x is undefined', () => {
        expect(() => assertNonNullWithReturn(undefined)).toThrow();
    });
    it('should not throw an error if x is not null or undefined', () => {
        expect(() => assertNonNullWithReturn(0)).not.toThrow();
        expect(() => assertNonNullWithReturn('')).not.toThrow();
        expect(() => assertNonNullWithReturn(false)).not.toThrow();
    });
    it('should return x if x is not null or undefined', () => {
        expect(assertNonNullWithReturn(0)).toBe(0);
        expect(assertNonNullWithReturn('')).toBe('');
        expect(assertNonNullWithReturn(false)).toBe(false);
    });
});
