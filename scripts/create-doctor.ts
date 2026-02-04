/**
 * Seed Script: Create Doctor Account
 * 
 * Usage: npx ts-node scripts/create-doctor.ts
 * 
 * This script creates doctor accounts manually (as per the diagram,
 * doctors cannot self-register and must be created by dev/admin after verification)
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB connection string from .env
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file!');
    process.exit(1);
}

// Doctor schema (matching the Doctor model)
const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    specialization: { type: String, required: true }
}, { timestamps: true });

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

async function createDoctor() {
    // ========================================
    // CONFIGURE DOCTOR DETAILS HERE
    // ========================================
    const doctorData = {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@doctorfiles.com',
        password: 'password123',  // Plain text password (will be hashed)
        phone: '+91-9876543210',
        specialization: 'Cardiology'
    };
    // ========================================

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if doctor already exists
        const existing = await Doctor.findOne({ email: doctorData.email.toLowerCase() });
        if (existing) {
            console.log('❌ Doctor with this email already exists!');
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(doctorData.password, salt);

        // Create doctor
        const doctor = await Doctor.create({
            name: doctorData.name,
            email: doctorData.email.toLowerCase(),
            passwordHash,
            phone: doctorData.phone,
            specialization: doctorData.specialization
        });

        console.log('\n✅ Doctor created successfully!');
        console.log('   Name:', doctor.name);
        console.log('   Email:', doctor.email);
        console.log('   Specialization:', doctor.specialization);
        console.log('\n   Login at: http://localhost:3000/login (select Doctor)');

    } catch (error) {
        console.error('Error creating doctor:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createDoctor();
