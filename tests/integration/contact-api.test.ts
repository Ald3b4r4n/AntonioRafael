/**
 * CONTRACT TESTS for the secure api/contact.mjs handler (v2).
 *
 * Purpose: Define TARGET behavior per contracts/contact-api.md (TDD Red phase).
 * These tests MUST FAIL against the current (pre-rewrite) handler.
 * They become the acceptance gate for T015 (secure rewrite — Green phase).
 *
 * Contract version: 2.0
 * Status codes: 200 (success), 405 (bad method), 422 (validation), 429 (rate limit), 500 (server error)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'node:events';

// Mock nodemailer before importing the handler
vi.mock('nodemailer', () => {
  const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'mock-id-456' });
  return {
    default: {
      createTransport: vi.fn(() => ({
        sendMail: sendMailMock,
      })),
    },
    __sendMailMock: sendMailMock,
  };
});

// Set required env vars before import
process.env.EMAIL_USER = 'test@gmail.com';
process.env.EMAIL_PASS = 'test-app-password';

// Dynamic import of ESM handler
const { default: handler, _resetRateLimiter } = await import('../../api/contact.mjs');
const { __sendMailMock: sendMailMock } = (await import('nodemailer')) as any;

/**
 * Creates a mock HTTP request simulating Vercel's serverless req object.
 * Supports optional rawBody for oversized payload testing.
 */
function createMockReq(
  method: string,
  body?: Record<string, unknown>,
  options?: { rawBody?: string },
) {
  const req = new EventEmitter() as EventEmitter & { method: string; ip: string };
  req.method = method;
  req.ip = '127.0.0.1';

  process.nextTick(() => {
    if (options?.rawBody !== undefined) {
      req.emit('data', options.rawBody);
    } else if (body !== undefined) {
      req.emit('data', JSON.stringify(body));
    }
    req.emit('end');
  });

  return req;
}

/**
 * Creates a mock HTTP response capturing status, JSON, headers.
 */
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

const VALID_BODY = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  message: 'Hello, I would like to discuss a project.',
};

