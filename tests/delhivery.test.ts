import { describe, it, expect } from 'vitest';
import { classifyDelhiveryError, formatDelhiveryHeaders } from '../src/lib/shipping/delhivery';

describe('Delhivery error handling', () => {
  it('maps 404 responses to endpoint errors with the upstream message', () => {
    const result = classifyDelhiveryError(404, { detail: 'Not Found' }, 'Request failed with status code 404');

    expect(result.errorType).toBe('WRONG_ENDPOINT');
    expect(result.message).toContain('404');
    expect(result.message).toContain('Not Found');
  });

  it('masks authorization headers while preserving the header shape', () => {
    const headers = formatDelhiveryHeaders({
      Authorization: 'Token secret-token',
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });

    expect(headers.Authorization).toBe('Token ****');
    expect(headers['Content-Type']).toBe('application/json');
  });
});
