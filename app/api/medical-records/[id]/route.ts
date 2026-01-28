import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MedicalRecord from '@/models/MedicalRecord';
import { authenticateAndAuthorize } from '@/middleware/authMiddleware';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/medical-records/[id] - Get specific medical record
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['patient', 'doctor', 'admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { user } = authResult;
        const { id } = await context.params;

        const record = await MedicalRecord.findById(id)
            .populate('patientId', 'name email phone gender')
            .populate('doctorId', 'name email specialization')
            .populate('appointmentId', 'date time status');

        if (!record) {
            return NextResponse.json(
                { error: 'Medical record not found' },
                { status: 404 }
            );
        }

        // Check access rights
        if (user.role === 'patient' && record.patientId._id.toString() !== user.userId) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        if (user.role === 'doctor' && record.doctorId._id.toString() !== user.userId) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json({ record });
    } catch (error) {
        console.error('Error fetching medical record:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/medical-records/[id] - Update medical record (doctor only)
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['doctor']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { user } = authResult;
        const { id } = await context.params;

        const record = await MedicalRecord.findById(id);
        if (!record) {
            return NextResponse.json(
                { error: 'Medical record not found' },
                { status: 404 }
            );
        }

        // Doctors can only update their own records
        if (record.doctorId.toString() !== user.userId) {
            return NextResponse.json(
                { error: 'Access denied. You can only update your own records.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { diagnosis, prescription, notes } = body;

        const updateData: Record<string, unknown> = {};
        if (diagnosis) updateData.diagnosis = diagnosis;
        if (prescription !== undefined) updateData.prescription = prescription;
        if (notes !== undefined) updateData.notes = notes;

        const updatedRecord = await MedicalRecord.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('patientId', 'name email')
            .populate('doctorId', 'name specialization');

        return NextResponse.json({
            message: 'Medical record updated successfully',
            record: updatedRecord
        });
    } catch (error) {
        console.error('Error updating medical record:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
