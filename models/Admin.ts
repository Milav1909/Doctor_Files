import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
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
AdminSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { passwordHash: _pw, ...rest } = ret;
        return rest;
    }
});


const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
