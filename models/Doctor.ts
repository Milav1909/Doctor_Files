import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAvailability {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
}

export interface IDoctor extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    availability: IAvailability[];
    passwordHash: string;
    createdAt: Date;
}

const AvailabilitySchema = new Schema<IAvailability>({
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
    startTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    endTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    }
}, { _id: false });

const DoctorSchema = new Schema<IDoctor>({
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
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        trim: true
    },
    availability: [AvailabilitySchema],
    passwordHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for specialization lookups (email index created by unique: true)
DoctorSchema.index({ specialization: 1 });

// Prevent returning password hash in JSON
DoctorSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { passwordHash: _pw, ...rest } = ret;
        return rest;
    }
});


const Doctor: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default Doctor;
