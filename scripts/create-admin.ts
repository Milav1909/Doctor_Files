/**
 * Seed Script: Create Admin Account
 * 
 * Usage: npx ts-node scripts/create-admin.ts
 * 
 * This script creates admin accounts manually (as per the diagram,
 * admins cannot self-register and must be created by dev)
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

// Admin schema (matching the Admin model)
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function createAdmin() {
    // ========================================
    // CONFIGURE ADMIN DETAILS HERE
    // ========================================
    const adminData = {
        name: 'System Admin',
        email: 'admin@doctorfiles.com',
        password: 'password123'  // Plain text password (will be hashed)
    };
    // ========================================

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existing = await Admin.findOne({ email: adminData.email.toLowerCase() });
        if (existing) {
            console.log('❌ Admin with this email already exists!');
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(adminData.password, salt);

        // Create admin
        const admin = await Admin.create({
            name: adminData.name,
            email: adminData.email.toLowerCase(),
            passwordHash
        });

        console.log('\n✅ Admin created successfully!');
        console.log('   Name:', admin.name);
        console.log('   Email:', admin.email);
        console.log('\n   Login at: http://localhost:3000/login (select Admin)');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createAdmin();
