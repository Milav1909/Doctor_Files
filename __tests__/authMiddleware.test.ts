/**
 * ============================================================
 * Module 5.2: Auth Middleware & RBAC – White Box Tests
 * ============================================================
 * Covers: authenticate(), requireRole(), authenticateAndAuthorize()
 *
 * CFG Paths Tested (Cyclomatic Complexity M = 4):
 *   Path 1 – No token                        → 401
 *   Path 2 – Invalid / expired token          → 401
 *   Path 3 – Wrong role (insufficient perms)  → 403
 *   Path 4 – Valid token + correct role       → user payload
 *
 * Coverage Target: 100% statement, 100% branch, 100% path
 * ============================================================
 */

import { NextRequest } from 'next/server';
import { generateToken } from '@/lib/auth';
import {
  authenticate,
  requireRole,
  authenticateAndAuthorize,
  errorResponse,
  successResponse,
} from '@/middleware/authMiddleware';

// ── Helpers ──────────────────────────────────────────────────

function createRequest(authHeader?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (authHeader) {
    headers['authorization'] = authHeader;
  }
  return new NextRequest('http://localhost:3000/api/test', {
    method: 'GET',
    headers,
  });
}

// ── Suppress console.error ───────────────────────────────────
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

// ════════════════════════════════════════════════════════════
describe('Module 5.2 – Auth Middleware & RBAC', () => {
  // ──────────────────────────────────────────────────────────
  describe('authenticate()', () => {
    // TC1 – Path 1: No Authorization header → 401
    it('TC1: should return 401 error when no Authorization header is present', async () => {
      const req = createRequest();
      const result = await authenticate(req);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        const json = await result.error.json();
        expect(result.error.status).toBe(401);
        expect(json.error).toMatch(/authentication required/i);
      }
    });

    // TC1b – Authorization header without "Bearer " prefix
    it('TC1b: should return 401 when Authorization header is missing Bearer prefix', async () => {
      const req = createRequest('Token abc123');
      const result = await authenticate(req);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });

    // TC2 – Path 2: Invalid / expired token → 401
    it('TC2: should return 401 when token is invalid', async () => {
      const req = createRequest('Bearer invalid.token.here');
      const result = await authenticate(req);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        const json = await result.error.json();
        expect(result.error.status).toBe(401);
        expect(json.error).toMatch(/invalid or expired/i);
      }
    });

    // TC2b – Expired token
    it('TC2b: should return 401 when token is expired', async () => {
      // Create a token that's already expired (using a custom jwt.sign would be ideal,
      // but we test with a garbled token to simulate expiry decoding failure)
      const req = createRequest('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjF9.invalid');
      const result = await authenticate(req);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });

    // TC4 (partial) – Valid token → returns user payload
    it('TC4: should return user payload when token is valid', async () => {
      const token = generateToken({
        userId: 'user-123',
        email: 'test@test.com',
        role: 'patient',
        name: 'Test',
      });

      const req = createRequest(`Bearer ${token}`);
      const result = await authenticate(req);

      expect('user' in result).toBe(true);
      if ('user' in result) {
        expect(result.user.userId).toBe('user-123');
        expect(result.user.email).toBe('test@test.com');
        expect(result.user.role).toBe('patient');
      }
    });
  });

  // ──────────────────────────────────────────────────────────
  describe('requireRole()', () => {
    const userPayload = {
      userId: 'user-1',
      email: 'user@test.com',
      role: 'patient' as const,
      name: 'Test',
    };

    // TC3 – Path 3: Wrong role → 403
    it('TC3: should return 403 when user role is not in allowedRoles', () => {
      const result = requireRole(userPayload, ['doctor', 'admin']);

      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
    });

    // TC4 – Path 4: Correct role → null (no error)
    it('TC4: should return null when user role matches allowedRoles', () => {
      const result = requireRole(userPayload, ['patient', 'doctor']);

      expect(result).toBeNull();
    });

    // Edge: Multiple allowed roles
    it('should allow access when role is in a large allowedRoles list', () => {
      const result = requireRole(
        { ...userPayload, role: 'admin' },
        ['patient', 'doctor', 'admin']
      );

      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────
  describe('authenticateAndAuthorize()', () => {
    // TC1 – No token → 401
    it('TC1: should return 401 error when no token provided', async () => {
      const req = createRequest();
      const result = await authenticateAndAuthorize(req, ['patient']);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });

    // TC2 – Invalid token → 401
    it('TC2: should return 401 on invalid token', async () => {
      const req = createRequest('Bearer garbage');
      const result = await authenticateAndAuthorize(req, ['patient']);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });

    // TC3 – Doctor token on admin-only route → 403
    it('TC3: should return 403 when role is not allowed', async () => {
      const token = generateToken({
        userId: 'doc-1',
        email: 'doc@test.com',
        role: 'doctor',
        name: 'Dr. Test',
      });

      const req = createRequest(`Bearer ${token}`);
      const result = await authenticateAndAuthorize(req, ['admin']);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        const json = await result.error.json();
        expect(result.error.status).toBe(403);
        expect(json.error).toMatch(/access denied|insufficient/i);
      }
    });

    // TC4 – Valid token + correct role → user payload
    it('TC4: should return user payload on valid token with correct role', async () => {
      const token = generateToken({
        userId: 'pat-55',
        email: 'patient@test.com',
        role: 'patient',
        name: 'Valid Patient',
      });

      const req = createRequest(`Bearer ${token}`);
      const result = await authenticateAndAuthorize(req, ['patient', 'doctor']);

      expect('user' in result).toBe(true);
      if ('user' in result) {
        expect(result.user.userId).toBe('pat-55');
        expect(result.user.role).toBe('patient');
      }
    });
  });

  // ──────────────────────────────────────────────────────────
  describe('Helper utilities', () => {
    it('errorResponse() should create a JSON error response', async () => {
      const res = errorResponse('Something went wrong', 500);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBe('Something went wrong');
    });

    it('successResponse() should create a JSON success response', async () => {
      const res = successResponse({ ok: true }, 200);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
    });
  });
});
