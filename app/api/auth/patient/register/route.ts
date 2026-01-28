import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { name, email, phone, gender, password } = body;

        // Validate required fields
        if (!name || !email || !phone || !gender || !password) {
            return NextResponse.json(
                { error: 'All fields are required: name, email, phone, gender, password' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingPatient = await Patient.findOne({ email: email.toLowerCase() });
        if (existingPatient) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Validate password strength
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Hash password and create patient
        const passwordHash = await hashPassword(password);
        const patient = await Patient.create({
            name,
            email: email.toLowerCase(),
            phone,
            gender,
            passwordHash
        });

        // Generate JWT token
        const token = generateToken({
            userId: patient._id.toString(),
            email: patient.email,
            role: 'patient',
            name: patient.name
        });

        return NextResponse.json(
            {
                message: 'Registration successful',
                token,
                user: {
                    id: patient._id,
                    name: patient.name,
                    email: patient.email,
                    role: 'patient'
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
