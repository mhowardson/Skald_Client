/**
 * Validation Utilities
 * 
 * Simple utility functions for form validation and data sanitization.
 * These functions are pure and easy to test.
 * 
 * @module ValidationUtils
 */

/**
 * Validates if an email address is in correct format
 * 
 * @param email - Email address to validate
 * @returns True if email is valid, false otherwise
 * 
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates if a password meets security requirements
 * 
 * @param password - Password to validate
 * @returns Object with validation result and error messages
 * 
 * @example
 * ```typescript
 * validatePassword('password123') 
 * // { isValid: true, errors: [] }
 * 
 * validatePassword('weak')
 * // { isValid: false, errors: ['Password must be at least 8 characters'] }
 * ```
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Sanitizes a string by removing HTML tags and trimming whitespace
 * 
 * @param input - String to sanitize
 * @returns Sanitized string
 * 
 * @example
 * ```typescript
 * sanitizeString('<script>alert("xss")</script>Hello  ') 
 * // 'alert("xss")Hello'
 * ```
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim(); // Remove leading/trailing whitespace
};

/**
 * Formats a phone number to standard format
 * 
 * @param phone - Phone number to format
 * @returns Formatted phone number or empty string if invalid
 * 
 * @example
 * ```typescript
 * formatPhoneNumber('1234567890') // '(123) 456-7890'
 * formatPhoneNumber('123-456-7890') // '(123) 456-7890'
 * ```
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Must be exactly 10 digits for US phone number
  if (digitsOnly.length !== 10) {
    return '';
  }
  
  // Format as (XXX) XXX-XXXX
  return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
};