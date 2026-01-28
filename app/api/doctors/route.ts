import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Doctor from '@/models/Doctor';

// GET /api/doctors - Search doctors by specialization
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const specialization = searchParams.get('specialization');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Build query
        const query: Record<string, unknown> = {};

        if (specialization) {
            query.specialization = { $regex: specialization, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } }
            ];
        }

        // Get total count for pagination
        const total = await Doctor.countDocuments(query);

        // Fetch doctors with pagination
        const doctors = await Doctor.find(query)
            .select('-passwordHash')
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        return NextResponse.json({
            doctors,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
