/**
 * ============================================================
 * Module 5.3: Appointment Booking – White Box Tests
 * ============================================================
 * Covers: POST /api/appointments (create appointment)
 *
 * CFG Paths Tested (Cyclomatic Complexity M = 5):
 *   Path 1 – Wrong role (not patient)          → 403
 *   Path 2 – Missing required fields           → 400
 *   Path 3 – Doctor not found                  → 404
 *   Path 4 – Time slot conflict                → 409
 *   Path 5 – All valid, slot free              → 201 Created
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

const mockDoctorFindById = jest.fn();
jest.mock('@/models/Doctor', () => ({
  __esModule: true,
  default: {
    findById: (...args: unknown[]) => mockDoctorFindById(...args),
  },
}));

const mockPatientFindById = jest.fn();
jest.mock('@/models/Patient', () => ({
  __esModule: true,
  default: {
    findById: (...args: unknown[]) => mockPatientFindById(...args),
  },
}));

const mockAppointmentFindOne = jest.fn();
const mockAppointmentCreate = jest.fn();
const mockAppointmentFindById = jest.fn();
const mockAppointmentCountDocuments = jest.fn();
const mockAppointmentFind = jest.fn();

jest.mock('@/models/Appointment', () => ({
  __esModule: true,
  default: {
    findOne: (...args: unknown[]) => mockAppointmentFindOne(...args),
    create: (...args: unknown[]) => mockAppointmentCreate(...args),
    findById: (...args: unknown[]) => mockAppointmentFindById(...args),
    countDocuments: (...args: unknown[]) => mockAppointmentCountDocuments(...args),
    find: (...args: unknown[]) => mockAppointmentFind(...args),
  },
}));

// ── Imports (after mocks) ────────────────────────────────────

import { POST } from '@/app/api/appointments/route';

// ── Helpers ──────────────────────────────────────────────────

const PATIENT_ID = 'patient-id-123';
const DOCTOR_ID = 'doctor-id-456';

function createPatientToken(userId: string = PATIENT_ID) {
  return generateToken({
    userId,
    email: 'patient@test.com',
    role: 'patient',
    name: 'Test Patient',
  });
}

function createDoctorToken() {
  return generateToken({
    userId: DOCTOR_ID,
    email: 'doctor@test.com',
    role: 'doctor',
    name: 'Dr. Test',
  });
}

function createAppointmentRequest(
  token: string,
  body: Record<string, unknown>
): NextRequest {
  return new NextRequest('http://localhost:3000/api/appointments', {
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
describe('Module 5.3 – Appointment Booking (POST /api/appointments)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC1 – Path 1: Wrong role (doctor JWT, not patient) → 403
  it('TC1: should return 403 when a doctor tries to create an appointment', async () => {
    const token = createDoctorToken();
    const req = createAppointmentRequest(token, {
      doctorId: DOCTOR_ID,
      date: '2026-05-01',
      time: '10:00',
    });

    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  // TC1b – No token at all → 401
  it('TC1b: should return 401 when no auth token is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId: DOCTOR_ID, date: '2026-05-01', time: '10:00' }),
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  // TC2 – Path 2: Missing required fields → 400
  it('TC2: should return 400 when "time" field is missing', async () => {
    const token = createPatientToken();
    const req = createAppointmentRequest(token, {
      doctorId: DOCTOR_ID,
      date: '2026-05-01',
      // time is missing
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/required/i);
  });

  // TC2b – Missing doctorId
  it('TC2b: should return 400 when "doctorId" is missing', async () => {
    const token = createPatientToken();
    const req = createAppointmentRequest(token, {
      date: '2026-05-01',
      time: '10:00',
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // TC2c – Missing date
  it('TC2c: should return 400 when "date" is missing', async () => {
    const token = createPatientToken();
    const req = createAppointmentRequest(token, {
      doctorId: DOCTOR_ID,
      time: '10:00',
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // TC3 – Path 3: Doctor not found → 404
  it('TC3: should return 404 when doctorId does not exist', async () => {
    mockDoctorFindById.mockResolvedValue(null);

    const token = createPatientToken();
    const req = createAppointmentRequest(token, {
      doctorId: 'nonexistent-doc',
      date: '2026-05-01',
      time: '10:00',
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toMatch(/doctor not found/i);
  });

  // TC4 – Path 4: Slot already booked → 409
  it('TC4: should return 409 when time slot is already booked', async () => {
    mockDoctorFindById.mockResolvedValue({ _id: DOCTOR_ID, name: 'Dr. Test' });
    mockPatientFindById.mockResolvedValue({ _id: PATIENT_ID, name: 'Patient' });
    mockAppointmentFindOne.mockResolvedValue({
      _id: 'existing-appt',
      status: 'pending',
    });

    const token = createPatientToken();
    const req = createAppointmentRequest(token, {
      doctorId: DOCTOR_ID,
      date: '2026-05-01',
      time: '10:00',
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toMatch(/already booked/i);
  });

  // Verify conflict check uses correct status filter
  it('TC4b: should check conflict with status $in [pending, approved]', async () => {
    mockDoctorFindById.mockResolvedValue({ _id: DOCTOR_ID });
    mockPatientFindById.mockResolvedValue({ _id: PATIENT_ID });
    mockAppointmentFindOne.mockResolvedValue({ _id: 'conflict' });

    const token = createPatientToken();
    const req = createAppointmentRequest(token, {
      doctorId: DOCTOR_ID,
      date: '2026-05-01',
      time: '14:00',
    });

    await POST(req);

    expect(mockAppointmentFindOne).toHaveBeenCalledWith(
      expect.objectContaining({
        doctorId: DOCTOR_ID,
        time: '14:00',
        status: { $in: ['pending', 'approved'] },
      })
    );
  });

  // TC5 – Path 5: All valid, slot free → 201
  it('TC5: should return 201 when appointment is created successfully', async () => {
    mockDoctorFindById.mockResolvedValue({ _id: DOCTOR_ID, name: 'Dr. Test' });
    mockPatientFindById.mockResolvedValue({ _id: PATIENT_ID, name: 'Patient' });
    mockAppointmentFindOne.mockResolvedValue(null); // no conflict
    mockAppointmentCreate.mockResolvedValue({
      _id: 'new-appt-id',
      patientId: PATIENT_ID,
      doctorId: DOCTOR_ID,
      date: new Date('2026-05-01'),
      time: '10:00',
      status: 'pending',
    });
    mockAppointmentFindById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'new-appt-id',
          patientId: { name: 'Patient', email: 'p@test.com' },
          doctorId: { name: 'Dr. Test', email: 'd@test.com' },
          date: new Date('2026-05-01'),
          time: '10:00',
          status: 'pending',
        }),
      }),
    });

    const token = createPatientToken();
    const req = createAppointmentRequest(token, {
      doctorId: DOCTOR_ID,
      date: '2026-05-01',
      time: '10:00',
      reason: 'Routine checkup',
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.message).toMatch(/submitted/i);
    expect(json.appointment).toBeDefined();
  });

  // Verify create is called with correct data
  it('TC5b: should create appointment with status "pending"', async () => {
    mockDoctorFindById.mockResolvedValue({ _id: DOCTOR_ID });
    mockPatientFindById.mockResolvedValue({ _id: PATIENT_ID });
    mockAppointmentFindOne.mockResolvedValue(null);
    mockAppointmentCreate.mockResolvedValue({ _id: 'new-id' });
    mockAppointmentFindById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'new-id' }),
      }),
    });

    const token = createPatientToken();
    const req = createAppointmentRequest(token, {
      doctorId: DOCTOR_ID,
      date: '2026-05-01',
      time: '10:00',
    });

    await POST(req);

    expect(mockAppointmentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: PATIENT_ID,
        doctorId: DOCTOR_ID,
        time: '10:00',
        status: 'pending',
      })
    );
  });
});
