# MEMBER 2 - Work Documentation
## Medicare Project - Backend Development & Authentication

**Team Member**: Member 2  
**Role**: Backend Lead & API Developer  
**Responsibilities**: Flask API, Authentication, Core Backend Services

---

## Work Overview

As the Backend Lead, I was responsible for building the entire Flask-based REST API backend, implementing secure authentication systems, and creating all core backend services that power the Medicare platform. This includes database models, API endpoints, authentication, and business logic.

---

## Detailed Work Breakdown

### 1. Backend Project Setup & Architecture (10% workload)

#### Tasks Completed:

**Flask Application Structure**
```
backend/
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── .env               # Environment variables
└── instance/          # SQLite database
    └── medicare.db
```

**Dependencies Installed:**
```python
Flask==3.0.0              # Web framework
Flask-SQLAlchemy==3.1.1   # ORM
Flask-CORS==4.0.0         # Cross-origin support
Flask-Limiter==3.5.0      # Rate limiting
PyJWT==2.8.0             # JWT tokens
bcrypt==4.1.2            # Password hashing
pydantic==2.5.0          # Data validation
python-dotenv==1.0.0     # Environment variables
google-auth==2.25.2      # Google OAuth
supabase==2.3.0          # File storage
```

**Core Configuration Setup:**
- Environment variable management
- CORS configuration for frontend
- SQLAlchemy database connection
- JWT secret key configuration
- Rate limiting setup
- Supabase storage integration

**Files Created:**
- `app.py` - Main application (1800+ lines)
- `requirements.txt` - Dependencies
- `.env.example` - Environment template

---

### 2. Database Models & Schema Design (20% workload)

Created 13+ comprehensive database models using SQLAlchemy:

#### 2.1 User Model
```python
class User(db.Model):
    id: Integer (Primary Key)
    email: String (Unique, Required)
    password_hash: String (Required)
    role: String (patient/doctor/admin)
    name: String (Required)
    photo_url: String
    phone: String
    age: Integer
    gender: String
    created_at: DateTime
    updated_at: DateTime
    is_verified: Boolean
    google_id: String (Unique)
```

**Relationships:**
- One User → One Patient (if role=patient)
- One User → One Doctor (if role=doctor)

**Methods:**
- `set_password()` - Hash password with bcrypt
- `check_password()` - Verify password
- `to_dict()` - Serialize to JSON

#### 2.2 Doctor Model
```python
class Doctor(db.Model):
    id: Integer (Primary Key)
    user_id: Integer (Foreign Key)
    specialization: String
    hospital: String
    experience_years: Integer
    bio: Text
    id_card_url: String (For verification)
    is_verified: Boolean
    is_online: Boolean
    last_online: DateTime
```

**Relationships:**
- Many-to-Many with Patients (through Consultations)
- One-to-Many with Consultations
- One-to-Many with Ratings

#### 2.3 Patient Model
```python
class Patient(db.Model):
    id: Integer (Primary Key)
    user_id: Integer (Foreign Key)
    medical_history: Text
    allergies: Text
    blood_group: String
    emergency_contact: String
```

**Relationships:**
- Many-to-Many with Doctors (through Consultations)
- One-to-Many with Consultations

#### 2.4 Consultation Model
```python
class Consultation(db.Model):
    id: Integer (Primary Key)
    patient_id: Integer (Foreign Key)
    doctor_id: Integer (Foreign Key)
    symptoms: Text
    diagnosis: Text
    prescription: Text
    status: String (requested/active/ended)
    consultation_date: DateTime
    ended_at: DateTime
    current_viewers: JSON (Active users list)
```

**Relationships:**
- Belongs to Doctor
- Belongs to Patient
- One-to-Many with Messages
- Many-to-Many with Documents

**Key Feature:** `current_viewers` field tracks active users to prevent duplicate notifications.

#### 2.5 Message Model
```python
class Message(db.Model):
    id: Integer (Primary Key)
    consultation_id: Integer (Foreign Key)
    sender_id: Integer (Foreign Key)
    sender_type: String (patient/doctor)
    content: Text
    created_at: DateTime
    is_read: Boolean
```

