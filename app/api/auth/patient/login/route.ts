import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';
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

        // Find patient by email
        const patient = await Patient.findOne({ email: email.toLowerCase() });
        if (!patient) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, patient.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({
            userId: patient._id.toString(),
            email: patient.email,
            role: 'patient',
            name: patient.name
        });

        return NextResponse.json({
            message: 'Login successful',
            token,
            user: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                role: 'patient'
            }
        });
    } catch (error) {
        console.error('Patient login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
