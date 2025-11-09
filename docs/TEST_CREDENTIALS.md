# 🏥 Medicare - Test Credentials

## Doctor Login Credentials

**Email**: `doctor@medicare.com`  
**Password**: `doctor123`

**Doctor Details:**
- Name: Dr. John Smith
- Specialization: General Medicine
- Hospital: Medicare General Hospital
- Phone: 9876543210

## Patient Login

Patients need to **register** first to create an account. Use any email and password (minimum 6 characters) to register.

## How to Test

### 1. Doctor Login
1. Open the application in your browser
2. Go to login page
3. Enter:
   - Email: `doctor@medicare.com`
   - Password: `doctor123`
4. Click "Login"
5. You will be redirected to the Doctor Dashboard

### 2. Patient Login
1. Open the application in a **different browser tab/window** (or incognito mode)
2. Register a new patient account:
   - Fill in your details
   - Email: `patient@test.com` (or any email)
   - Password: `patient123` (or any password, min 6 chars)
3. After registration, you'll be automatically logged in
4. Navigate to "Consult" page to request a consultation

### 3. Testing Full Flow

#### Step 1: Patient Requests Consultation
1. Login as patient
2. Go to "Consult" page
3. Click "Request Consultation"
4. Select doctor: "Dr. John Smith"
5. Enter symptoms (e.g., "Headache and fever for 2 days")
6. Click "Send Request"

#### Step 2: Doctor Accepts Request
1. In the doctor tab, go to "Patient Requests"
2. You should see the consultation request
3. Click "Accept" button
4. The consultation becomes active

#### Step 3: Chat Between Patient and Doctor
1. **Doctor Side**: Go to "Active Consultations"
2. **Patient Side**: Go to "Consult" page
3. Both can now send messages and chat in real-time

### 4. Features to Test

#### Doctor Dashboard
- ✅ View statistics (new requests, active consultations, total patients)
- ✅ View and accept/reject patient requests
- ✅ Chat with patients in active consultations
- ✅ View all patients who have consulted
- ✅ Update profile settings

#### Patient Dashboard
- ✅ Request consultation with doctors
- ✅ Chat with doctor in active consultations
- ✅ Upload medical documents
- ✅ View medical history
- ✅ Update profile

## Important Notes

1. **Multiple Tabs**: Open doctor and patient in separate tabs/windows to test the full flow
2. **Real-time Updates**: Messages poll every 2 seconds - you should see updates automatically
3. **Backend**: Make sure the Flask backend is running on `http://localhost:5000`
4. **Frontend**: React app should be running on `http://localhost:3000` (or your configured port)

## Backend Endpoints

### Doctor Endpoints
- `GET /api/doctor/dashboard` - Dashboard stats
- `GET /api/doctor/requests` - Pending requests
- `GET /api/doctor/consultations` - Active consultations
- `POST /api/consultation/{id}/accept` - Accept request
- `POST /api/consultation/{id}/reject` - Reject request
- `POST /api/consultation/{id}/end` - End consultation
- `GET /api/consultation/{id}/messages` - Get messages
- `POST /api/consultation/{id}/messages` - Send message

### Patient Endpoints
- `GET /api/doctors` - List all doctors
- `POST /api/consultation/request` - Request consultation
- `GET /api/consultation/active` - Get active consultations
- `GET /api/consultation/{id}/messages` - Get messages
- `POST /api/consultation/{id}/messages` - Send message

## Troubleshooting

1. **Login fails**: Make sure backend is running and database is initialized
2. **No doctors showing**: Run the backend once to seed the test doctor
3. **Messages not updating**: Check browser console for errors, verify backend is running
4. **CORS errors**: Ensure backend CORS is configured for your frontend URL

## Database

The SQLite database (`medicare.db`) is automatically created on first run. The test doctor is seeded automatically.