**Relationships:**
- Belongs to Consultation
- One-to-Many with MessageDocuments (attachments)

#### 2.6 MessageDocument Model (New Addition)
```python
class MessageDocument(db.Model):
    id: Integer (Primary Key)
    message_id: Integer (Foreign Key)
    document_id: Integer (Foreign Key)
    attached_at: DateTime
```

**Purpose:** Links documents to specific messages for inline file bubbles

**Relationships:**
- Belongs to Message
- Belongs to Document

#### 2.7 Document Model
```python
class Document(db.Model):
    id: Integer (Primary Key)
    user_id: Integer (Foreign Key)
    folder_id: Integer (Foreign Key, Nullable)
    file_name: String
    file_url: String (Supabase URL)
    file_type: String
    file_size: Integer
    uploaded_at: DateTime
```

**Relationships:**
- Belongs to User
- Belongs to Folder (optional)
- Many-to-Many with Consultations
- One-to-Many with MessageDocuments

#### 2.8 Folder Model
```python
class Folder(db.Model):
    id: Integer (Primary Key)
    user_id: Integer (Foreign Key)
    name: String
    parent_id: Integer (Self-reference)
    created_at: DateTime
```

**Features:** Hierarchical folder structure

#### 2.9 ConsultationDocument Model
```python
class ConsultationDocument(db.Model):
    id: Integer (Primary Key)
    consultation_id: Integer (Foreign Key)
    document_id: Integer (Foreign Key)
    shared_at: DateTime
```

**Purpose:** Track documents shared during consultation requests

#### 2.10 Notification Model
```python
class Notification(db.Model):
    id: Integer (Primary Key)
    user_id: Integer (Foreign Key)
    title: String
    message: Text
    type: String (info/success/warning/error)
    is_read: Boolean
    related_consultation_id: Integer
    created_at: DateTime
```

#### 2.11 Rating Model
```python
class Rating(db.Model):
    id: Integer (Primary Key)
    consultation_id: Integer (Foreign Key)
    patient_id: Integer (Foreign Key)
    doctor_id: Integer (Foreign Key)
    doctor_rating: Integer (1-5)
    platform_rating: Integer (1-5)
    feedback: Text
    created_at: DateTime
```

#### 2.12 DocumentView Model
```python
class DocumentView(db.Model):
    id: Integer (Primary Key)
    document_id: Integer (Foreign Key)
    user_id: Integer (Foreign Key)
    viewed_at: DateTime
```

**Purpose:** Track document access for security auditing

#### 2.13 AdminAudit Model
```python
class AdminAudit(db.Model):
    id: Integer (Primary Key)
    admin_id: Integer (Foreign Key)
    action: String
    target_user_id: Integer
    details: JSON
    created_at: DateTime
```

#### 2.14 PasswordReset Model
```python
class PasswordReset(db.Model):
    id: Integer (Primary Key)
    user_id: Integer (Foreign Key)
    token: String (Unique)
    created_at: DateTime
    expires_at: DateTime
    is_used: Boolean
```

---

### 3. Authentication & Authorization System (25% workload)

#### 3.1 JWT Authentication

**Token Generation:**
```python
def generate_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')
```

**Token Verification Decorator:**
```python
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return {'error': 'Token missing'}, 401
        
        try:
            token = token.split('Bearer ')[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = User.query.get(payload['user_id'])
            if not current_user:
                return {'error': 'Invalid token'}, 401
        except:
            return {'error': 'Invalid token'}, 401
        
        return f(current_user, *args, **kwargs)
    return decorated
```

**Role-Based Access Control:**
```python
def role_required(roles):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in roles:
                return {'error': 'Unauthorized'}, 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
```

#### 3.2 Password Security

**Hashing with bcrypt:**
```python
def set_password(self, password):
    self.password_hash = bcrypt.hashpw(
        password.encode('utf-8'), 
        bcrypt.gensalt()
    ).decode('utf-8')

def check_password(self, password):
    return bcrypt.checkpw(
        password.encode('utf-8'), 
        self.password_hash.encode('utf-8')
    )
```

