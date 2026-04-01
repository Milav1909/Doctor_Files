/**
 * Seed Script: Create 100 Patient Accounts
 * 
 * Usage: npx ts-node scripts/seed-patient.ts
 * 
 * Creates 100 patients with realistic Indian names and details.
 * All passwords are set to 'patient123' for testing convenience.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file!');
    process.exit(1);
}

// Patient schema (matching the Patient model)
const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
    createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

const firstNamesMale = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Sai', 'Arnav',
    'Dhruv', 'Kabir', 'Ritvik', 'Aniket', 'Ishaan', 'Shaurya', 'Atharv',
    'Advik', 'Pranav', 'Advait', 'Ayaan', 'Darsh', 'Rudra', 'Krish', 'Parth',
    'Yash', 'Dev', 'Harsh', 'Rohan', 'Kunal', 'Varun', 'Nikhil',
    'Rahul', 'Sahil', 'Tejas', 'Ankit', 'Gaurav', 'Manav', 'Kartik', 'Saurabh',
    'Chirag', 'Jayesh', 'Hitesh', 'Mehul', 'Neeraj', 'Piyush', 'Rishi',
    'Sumit', 'Tushar', 'Utkarsh', 'Viraj', 'Yuvraj'
];

const firstNamesFemale = [
    'Aanya', 'Diya', 'Saanvi', 'Myra', 'Ananya', 'Aadhya', 'Aarohi', 'Pari',
    'Anika', 'Navya', 'Kiara', 'Isha', 'Riya', 'Sneha', 'Priya',
    'Kavya', 'Tanvi', 'Shruti', 'Pooja', 'Nisha', 'Meera', 'Sanya', 'Avni',
    'Jiya', 'Tara', 'Simran', 'Neha', 'Divya', 'Rashmi', 'Pallavi',
    'Aparna', 'Bhavna', 'Charmi', 'Deepa', 'Ekta', 'Falguni', 'Garima',
    'Heena', 'Ira', 'Juhi', 'Komal', 'Latika', 'Manya', 'Nupur', 'Oviya',
    'Pragya', 'Radhika', 'Sakshi', 'Trisha', 'Uma'
];

const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Nair',
    'Iyer', 'Joshi', 'Mehta', 'Shah', 'Chopra', 'Malhotra', 'Bhat',
    'Kulkarni', 'Desai', 'Pillai', 'Menon', 'Rao', 'Agarwal', 'Mishra',
    'Pandey', 'Tiwari', 'Saxena', 'Chauhan', 'Yadav', 'Thakur', 'Jain', 'Kapoor'
];

// Generate 100 patients
function generatePatients() {
    const patients = [];
    const usedEmails = new Set<string>();

    for (let i = 0; i < 100; i++) {
        const isMale = i < 50; // 50 male, 50 female
        const firstName = isMale
            ? firstNamesMale[i % firstNamesMale.length]
            : firstNamesFemale[(i - 50) % firstNamesFemale.length];
        const lastName = lastNames[i % lastNames.length];
        const name = `${firstName} ${lastName}`;

        // Create unique email
        let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`;
        if (usedEmails.has(email)) {
            email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;
        }
        usedEmails.add(email);

        const phone = `+91-${9000000000 + i * 100 + Math.floor(Math.random() * 99)}`;
        const gender: 'male' | 'female' | 'other' = isMale ? 'male' : 'female';

        patients.push({ name, email, phone, gender });
    }

    return patients;
}

async function seedPatients() {
    const patients = generatePatients();

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash('patient123', salt);

        let created = 0;
        let skipped = 0;

        for (const pat of patients) {
            const existing = await Patient.findOne({ email: pat.email.toLowerCase() });
            if (existing) {
                console.log(`   ⏭️  Skipped (exists): ${pat.email}`);
                skipped++;
                continue;
            }

            await Patient.create({
                name: pat.name,
                email: pat.email.toLowerCase(),
                passwordHash,
                phone: pat.phone,
                gender: pat.gender
            });

            console.log(`   ✅ Created: ${pat.name} (${pat.gender})`);
            created++;
        }

        console.log(`\n========================================`);
        console.log(`   Total Created: ${created}`);
        console.log(`   Total Skipped: ${skipped}`);
        console.log(`   Password for all: patient123`);
        console.log(`========================================\n`);

    } catch (error) {
        console.error('Error seeding patients:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedPatients();
