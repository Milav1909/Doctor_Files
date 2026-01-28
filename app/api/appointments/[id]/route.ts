import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Appointment, { AppointmentStatus } from '@/models/Appointment';
import { authenticateAndAuthorize } from '@/middleware/authMiddleware';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/appointments/[id] - Get specific appointment
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['patient', 'doctor', 'admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { user } = authResult;
        const { id } = await context.params;

        const appointment = await Appointment.findById(id)
            .populate('patientId', 'name email phone gender')
            .populate('doctorId', 'name email specialization phone');

        if (!appointment) {
            return NextResponse.json(
                { error: 'Appointment not found' },
                { status: 404 }
            );
        }

        // Check access rights
        if (user.role === 'patient' && appointment.patientId._id.toString() !== user.userId) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        if (user.role === 'doctor' && appointment.doctorId._id.toString() !== user.userId) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json({ appointment });
    } catch (error) {
        console.error('Error fetching appointment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/appointments/[id] - Update appointment status
export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['patient', 'doctor', 'admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { user } = authResult;
        const { id } = await context.params;

        const body = await request.json();
        const { status, date, time } = body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return NextResponse.json(
                { error: 'Appointment not found' },
                { status: 404 }
            );
        }

        // Role-based status update permissions
        const allowedTransitions: Record<string, { roles: string[]; from: AppointmentStatus[] }> = {
            approved: {
                roles: ['doctor'],
                from: ['pending']
            },
            rejected: {
                roles: ['doctor'],
                from: ['pending']
            },
            cancelled: {
                roles: ['patient', 'admin'],
                from: ['pending', 'approved']
            },
            completed: {
                roles: ['doctor'],
                from: ['approved']
            },
            pending: {
                roles: ['doctor'],
                from: ['pending'] // For rescheduling
            }
        };

        if (status) {
            const transition = allowedTransitions[status];

            if (!transition) {
                return NextResponse.json(
                    { error: 'Invalid status' },
                    { status: 400 }
                );
            }

            if (!transition.roles.includes(user.role)) {
                return NextResponse.json(
                    { error: 'You are not authorized to set this status' },
                    { status: 403 }
                );
            }

            if (!transition.from.includes(appointment.status)) {
                return NextResponse.json(
                    { error: `Cannot transition from ${appointment.status} to ${status}` },
                    { status: 400 }
                );
            }

            // Verify ownership for non-admin users
            if (user.role === 'patient' && appointment.patientId.toString() !== user.userId) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }

            if (user.role === 'doctor' && appointment.doctorId.toString() !== user.userId) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }

            appointment.status = status;
        }

        // Handle rescheduling (doctor only)
        if (date || time) {
            if (user.role !== 'doctor') {
                return NextResponse.json(
                    { error: 'Only doctors can reschedule appointments' },
                    { status: 403 }
                );
            }

            if (appointment.doctorId.toString() !== user.userId) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }

            if (date) appointment.date = new Date(date);
            if (time) appointment.time = time;
            appointment.status = 'pending'; // Reset to pending on reschedule
        }

        await appointment.save();

        const updatedAppointment = await Appointment.findById(id)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name email specialization');

        return NextResponse.json({
            message: 'Appointment updated successfully',
            appointment: updatedAppointment
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