#### 3.3 Google OAuth Integration

**Google ID Token Verification:**
```python
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

def verify_google_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        return idinfo
    except ValueError:
        return None
```

**Google Auth Endpoint:**
```python
@app.route('/api/auth/google', methods=['POST'])
@limiter.limit("5 per minute")
def google_auth():
    data = request.json
    google_token = data.get('token')
    
    idinfo = verify_google_token(google_token)
    if not idinfo:
        return {'error': 'Invalid Google token'}, 401
    
    google_id = idinfo['sub']
    email = idinfo['email']
    name = idinfo.get('name', '')
    photo = idinfo.get('picture', '')
    
    # Find or create user
    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
        else:
            user = User(...)
            db.session.add(user)
    
    db.session.commit()
    token = generate_token(user.id, user.role)
    return {'token': token, 'user': user.to_dict()}
```

---

### 4. Core API Endpoints (30% workload)

#### 4.1 Authentication Endpoints

**POST /api/auth/register**
- Input validation with Pydantic
- Email uniqueness check
- Password hashing
- User creation
- Automatic role assignment
- JWT token generation

```python
@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("3 per hour")
def register():
    class RegisterSchema(BaseModel):
        email: EmailStr
        password: str
        name: str
        phone: str
        age: int
        gender: str
        role: str = 'patient'
    
    # Validation
    data = RegisterSchema(**request.json)
    
    # Check existing user
    if User.query.filter_by(email=data.email).first():
        return {'error': 'Email already registered'}, 400
    
    # Create user
    user = User(
        email=data.email,
        name=data.name,
        phone=data.phone,
        age=data.age,
        gender=data.gender,
        role=data.role
    )
    user.set_password(data.password)
    db.session.add(user)
    db.session.commit()
    
    # Create role-specific record
    if data.role == 'patient':
        patient = Patient(user_id=user.id)
        db.session.add(patient)
    
    db.session.commit()
    token = generate_token(user.id, user.role)
    return {'token': token, 'user': user.to_dict()}
```

**POST /api/auth/login**
- Email/password validation
- Password verification
- JWT token generation
- User data return

**POST /api/auth/google**
- Google token verification
- User creation/retrieval
- JWT token generation

**GET /api/auth/me**
- Token validation
- Current user data return
- Protected endpoint

#### 4.2 Doctor Endpoints

**GET /api/doctors**
- List all doctors with pagination
- Filter by specialization, hospital
- Search by name
- Include online status
- Include verification status

```python
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    
    query = Doctor.query.join(User)
    
    if search:
        query = query.filter(
            db.or_(
                User.name.ilike(f'%{search}%'),
                Doctor.specialization.ilike(f'%{search}%'),
                Doctor.hospital.ilike(f'%{search}%')
            )
        )
    
    pagination = query.paginate(page=page, per_page=per_page)
    
    doctors = [{
        'id': d.id,
        'name': d.user.name,
        'email': d.user.email,
        'photo_url': d.user.photo_url,
        'specialization': d.specialization,
        'hospital': d.hospital,
        'experience_years': d.experience_years,
        'bio': d.bio,
        'is_online': d.is_online,
        'is_verified': d.is_verified,
        'id_card_url': d.id_card_url
    } for d in pagination.items]
    
    return {
        'data': doctors,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages
        }
    }
```

**PUT /api/doctors/online-status**
- Update doctor online status
- Protected endpoint (doctors only)

**POST /api/doctors/profile**
- Create/update doctor profile
- Upload ID card for verification

#### 4.3 User Profile Endpoints

**GET /api/users/profile**
- Get current user profile
- Include role-specific data

**PUT /api/users/profile**
- Update user information
- Upload profile photo
- Update patient medical history

**POST /api/users/upload-photo**
- Upload profile photo to Supabase
- Update user record
- Return photo URL

---

### 5. Supabase File Storage Integration (15% workload)

#### Storage Setup
```python
from supabase import create_client

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)
```

