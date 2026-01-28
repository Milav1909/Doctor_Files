import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';
import { authenticateAndAuthorize } from '@/middleware/authMiddleware';

// GET /api/patients - Get patients (doctor/admin only)
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateAndAuthorize(request, ['doctor', 'admin']);
        if ('error' in authResult) return authResult.error;

        await connectDB();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Patient.countDocuments(query);

        const patients = await Patient.find(query)
            .select('-passwordHash')
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        return NextResponse.json({
            patients,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
