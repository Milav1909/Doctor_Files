import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicalRecord extends Document {
    _id: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    appointmentId?: mongoose.Types.ObjectId;
    diagnosis: string;
    prescription: string;
    notes: string;
    createdAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>({
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
    appointmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    diagnosis: {
        type: String,
        required: [true, 'Diagnosis is required'],
        trim: true
    },
    prescription: {
        type: String,
        trim: true,
        default: ''
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient queries
MedicalRecordSchema.index({ patientId: 1 });
MedicalRecordSchema.index({ doctorId: 1 });
MedicalRecordSchema.index({ patientId: 1, createdAt: -1 }); // Patient records sorted by date

const MedicalRecord: Model<IMedicalRecord> = mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);

export default MedicalRecord;
