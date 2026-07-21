import { describe, it, expect } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('Worker hello-world', () => {
  it('responds 200 with the Vulcan greeting', async () => {
    const response = await SELF.fetch('http://example.com/');
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Live long and prosper.');
  });

  it('sets X-Live-Long and CORS headers', async () => {
    const response = await SELF.fetch('http://example.com/');
    expect(response.headers.get('X-Live-Long')).toBe('and-prosper');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
