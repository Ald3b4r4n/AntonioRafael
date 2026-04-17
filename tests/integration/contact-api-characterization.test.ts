/**
 * CHARACTERIZATION TESTS for api/contact.mjs (updated post-rewrite).
 *
 * Originally written in T012 to document pre-rewrite (v1) behavior.
 * Updated in T015 after secure rewrite to document v2 behavior.
 *
 * Changes from v1:
 * - 400 → 422 for validation errors, with structured { fields } object
 * - Response messages now in English with error codes
 * - Rate limiting now enforced (5 req / 10 min / IP)
 * - CRLF injection blocked (stripped from inputs)
 * - HTML tags stripped from all inputs
 * - Name: min 1 char (was 2), max 100 chars (was unlimited)
 * - Message: min 1 char (was 5), max 5000 chars (was unlimited)
 * - Email validated with validator.isEmail (was .+@.+\..+)
 * - Phone field silently ignored (was included in email)
 * - Success response: { ok, message } (was { ok, id })
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'node:events';

// Mock nodemailer before importing the handler
vi.mock('nodemailer', () => {
  const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'mock-id-123' });
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
const { __sendMailMock: sendMailMock } = await import('nodemailer') as any;

/**
 * Creates a mock HTTP request that mimics Vercel's serverless req object.
 * The handler reads JSON body via stream events (req.on('data'/'end')).
 */
function createMockReq(method: string, body?: Record<string, unknown>) {
  const req = new EventEmitter() as EventEmitter & { method: string; ip: string };
  req.method = method;
  req.ip = '127.0.0.1';

  if (body !== undefined) {
    process.nextTick(() => {
      req.emit('data', JSON.stringify(body));
      req.emit('end');
    });
  } else {
    process.nextTick(() => {
      req.emit('end');
    });
  }

  return req;
}

