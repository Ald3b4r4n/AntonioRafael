/**
 * CONTRACT TESTS for api/health.mjs v1.1 (TDD Red phase).
 *
 * Target behavior per contracts/health-api.md:
 * - GET /api/health returns structured health payload
 * - Response includes: status, version, timestamp, checks.email
 * - "ok" when email env vars are set, "degraded" when missing
 * - 405 for non-GET methods
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Dynamic import of ESM handler
const { default: handler } = await import('../../api/health.mjs');

function createMockReq(method: string) {
  return { method };
}

function createMockRes() {
  const res: any = {
    _status: 0,
    _json: null as unknown,
    _ended: false,
    _headers: {} as Record<string, string>,
    status(code: number) {
      res._status = code;
      return res;
    },
    json(data: unknown) {
      res._json = data;
      return res;
    },
    end() {
      res._ended = true;
      return res;
    },
    setHeader(key: string, value: string) {
      res._headers[key] = value;
      return res;
    },
  };
  return res;
}

describe('api/health.mjs — Contract Tests (v1.1)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.EMAIL_USER = 'test@gmail.com';
    process.env.EMAIL_PASS = 'test-app-password';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ─── Response shape ────────────────────────────────────────

  describe('response shape', () => {
    it('returns 200 with status, version, timestamp, and checks', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      expect(res._json).toHaveProperty('status');
      expect(res._json).toHaveProperty('version');
      expect(res._json).toHaveProperty('timestamp');
      expect(res._json).toHaveProperty('checks');
      expect(res._json.checks).toHaveProperty('email');
    });

    it('does not include ok or ts fields (v1 response shape)', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();
      await handler(req, res);
      expect(res._json).not.toHaveProperty('ok');
      expect(res._json).not.toHaveProperty('ts');
    });

    it('returns version as a semver string from package.json', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();
      await handler(req, res);
      expect(typeof res._json.version).toBe('string');
      expect(res._json.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('returns timestamp as ISO 8601 UTC string', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();
      await handler(req, res);
      expect(typeof res._json.timestamp).toBe('string');
      // ISO 8601 format: 2026-04-14T12:00:00.000Z
      expect(res._json.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });

  // ─── Healthy state ─────────────────────────────────────────

  describe('healthy state (all env vars set)', () => {
    it('returns status "ok" when EMAIL_USER and EMAIL_PASS are set', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();
      await handler(req, res);
      expect(res._json.status).toBe('ok');
    });

    it('returns checks.email as "configured"', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();
      await handler(req, res);
      expect(res._json.checks.email).toBe('configured');
    });
  });

  // ─── Degraded state ────────────────────────────────────────

  describe('degraded state (missing env vars)', () => {
    it('returns status "degraded" when EMAIL_USER is missing', async () => {
      delete process.env.EMAIL_USER;
      const req = createMockReq('GET');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      expect(res._json.status).toBe('degraded');
      expect(res._json.checks.email).toBe('missing');
    });

    it('returns status "degraded" when EMAIL_PASS is missing', async () => {
      delete process.env.EMAIL_PASS;
      const req = createMockReq('GET');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      expect(res._json.status).toBe('degraded');
      expect(res._json.checks.email).toBe('missing');
    });
  });

  // ─── Method handling ───────────────────────────────────────

  describe('method handling', () => {
    it('returns 405 for POST requests', async () => {
      const req = createMockReq('POST');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(405);
    });

    it('returns 405 for PUT requests', async () => {
      const req = createMockReq('PUT');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(405);
    });
  });
});
