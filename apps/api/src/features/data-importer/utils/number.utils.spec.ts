import { parseNumber, isValidNumber } from './number.utils.js';

describe('Number Utils', () => {
  describe('parseNumber', () => {
    it('should return NaN for null/undefined/empty/boolean', () => {
      expect(parseNumber(null)).toBeNaN();
      expect(parseNumber(undefined)).toBeNaN();
      expect(parseNumber('')).toBeNaN();
      expect(parseNumber(true)).toBeNaN();
      expect(parseNumber(false)).toBeNaN();
    });

    it('should return the value if it is already a number', () => {
      expect(parseNumber(123)).toBe(123);
      expect(parseNumber(-123.45)).toBe(-123.45);
    });

    it('should parse standard string numbers', () => {
      expect(parseNumber('123')).toBe(123);
      expect(parseNumber('123.45')).toBe(123.45);
      expect(parseNumber('-123.45')).toBe(-123.45);
    });

    it('should parse European formatted numbers (comma decimal)', () => {
      expect(parseNumber('123,45')).toBe(123.45);
      expect(parseNumber('-115,53')).toBe(-115.53);
      expect(parseNumber('123,00')).toBe(123);
    });

    it('should trim whitespace', () => {
      expect(parseNumber('  123  ')).toBe(123);
      expect(parseNumber('  123,45  ')).toBe(123.45);
    });

    it('should return NaN for invalid strings', () => {
      expect(parseNumber('abc')).toBeNaN();
      expect(parseNumber('123.45.67')).toBeNaN();
    });
  });

  describe('isValidNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isValidNumber(123)).toBe(true);
      expect(isValidNumber('123')).toBe(true);
      expect(isValidNumber('123,45')).toBe(true);
    });

    it('should return false for invalid numbers', () => {
      expect(isValidNumber(null)).toBe(false);
      expect(isValidNumber('abc')).toBe(false);
      expect(isValidNumber('')).toBe(false);
    });
  });
});