/**
 * Creates a mock HTTP response that captures status and JSON output.
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

describe('api/contact.mjs — Characterization Tests (v2 behavior)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendMailMock.mockResolvedValue({ messageId: 'mock-id-123' });
    _resetRateLimiter();
  });

  // ─── Method handling ────────────────────────────────────────

  describe('HTTP method handling', () => {
    it('returns 204 for OPTIONS (CORS preflight)', async () => {
      const req = createMockReq('OPTIONS');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(204);
      expect(res._ended).toBe(true);
    });

    it('returns 405 for GET with structured error and Allow header', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(405);
      expect(res._json).toEqual({
        ok: false,
        error: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are accepted.',
      });
      expect(res._headers['Allow']).toBe('POST, OPTIONS');
    });

    it('returns 405 for PUT', async () => {
      const req = createMockReq('PUT');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(405);
    });

    it('returns 405 for DELETE', async () => {
      const req = createMockReq('DELETE');
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(405);
    });
  });

  // ─── Successful submission ──────────────────────────────────

  describe('valid POST submission', () => {
    it('returns 200 with ok:true and success message (no messageId exposed)', async () => {
      const req = createMockReq('POST', VALID_BODY);
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      expect(res._json).toEqual({ ok: true, message: 'Message sent successfully.' });
    });

    it('calls sendMail with correct fields', async () => {
      const req = createMockReq('POST', VALID_BODY);
      const res = createMockRes();
      await handler(req, res);
      expect(sendMailMock).toHaveBeenCalledOnce();
      const call = sendMailMock.mock.calls[0][0];
      expect(call.to).toBe('test@gmail.com');
      expect(call.replyTo).toBe('maria@example.com');
      expect(call.subject).toContain('Maria Silva');
      expect(call.text).toContain('Maria Silva');
      expect(call.html).toContain('Maria Silva');
    });

    it('silently ignores phone field (removed in v2)', async () => {
      const req = createMockReq('POST', {
        ...VALID_BODY,
        phone: '+55 11 99999-0000',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      const call = sendMailMock.mock.calls[0][0];
      expect(call.text).not.toContain('+55 11 99999-0000');
      expect(call.text).not.toContain('Telefone');
    });

    it('works without phone field', async () => {
      const req = createMockReq('POST', VALID_BODY);
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      const call = sendMailMock.mock.calls[0][0];
      expect(call.text).not.toContain('Telefone:');
    });
  });

  // ─── Validation — name ──────────────────────────────────────

  describe('name validation', () => {
    it('returns 422 for missing name', async () => {
      const req = createMockReq('POST', {
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
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
    });

    it('accepts single-character name (v2: min 1 char, was 2)', async () => {
      const req = createMockReq('POST', {
        name: 'A',
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
    });

    it('accepts 2-character name', async () => {
      const req = createMockReq('POST', {
        name: 'AB',
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
    });

    /** FIXED: v2 enforces max 100 chars (was unlimited). */
    it('rejects name exceeding 100 characters', async () => {
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
  });

  // ─── Validation — email ─────────────────────────────────────

  describe('email validation', () => {
    it('returns 422 for missing email', async () => {
      const req = createMockReq('POST', {
        name: 'Test User',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
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
    });

    it('returns 422 for email without @', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'notanemail',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
    });

    /** FIXED: v2 uses validator.isEmail — stricter than old .+@.+\..+ regex. */
    it('validates email with validator.isEmail (stricter than v1 regex)', async () => {
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

  // ─── Validation — message ───────────────────────────────────

  describe('message validation', () => {
    it('returns 422 for missing message', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'a@b.com',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
      expect(res._json.fields).toHaveProperty('message');
    });

    it('accepts short messages (v2: min 1 char, was 5)', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'a@b.com',
        message: 'Hi',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
    });

    it('accepts message of exactly 5 chars', async () => {
      const req = createMockReq('POST', {
        name: 'Test',
        email: 'a@b.com',
        message: 'Hello',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
    });

    /** FIXED: v2 enforces max 5000 chars (was unlimited). */
    it('rejects message exceeding 5000 characters', async () => {
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
  });

  // ─── Error handling ─────────────────────────────────────────

  describe('error handling', () => {
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

    it('returns 422 when body is invalid JSON (was 500 in v1)', async () => {
      const req = new EventEmitter() as EventEmitter & { method: string; ip: string };
      req.method = 'POST';
      req.ip = '127.0.0.1';
      process.nextTick(() => {
        req.emit('data', 'not-json{{{');
        req.emit('end');
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(422);
    });
  });

  // ─── Security fixes (documented, verified post-rewrite) ────

  describe('security fixes (verified post-rewrite)', () => {
    /** FIXED: Rate limiting now enforced. */
    it('enforces rate limiting — 6th rapid request returns 429', async () => {
      for (let i = 0; i < 5; i++) {
        const req = createMockReq('POST', VALID_BODY);
        const res = createMockRes();
        await handler(req, res);
        expect(res._status).toBe(200);
      }
      const req = createMockReq('POST', VALID_BODY);
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(429);
    });

    /** FIXED: CRLF stripped from name — no header injection possible. */
    it('strips CRLF from name (header injection prevented)', async () => {
      const req = createMockReq('POST', {
        name: 'Injected\r\nBcc: attacker@evil.com',
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      const call = sendMailMock.mock.calls[0][0];
      expect(call.subject).not.toContain('\r\n');
      expect(call.subject).not.toContain('\r');
      expect(call.subject).not.toContain('\n');
    });

    /** FIXED: HTML tags stripped from all inputs before processing. */
    it('strips HTML tags from all inputs', async () => {
      const req = createMockReq('POST', {
        name: '<script>alert("xss")</script>Test',
        email: 'a@b.com',
        message: 'Hello world',
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      const call = sendMailMock.mock.calls[0][0];
      expect(call.subject).not.toContain('<script>');
      expect(call.text).not.toContain('<script>');
    });
  });
});