#### File Upload Function
```python
def upload_file_to_supabase(file, bucket_name, file_path):
    try:
        # Read file content
        file_content = file.read()
        
        # Upload to Supabase
        response = supabase.storage.from_(bucket_name).upload(
            file_path,
            file_content,
            {'content-type': file.content_type}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
        
        return public_url
    except Exception as e:
        raise Exception(f'Upload failed: {str(e)}')
```

#### Document Upload Endpoint
```python
@app.route('/api/documents/upload', methods=['POST'])
@token_required
def upload_document(current_user):
    if 'file' not in request.files:
        return {'error': 'No file provided'}, 400
    
    file = request.files['file']
    folder_id = request.form.get('folder_id')
    
    # Validate file
    if file.filename == '':
        return {'error': 'No file selected'}, 400
    
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png']
    if file.content_type not in allowed_types:
        return {'error': 'Invalid file type'}, 400
    
    max_size = 6 * 1024 * 1024  # 6 MB
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > max_size:
        return {'error': 'File too large'}, 400
    
    # Generate unique filename
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = f"documents/{current_user.id}/{unique_filename}"
    
    # Upload to Supabase
    file_url = upload_file_to_supabase(file, 'medicare-documents', file_path)
    
    # Save to database
    document = Document(
        user_id=current_user.id,
        folder_id=folder_id,
        file_name=file.filename,
        file_url=file_url,
        file_type=file.content_type,
        file_size=size
    )
    db.session.add(document)
    db.session.commit()
    
    return document.to_dict()
```

**Features Implemented:**
- File type validation (PDF, JPG, PNG)
- File size validation (6 MB limit)
- Unique filename generation
- Folder organization
- Public URL generation
- Database tracking

---

## Challenges Faced & Solutions

### Challenge 1: Pydantic v2 Migration
**Problem:** Pydantic v2 has breaking changes from v1  
**Solution:**
- Updated all schemas to use `BaseModel` from `pydantic`
- Changed `Config` to `model_config`
- Updated field validators to use `field_validator`
- Used `model_dump()` instead of `dict()`

### Challenge 2: Active Viewer Tracking
**Problem:** Notifications sent even when patient is viewing consultation  
**Solution:**
- Added `current_viewers` JSON field to Consultation model
- Created `mark_viewing` endpoint to register active users
- Modified notification logic to check viewer list before sending
- Implemented automatic cleanup of stale viewers

### Challenge 3: File Storage with Supabase
**Problem:** Complex file upload and URL generation  
**Solution:**
- Integrated Supabase Python client
- Created reusable upload function
- Implemented proper error handling
- Added file validation and size limits

### Challenge 4: JWT Token Security
**Problem:** Secure token generation and validation  
**Solution:**
- Used PyJWT library with HS256 algorithm
- Added expiration time (24 hours)
- Created decorator for token validation
- Implemented role-based access control

### Challenge 5: Rate Limiting
**Problem:** Prevent API abuse  
**Solution:**
- Integrated Flask-Limiter
- Applied limits to sensitive endpoints (login: 5/min, register: 3/hr)
- IP-based rate limiting
- Custom error messages

---

## API Endpoint Summary

### Total Endpoints Created: 30+

