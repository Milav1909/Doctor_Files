/**
 * ============================================================
 * Module 5.6: Medical Records – White Box Tests
 * ============================================================
 * Covers: POST /api/medical-records (create medical record)
 *
 * CFG Paths Tested (Cyclomatic Complexity M = 3):
 *   Path 1 – Non-doctor role                   → 403
 *   Path 2 – Missing required fields            → 400
 *   Path 3 – Patient not found                  → 404
 *   Path 4 – All fields valid                   → 201 Created
 *
 * Coverage Target: 100% statement, 100% branch, 100% path
 * ============================================================
 */

import { NextRequest } from 'next/server';
import { generateToken } from '@/lib/auth';

// ── Mocks ────────────────────────────────────────────────────

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

const mockPatientFindById = jest.fn();
jest.mock('@/models/Patient', () => ({
  __esModule: true,
  default: {
    findById: (...args: unknown[]) => mockPatientFindById(...args),
  },
}));

const mockMedicalRecordCreate = jest.fn();
const mockMedicalRecordFindById = jest.fn();
const mockMedicalRecordFind = jest.fn();
const mockMedicalRecordCountDocuments = jest.fn();

jest.mock('@/models/MedicalRecord', () => ({
  __esModule: true,
  default: {
    create: (...args: unknown[]) => mockMedicalRecordCreate(...args),
    findById: (...args: unknown[]) => mockMedicalRecordFindById(...args),
    find: (...args: unknown[]) => mockMedicalRecordFind(...args),
    countDocuments: (...args: unknown[]) => mockMedicalRecordCountDocuments(...args),
  },
}));

// ── Imports (after mocks) ────────────────────────────────────

import { POST } from '@/app/api/medical-records/route';

// ── Helpers ──────────────────────────────────────────────────

const DOCTOR_ID = 'doctor-mr-100';
const PATIENT_ID = 'patient-mr-200';

function createDoctorToken(userId: string = DOCTOR_ID) {
  return generateToken({
    userId,
    email: 'doctor@test.com',
    role: 'doctor',
    name: 'Dr. Test',
  });
}

function createPatientToken() {
  return generateToken({
    userId: PATIENT_ID,
    email: 'patient@test.com',
    role: 'patient',
    name: 'Test Patient',
  });
}

function createAdminToken() {
  return generateToken({
    userId: 'admin-1',
    email: 'admin@test.com',
    role: 'admin',
    name: 'Admin',
  });
}

function createPostRequest(
  token: string,
  body: Record<string, unknown>
): NextRequest {
  return new NextRequest('http://localhost:3000/api/medical-records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

// ── Suppress console.error ───────────────────────────────────
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

// ════════════════════════════════════════════════════════════
describe('Module 5.6 – Medical Records (POST /api/medical-records)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC1 – Path 1: Patient JWT used (non-doctor) → 403
  it('TC1: should return 403 when a patient tries to create a medical record', async () => {
    const token = createPatientToken();
    const req = createPostRequest(token, {
      patientId: PATIENT_ID,
      diagnosis: 'Common cold',
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/denied|insufficient/i);
  });

  // TC1b – Admin JWT → 403 (only doctors can create)
  it('TC1b: should return 403 when an admin tries to create a medical record', async () => {
    const token = createAdminToken();
    const req = createPostRequest(token, {
      patientId: PATIENT_ID,
      diagnosis: 'Flu',
    });

    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  // TC1c – No auth → 401
  it('TC1c: should return 401 when no auth token is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/medical-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: PATIENT_ID, diagnosis: 'Cold' }),
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  // TC2 – Path 2: Missing diagnosis field → 400
  it('TC2: should return 400 when diagnosis field is missing', async () => {
    const token = createDoctorToken();
    const req = createPostRequest(token, {
      patientId: PATIENT_ID,
      // diagnosis is missing
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/required/i);
  });

  // TC2b – Missing patientId → 400
  it('TC2b: should return 400 when patientId is missing', async () => {
    const token = createDoctorToken();
    const req = createPostRequest(token, {
      diagnosis: 'Migraine',
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // TC2c – Both fields missing → 400
  it('TC2c: should return 400 when both patientId and diagnosis are missing', async () => {
    const token = createDoctorToken();
    const req = createPostRequest(token, {});

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // TC3 – Path 3: Patient not found → 404
  it('TC3: should return 404 when patientId does not exist', async () => {
    mockPatientFindById.mockResolvedValue(null);

    const token = createDoctorToken();
    const req = createPostRequest(token, {
      patientId: 'nonexistent-patient',
      diagnosis: 'Diabetes',
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toMatch(/patient not found/i);
  });

  // TC4 – Path 4: All fields valid → 201
  it('TC4: should return 201 when medical record is created successfully', async () => {
    mockPatientFindById.mockResolvedValue({
      _id: PATIENT_ID,
      name: 'Test Patient',
      email: 'patient@test.com',
    });

    mockMedicalRecordCreate.mockResolvedValue({
      _id: 'record-id-1',
      patientId: PATIENT_ID,
      doctorId: DOCTOR_ID,
      diagnosis: 'Hypertension',
      prescription: 'Amlodipine 5mg',
      notes: 'Follow up in 2 weeks',
    });

    mockMedicalRecordFindById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'record-id-1',
          patientId: { name: 'Test Patient', email: 'patient@test.com' },
          doctorId: { name: 'Dr. Test', specialization: 'Cardiology' },
          diagnosis: 'Hypertension',
          prescription: 'Amlodipine 5mg',
          notes: 'Follow up in 2 weeks',
        }),
      }),
    });

    const token = createDoctorToken();
    const req = createPostRequest(token, {
      patientId: PATIENT_ID,
      diagnosis: 'Hypertension',
      prescription: 'Amlodipine 5mg',
      notes: 'Follow up in 2 weeks',
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.message).toMatch(/created/i);
    expect(json.record).toBeDefined();
    expect(json.record.diagnosis).toBe('Hypertension');
  });

  // Verify create is called with correct doctorId from token
  it('TC4b: should set doctorId from the authenticated user\'s token', async () => {
    mockPatientFindById.mockResolvedValue({ _id: PATIENT_ID });
    mockMedicalRecordCreate.mockResolvedValue({ _id: 'rec-new' });
    mockMedicalRecordFindById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'rec-new' }),
      }),
    });

    const token = createDoctorToken();
    const req = createPostRequest(token, {
      patientId: PATIENT_ID,
      diagnosis: 'Fever',
    });

    await POST(req);

    expect(mockMedicalRecordCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: PATIENT_ID,
        doctorId: DOCTOR_ID,
        diagnosis: 'Fever',
      })
    );
  });

  // TC4c – Optional fields default to empty strings
  it('TC4c: should default prescription and notes to empty strings', async () => {
    mockPatientFindById.mockResolvedValue({ _id: PATIENT_ID });
    mockMedicalRecordCreate.mockResolvedValue({ _id: 'rec-new' });
    mockMedicalRecordFindById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'rec-new' }),
      }),
    });

    const token = createDoctorToken();
    const req = createPostRequest(token, {
      patientId: PATIENT_ID,
      diagnosis: 'Checkup',
    });

    await POST(req);

    expect(mockMedicalRecordCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        prescription: '',
        notes: '',
      })
    );
  });
});
