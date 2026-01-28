import mongoose, { Schema, Document, Model } from 'mongoose';

export type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface IAppointment extends Document {
    _id: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    date: Date;
    time: string;
    reason?: string;
    status: AppointmentStatus;
    createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient ID is required']
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor ID is required']
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    time: {
        type: String,
        required: [true, 'Appointment time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient queries
AppointmentSchema.index({ patientId: 1 });
AppointmentSchema.index({ doctorId: 1 });
AppointmentSchema.index({ date: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ doctorId: 1, date: 1 }); // Composite index for doctor schedule

const Appointment: Model<IAppointment> = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
