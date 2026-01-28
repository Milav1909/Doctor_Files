import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Doctor from '@/models/Doctor';
import { authenticateAndAuthorize } from '@/middleware/authMiddleware';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/doctors/[id] - Get doctor by ID
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        await connectDB();

        const { id } = await context.params;

        const doctor = await Doctor.findById(id).select('-passwordHash');

        if (!doctor) {
            return NextResponse.json(
                { error: 'Doctor not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ doctor });
    } catch (error) {
        console.error('Error fetching doctor:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/doctors/[id] - Update doctor profile (doctor only)
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['doctor']);
        if ('error' in authResult) return authResult.error;

        await connectDB();

        const { id } = await context.params;
        const { user } = authResult;

        // Doctors can only update their own profile
        if (user.userId !== id) {
            return NextResponse.json(
                { error: 'Access denied. You can only update your own profile.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, phone, specialization, availability } = body;

        const updateData: Record<string, unknown> = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (specialization) updateData.specialization = specialization;
        if (availability) updateData.availability = availability;

        const doctor = await Doctor.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!doctor) {
            return NextResponse.json(
                { error: 'Doctor not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            doctor
        });
    } catch (error) {
        console.error('Error updating doctor:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
