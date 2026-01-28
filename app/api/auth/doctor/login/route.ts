import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Doctor from '@/models/Doctor';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find doctor by email
        const doctor = await Doctor.findOne({ email: email.toLowerCase() });
        if (!doctor) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, doctor.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({
            userId: doctor._id.toString(),
            email: doctor.email,
            role: 'doctor',
            name: doctor.name
        });

        return NextResponse.json({
            message: 'Login successful',
            token,
            user: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
                role: 'doctor'
            }
        });
    } catch (error) {
        console.error('Doctor login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
