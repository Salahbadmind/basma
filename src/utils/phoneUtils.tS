/**
 * Utility functions for phone number normalization and comparison.
 * Supports Algerian phone formats (+213, 00213, 05/06/07), raw short test numbers (e.g., 6666666),
 * and various punctuation/spacing styles.
 */

export const normalizePhoneNumber = (raw: string): string => {
  if (!raw) return '';
  // Extract all digit characters
  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // Remove Algerian international prefix: 00213 or 213
  if (digits.startsWith('00213')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('213') && digits.length >= 8) {
    digits = digits.slice(3);
  }

  // Remove leading zeros (e.g. 0666 -> 666, 0550 -> 550)
  digits = digits.replace(/^0+/, '');

  return digits;
};

export const arePhoneNumbersEqual = (phone1: string, phone2: string): boolean => {
  if (!phone1 || !phone2) return false;
  const norm1 = normalizePhoneNumber(phone1);
  const norm2 = normalizePhoneNumber(phone2);

  if (!norm1 || !norm2) return false;

  // Direct exact match of normalized digits
  if (norm1 === norm2) return true;

  // Check matching suffix when both have at least 6 digits
  const minLen = Math.min(norm1.length, norm2.length);
  if (minLen >= 6) {
    if (norm1.slice(-minLen) === norm2.slice(-minLen)) {
      return true;
    }
  }

  return false;
};
