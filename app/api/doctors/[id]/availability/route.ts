import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Doctor from '@/models/Doctor';
import { authenticateAndAuthorize } from '@/middleware/authMiddleware';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/doctors/[id]/availability - Get doctor availability
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        await connectDB();

        const { id } = await context.params;

        const doctor = await Doctor.findById(id).select('availability name');

        if (!doctor) {
            return NextResponse.json(
                { error: 'Doctor not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            doctorId: doctor._id,
            doctorName: doctor.name,
            availability: doctor.availability
        });
    } catch (error) {
        console.error('Error fetching availability:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/doctors/[id]/availability - Update doctor availability
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['doctor']);
        if ('error' in authResult) return authResult.error;

        await connectDB();

        const { id } = await context.params;
        const { user } = authResult;

        // Doctors can only update their own availability
        if (user.userId !== id) {
            return NextResponse.json(
                { error: 'Access denied. You can only update your own availability.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { availability } = body;

        if (!Array.isArray(availability)) {
            return NextResponse.json(
                { error: 'Availability must be an array' },
                { status: 400 }
            );
        }

        // Validate availability format
        for (const slot of availability) {
            if (
                typeof slot.dayOfWeek !== 'number' ||
                slot.dayOfWeek < 0 ||
                slot.dayOfWeek > 6 ||
                !slot.startTime ||
                !slot.endTime
            ) {
                return NextResponse.json(
                    { error: 'Invalid availability format' },
                    { status: 400 }
                );
            }
        }

        const doctor = await Doctor.findByIdAndUpdate(
            id,
            { $set: { availability } },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!doctor) {
            return NextResponse.json(
                { error: 'Doctor not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Availability updated successfully',
            availability: doctor.availability
        });
    } catch (error) {
        console.error('Error updating availability:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
