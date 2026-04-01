/**
 * ============================================================
 * Module 5.5: Doctor Availability – White Box Tests
 * ============================================================
 * Covers: PUT /api/doctors/[id]/availability
 *
 * CFG Paths Tested (Cyclomatic Complexity M = 4):
 *   Path 1 – userId mismatch (another doctor's schedule) → 403
 *   Path 2 – availability is not an array                → 400
 *   Path 3 – Invalid slot in loop (dayOfWeek out of range) → 400
 *   Path 4 – All slots valid                              → 200
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

const mockDoctorFindByIdAndUpdate = jest.fn();
jest.mock('@/models/Doctor', () => ({
  __esModule: true,
  default: {
    findByIdAndUpdate: (...args: unknown[]) => mockDoctorFindByIdAndUpdate(...args),
  },
}));

// ── Imports (after mocks) ────────────────────────────────────

import { PUT } from '@/app/api/doctors/[id]/availability/route';

// ── Helpers ──────────────────────────────────────────────────

const DOCTOR_ID = 'doctor-avail-123';
const OTHER_DOCTOR_ID = 'doctor-avail-999';

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
    userId: 'patient-1',
    email: 'patient@test.com',
    role: 'patient',
    name: 'Test Patient',
  });
}

function createPutRequest(
  token: string,
  body: Record<string, unknown>
): NextRequest {
  return new NextRequest(
    `http://localhost:3000/api/doctors/${DOCTOR_ID}/availability`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
}

const mockContext = {
  params: Promise.resolve({ id: DOCTOR_ID }),
};

// ── Suppress console.error ───────────────────────────────────
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

// ════════════════════════════════════════════════════════════
describe('Module 5.5 – Doctor Availability (PUT /api/doctors/[id]/availability)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC1 – Path 1: Doctor updating another doctor's schedule → 403
  it('TC1: should return 403 when doctor tries to update another doctor\'s availability', async () => {
    const token = createDoctorToken(OTHER_DOCTOR_ID);
    const req = createPutRequest(token, {
      availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
    });

    const res = await PUT(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/access denied/i);
  });

  // TC1b – Non-doctor role → 403
  it('TC1b: should return 403 when a patient tries to update availability', async () => {
    const token = createPatientToken();
    const req = createPutRequest(token, {
      availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
    });

    const res = await PUT(req, mockContext);

    expect(res.status).toBe(403);
  });

  // TC1c – No auth → 401
  it('TC1c: should return 401 when no auth token is provided', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/doctors/${DOCTOR_ID}/availability`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
        }),
      }
    );

    const res = await PUT(req, mockContext);

    expect(res.status).toBe(401);
  });

  // TC2 – Path 2: availability is not an array → 400
  it('TC2: should return 400 when availability is not an array', async () => {
    const token = createDoctorToken();
    const req = createPutRequest(token, {
      availability: 'not-an-array',
    });

    const res = await PUT(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/array/i);
  });

  // TC2b – availability is an object
  it('TC2b: should return 400 when availability is an object instead of array', async () => {
    const token = createDoctorToken();
    const req = createPutRequest(token, {
      availability: { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
    });

    const res = await PUT(req, mockContext);

    expect(res.status).toBe(400);
  });

  // TC3 – Path 3: Invalid slot (dayOfWeek = 8) → 400
  it('TC3: should return 400 when dayOfWeek is out of range (8)', async () => {
    const token = createDoctorToken();
    const req = createPutRequest(token, {
      availability: [{ dayOfWeek: 8, startTime: '09:00', endTime: '17:00' }],
    });

    const res = await PUT(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/invalid/i);
  });

  // TC3b – dayOfWeek negative
  it('TC3b: should return 400 when dayOfWeek is negative (-1)', async () => {
    const token = createDoctorToken();
    const req = createPutRequest(token, {
      availability: [{ dayOfWeek: -1, startTime: '09:00', endTime: '17:00' }],
    });

    const res = await PUT(req, mockContext);

    expect(res.status).toBe(400);
  });

  // TC3c – Missing startTime
  it('TC3c: should return 400 when startTime is missing', async () => {
    const token = createDoctorToken();
    const req = createPutRequest(token, {
      availability: [{ dayOfWeek: 1, endTime: '17:00' }],
    });

    const res = await PUT(req, mockContext);

    expect(res.status).toBe(400);
  });

  // TC3d – Missing endTime
  it('TC3d: should return 400 when endTime is missing', async () => {
    const token = createDoctorToken();
    const req = createPutRequest(token, {
      availability: [{ dayOfWeek: 1, startTime: '09:00' }],
    });

    const res = await PUT(req, mockContext);

    expect(res.status).toBe(400);
  });

  // TC3e – Mixed valid and invalid slots (loop testing)
  it('TC3e: should return 400 when any slot in the array is invalid', async () => {
    const token = createDoctorToken();
    const req = createPutRequest(token, {
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // valid
        { dayOfWeek: 10, startTime: '09:00', endTime: '17:00' }, // invalid
      ],
    });

    const res = await PUT(req, mockContext);

    expect(res.status).toBe(400);
  });

  // TC4 – Path 4: All valid slots → 200
  it('TC4: should return 200 when all availability slots are valid', async () => {
    const validAvailability = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '16:00' },
    ];

    mockDoctorFindByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: DOCTOR_ID,
        name: 'Dr. Test',
        availability: validAvailability,
      }),
    });

    const token = createDoctorToken();
    const req = createPutRequest(token, { availability: validAvailability });

    const res = await PUT(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/updated/i);
    expect(json.availability).toHaveLength(3);
  });

  // TC4b – Empty availability array (valid – clearing schedule)
  it('TC4b: should return 200 when availability is an empty array', async () => {
    mockDoctorFindByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: DOCTOR_ID,
        name: 'Dr. Test',
        availability: [],
      }),
    });

    const token = createDoctorToken();
    const req = createPutRequest(token, { availability: [] });

    const res = await PUT(req, mockContext);

    expect(res.status).toBe(200);
  });

  // Verify findByIdAndUpdate is called with correct params
  it('should call findByIdAndUpdate with $set and correct options', async () => {
    const slots = [{ dayOfWeek: 0, startTime: '08:00', endTime: '12:00' }];

    mockDoctorFindByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: DOCTOR_ID,
        availability: slots,
      }),
    });

    const token = createDoctorToken();
    const req = createPutRequest(token, { availability: slots });

    await PUT(req, mockContext);

    expect(mockDoctorFindByIdAndUpdate).toHaveBeenCalledWith(
      DOCTOR_ID,
      { $set: { availability: slots } },
      { new: true, runValidators: true }
    );
  });
});
