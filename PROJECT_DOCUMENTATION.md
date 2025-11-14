# Medicare - Healthcare Management System

## Project Overview

Medicare is a comprehensive healthcare management system that connects patients with doctors through an intuitive web platform. The system facilitates real-time medical consultations, document management, AI-powered symptom analysis, and seamless communication between healthcare providers and patients.

## What It Does

### Core Features

1. **Patient Portal**
   - User registration and authentication (Email/Password and Google OAuth)
   - Upload and manage medical documents (reports, prescriptions, X-rays)
   - AI-powered symptom analysis using LLM
   - Search and browse available doctors by specialization
   - Request consultations with doctors
   - Real-time chat with doctors during active consultations
   - Share medical documents during consultations
   - Rate doctors after consultation
   - View consultation history
   - Receive real-time notifications

2. **Doctor Portal**
   - Secure doctor authentication
   - Dashboard with key statistics (new requests, active consultations, patients)
   - View and manage consultation requests
   - Accept or reject consultation requests
   - Real-time chat with patients
   - Access patient medical history and shared documents
   - Mark documents as viewed
   - Manage patient list
   - Mark patients as cured/uncured
   - Update profile and availability status

3. **Admin Portal**
   - Manage doctor accounts (add/remove/activate)
   - View system statistics
   - Handle password reset requests
   - Monitor platform activity
   - Audit log for administrative actions

4. **Real-Time Features**
   - Instant messaging between doctors and patients
   - File sharing with WhatsApp-like bubbles
   - Live notification system
   - Active user tracking to minimize notification spam
   - Online/offline status indicators

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite 5
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **State Management**: React Context API
- **Authentication**: JWT tokens, Google OAuth (@react-oauth/google)
- **Styling**: Custom theme with dark/light mode support

### Backend
- **Framework**: Flask (Python)
- **ORM**: SQLAlchemy
- **Validation**: Pydantic v2
- **Authentication**: JWT, bcrypt, Google ID token verification
- **Database**: SQLite (development), PostgreSQL-compatible (production)
- **File Storage**: Supabase Storage
- **Rate Limiting**: Flask-Limiter

### Database Schema
- Users (patients)
- Doctors
- Consultations
- Messages
- MessageDocuments (attachments)
- ConsultationDocuments (shared files)
- Documents
- DocumentFolders
- Notifications
- Ratings
- DocumentViews
- AdminAudit
- PasswordResets

## System Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │◄───────►│  Flask Backend  │◄───────►│   SQLite DB     │
│   (Port 5173)   │  HTTP   │   (Port 5000)   │         │                 │
│                 │   API   │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │ Supabase Storage│
                            │  (File Uploads) │
                            │                 │
                            └─────────────────┘
```

### Component Architecture

#### Frontend Architecture
```
App.jsx (Root)
├── AuthContext (Authentication State)
├── ThemeContext (Dark/Light Mode)
├── Protected Routes
│   ├── Patient Routes
│   │   ├── Navigation Shell
│   │   ├── Dashboard
│   │   ├── Doctors List
│   │   ├── Consult (Chat)
│   │   ├── Upload Documents
│   │   ├── LLM Analysis
│   │   ├── History
│   │   ├── Notifications
│   │   └── Settings
│   │
│   ├── Doctor Routes
│   │   ├── DoctorNavigation Shell
│   │   ├── Dashboard
│   │   ├── Requests
│   │   ├── Active Consultations
│   │   ├── Patients List
│   │   ├── Reports
│   │   └── Settings
│   │
│   └── Admin Routes
│       ├── AdminNavigation Shell
│       ├── Dashboard
│       ├── Manage Doctors
│       └── System Settings
│
└── Public Routes
    └── Auth (Login/Register)
