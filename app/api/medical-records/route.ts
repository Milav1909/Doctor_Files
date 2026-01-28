import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MedicalRecord from '@/models/MedicalRecord';
import Patient from '@/models/Patient';
import { authenticateAndAuthorize } from '@/middleware/authMiddleware';

// GET /api/medical-records - Get medical records
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['patient', 'doctor', 'admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { user } = authResult;

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Build query based on role
        const query: Record<string, unknown> = {};

        if (user.role === 'patient') {
            // Patients can only see their own records
            query.patientId = user.userId;
        } else if (user.role === 'doctor') {
            // Doctors can see records of their patients
            query.doctorId = user.userId;
            if (patientId) {
                query.patientId = patientId;
            }
        } else if (user.role === 'admin') {
            // Admin can filter by patient
            if (patientId) {
                query.patientId = patientId;
            }
        }

        const total = await MedicalRecord.countDocuments(query);

        const records = await MedicalRecord.find(query)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name specialization')
            .populate('appointmentId', 'date time')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return NextResponse.json({
            records,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching medical records:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/medical-records - Create medical record (doctor only)
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['doctor']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { user } = authResult;

        const body = await request.json();
        const { patientId, appointmentId, diagnosis, prescription, notes } = body;

        // Validate required fields
        if (!patientId || !diagnosis) {
            return NextResponse.json(
                { error: 'Patient ID and diagnosis are required' },
                { status: 400 }
            );
        }

        // Verify patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 }
            );
        }

        // Create medical record
        const record = await MedicalRecord.create({
            patientId,
            doctorId: user.userId,
            appointmentId: appointmentId || undefined,
            diagnosis,
            prescription: prescription || '',
            notes: notes || ''
        });

        const populatedRecord = await MedicalRecord.findById(record._id)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name specialization');

        return NextResponse.json(
            {
                message: 'Medical record created',
                record: populatedRecord
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating medical record:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