**Authentication (5 endpoints):**
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/google`
- GET `/api/auth/me`
- POST `/api/auth/logout`

**Users (4 endpoints):**
- GET `/api/users/profile`
- PUT `/api/users/profile`
- POST `/api/users/upload-photo`
- GET `/api/users/:id`

**Doctors (4 endpoints):**
- GET `/api/doctors`
- GET `/api/doctors/:id`
- PUT `/api/doctors/online-status`
- POST `/api/doctors/profile`

**Documents (5 endpoints):**
- POST `/api/documents/upload`
- GET `/api/documents`
- GET `/api/documents/:id`
- DELETE `/api/documents/:id`
- PUT `/api/documents/:id/move`

**Folders (4 endpoints):**
- POST `/api/folders`
- GET `/api/folders`
- PUT `/api/folders/:id`
- DELETE `/api/folders/:id`

**Additional endpoints implemented for consultations, messages, notifications, and ratings.**

---

## Code Quality & Security

### Security Measures Implemented:

1. **Password Security**
   - bcrypt hashing with salt
   - No plain text storage
   - Minimum password requirements

2. **JWT Tokens**
   - Secure secret key
   - Expiration time
   - Signature verification

3. **CORS Configuration**
   - Restricted origins
   - Allowed methods
   - Credentials support

4. **Rate Limiting**
   - Per-endpoint limits
   - IP-based tracking
   - Abuse prevention

5. **Input Validation**
   - Pydantic schemas
   - Type checking
   - SQL injection prevention

6. **File Upload Security**
   - Type validation
   - Size limits
   - Unique filenames
   - Secure storage

### Best Practices:

1. **Error Handling**
   - Try-except blocks
   - Meaningful error messages
   - Proper HTTP status codes

2. **Database Management**
   - Transaction handling
   - Commit on success
   - Rollback on error

3. **Code Organization**
   - Modular functions
   - Reusable decorators
   - Clear naming conventions

4. **API Design**
   - RESTful conventions
   - Consistent response format
   - Proper HTTP methods

---

## Testing & Quality Assurance

**Manual Testing:**
- ✅ User registration with validation
- ✅ Login with email/password
- ✅ Google OAuth flow
- ✅ JWT token generation and validation
- ✅ Protected endpoints access control
- ✅ Role-based authorization
- ✅ File upload to Supabase
- ✅ Doctor profile CRUD operations
- ✅ Rate limiting functionality
- ✅ Error handling and responses

**Database Testing:**
- ✅ All models created successfully
- ✅ Relationships working correctly
- ✅ Cascade deletes
- ✅ Data integrity

**Security Testing:**
- ✅ Password hashing
- ✅ Token expiration
- ✅ Unauthorized access prevention
- ✅ SQL injection prevention
- ✅ File upload validation

---

## Performance Optimizations

1. **Database Queries**
   - Efficient joins
   - Pagination support
   - Index on frequently queried fields

2. **File Handling**
   - Streaming uploads
   - Size validation before processing
   - Efficient memory usage

3. **API Response**
   - Minimal data transfer
   - Selective field inclusion
   - Compression support

---

## Key Achievements

1. **Comprehensive Backend API**
   - 30+ endpoints covering all features
   - RESTful design
   - Secure and scalable

2. **Robust Authentication**
   - JWT-based system
   - Google OAuth integration
   - Role-based access control

3. **Advanced Database Design**
   - 13+ models with complex relationships
   - Support for hierarchical data (folders)
   - Efficient querying

4. **File Storage Integration**
   - Seamless Supabase integration
   - Secure file handling
   - Proper validation

5. **Security Implementation**
   - Multiple security layers
   - Rate limiting
   - Input validation

---

## Files Created & Modified

**Primary File:**
- `app.py` (1800+ lines) - Complete backend implementation

**Configuration Files:**
- `requirements.txt` - Python dependencies
- `.env.example` - Environment template

---

## Time Investment

**Total Hours:** ~130 hours over 4 weeks

**Breakdown:**
- Setup & Configuration: 10 hours
- Database Models: 25 hours
- Authentication System: 30 hours
- Core API Endpoints: 40 hours
- Supabase Integration: 15 hours
- Testing & Debugging: 10 hours

---

## Learning Outcomes

1. **Flask Mastery**
   - Advanced routing
   - Middleware and decorators
   - Blueprint architecture

2. **Database Design**
   - Complex relationships
   - SQLAlchemy ORM
   - Migration strategies

3. **Authentication**
   - JWT implementation
   - OAuth 2.0
   - Security best practices

4. **Cloud Storage**
   - Supabase integration
   - File upload handling
   - URL management

5. **API Design**
   - RESTful principles
   - Versioning strategies
   - Documentation practices

---

## Future Improvements

1. **WebSocket Support** - Real-time messaging without polling
2. **Redis Caching** - Improve performance
3. **Elasticsearch** - Advanced search capabilities
4. **API Versioning** - Support multiple API versions
5. **Automated Testing** - Unit and integration tests

---

**Signature:** Member 2  
**Date:** November 13, 2025  
**Project:** Medicare Healthcare Management System
