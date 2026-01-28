import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';
import Appointment from '@/models/Appointment';
import MedicalRecord from '@/models/MedicalRecord';
import { authenticateAndAuthorize } from '@/middleware/authMiddleware';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/patients/[id] - Get patient details
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['patient', 'doctor', 'admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { user } = authResult;
        const { id } = await context.params;

        // Patients can only view their own profile
        if (user.role === 'patient' && user.userId !== id) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        const patient = await Patient.findById(id).select('-passwordHash');

        if (!patient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ patient });
    } catch (error) {
        console.error('Error fetching patient:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/patients/[id] - Update patient profile
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['patient', 'admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { user } = authResult;
        const { id } = await context.params;

        // Patients can only update their own profile
        if (user.role === 'patient' && user.userId !== id) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, phone, gender } = body;

        const updateData: Record<string, unknown> = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (gender) updateData.gender = gender;

        const patient = await Patient.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!patient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            patient
        });
    } catch (error) {
        console.error('Error updating patient:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/patients/[id] - Delete patient (admin only)
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { id } = await context.params;

        const patient = await Patient.findById(id);
        if (!patient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 }
            );
        }

        // Delete related records
        await Appointment.deleteMany({ patientId: id });
        await MedicalRecord.deleteMany({ patientId: id });
        await Patient.findByIdAndDelete(id);

        return NextResponse.json({
            message: 'Patient and related records deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting patient:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
