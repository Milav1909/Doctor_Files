/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/doctorfiles';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await mongoose.connection.db.dropDatabase();
        console.log('Database cleared');

        // Hash password
        const passwordHash = await bcrypt.hash('password123', 12);

        // Create Admin
        const adminCollection = mongoose.connection.db.collection('admins');
        await adminCollection.insertOne({
            name: 'System Admin',
            email: 'admin@doctorfiles.com',
            passwordHash,
            createdAt: new Date()
        });
        console.log('Admin created: admin@doctorfiles.com / password123');

        // Create Doctors
        const doctorCollection = mongoose.connection.db.collection('doctors');
        const doctors = [
            {
                name: 'Dr. Sarah Johnson',
                email: 'sarah.johnson@doctorfiles.com',
                phone: '+1-555-0101',
                specialization: 'Cardiology',
                availability: [
                    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
                    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
                    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
                    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
                    { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' }
                ],
                passwordHash,
                createdAt: new Date()
            },
            {
                name: 'Dr. Michael Chen',
                email: 'michael.chen@doctorfiles.com',
                phone: '+1-555-0102',
                specialization: 'Dermatology',
                availability: [
                    { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
                    { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
                    { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' }
                ],
                passwordHash,
                createdAt: new Date()
            },
            {
                name: 'Dr. Emily Rodriguez',
                email: 'emily.rodriguez@doctorfiles.com',
                phone: '+1-555-0103',
                specialization: 'Pediatrics',
                availability: [
                    { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
                    { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
                    { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
                    { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
                    { dayOfWeek: 5, startTime: '08:00', endTime: '16:00' }
                ],
                passwordHash,
                createdAt: new Date()
            },
            {
                name: 'Dr. James Wilson',
                email: 'james.wilson@doctorfiles.com',
                phone: '+1-555-0104',
                specialization: 'Orthopedics',
                availability: [
                    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
                    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }
                ],
                passwordHash,
                createdAt: new Date()
            },
            {
                name: 'Dr. Lisa Park',
                email: 'lisa.park@doctorfiles.com',
                phone: '+1-555-0105',
                specialization: 'Neurology',
                availability: [
                    { dayOfWeek: 1, startTime: '09:00', endTime: '15:00' },
                    { dayOfWeek: 2, startTime: '09:00', endTime: '15:00' },
                    { dayOfWeek: 3, startTime: '09:00', endTime: '15:00' },
                    { dayOfWeek: 4, startTime: '09:00', endTime: '15:00' }
                ],
                passwordHash,
                createdAt: new Date()
            }
        ];

        await doctorCollection.insertMany(doctors);
        console.log('5 Doctors created (all with password: password123)');

        // Create sample patients
        const patientCollection = mongoose.connection.db.collection('patients');
        const patients = [
            {
                name: 'John Smith',
                email: 'john.smith@email.com',
                phone: '+1-555-1001',
                gender: 'male',
                passwordHash,
                createdAt: new Date()
            },
            {
                name: 'Jane Doe',
                email: 'jane.doe@email.com',
                phone: '+1-555-1002',
                gender: 'female',
                passwordHash,
                createdAt: new Date()
            }
        ];

        await patientCollection.insertMany(patients);
        console.log('2 Sample patients created (all with password: password123)');

        console.log('\n=== Seed Complete ===');
        console.log('Login credentials (all use password: password123):');
        console.log('  Admin: admin@doctorfiles.com');
        console.log('  Doctors: sarah.johnson@doctorfiles.com, michael.chen@doctorfiles.com, etc.');
        console.log('  Patients: john.smith@email.com, jane.doe@email.com');

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
