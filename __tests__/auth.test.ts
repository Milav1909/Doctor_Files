/**
 * ============================================================
 * Module 5.1: User Authentication – White Box Tests
 * ============================================================
 * Covers: Patient Login, Doctor Login, Admin Login routes
 *
 * CFG Paths Tested (Cyclomatic Complexity M = 4 per role):
 *   Path 1 – Empty email/password           → 400
 *   Path 2 – User not found                 → 401
 *   Path 3 – Wrong password                 → 401
 *   Path 4 – Valid credentials              → 200 + JWT
 *
 * Coverage Target: 100% statement, 100% branch, 100% path
 * ============================================================
 */

import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────

// Mock DB connection (no-op in tests)
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

// Mock auth utilities
const mockVerifyPassword = jest.fn();
const mockGenerateToken = jest.fn().mockReturnValue('mock-jwt-token');
const mockHashPassword = jest.fn().mockResolvedValue('hashed-pw');

jest.mock('@/lib/auth', () => ({
  __esModule: true,
  verifyPassword: (...args: unknown[]) => mockVerifyPassword(...args),
  generateToken: (...args: unknown[]) => mockGenerateToken(...args),
  hashPassword: (...args: unknown[]) => mockHashPassword(...args),
}));

// Mock Patient model
const mockPatientFindOne = jest.fn();
jest.mock('@/models/Patient', () => ({
  __esModule: true,
  default: {
    findOne: (...args: unknown[]) => mockPatientFindOne(...args),
    create: jest.fn(),
  },
}));

// Mock Doctor model
const mockDoctorFindOne = jest.fn();
jest.mock('@/models/Doctor', () => ({
  __esModule: true,
  default: {
    findOne: (...args: unknown[]) => mockDoctorFindOne(...args),
  },
}));

// Mock Admin model
const mockAdminFindOne = jest.fn();
jest.mock('@/models/Admin', () => ({
  __esModule: true,
  default: {
    findOne: (...args: unknown[]) => mockAdminFindOne(...args),
  },
}));

// ── Imports (after mocks) ────────────────────────────────────

import { POST as patientLogin } from '@/app/api/auth/patient/login/route';
import { POST as doctorLogin } from '@/app/api/auth/doctor/login/route';
import { POST as adminLogin } from '@/app/api/auth/admin/login/route';

// ── Helpers ──────────────────────────────────────────────────

function createLoginRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/patient/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Suppress console.error ───────────────────────────────────
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

// ════════════════════════════════════════════════════════════
// 5.1.1  Patient Login
// ════════════════════════════════════════════════════════════

