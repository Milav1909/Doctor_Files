// Re-export all models for convenient imports
export { default as Patient } from './Patient';
export type { IPatient } from './Patient';

export { default as Doctor } from './Doctor';
export type { IDoctor, IAvailability } from './Doctor';

export { default as Admin } from './Admin';
export type { IAdmin } from './Admin';

export { default as Appointment } from './Appointment';
export type { IAppointment, AppointmentStatus } from './Appointment';

export { default as MedicalRecord } from './MedicalRecord';
export type { IMedicalRecord } from './MedicalRecord';
