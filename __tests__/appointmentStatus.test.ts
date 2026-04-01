/**
 * ============================================================
 * Module 5.4: Appointment Status Management – White Box Tests
 * ============================================================
 * Covers: PATCH /api/appointments/[id] (update appointment status)
 *
 * CFG Paths Tested (Cyclomatic Complexity M = 5):
 *   Path 1 – Appointment not found               → 404
 *   Path 2 – Doctor updating another's appt       → 403
 *   Path 3 – Patient trying non-cancel action      → 403
 *   Path 4 – Doctor approves own appointment       → 200
 *   Path 5 – Patient cancels own appointment       → 200
 *
 * Coverage Target: 100% statement, 100% branch, 95% path
 * ============================================================
 */

import { NextRequest } from 'next/server';
import { generateToken } from '@/lib/auth';

// ── Mocks ────────────────────────────────────────────────────

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

const mockAppointmentFindById = jest.fn();
const mockAppointmentSave = jest.fn();

jest.mock('@/models/Appointment', () => ({
  __esModule: true,
  default: {
    findById: (...args: unknown[]) => mockAppointmentFindById(...args),
  },
  AppointmentStatus: {},
}));

// ── Imports (after mocks) ────────────────────────────────────

import { PATCH } from '@/app/api/appointments/[id]/route';

// ── Helpers ──────────────────────────────────────────────────

const DOCTOR_ID = 'doctor-id-100';
const PATIENT_ID = 'patient-id-200';
const APPOINTMENT_ID = 'appt-id-300';
const OTHER_DOCTOR_ID = 'doctor-id-999';

function createDoctorToken(userId: string = DOCTOR_ID) {
  return generateToken({
    userId,
    email: 'doctor@test.com',
    role: 'doctor',
    name: 'Dr. Test',
  });
}

function createPatientToken(userId: string = PATIENT_ID) {
  return generateToken({
    userId,
    email: 'patient@test.com',
    role: 'patient',
    name: 'Test Patient',
  });
}

function createAdminToken() {
  return generateToken({
    userId: 'admin-id-1',
    email: 'admin@test.com',
    role: 'admin',
    name: 'Admin',
  });
}