```

#### Backend Architecture
```
Flask App
├── Models (SQLAlchemy)
│   ├── User, Doctor, Admin
│   ├── Consultation, Message, MessageDocument
│   ├── Document, DocumentFolder
│   ├── Notification, Rating
│   └── Audit & Password Reset
│
├── API Routes
│   ├── /api/auth/* (Authentication)
│   ├── /api/doctors/* (Doctor endpoints)
│   ├── /api/consultation/* (Consultation & messaging)
│   ├── /api/patient/* (Patient documents & folders)
│   ├── /api/doctor/* (Doctor dashboard & patients)
│   ├── /api/notifications/* (Notification management)
│   ├── /api/upload (File upload)
│   └── /api/admin/* (Admin operations)
│
├── Middleware
│   ├── JWT Token Verification
│   ├── Rate Limiting
│   └── CORS Configuration
│
└── Services
    ├── Google OAuth Verification
    ├── Supabase Storage Integration
    └── Notification System
```

## Workflow

### 1. Patient Consultation Flow

```
Patient Registration/Login
         │
         ▼
Browse Available Doctors
         │
         ▼
Select Doctor & Request Consultation
(Can attach medical documents)
         │
         ▼
Notification sent to Doctor
         │
         ▼
Doctor Reviews Request
         │
    ┌────┴────┐
    │         │
Accept    Reject
    │         │
    │         └──► Patient notified
    │
    ▼
Active Consultation Started
    │
    ▼
Real-time Chat Session
(Text messages + File sharing)
    │
    ▼
Either party ends consultation
    │
    ▼
Patient rates doctor (optional)
    │
    ▼
Consultation archived in history
```

### 2. Doctor Workflow

```
Doctor Login
     │
     ▼
View Dashboard
(Stats: Requests, Active, Patients)
     │
     ▼
Check New Consultation Requests
     │
     ▼
Review Patient Info & Documents
     │
     ▼
Accept/Reject Request
     │
     ▼
If Accepted: Active Consultation
     │
     ▼
Chat with Patient
(Access medical history)
     │
     ▼
End Consultation
     │
     ▼
Mark Patient as Cured (if resolved)
     │
     ▼
View all patients & reports
```

### 3. Document Management Flow

```
Patient Uploads Document
         │
         ▼
File sent to Supabase Storage
         │
         ▼
Document metadata saved in DB
         │
         ▼
Can organize in folders
         │
         ▼
Share during consultation request
    OR
Share during active chat
         │
         ▼
Doctor receives document
         │
         ▼
Doctor views document
         │
         ▼
View tracked in DocumentViews table
```

### 4. Notification System Flow

```
Event Triggers (e.g., New message)
         │
         ▼
Check if recipient is actively viewing
         │
    ┌────┴────┐
    │         │
   Yes        No
    │         │
    │         ▼
    │    Create Notification
    │         │
    │         ▼
    │    Store in Database
    │         │
    │         ▼
    │    Badge appears in UI
    │         │
    └─────────┴────────►
              │
              ▼
    User views page/notification
              │
              ▼
    Mark as read in database
              │
              ▼
    Badge count decreases
```

## Data Flow Diagrams

### Authentication Flow
```
Frontend              Backend              Database
   │                     │                     │
   │──Register/Login────►│                     │
   │                     │                     │
   │                     │──Validate Data──────►│
   │                     │                     │
   │                     │◄────User Data───────│
   │                     │                     │
   │                     │──Hash Password──────►│
   │                     │                     │
   │◄───JWT Token────────│                     │
   │                     │                     │
   │──API Requests───────►│                     │
   │  (with token)       │                     │
   │                     │──Verify Token───────►│
   │                     │                     │
   │◄───Response─────────│                     │
```

### Messaging Flow
```
Patient               Backend              Doctor
   │                     │                     │
   │──Send Message──────►│                     │
   │  + attachments      │                     │
   │                     │──Save Message───────►│
   │                     │──Create Links───────►│
   │                     │                     │
   │                     │──Check if viewing───►│
   │                     │                     │
   │                     │──Create Notif───────►│
   │                     │  (if not viewing)   │
   │                     │                     │
   │                     ├──Poll for msgs──────┤
   │                     │                     │
   │                     │◄──Fetch new msgs────┤
   │                     │  + attachments      │
   │                     │                     │
   │◄───Sync updates─────┤──Send to Doctor────►│
```

## Security Features

1. **Authentication & Authorization**
   - JWT-based authentication with 7-day expiration
   - Secure password hashing with bcrypt
   - Google OAuth 2.0 integration with ID token verification
   - Role-based access control (Patient, Doctor, Admin)

2. **Data Protection**
   - CORS configuration for frontend-backend communication
   - Rate limiting on authentication endpoints (3 registrations/min, 5 logins/min)
   - Secure file storage with Supabase
   - Input validation using Pydantic models

3. **Privacy**
   - Doctors can only access documents from their patients
   - Document view tracking
   - Consultation history is private to involved parties
   - Notification privacy based on roles

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Patient registration
- `POST /api/auth/login` - User/Doctor login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update user profile

### Doctors
- `GET /api/doctors` - List all active doctors (paginated)
- `GET /api/doctors/:id` - Get doctor details

### Consultations
- `POST /api/consultation/request` - Request consultation
- `GET /api/consultation/active` - Get active consultations
- `GET /api/consultation/history` - Get consultation history
- `POST /api/consultation/:id/accept` - Accept request (doctor)
- `POST /api/consultation/:id/reject` - Reject request (doctor)
- `POST /api/consultation/:id/end` - End consultation
- `POST /api/consultation/:id/rate` - Rate consultation (patient)
- `GET /api/consultation/:id/messages` - Get messages (paginated)
- `POST /api/consultation/:id/messages` - Send message + attachments
- `POST /api/consultation/:id/viewing` - Mark as viewing (active users)

### Documents
- `GET /api/patient/documents` - List patient documents
- `POST /api/upload` - Upload file
- `PUT /api/patient/documents/:id` - Update document
- `DELETE /api/patient/documents/:id` - Delete document
- `GET /api/patient/folders` - List folders
- `POST /api/patient/folders` - Create folder
- `DELETE /api/patient/folders/:id` - Delete folder

### Doctor Endpoints
- `GET /api/doctor/dashboard` - Dashboard statistics
- `GET /api/doctor/requests` - Consultation requests
- `GET /api/doctor/consultations` - Active consultations
- `GET /api/doctor/patients` - Patient list
- `GET /api/doctor/reports` - All patient documents
- `POST /api/doctor/reports/:id/view` - Mark document as viewed
- `POST /api/doctor/patients/:id/mark-cured` - Mark patient as cured
- `PUT /api/doctor/me` - Update doctor profile

### Notifications
- `GET /api/notifications` - List notifications (paginated)
- `GET /api/notifications?summary=true` - Get unread count
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read_all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin
- `GET /api/admin/dashboard/stats` - System statistics
- `GET /api/admin/doctors` - List all doctors
- `POST /api/admin/doctors` - Add new doctor
- `PUT /api/admin/doctors/:id` - Update doctor
- `DELETE /api/admin/doctors/:id` - Remove doctor

## Environment Configuration

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend (.env)
```
DATABASE_URL=sqlite:///medicare.db
JWT_SECRET=your-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
FRONTEND_URL=http://localhost:5173
FLASK_ENV=development
PORT=5000
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git

### Frontend Setup
```bash
cd medicare
npm install
npm run dev
```

### Backend Setup
```bash
cd medicare
pip install -r requirements.txt
python app.py
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Key Features Implementation

### Real-Time Messaging
- Polling-based system (5-second intervals)
- Active viewer tracking to minimize unnecessary notifications
- Per-message attachment support
- WhatsApp-like file bubble UI

### Document Management
- Folder organization
- Multiple file format support (PDF, images)
- 6 MB file size limit
- Secure storage with Supabase
- View tracking for doctors

### AI Integration
- LLM-powered symptom analysis
- Disease prediction based on symptoms
- Medicine and precaution suggestions

### Notification System
- Real-time badge updates
- Smart notification suppression (active viewers)
- Categorized by type (messages, requests, updates)
- Mark as read/unread functionality

## Future Enhancements

1. **WebSocket Integration** - Replace polling with real-time WebSockets
2. **Video Consultations** - Add WebRTC video call support
3. **Appointment Scheduling** - Calendar-based appointment system
4. **Payment Integration** - Online payment for consultations
5. **Prescription Generation** - Digital prescription creation for doctors
6. **Analytics Dashboard** - Advanced analytics for doctors and admins
7. **Mobile App** - React Native mobile applications
8. **Multi-language Support** - Internationalization
9. **Telemedicine APIs** - Integration with external health systems
10. **AI Chatbot** - Preliminary symptom checker chatbot

---

**Project Status**: Active Development  
**Last Updated**: November 13, 2025  
**Version**: 1.0.0
