import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';
import { authenticateAndAuthorize } from '@/middleware/authMiddleware';

// GET /api/appointments - Get appointments for current user
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['patient', 'doctor', 'admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { user } = authResult;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Build query based on role
        const query: Record<string, unknown> = {};

        if (user.role === 'patient') {
            query.patientId = user.userId;
        } else if (user.role === 'doctor') {
            query.doctorId = user.userId;
        }
        // Admin sees all appointments

        if (status) {
            query.status = status;
        }

        const total = await Appointment.countDocuments(query);

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name email specialization')
            .skip(skip)
            .limit(limit)
            .sort({ date: -1, createdAt: -1 });

        return NextResponse.json({
            appointments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/appointments - Create new appointment (patient only)
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['patient']);
        if ('error' in authResult) return authResult.error;

        await connectDB();
        const { user } = authResult;

        const body = await request.json();
        const { doctorId, date, time, reason } = body;

        // Validate required fields
        if (!doctorId || !date || !time) {
            return NextResponse.json(
                { error: 'Doctor ID, date, and time are required' },
                { status: 400 }
            );
        }

        // Verify doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { error: 'Doctor not found' },
                { status: 404 }
            );
        }

        // Verify patient exists
        const patient = await Patient.findById(user.userId);
        if (!patient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 }
            );
        }

        // Check for conflicting appointments
        const appointmentDate = new Date(date);
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: appointmentDate,
            time,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingAppointment) {
            return NextResponse.json(
                { error: 'This time slot is already booked' },
                { status: 409 }
            );
        }

        // Create appointment with pending status
        const appointment = await Appointment.create({
            patientId: user.userId,
            doctorId,
            date: appointmentDate,
            time,
            reason: reason || '',
            status: 'pending'
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name email specialization');

        return NextResponse.json(
            {
                message: 'Appointment request submitted',
                appointment: populatedAppointment
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