describe('api/contact.mjs — Contract Tests (target behavior v2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendMailMock.mockResolvedValue({ messageId: 'mock-id-456' });
    _resetRateLimiter();
  });

  // ─── Method handling ────────────────────────────────────────

  describe('HTTP method handling (contract)', () => {
    it('returns 405 for GET with structured error response', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(405);
      expect(res._json).toEqual({
        ok: false,
        error: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are accepted.',
      });
    });

    it('returns 405 for PUT with structured error response', async () => {
      const req = createMockReq('PUT');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(405);
      expect(res._json).toEqual({
        ok: false,
        error: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are accepted.',
      });
    });

    it('returns 405 for DELETE with structured error response', async () => {
      const req = createMockReq('DELETE');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(405);
      expect(res._json).toEqual({
        ok: false,
        error: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are accepted.',
      });
    });

    it('returns 405 for PATCH with structured error response', async () => {
      const req = createMockReq('PATCH');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(405);
      expect(res._json).toEqual({
        ok: false,
        error: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are accepted.',
      });
    });
  });

  // ─── Successful submission (contract response shape) ───────

  describe('valid POST submission (contract response)', () => {
    it('returns 200 with { ok: true, message: "Message sent successfully." }', async () => {
      const req = createMockReq('POST', VALID_BODY);
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      expect(res._json).toEqual({
        ok: true,
        message: 'Message sent successfully.',
      });
    });

    it('does not expose messageId in response', async () => {
      const req = createMockReq('POST', VALID_BODY);
      const res = createMockRes();
      await handler(req, res);
      expect(res._json).not.toHaveProperty('id');
    });

    it('trims whitespace from name before processing', async () => {
      const req = createMockReq('POST', {
        ...VALID_BODY,
        name: '  Maria Silva  ',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      const call = sendMailMock.mock.calls[0][0];
      expect(call.text).toContain('Maria Silva');
      expect(call.text).not.toContain('  Maria Silva  ');
    });

    it('normalizes email via validator normalizeEmail', async () => {
      const req = createMockReq('POST', {
        ...VALID_BODY,
        email: 'MARIA@EXAMPLE.COM',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      const call = sendMailMock.mock.calls[0][0];
      // normalizeEmail lowercases
      expect(call.replyTo).toBe('maria@example.com');
    });
  });

  // ─── Validation — name (contract: 1–100 chars) ────────────

  describe('name validation (contract)', () => {
    it('returns 422 for missing name with fields.name', async () => {
      const req = createMockReq('POST', {
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json).toMatchObject({
        ok: false,
        error: 'VALIDATION_ERROR',
        message: 'One or more fields are invalid.',
      });
      expect(res._json.fields).toHaveProperty('name');
    });

    it('returns 422 for empty string name', async () => {
      const req = createMockReq('POST', {
        name: '',
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json.fields).toHaveProperty('name');
    });

    it('returns 422 for whitespace-only name', async () => {
      const req = createMockReq('POST', {
        name: '   ',
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json.fields).toHaveProperty('name');
    });

    it('accepts single character name (≥1 after trim)', async () => {
      const req = createMockReq('POST', {
        name: 'A',
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
    });

    it('returns 422 for name exceeding 100 characters', async () => {
      const req = createMockReq('POST', {
        name: 'A'.repeat(101),
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json.fields).toHaveProperty('name');
    });

    it('accepts name of exactly 100 characters', async () => {
      const req = createMockReq('POST', {
        name: 'A'.repeat(100),
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
    });
  });

  // ─── Validation — email (contract: validator isEmail) ──────

  describe('email validation (contract)', () => {
    it('returns 422 for missing email with fields.email', async () => {
      const req = createMockReq('POST', {
        name: 'Test User',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json).toMatchObject({
        ok: false,
        error: 'VALIDATION_ERROR',
      });
      expect(res._json.fields).toHaveProperty('email');
    });

    it('returns 422 for empty string email', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: '',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json.fields).toHaveProperty('email');
    });

    it('returns 422 for email without TLD (a@b)', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'a@b',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json.fields).toHaveProperty('email');
    });

    it('returns 422 for email with spaces', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'user @example.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json.fields).toHaveProperty('email');
    });

    it('accepts valid email address', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'user@example.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
    });
  });

  // ─── Validation — message (contract: 1–5000 chars) ─────────

  describe('message validation (contract)', () => {
    it('returns 422 for missing message with fields.message', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'a@b.com',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json).toMatchObject({
        ok: false,
        error: 'VALIDATION_ERROR',
      });
      expect(res._json.fields).toHaveProperty('message');
    });

    it('returns 422 for empty message', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'a@b.com',
        message: '',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json.fields).toHaveProperty('message');
    });

    it('accepts single character message (≥1 after trim)', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'a@b.com',
        message: 'H',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
    });

    it('returns 422 for message exceeding 5000 characters', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'a@b.com',
        message: 'A'.repeat(5001),
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json.fields).toHaveProperty('message');
    });

    it('accepts message of exactly 5000 characters', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'a@b.com',
        message: 'A'.repeat(5000),
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
    });
  });

  // ─── Multiple field validation ─────────────────────────────

  describe('multi-field validation (contract)', () => {
    it('returns 422 with all invalid fields when multiple are wrong', async () => {
      const req = createMockReq('POST', {
        name: '',
        email: 'not-an-email',
        message: '',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json.error).toBe('VALIDATION_ERROR');
      expect(res._json.fields).toHaveProperty('name');
      expect(res._json.fields).toHaveProperty('email');
      expect(res._json.fields).toHaveProperty('message');
    });
  });

  // ─── Security — input sanitization ─────────────────────────

  describe('input sanitization (contract)', () => {
    it('strips CRLF from name to prevent header injection', async () => {
      const req = createMockReq('POST', {
        name: 'Injected\r\nBcc: attacker@evil.com',
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      // After CRLF stripping, name is sanitized. Should still succeed or reject,
      // but the subject line MUST NOT contain \r\n
      if (res._status === 200) {
        const call = sendMailMock.mock.calls[0][0];
        expect(call.subject).not.toContain('\r\n');
        expect(call.subject).not.toContain('\r');
        expect(call.subject).not.toContain('\n');
      }
      // Either way, no CRLF should reach sendMail
      if (sendMailMock.mock.calls.length > 0) {
        const call = sendMailMock.mock.calls[0][0];
        expect(call.subject).not.toContain('\r\n');
      }
    });

    it('strips HTML tags from name before processing', async () => {
      const req = createMockReq('POST', {
        name: '<script>alert("xss")</script>Test',
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      // If it passes validation after stripping, the subject must not have raw HTML
      if (sendMailMock.mock.calls.length > 0) {
        const call = sendMailMock.mock.calls[0][0];
        expect(call.subject).not.toContain('<script>');
        expect(call.text).not.toContain('<script>');
      }
    });

    it('strips HTML tags from message before processing', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'a@b.com',
        message: '<img src=x onerror=alert(1)>Real message here',
      });
      const res = createMockRes();
      await handler(req, res);
      if (sendMailMock.mock.calls.length > 0) {
        const call = sendMailMock.mock.calls[0][0];
        expect(call.text).not.toContain('<img');
      }
    });

    it('does not accept phone field (removed in v2 contract)', async () => {
      const req = createMockReq('POST', {
        ...VALID_BODY,
        phone: '+55 11 99999-0000',
      });
      const res = createMockRes();
      await handler(req, res);
      // Phone should be silently ignored — not appear in email
      if (res._status === 200 && sendMailMock.mock.calls.length > 0) {
        const call = sendMailMock.mock.calls[0][0];
        expect(call.text).not.toContain('+55 11 99999-0000');
        expect(call.text).not.toContain('Telefone');
      }
    });
  });

  // ─── Error handling (contract response shape) ──────────────

  describe('error handling (contract)', () => {
    it('returns 500 with structured error when sendMail fails', async () => {
      sendMailMock.mockRejectedValueOnce(new Error('SMTP connection refused'));
      const req = createMockReq('POST', VALID_BODY);
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(500);
      expect(res._json).toEqual({
        ok: false,
        error: 'SERVER_ERROR',
        message: 'Failed to send your message. Please try again later.',
      });
    });

    it('does not expose stack trace or internal details on error', async () => {
      sendMailMock.mockRejectedValueOnce(new Error('ECONNREFUSED 127.0.0.1:465'));
      const req = createMockReq('POST', VALID_BODY);
      const res = createMockRes();
      await handler(req, res);
      const body = JSON.stringify(res._json);
      expect(body).not.toContain('ECONNREFUSED');
      expect(body).not.toContain('127.0.0.1');
      expect(body).not.toContain('stack');
    });

    it('returns 422 (not 500) for invalid JSON body', async () => {
      const req = createMockReq('POST', undefined, { rawBody: 'not-json{{{' });
      const res = createMockRes();
      await handler(req, res);
      // Contract: malformed input should be a client error, not server error
      expect(res._status).toBe(422);
      expect(res._json).toMatchObject({
        ok: false,
        error: 'VALIDATION_ERROR',
      });
    });
  });

  // ─── Rate limiting (contract: 5 req / 10 min / IP) ────────

  describe('rate limiting (contract)', () => {
    it('returns 429 after 5 requests from the same IP', async () => {
      // First 5 should succeed
      for (let i = 0; i < 5; i++) {
        const req = createMockReq('POST', VALID_BODY);
        const res = createMockRes();
        await handler(req, res);
        expect(res._status).toBe(200);
      }

      // 6th request should be rate-limited
      const req = createMockReq('POST', VALID_BODY);
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(429);
      expect(res._json).toEqual({
        ok: false,
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a few minutes before trying again.',
      });
    });

    it('includes Retry-After header on 429 response', async () => {
      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        const req = createMockReq('POST', VALID_BODY);
        const res = createMockRes();
        await handler(req, res);
      }

      const req = createMockReq('POST', VALID_BODY);
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(429);
      expect(res._headers['Retry-After']).toBeDefined();
    });
  });
});
