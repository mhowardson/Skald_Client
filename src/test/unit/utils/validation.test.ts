/**
 * Unit Tests for Validation Utilities
 * 
 * These tests demonstrate proper unit testing:
 * - Test pure functions in isolation
 * - No external dependencies or mocking needed
 * - Clear test cases covering happy path, edge cases, and errors
 * - Fast execution and reliable results
 */

import { describe, it, expect } from 'vitest';
import { 
  isValidEmail, 
  validatePassword, 
  sanitizeString, 
  formatPhoneNumber 
} from '../../../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com',
        'user123@test-domain.net'
      ];
      
      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });
    
    it('should return false for invalid email addresses', () => {
      const invalidEmails = [
        '',
        'not-an-email',
        '@example.com',
        'user@',
        'user@.com',
        'user space@example.com',
        'user@example',
        'user@ex ample.com'
      ];
      
      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
    
    it('should handle edge cases', () => {
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
      expect(isValidEmail(123 as any)).toBe(false);
      expect(isValidEmail('  user@example.com  ')).toBe(true); // Should trim whitespace
    });
  });

  describe('validatePassword', () => {
    it('should return valid for strong passwords', () => {
      const strongPasswords = [
        'Password123',
        'MySecure1Pass',
        'Test123Pass',
        'Complex1Password'
      ];
      
      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
    
    it('should return errors for weak passwords', () => {
      const testCases = [
        {
          password: 'short',
          expectedErrors: [
            'Password must be at least 8 characters',
            'Password must contain at least one uppercase letter',
            'Password must contain at least one number'
          ]
        },
        {
          password: 'nouppercase123',
          expectedErrors: ['Password must contain at least one uppercase letter']
        },
        {
          password: 'NOLOWERCASE123',
          expectedErrors: ['Password must contain at least one lowercase letter']
        },
        {
          password: 'NoNumbers',
          expectedErrors: ['Password must contain at least one number']
        }
      ];
      
      testCases.forEach(({ password, expectedErrors }) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expectedErrors.forEach(error => {
          expect(result.errors).toContain(error);
        });
      });
    });
    
    it('should handle edge cases', () => {
      expect(validatePassword('')).toEqual({
        isValid: false,
        errors: ['Password is required']
      });
      
      expect(validatePassword(null as any)).toEqual({
        isValid: false,
        errors: ['Password is required']
      });
      
      expect(validatePassword(undefined as any)).toEqual({
        isValid: false,
        errors: ['Password is required']
      });
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const testCases = [
        {
          input: '<script>alert("xss")</script>Hello',
          expected: 'alert("xss")Hello'
        },
        {
          input: '<b>Bold text</b>',
          expected: 'Bold text'
        },
        {
          input: '<div class="test">Content</div>',
          expected: 'Content'
        },
        {
          input: 'No <em>HTML</em> here',
          expected: 'No HTML here'
        }
      ];
      
      testCases.forEach(({ input, expected }) => {
        expect(sanitizeString(input)).toBe(expected);
      });
    });
    
    it('should trim whitespace', () => {
      const testCases = [
        { input: '  Hello World  ', expected: 'Hello World' },
        { input: '\n\tTest\n\t', expected: 'Test' },
        { input: '   ', expected: '' }
      ];
      
      testCases.forEach(({ input, expected }) => {
        expect(sanitizeString(input)).toBe(expected);
      });
    });
    
    it('should handle edge cases', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
      expect(sanitizeString(123 as any)).toBe('');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format valid 10-digit phone numbers', () => {
      const testCases = [
        { input: '1234567890', expected: '(123) 456-7890' },
        { input: '123-456-7890', expected: '(123) 456-7890' },
        { input: '(123) 456-7890', expected: '(123) 456-7890' },
        { input: '123.456.7890', expected: '(123) 456-7890' },
        { input: '123 456 7890', expected: '(123) 456-7890' }
      ];
      
      testCases.forEach(({ input, expected }) => {
        expect(formatPhoneNumber(input)).toBe(expected);
      });
    });
    
    it('should return empty string for invalid phone numbers', () => {
      const invalidPhones = [
        '123',           // Too short
        '12345678901',   // Too long
        'abc-def-ghij',  // Not numbers
        '',              // Empty
        '123-456-789'    // 9 digits
      ];
      
      invalidPhones.forEach(phone => {
        expect(formatPhoneNumber(phone)).toBe('');
      });
    });
    
    it('should handle edge cases', () => {
      expect(formatPhoneNumber(null as any)).toBe('');
      expect(formatPhoneNumber(undefined as any)).toBe('');
      expect(formatPhoneNumber(1234567890 as any)).toBe('');
    });
  });
});