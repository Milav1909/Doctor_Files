# Doctor Files — Class Diagram

## Mermaid Class Diagram

```mermaid
classDiagram
    direction TB

    class Patient {
        +ObjectId _id
        +String name
        +String email
        +String phone
        +String gender
        -String passwordHash
        +Date createdAt
    }

    class Doctor {
        +ObjectId _id
        +String name
        +String email
        +String phone
        +String specialization
        +Availability[] availability
        -String passwordHash
        +Date createdAt
    }

    class Admin {
        +ObjectId _id
        +String name
        +String email
        -String passwordHash
        +Date createdAt
    }

    class Availability {
        +Number dayOfWeek
        +String startTime
        +String endTime
    }

    class Appointment {
        +ObjectId _id
        +ObjectId patientId
        +ObjectId doctorId
        +Date date
        +String time
        +String reason
        +AppointmentStatus status
        +Date createdAt
    }

    class MedicalRecord {
        +ObjectId _id
        +ObjectId patientId
        +ObjectId doctorId
        +ObjectId appointmentId
        +String diagnosis
        +String prescription
        +String notes
        +Date createdAt
    }

    class AppointmentStatus {
        <<enumeration>>
        pending
        approved
        rejected
        cancelled
        completed
    }

    class Gender {
        <<enumeration>>
        male
        female
        other
    }

    class UserRole {
        <<enumeration>>
        patient
        doctor
        admin
    }

    class JWTPayload {
        +String userId
        +String email
        +UserRole role
        +String name
    }

    class AuthContext {
        +User user
        +String token
        +Boolean isLoading
        +login(email, password, role) Promise~void~
        +register(data) Promise~void~
        +logout() void
    }

    %% ── Relationships ──

    Doctor "1" *-- "0..*" Availability : embeds

    Patient "1" -- "0..*" Appointment : books
    Doctor "1" -- "0..*" Appointment : receives

    Patient "1" -- "0..*" MedicalRecord : has
    Doctor "1" -- "0..*" MedicalRecord : creates

    Appointment "0..1" -- "0..*" MedicalRecord : linked to

    Appointment --> AppointmentStatus : uses
    Patient --> Gender : uses
    JWTPayload --> UserRole : uses
    AuthContext --> JWTPayload : authenticates via
```

## Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| Doctor → Availability | Composition (embedded) | Each doctor embeds an array of availability slots |
| Patient → Appointment | One-to-Many | A patient can book many appointments |
| Doctor → Appointment | One-to-Many | A doctor can receive many appointments |
| Patient → MedicalRecord | One-to-Many | A patient can have many medical records |
| Doctor → MedicalRecord | One-to-Many | A doctor can create many medical records |
| Appointment → MedicalRecord | One-to-Many (optional) | A medical record may optionally reference an appointment |

## Enumerations

| Enum | Values |
|---|---|
| `AppointmentStatus` | `pending`, `approved`, `rejected`, `cancelled`, `completed` |
| `Gender` | `male`, `female`, `other` |
| `UserRole` | `patient`, `doctor`, `admin` |

## Notes

- **Password Security**: All user models (`Patient`, `Doctor`, `Admin`) store a hashed password (`passwordHash`) which is excluded from JSON serialization via a `toJSON` transform.
- **Authentication**: JWT-based authentication with role-based access control (RBAC). Tokens carry a `JWTPayload` containing user ID, email, role, and name.
- **Indexes**: `Appointment` is indexed on `patientId`, `doctorId`, `date`, `status`, and a composite `(doctorId, date)`. `MedicalRecord` is indexed on `patientId`, `doctorId`, and composite `(patientId, createdAt)`. `Doctor` is indexed on `specialization`.
