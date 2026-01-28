import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';
import Appointment from '@/models/Appointment';
import { authenticateAndAuthorize } from '@/middleware/authMiddleware';

// GET /api/admin/stats - Get system statistics
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();

        // Get counts
        const [
            totalPatients,
            totalDoctors,
            totalAppointments,
            pendingAppointments,
            approvedAppointments,
            completedAppointments,
            cancelledAppointments,
            todayAppointments
        ] = await Promise.all([
            Patient.countDocuments(),
            Doctor.countDocuments(),
            Appointment.countDocuments(),
            Appointment.countDocuments({ status: 'pending' }),
            Appointment.countDocuments({ status: 'approved' }),
            Appointment.countDocuments({ status: 'completed' }),
            Appointment.countDocuments({ status: 'cancelled' }),
            Appointment.countDocuments({
                date: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            })
        ]);

        // Get recent activity
        const recentAppointments = await Appointment.find()
            .populate('patientId', 'name')
            .populate('doctorId', 'name specialization')
            .sort({ createdAt: -1 })
            .limit(10);

        return NextResponse.json({
            stats: {
                totalPatients,
                totalDoctors,
                totalAppointments,
                pendingAppointments,
                approvedAppointments,
                completedAppointments,
                cancelledAppointments,
                todayAppointments
            },
            recentActivity: recentAppointments
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
