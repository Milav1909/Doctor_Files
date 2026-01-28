import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';
import Admin from '@/models/Admin';
import { authenticateAndAuthorize } from '@/middleware/authMiddleware';

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // patient, doctor, admin, or all
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        // Fetch based on type
        if (type === 'patient') {
            const total = await Patient.countDocuments(searchQuery);
            const patients = await Patient.find(searchQuery)
                .select('-passwordHash')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            return NextResponse.json({
                users: patients.map(p => ({ ...p.toJSON(), role: 'patient' })),
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
        }

        if (type === 'doctor') {
            const total = await Doctor.countDocuments(searchQuery);
            const doctors = await Doctor.find(searchQuery)
                .select('-passwordHash')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            return NextResponse.json({
                users: doctors.map(d => ({ ...d.toJSON(), role: 'doctor' })),
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
        }

        if (type === 'admin') {
            const total = await Admin.countDocuments(searchQuery);
            const admins = await Admin.find(searchQuery)
                .select('-passwordHash')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            return NextResponse.json({
                users: admins.map(a => ({ ...a.toJSON(), role: 'admin' })),
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
        }

        // Get all users (default)
        const [patients, doctors, admins] = await Promise.all([
            Patient.find(searchQuery).select('-passwordHash').limit(50),
            Doctor.find(searchQuery).select('-passwordHash').limit(50),
            Admin.find(searchQuery).select('-passwordHash').limit(10)
        ]);

        const allUsers = [
            ...patients.map(p => ({ ...p.toJSON(), role: 'patient' as const })),
            ...doctors.map(d => ({ ...d.toJSON(), role: 'doctor' as const })),
            ...admins.map(a => ({ ...a.toJSON(), role: 'admin' as const }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            users: allUsers.slice(skip, skip + limit),
            pagination: {
                page,
                limit,
                total: allUsers.length,
                totalPages: Math.ceil(allUsers.length / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