function createPatchRequest(
  token: string,
  body: Record<string, unknown>
): NextRequest {
  return new NextRequest(
    `http://localhost:3000/api/appointments/${APPOINTMENT_ID}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
}

function createMockAppointment(overrides: Record<string, unknown> = {}) {
  return {
    _id: APPOINTMENT_ID,
    patientId: { toString: () => PATIENT_ID },
    doctorId: { toString: () => DOCTOR_ID },
    date: new Date('2026-05-01'),
    time: '10:00',
    status: 'pending',
    save: mockAppointmentSave,
    ...overrides,
  };
}

const mockContext = {
  params: Promise.resolve({ id: APPOINTMENT_ID }),
};

// ── Suppress console.error ───────────────────────────────────
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

// ════════════════════════════════════════════════════════════
describe('Module 5.4 – Appointment Status Management (PATCH /api/appointments/[id])', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppointmentSave.mockResolvedValue(undefined);
  });

  // TC1 – Path 1: Appointment not found → 404
  it('TC1: should return 404 when appointment ID does not exist', async () => {
    mockAppointmentFindById.mockResolvedValue(null);

    const token = createDoctorToken();
    const req = createPatchRequest(token, { status: 'approved' });

    const res = await PATCH(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toMatch(/not found/i);
  });

  // TC2 – Path 2: Doctor updating another doctor's appointment → 403
  it('TC2: should return 403 when doctor tries to update another doctor\'s appointment', async () => {
    const appt = createMockAppointment();
    mockAppointmentFindById.mockResolvedValue(appt);

    // Token for a DIFFERENT doctor
    const token = createDoctorToken(OTHER_DOCTOR_ID);
    const req = createPatchRequest(token, { status: 'approved' });

    const res = await PATCH(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/access denied/i);
  });

  // TC3 – Path 3: Patient trying to approve (non-cancel action) → 403
  it('TC3: should return 403 when patient tries to approve an appointment', async () => {
    const appt = createMockAppointment();
    mockAppointmentFindById.mockResolvedValue(appt);

    const token = createPatientToken();
    const req = createPatchRequest(token, { status: 'approved' });

    const res = await PATCH(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toBeDefined();
  });

  // TC3b – Patient trying to reject → 403
  it('TC3b: should return 403 when patient tries to reject an appointment', async () => {
    const appt = createMockAppointment();
    mockAppointmentFindById.mockResolvedValue(appt);

    const token = createPatientToken();
    const req = createPatchRequest(token, { status: 'rejected' });

    const res = await PATCH(req, mockContext);

    expect(res.status).toBe(403);
  });

  // TC4 – Path 4: Doctor approves own pending appointment → 200
  it('TC4: should return 200 when doctor approves their own pending appointment', async () => {
    const appt = createMockAppointment({ status: 'pending' });
    mockAppointmentFindById
      .mockResolvedValueOnce(appt) // first call: findById in handler
      .mockReturnValueOnce({       // second call: findById for populate
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            ...appt,
            status: 'approved',
            patientId: { name: 'Patient', email: 'p@test.com' },
            doctorId: { name: 'Dr. Test', email: 'd@test.com' },
          }),
        }),
      });

    const token = createDoctorToken(DOCTOR_ID);
    const req = createPatchRequest(token, { status: 'approved' });

    const res = await PATCH(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/updated/i);
    expect(mockAppointmentSave).toHaveBeenCalled();
  });

  // TC4b – Doctor rejects own pending appointment → 200
  it('TC4b: should return 200 when doctor rejects their own pending appointment', async () => {
    const appt = createMockAppointment({ status: 'pending' });
    mockAppointmentFindById
      .mockResolvedValueOnce(appt)
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({ ...appt, status: 'rejected' }),
        }),
      });

    const token = createDoctorToken(DOCTOR_ID);
    const req = createPatchRequest(token, { status: 'rejected' });

    const res = await PATCH(req, mockContext);

    expect(res.status).toBe(200);
    expect(mockAppointmentSave).toHaveBeenCalled();
  });

  // TC4c – Doctor completes own approved appointment → 200
  it('TC4c: should return 200 when doctor completes an approved appointment', async () => {
    const appt = createMockAppointment({ status: 'approved' });
    mockAppointmentFindById
      .mockResolvedValueOnce(appt)
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({ ...appt, status: 'completed' }),
        }),
      });

    const token = createDoctorToken(DOCTOR_ID);
    const req = createPatchRequest(token, { status: 'completed' });

    const res = await PATCH(req, mockContext);

    expect(res.status).toBe(200);
  });

  // TC5 – Path 5: Patient cancels own appointment → 200
  it('TC5: should return 200 when patient cancels their own pending appointment', async () => {
    const appt = createMockAppointment({ status: 'pending' });
    mockAppointmentFindById
      .mockResolvedValueOnce(appt)
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({ ...appt, status: 'cancelled' }),
        }),
      });

    const token = createPatientToken(PATIENT_ID);
    const req = createPatchRequest(token, { status: 'cancelled' });

    const res = await PATCH(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/updated/i);
    expect(mockAppointmentSave).toHaveBeenCalled();
  });

  // TC5b – Patient cancels approved appointment → 200
  it('TC5b: should return 200 when patient cancels an approved appointment', async () => {
    const appt = createMockAppointment({ status: 'approved' });
    mockAppointmentFindById
      .mockResolvedValueOnce(appt)
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({ ...appt, status: 'cancelled' }),
        }),
      });

    const token = createPatientToken(PATIENT_ID);
    const req = createPatchRequest(token, { status: 'cancelled' });

    const res = await PATCH(req, mockContext);

    expect(res.status).toBe(200);
  });

  // Edge: Invalid status value → 400
  it('should return 400 for an invalid status value', async () => {
    const appt = createMockAppointment();
    mockAppointmentFindById.mockResolvedValue(appt);

    const token = createDoctorToken(DOCTOR_ID);
    const req = createPatchRequest(token, { status: 'invalid_status' });

    const res = await PATCH(req, mockContext);

    expect(res.status).toBe(400);
  });

  // Edge: Invalid state transition (e.g., approve a completed appointment) → 400
  it('should return 400 for invalid state transition', async () => {
    const appt = createMockAppointment({ status: 'completed' });
    mockAppointmentFindById.mockResolvedValue(appt);

    const token = createDoctorToken(DOCTOR_ID);
    const req = createPatchRequest(token, { status: 'approved' });

    const res = await PATCH(req, mockContext);

    expect(res.status).toBe(400);
  });

  // Edge: Admin cancels any appointment → 200
  it('should return 200 when admin cancels any appointment', async () => {
    const appt = createMockAppointment({ status: 'pending' });
    mockAppointmentFindById
      .mockResolvedValueOnce(appt)
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({ ...appt, status: 'cancelled' }),
        }),
      });

    const token = createAdminToken();
    const req = createPatchRequest(token, { status: 'cancelled' });

    const res = await PATCH(req, mockContext);

    expect(res.status).toBe(200);
  });

  // Edge: No auth token → 401
  it('should return 401 when no auth token is provided', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/appointments/${APPOINTMENT_ID}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      }
    );

    const res = await PATCH(req, mockContext);

    expect(res.status).toBe(401);
  });
});
