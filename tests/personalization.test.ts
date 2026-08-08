import { describe, expect, it } from 'vitest';
import { formatPersonalizedProductTitle, extractCustomizationText } from '../src/lib/personalization';

describe('personalization helpers', () => {
  it('formats a personalized keychain title with the customer name', () => {
    expect(formatPersonalizedProductTitle('Customized 3D Printed Name Keychain (Pack of 2)', 'Aarav')).toBe(
      'Customized 3D Printed Name Keychain (Pack of 2) • For: Aarav'
    );
  });

  it('extracts the custom name from the stored product title', () => {
    expect(extractCustomizationText('Customized 3D Printed Name Keychain (Pack of 2) • For: Aarav')).toBe('Aarav');
    expect(extractCustomizationText('Plain product title')).toBe('');
  });
});
