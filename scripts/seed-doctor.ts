/**
 * Seed Script: Create 25 Doctor Accounts
 * 
 * Usage: npx ts-node scripts/seed-doctor.ts
 * 
 * Creates 25 doctors with varied specializations and availability.
 * All passwords are set to 'doctor123' for testing convenience.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file!');
    process.exit(1);
}

// Doctor schema (matching the Doctor model)
const AvailabilitySchema = new mongoose.Schema({
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    specialization: { type: String, required: true },
    availability: [AvailabilitySchema],
    createdAt: { type: Date, default: Date.now }
});

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

const doctors = [
    { name: 'Dr. Aarav Sharma', email: 'aarav.sharma@doctorfiles.com', phone: '+91-9876543201', specialization: 'Cardiology' },
    { name: 'Dr. Priya Patel', email: 'priya.patel@doctorfiles.com', phone: '+91-9876543202', specialization: 'Dermatology' },
    { name: 'Dr. Rohan Gupta', email: 'rohan.gupta@doctorfiles.com', phone: '+91-9876543203', specialization: 'Neurology' },
    { name: 'Dr. Ananya Reddy', email: 'ananya.reddy@doctorfiles.com', phone: '+91-9876543204', specialization: 'Pediatrics' },
    { name: 'Dr. Vikram Singh', email: 'vikram.singh@doctorfiles.com', phone: '+91-9876543205', specialization: 'Orthopedics' },
    { name: 'Dr. Sneha Iyer', email: 'sneha.iyer@doctorfiles.com', phone: '+91-9876543206', specialization: 'Gynecology' },
    { name: 'Dr. Arjun Nair', email: 'arjun.nair@doctorfiles.com', phone: '+91-9876543207', specialization: 'Ophthalmology' },
    { name: 'Dr. Kavita Desai', email: 'kavita.desai@doctorfiles.com', phone: '+91-9876543208', specialization: 'ENT' },
    { name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@doctorfiles.com', phone: '+91-9876543209', specialization: 'General Medicine' },
    { name: 'Dr. Meera Joshi', email: 'meera.joshi@doctorfiles.com', phone: '+91-9876543210', specialization: 'Psychiatry' },
    { name: 'Dr. Siddharth Mehta', email: 'siddharth.mehta@doctorfiles.com', phone: '+91-9876543211', specialization: 'Urology' },
    { name: 'Dr. Deepika Kulkarni', email: 'deepika.kulkarni@doctorfiles.com', phone: '+91-9876543212', specialization: 'Endocrinology' },
    { name: 'Dr. Aditya Verma', email: 'aditya.verma@doctorfiles.com', phone: '+91-9876543213', specialization: 'Pulmonology' },
    { name: 'Dr. Nisha Bhat', email: 'nisha.bhat@doctorfiles.com', phone: '+91-9876543214', specialization: 'Oncology' },
    { name: 'Dr. Karthik Menon', email: 'karthik.menon@doctorfiles.com', phone: '+91-9876543215', specialization: 'Gastroenterology' },
    { name: 'Dr. Pooja Saxena', email: 'pooja.saxena@doctorfiles.com', phone: '+91-9876543216', specialization: 'Rheumatology' },
    { name: 'Dr. Manish Tiwari', email: 'manish.tiwari@doctorfiles.com', phone: '+91-9876543217', specialization: 'Nephrology' },
    { name: 'Dr. Swati Chopra', email: 'swati.chopra@doctorfiles.com', phone: '+91-9876543218', specialization: 'Cardiology' },
    { name: 'Dr. Nikhil Rao', email: 'nikhil.rao@doctorfiles.com', phone: '+91-9876543219', specialization: 'Dermatology' },
    { name: 'Dr. Ritu Agarwal', email: 'ritu.agarwal@doctorfiles.com', phone: '+91-9876543220', specialization: 'Neurology' },
    { name: 'Dr. Harsh Pandey', email: 'harsh.pandey@doctorfiles.com', phone: '+91-9876543221', specialization: 'Orthopedics' },
    { name: 'Dr. Tanvi Shah', email: 'tanvi.shah@doctorfiles.com', phone: '+91-9876543222', specialization: 'Pediatrics' },
    { name: 'Dr. Amit Mishra', email: 'amit.mishra@doctorfiles.com', phone: '+91-9876543223', specialization: 'General Medicine' },
    { name: 'Dr. Shreya Pillai', email: 'shreya.pillai@doctorfiles.com', phone: '+91-9876543224', specialization: 'Gynecology' },
    { name: 'Dr. Vivek Chauhan', email: 'vivek.chauhan@doctorfiles.com', phone: '+91-9876543225', specialization: 'Psychiatry' },
];

// Generate availability slots for a doctor (Mon-Sat, varied timings)
function generateAvailability(index: number) {
    const slots = [];
    const startHours = ['09:00', '10:00', '08:00', '11:00', '09:30'];
    const endHours = ['17:00', '18:00', '16:00', '19:00', '17:30'];

    // Each doctor works 4-5 days a week
    const workDays = [1, 2, 3, 4, 5]; // Mon-Fri base
    if (index % 3 === 0) workDays.push(6); // Some work Saturdays

    for (const day of workDays) {
        slots.push({
            dayOfWeek: day,
            startTime: startHours[index % startHours.length],
            endTime: endHours[index % endHours.length]
        });
    }
    return slots;
}

async function seedDoctors() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash('doctor123', salt);

        let created = 0;
        let skipped = 0;

        for (let i = 0; i < doctors.length; i++) {
            const doc = doctors[i];
            const existing = await Doctor.findOne({ email: doc.email.toLowerCase() });
            if (existing) {
                console.log(`   ⏭️  Skipped (exists): ${doc.email}`);
                skipped++;
                continue;
            }

            await Doctor.create({
                name: doc.name,
                email: doc.email.toLowerCase(),
                passwordHash,
                phone: doc.phone,
                specialization: doc.specialization,
                availability: generateAvailability(i)
            });

            console.log(`   ✅ Created: ${doc.name} (${doc.specialization})`);
            created++;
        }

        console.log(`\n========================================`);
        console.log(`   Total Created: ${created}`);
        console.log(`   Total Skipped: ${skipped}`);
        console.log(`   Password for all: doctor123`);
        console.log(`========================================\n`);

    } catch (error) {
        console.error('Error seeding doctors:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedDoctors();