describe('Module 5.1 – User Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────
  describe('Patient Login POST /api/auth/patient/login', () => {
    // TC1 – Path 1: Empty fields → 400
    it('TC1: should return 400 when email or password is empty', async () => {
      const req = createLoginRequest({ email: '', password: '' });
      const res = await patientLogin(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/required/i);
    });

    // TC1b – Only email missing
    it('TC1b: should return 400 when only email is missing', async () => {
      const req = createLoginRequest({ password: 'test123' });
      const res = await patientLogin(req);

      expect(res.status).toBe(400);
    });

    // TC1c – Only password missing
    it('TC1c: should return 400 when only password is missing', async () => {
      const req = createLoginRequest({ email: 'test@test.com' });
      const res = await patientLogin(req);

      expect(res.status).toBe(400);
    });

    // TC2 – Path 2: Patient not found → 401
    it('TC2: should return 401 when email is not registered', async () => {
      mockPatientFindOne.mockResolvedValue(null);

      const req = createLoginRequest({
        email: 'notfound@test.com',
        password: 'test123',
      });
      const res = await patientLogin(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toMatch(/invalid/i);
    });

    // TC3 – Path 3: Wrong password → 401
    it('TC3: should return 401 when password is incorrect', async () => {
      mockPatientFindOne.mockResolvedValue({
        _id: { toString: () => 'pat-1' },
        email: 'patient@test.com',
        name: 'Test Patient',
        passwordHash: 'hashed-pw',
      });
      mockVerifyPassword.mockResolvedValue(false);

      const req = createLoginRequest({
        email: 'patient@test.com',
        password: 'wrongpass',
      });
      const res = await patientLogin(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toMatch(/invalid/i);
    });

    // TC4 – Path 4: Valid credentials → 200 + JWT
    it('TC4: should return 200 with JWT token on valid credentials', async () => {
      mockPatientFindOne.mockResolvedValue({
        _id: { toString: () => 'pat-1' },
        email: 'patient@test.com',
        name: 'Test Patient',
        passwordHash: 'hashed-pw',
      });
      mockVerifyPassword.mockResolvedValue(true);

      const req = createLoginRequest({
        email: 'patient@test.com',
        password: 'correct-pass',
      });
      const res = await patientLogin(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.token).toBe('mock-jwt-token');
      expect(json.user).toBeDefined();
      expect(json.user.role).toBe('patient');
      expect(json.message).toMatch(/successful/i);
    });

    // Verify generateToken receives correct payload
    it('TC4b: should call generateToken with correct payload', async () => {
      mockPatientFindOne.mockResolvedValue({
        _id: { toString: () => 'pat-123' },
        email: 'patient@test.com',
        name: 'Test Patient',
        passwordHash: 'hashed-pw',
      });
      mockVerifyPassword.mockResolvedValue(true);

      const req = createLoginRequest({
        email: 'patient@test.com',
        password: 'correct-pass',
      });
      await patientLogin(req);

      expect(mockGenerateToken).toHaveBeenCalledWith({
        userId: 'pat-123',
        email: 'patient@test.com',
        role: 'patient',
        name: 'Test Patient',
      });
    });

    // Verify passwordHash is NOT in response
    it('TC4c: should never return passwordHash in user object', async () => {
      mockPatientFindOne.mockResolvedValue({
        _id: { toString: () => 'pat-1' },
        email: 'patient@test.com',
        name: 'Test Patient',
        passwordHash: 'secret-hash',
      });
      mockVerifyPassword.mockResolvedValue(true);

      const req = createLoginRequest({
        email: 'patient@test.com',
        password: 'correct-pass',
      });
      const res = await patientLogin(req);
      const json = await res.json();

      expect(json.user.passwordHash).toBeUndefined();
    });
  });

  // ──────────────────────────────────────────────────────────
  describe('Doctor Login POST /api/auth/doctor/login', () => {
    // TC1 – Empty fields → 400
    it('TC1: should return 400 when fields are empty', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', password: '' }),
      });
      const res = await doctorLogin(req);

      expect(res.status).toBe(400);
    });

    // TC2 – Doctor not found → 401
    it('TC2: should return 401 when doctor email not found', async () => {
      mockDoctorFindOne.mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nobody@test.com', password: 'test123' }),
      });
      const res = await doctorLogin(req);

      expect(res.status).toBe(401);
    });

    // TC3 – Wrong password → 401
    it('TC3: should return 401 on wrong password', async () => {
      mockDoctorFindOne.mockResolvedValue({
        _id: { toString: () => 'doc-1' },
        email: 'doctor@test.com',
        name: 'Dr. Test',
        specialization: 'General',
        passwordHash: 'hashed-pw',
      });
      mockVerifyPassword.mockResolvedValue(false);

      const req = new NextRequest('http://localhost:3000/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'doctor@test.com', password: 'wrong' }),
      });
      const res = await doctorLogin(req);

      expect(res.status).toBe(401);
    });

    // TC4 – Valid credentials → 200 + JWT
    it('TC4: should return 200 with JWT on valid credentials', async () => {
      mockDoctorFindOne.mockResolvedValue({
        _id: { toString: () => 'doc-1' },
        email: 'doctor@test.com',
        name: 'Dr. Test',
        specialization: 'Cardiology',
        passwordHash: 'hashed-pw',
      });
      mockVerifyPassword.mockResolvedValue(true);

      const req = new NextRequest('http://localhost:3000/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'doctor@test.com', password: 'correct' }),
      });
      const res = await doctorLogin(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.token).toBe('mock-jwt-token');
      expect(json.user.role).toBe('doctor');
      expect(json.user.specialization).toBe('Cardiology');
    });
  });

  // ──────────────────────────────────────────────────────────
  describe('Admin Login POST /api/auth/admin/login', () => {
    // TC1 – Empty fields → 400
    it('TC1: should return 400 when fields are empty', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const res = await adminLogin(req);

      expect(res.status).toBe(400);
    });

    // TC2 – Admin not found → 401
    it('TC2: should return 401 when admin email not found', async () => {
      mockAdminFindOne.mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'fake@admin.com', password: 'test' }),
      });
      const res = await adminLogin(req);

      expect(res.status).toBe(401);
    });

    // TC3 – Wrong password → 401
    it('TC3: should return 401 on wrong password', async () => {
      mockAdminFindOne.mockResolvedValue({
        _id: { toString: () => 'admin-1' },
        email: 'admin@test.com',
        name: 'Admin',
        passwordHash: 'hashed-pw',
      });
      mockVerifyPassword.mockResolvedValue(false);

      const req = new NextRequest('http://localhost:3000/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@test.com', password: 'wrong' }),
      });
      const res = await adminLogin(req);

      expect(res.status).toBe(401);
    });

    // TC4 – Valid credentials → 200 + JWT
    it('TC4: should return 200 with JWT on valid credentials', async () => {
      mockAdminFindOne.mockResolvedValue({
        _id: { toString: () => 'admin-1' },
        email: 'admin@test.com',
        name: 'Admin',
        passwordHash: 'hashed-pw',
      });
      mockVerifyPassword.mockResolvedValue(true);

      const req = new NextRequest('http://localhost:3000/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@test.com', password: 'correct' }),
      });
      const res = await adminLogin(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.token).toBe('mock-jwt-token');
      expect(json.user.role).toBe('admin');
    });
  });
});
