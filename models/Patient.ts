import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPatient extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    passwordHash: string;
    createdAt: Date;
}

const PatientSchema = new Schema<IPatient>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['male', 'female', 'other']
    },
    passwordHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent returning password hash in JSON
PatientSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { passwordHash: _pw, ...rest } = ret;
        return rest;
    }
});


const Patient: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

export default Patient;
