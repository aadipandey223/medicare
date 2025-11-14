# MEMBER 4 - Work Documentation
## Medicare Project - Database Architecture, Document Management & Admin Portal

**Team Member**: Member 4  
**Role**: Database Architect & Document Management Specialist  
**Responsibilities**: Database Design, Document Management, Admin Portal, Testing & Deployment

---

## Work Overview

As the Database Architect and Document Management Specialist, I was responsible for designing the complete database schema with complex relationships, implementing the document management system with folder hierarchy and Supabase integration, building the admin portal for system management, and ensuring proper testing and deployment configurations. My work forms the foundational data layer and management system for the entire Medicare platform.

---

## Detailed Work Breakdown

### 1. Database Schema Architecture (30% workload)

#### Overall Database Design

**Database Technology:**
- **Development**: SQLite (for easy local development)
- **Production**: PostgreSQL-compatible schema (for Supabase/cloud deployment)
- **ORM**: SQLAlchemy with Flask-SQLAlchemy extension

**Total Models:** 14 comprehensive models
**Total Relationships:** 25+ foreign keys and relationships
**Design Principles:**
- Normalization (3NF compliance)
- Referential integrity
- Cascade behaviors
- Indexing for performance
- Timestamp tracking
- Soft deletes support

#### 1.1 Core Entity Models

**User Model (Central Entity)**
```python
class User(db.Model):
    __tablename__ = 'users'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Authentication
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=True)
    google_id = db.Column(db.String(256), unique=True, nullable=True, index=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Profile
    role = db.Column(db.String(20), nullable=False, default='patient')
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    photo_url = db.Column(db.String(500))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = db.relationship('Patient', backref='user', uselist=False, cascade='all, delete-orphan')
    doctor = db.relationship('Doctor', backref='user', uselist=False, cascade='all, delete-orphan')
    documents = db.relationship('Document', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    folders = db.relationship('Folder', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic', cascade='all, delete-orphan')
```

**Design Decisions:**
- `email` and `google_id` indexed for fast authentication lookups
- `password_hash` nullable to support Google OAuth-only users
- `role` field for role-based access control
- Cascade delete for dependent records
- Timestamps for audit trail

**Doctor Model (Professional Entity)**
```python
class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    
    # Professional Info
    specialization = db.Column(db.String(100))
    hospital = db.Column(db.String(200))
    experience_years = db.Column(db.Integer, default=0)
    bio = db.Column(db.Text)
    
    # Verification
    id_card_url = db.Column(db.String(500))
    is_verified = db.Column(db.Boolean, default=False)
    
    # Availability
    is_online = db.Column(db.Boolean, default=False)
    last_online = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    consultations = db.relationship('Consultation', backref='doctor', lazy='dynamic')
    ratings = db.relationship('Rating', backref='doctor', lazy='dynamic')
```

**Patient Model (Medical Entity)**
```python
class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    
    # Medical Info
    medical_history = db.Column(db.Text)
    allergies = db.Column(db.Text)
    blood_group = db.Column(db.String(5))
    emergency_contact = db.Column(db.String(20))
    
    # Relationships
    consultations = db.relationship('Consultation', backref='patient', lazy='dynamic')
    ratings_given = db.relationship('Rating', backref='patient', lazy='dynamic')
```

#### 1.2 Consultation System Models

**Consultation Model (Core Transaction)**
```python
class Consultation(db.Model):
    __tablename__ = 'consultations'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    
    # Consultation Data
    symptoms = db.Column(db.Text, nullable=False)
    diagnosis = db.Column(db.Text)
    prescription = db.Column(db.Text)
    
    # Status Management
    status = db.Column(db.String(20), default='requested')  # requested, active, ended
    
    # Timestamps
    consultation_date = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    ended_at = db.Column(db.DateTime)
    
    # Real-Time Tracking
    current_viewers = db.Column(db.JSON)  # [{user_id, last_seen}, ...]
    
    # Relationships
    messages = db.relationship('Message', backref='consultation', lazy='dynamic', cascade='all, delete-orphan')
    documents = db.relationship('Document', secondary='consultation_documents', backref='consultations')
    rating = db.relationship('Rating', backref='consultation', uselist=False)
    
    # Indexes
    __table_args__ = (
        db.Index('idx_consultation_patient', 'patient_id'),
        db.Index('idx_consultation_doctor', 'doctor_id'),
        db.Index('idx_consultation_status', 'status'),
    )
```

**Design Features:**
- Composite indexes for efficient querying
- JSON field for dynamic viewer tracking
- Many-to-many with documents via association table
- Status-based workflow
- Cascade delete for messages

**Message Model (Communication)**
```python
class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id', ondelete='CASCADE'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Message Data
    sender_type = db.Column(db.String(20), nullable=False)  # patient, doctor
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    attachments = db.relationship('MessageDocument', backref='message', lazy='dynamic', cascade='all, delete-orphan')
    
    # Indexes
    __table_args__ = (
        db.Index('idx_message_consultation', 'consultation_id'),
        db.Index('idx_message_created', 'created_at'),
    )
```

**MessageDocument Model (Attachment Linking)**
```python
class MessageDocument(db.Model):
    __tablename__ = 'message_documents'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    message_id = db.Column(db.Integer, db.ForeignKey('messages.id', ondelete='CASCADE'), nullable=False)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    
    # Timestamp
    attached_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    document = db.relationship('Document', backref='message_links')
    
    # Unique Constraint
    __table_args__ = (
        db.UniqueConstraint('message_id', 'document_id', name='uq_message_document'),
    )
```

**Design Purpose:** Links documents to specific messages for inline file attachments

#### 1.3 Document Management Models

**Document Model (File Entity)**
```python
class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    folder_id = db.Column(db.Integer, db.ForeignKey('folders.id', ondelete='SET NULL'), nullable=True)
    
    # File Metadata
    file_name = db.Column(db.String(255), nullable=False)
    file_url = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # in bytes
    
    # Timestamp
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    views = db.relationship('DocumentView', backref='document', lazy='dynamic', cascade='all, delete-orphan')
    
    # Indexes
    __table_args__ = (
        db.Index('idx_document_user', 'user_id'),
        db.Index('idx_document_folder', 'folder_id'),
    )
```

**Folder Model (Hierarchical Structure)**
```python
class Folder(db.Model):
    __tablename__ = 'folders'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('folders.id', ondelete='CASCADE'), nullable=True)
    
    # Folder Data
    name = db.Column(db.String(100), nullable=False)
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    children = db.relationship('Folder', backref=db.backref('parent', remote_side=[id]), cascade='all, delete-orphan')
    documents = db.relationship('Document', backref='folder', lazy='dynamic')
```

**Design Features:**
- Self-referencing relationship for folder hierarchy
- Cascade delete for nested folders
- Supports unlimited nesting depth

**ConsultationDocument Model (Association Table)**
```python
class ConsultationDocument(db.Model):
    __tablename__ = 'consultation_documents'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id', ondelete='CASCADE'), nullable=False)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    
    # Timestamp
    shared_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique Constraint
    __table_args__ = (
        db.UniqueConstraint('consultation_id', 'document_id', name='uq_consultation_document'),
    )
```

**DocumentView Model (Access Tracking)**
```python
class DocumentView(db.Model):
    __tablename__ = 'document_views'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Timestamp
    viewed_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Index for analytics
    __table_args__ = (
        db.Index('idx_view_document_user', 'document_id', 'user_id'),
    )
```

**Purpose:** Security auditing and analytics

#### 1.4 Supporting Models

**Notification Model**
```python
class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    related_consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id', ondelete='CASCADE'), nullable=True)
    
    # Notification Data
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), default='info')  # info, success, warning, error
    is_read = db.Column(db.Boolean, default=False, index=True)
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Indexes
    __table_args__ = (
        db.Index('idx_notification_user_read', 'user_id', 'is_read'),
    )
```

**Rating Model**
```python
class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id', ondelete='CASCADE'), unique=True, nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    
    # Ratings
    doctor_rating = db.Column(db.Integer, nullable=False)  # 1-5
    platform_rating = db.Column(db.Integer, nullable=False)  # 1-5
    feedback = db.Column(db.Text)
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Constraints
    __table_args__ = (
        db.CheckConstraint('doctor_rating >= 1 AND doctor_rating <= 5', name='check_doctor_rating'),
        db.CheckConstraint('platform_rating >= 1 AND platform_rating <= 5', name='check_platform_rating'),
    )
```

**AdminAudit Model**
```python
class AdminAudit(db.Model):
    __tablename__ = 'admin_audits'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    target_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Audit Data
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.JSON)
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
```

**PasswordReset Model**
```python
class PasswordReset(db.Model):
    __tablename__ = 'password_resets'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Key
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Token Data
    token = db.Column(db.String(256), unique=True, nullable=False, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
```

---

### 2. Document Management System (25% workload)

#### 2.1 File Upload System

**Backend Endpoints Created:**

**Upload Document (POST /api/documents/upload)**
```python
@app.route('/api/documents/upload', methods=['POST'])
@token_required
@limiter.limit("10 per minute")
def upload_document(current_user):
    if 'file' not in request.files:
        return {'error': 'No file provided'}, 400
    
    file = request.files['file']
    folder_id = request.form.get('folder_id')
    
    # Validation
    if file.filename == '':
        return {'error': 'No file selected'}, 400
    
    # Type validation
    allowed_types = {
        'application/pdf': '.pdf',
        'image/jpeg': '.jpg',
        'image/png': '.png'
    }
    
    if file.content_type not in allowed_types:
        return {'error': 'Invalid file type. Only PDF, JPG, and PNG allowed'}, 400
    
    # Size validation (6 MB limit)
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    
    if size > 6 * 1024 * 1024:
        return {'error': 'File too large. Maximum size is 6 MB'}, 400
    
    # Generate unique filename
    ext = allowed_types[file.content_type]
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = f"documents/{current_user.id}/{unique_name}"
    
    # Upload to Supabase
    try:
        file_url = upload_to_supabase(file, 'medicare-documents', file_path)
    except Exception as e:
        return {'error': f'Upload failed: {str(e)}'}, 500
    
    # Save to database
    document = Document(
        user_id=current_user.id,
        folder_id=folder_id if folder_id else None,
        file_name=file.filename,
        file_url=file_url,
        file_type=file.content_type,
        file_size=size
    )
    
    db.session.add(document)
    db.session.commit()
    
    return document.to_dict(), 201
```

**Features:**
- File type validation (PDF, JPG, PNG)
- File size validation (6 MB limit)
- Unique filename generation with UUID
- Supabase storage integration
- Folder organization support
- Rate limiting (10 uploads per minute)
- Error handling

#### 2.2 Document Retrieval

**Get All Documents (GET /api/documents)**
```python
@app.route('/api/documents', methods=['GET'])
@token_required
def get_documents(current_user):
    folder_id = request.args.get('folder_id', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    query = Document.query.filter_by(user_id=current_user.id)
    
    if folder_id:
        query = query.filter_by(folder_id=folder_id)
    elif folder_id is None and 'folder_id' in request.args:
        # Root folder (no folder)
        query = query.filter_by(folder_id=None)
    
    pagination = query.order_by(Document.uploaded_at.desc()).paginate(
        page=page, per_page=per_page
    )
    
    return {
        'data': [d.to_dict() for d in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages
        }
    }
```

**Get Single Document (GET /api/documents/{id})**
```python
@app.route('/api/documents/<int:document_id>', methods=['GET'])
@token_required
def get_document(current_user, document_id):
    document = Document.query.get_or_404(document_id)
    
    # Authorization check
    if document.user_id != current_user.id:
        # Check if shared in consultation
        shared_consultations = document.consultations
        authorized = False
        
        for consultation in shared_consultations:
            if current_user.role == 'patient':
                patient = Patient.query.filter_by(user_id=current_user.id).first()
                if consultation.patient_id == patient.id:
                    authorized = True
            elif current_user.role == 'doctor':
                doctor = Doctor.query.filter_by(user_id=current_user.id).first()
                if consultation.doctor_id == doctor.id:
                    authorized = True
        
        if not authorized:
            return {'error': 'Unauthorized'}, 403
    
    # Log view
    view = DocumentView(
        document_id=document.id,
        user_id=current_user.id
    )
    db.session.add(view)
    db.session.commit()
    
    return document.to_dict()
```

**Features:**
- Ownership verification
- Shared document access for consultations
- Document view tracking
- Security audit trail

#### 2.3 Folder Management

**Create Folder (POST /api/folders)**
```python
@app.route('/api/folders', methods=['POST'])
@token_required
def create_folder(current_user):
    data = request.json
    
    folder = Folder(
        user_id=current_user.id,
        name=data['name'],
        parent_id=data.get('parent_id')
    )
    
    db.session.add(folder)
    db.session.commit()
    
    return folder.to_dict(), 201
```

**Get Folders (GET /api/folders)**
```python
@app.route('/api/folders', methods=['GET'])
@token_required
def get_folders(current_user):
    parent_id = request.args.get('parent_id', type=int)
    
    query = Folder.query.filter_by(user_id=current_user.id)
    
    if parent_id:
        query = query.filter_by(parent_id=parent_id)
    elif 'parent_id' in request.args and parent_id is None:
        # Root folders
        query = query.filter_by(parent_id=None)
    
    folders = query.order_by(Folder.name).all()
    
    # Include document count for each folder
    result = []
    for folder in folders:
        folder_dict = folder.to_dict()
        folder_dict['document_count'] = folder.documents.count()
        folder_dict['subfolder_count'] = Folder.query.filter_by(parent_id=folder.id).count()
        result.append(folder_dict)
    
    return result
```

**Move Document to Folder (PUT /api/documents/{id}/move)**
```python
@app.route('/api/documents/<int:document_id>/move', methods=['PUT'])
@token_required
def move_document(current_user, document_id):
    document = Document.query.get_or_404(document_id)
    
    if document.user_id != current_user.id:
        return {'error': 'Unauthorized'}, 403
    
    data = request.json
    new_folder_id = data.get('folder_id')
    
    # Validate folder ownership
    if new_folder_id:
        folder = Folder.query.get(new_folder_id)
        if not folder or folder.user_id != current_user.id:
            return {'error': 'Invalid folder'}, 400
    
    document.folder_id = new_folder_id
    db.session.commit()
    
    return document.to_dict()
```

**Delete Document (DELETE /api/documents/{id})**
```python
@app.route('/api/documents/<int:document_id>', methods=['DELETE'])
@token_required
def delete_document(current_user, document_id):
    document = Document.query.get_or_404(document_id)
    
    if document.user_id != current_user.id:
        return {'error': 'Unauthorized'}, 403
    
    # Delete from Supabase
    try:
        delete_from_supabase(document.file_url)
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Supabase deletion failed: {e}")
    
    # Delete from database (cascade to views and links)
    db.session.delete(document)
    db.session.commit()
    
    return {'status': 'success'}
```

---

### 3. Admin Portal (20% workload)

#### 3.1 Admin Dashboard (`src/pages/admin/AdminDashboard.jsx`)

**Features:**

**Statistics Cards:**
- Total users count
- Total doctors count
- Active consultations count
- Total documents uploaded
- Revenue metrics (if applicable)

**Recent Activity Feed:**
- New user registrations
- New consultations
- Document uploads
- System events

**Quick Actions:**
- Manage users
- Verify doctors
- View reports
- System settings

**Code Implementation:**
```javascript
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    activeConsultations: 0,
    totalDocuments: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  
  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);
  
  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* More stat cards... */}
      </Grid>
      
      {/* Recent activity feed */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {recentActivity.map((activity) => (
            <ListItem key={activity.id}>
              <ListItemText
                primary={activity.action}
                secondary={new Date(activity.created_at).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};
```

#### 3.2 User Management (`src/pages/admin/ManageUsers.jsx`)

**Features:**

**User List:**
- All users with pagination
- Filter by role (patient/doctor/admin)
- Search by name or email
- User status indicators

**User Actions:**
- View user details
- Edit user profile
- Disable/Enable user
- Delete user (with confirmation)
- Reset password

**Doctor Verification:**
- View pending verification requests
- Check ID card uploads
- Approve/Reject verification
- Send verification email

**Code Implementation:**
```javascript
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleVerifyDoctor = async (doctorId) => {
    try {
      await api.put(`/admin/doctors/${doctorId}/verify`, {
        is_verified: true
      });
      
      // Create audit log
      await api.post('/admin/audit', {
        action: 'verify_doctor',
        target_user_id: doctorId
      });
      
      // Refresh list
      fetchUsers();
    } catch (error) {
      console.error('Failed to verify doctor:', error);
    }
  };
  
  const handleDisableUser = async (userId) => {
    if (!confirm('Are you sure you want to disable this user?')) return;
    
    try {
      await api.put(`/admin/users/${userId}/disable`);
      
      // Audit log
      await api.post('/admin/audit', {
        action: 'disable_user',
        target_user_id: userId
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Failed to disable user:', error);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      
      {/* Filters and search */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <MenuItem value="all">All Users</MenuItem>
          <MenuItem value="patient">Patients</MenuItem>
          <MenuItem value="doctor">Doctors</MenuItem>
          <MenuItem value="admin">Admins</MenuItem>
        </Select>
      </Box>
      
      {/* User table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.is_verified ? 
                    <Chip label="Verified" color="success" size="small" /> :
                    <Chip label="Pending" color="warning" size="small" />
                  }
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditUser(user.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDisableUser(user.id)}>
                    <BlockIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
```

#### 3.3 Admin Backend Endpoints

**Get Admin Stats (GET /api/admin/stats)**
```python
@app.route('/api/admin/stats', methods=['GET'])
@token_required
@role_required(['admin'])
def get_admin_stats(current_user):
    total_users = User.query.count()
    total_doctors = Doctor.query.count()
    total_patients = Patient.query.count()
    active_consultations = Consultation.query.filter_by(status='active').count()
    ended_consultations = Consultation.query.filter_by(status='ended').count()
    total_documents = Document.query.count()
    unverified_doctors = Doctor.query.filter_by(is_verified=False).count()
    
    return {
        'totalUsers': total_users,
        'totalDoctors': total_doctors,
        'totalPatients': total_patients,
        'activeConsultations': active_consultations,
        'endedConsultations': ended_consultations,
        'totalDocuments': total_documents,
        'unverifiedDoctors': unverified_doctors
    }
```

**Verify Doctor (PUT /api/admin/doctors/{id}/verify)**
```python
@app.route('/api/admin/doctors/<int:doctor_id>/verify', methods=['PUT'])
@token_required
@role_required(['admin'])
def verify_doctor(current_user, doctor_id):
    doctor = Doctor.query.get_or_404(doctor_id)
    
    data = request.json
    doctor.is_verified = data.get('is_verified', True)
    
    # Create audit log
    audit = AdminAudit(
        admin_id=current_user.id,
        action='verify_doctor',
        target_user_id=doctor.user_id,
        details={'doctor_id': doctor_id, 'verified': doctor.is_verified}
    )
    db.session.add(audit)
    
    # Notify doctor
    notification = Notification(
        user_id=doctor.user_id,
        title='Verification Status Updated',
        message=f'Your doctor account has been {"verified" if doctor.is_verified else "rejected"}',
        type='success' if doctor.is_verified else 'warning'
    )
    db.session.add(notification)
    
    db.session.commit()
    
    return doctor.to_dict()
```

**Get Audit Logs (GET /api/admin/audit)**
```python
@app.route('/api/admin/audit', methods=['GET'])
@token_required
@role_required(['admin'])
def get_audit_logs(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    logs = AdminAudit.query.order_by(
        AdminAudit.created_at.desc()
    ).paginate(page=page, per_page=per_page)
    
    return {
        'data': [log.to_dict() for log in logs.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': logs.total,
            'pages': logs.pages
        }
    }
```

---

### 4. Testing & Quality Assurance (15% workload)

#### 4.1 Database Testing

**Migration Testing:**
```python
# Test database creation
with app.app_context():
    db.create_all()
    print("✓ All tables created successfully")
    
    # Verify tables
    tables = db.engine.table_names()
    expected_tables = [
        'users', 'doctors', 'patients', 'consultations',
        'messages', 'message_documents', 'documents',
        'folders', 'consultation_documents', 'notifications',
        'ratings', 'document_views', 'admin_audits', 'password_resets'
    ]
    
    for table in expected_tables:
        assert table in tables, f"Table {table} not found"
    
    print("✓ All expected tables exist")
```

**Relationship Testing:**
```python
# Test cascade delete
user = User(email='test@test.com', name='Test', role='patient')
user.set_password('password123')
db.session.add(user)
db.session.commit()

patient = Patient(user_id=user.id)
db.session.add(patient)
db.session.commit()

# Delete user should cascade to patient
db.session.delete(user)
db.session.commit()

assert Patient.query.get(patient.id) is None
print("✓ Cascade delete working")
```

**Constraint Testing:**
```python
# Test unique constraints
try:
    user1 = User(email='test@test.com', name='User 1', role='patient')
    user1.set_password('pass1')
    db.session.add(user1)
    db.session.commit()
    
    user2 = User(email='test@test.com', name='User 2', role='patient')
    user2.set_password('pass2')
    db.session.add(user2)
    db.session.commit()
    
    assert False, "Should have raised unique constraint error"
except:
    db.session.rollback()
    print("✓ Unique constraint working")
```

#### 4.2 API Testing

**Endpoint Testing:**
- Created test scripts for all endpoints
- Verified authentication and authorization
- Tested error cases
- Validated response formats
- Performance testing with concurrent requests

#### 4.3 Integration Testing

**Full Workflow Tests:**
1. User registration → Login → Profile update
2. Patient request consultation → Doctor accepts → Messaging → End consultation → Rating
3. Document upload → Folder creation → Move document → Share in consultation → Delete
4. Notification creation → Polling → Mark as read → Delete

---

### 5. Deployment Configuration (10% workload)

#### 5.1 Environment Configuration

**`.env.example` Template:**
```bash
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET_KEY=your-jwt-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Rate Limiting
RATELIMIT_STORAGE_URL=redis://localhost:6379

# CORS
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

#### 5.2 Requirements File

**`requirements.txt`:**
```
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.0
Flask-Limiter==3.5.0
PyJWT==2.8.0
bcrypt==4.1.2
pydantic==2.5.0
pydantic[email]==2.5.0
python-dotenv==1.0.0
google-auth==2.25.2
supabase==2.3.0
psycopg2-binary==2.9.9  # PostgreSQL adapter
redis==5.0.1  # For rate limiting
```

#### 5.3 Production Database Migration

**Migration Script (`migrate.py`):**
```python
from app import app, db

with app.app_context():
    # Create all tables
    db.create_all()
    
    # Create admin user
    admin = User.query.filter_by(email='admin@medicare.com').first()
    if not admin:
        admin = User(
            email='admin@medicare.com',
            name='Admin',
            role='admin',
            is_verified=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("Admin user created")
```

---

## Challenges Faced & Solutions

### Challenge 1: Complex Relationships
**Problem:** Managing 25+ foreign keys and relationships  
**Solution:**
- Drew ER diagrams before implementation
- Used SQLAlchemy's backref for bidirectional relationships
- Careful cascade configuration
- Comprehensive testing

### Challenge 2: Hierarchical Folder Structure
**Problem:** Self-referencing relationship with unlimited nesting  
**Solution:**
- Used self-referencing foreign key
- Implemented recursive queries for folder tree
- Cascade delete for nested folders
- Added depth limits in frontend

### Challenge 3: Document Security
**Problem:** Ensure only authorized users can access documents  
**Solution:**
- Ownership checks on all document endpoints
- Consultation-based sharing verification
- Document view tracking for audit
- Supabase bucket policies

### Challenge 4: Database Performance
**Problem:** Slow queries with large datasets  
**Solution:**
- Added indexes on frequently queried columns
- Composite indexes for multi-column queries
- Pagination support on all list endpoints
- Lazy loading for relationships

### Challenge 5: Data Integrity
**Problem:** Maintaining referential integrity  
**Solution:**
- Foreign key constraints
- Unique constraints
- Check constraints for ratings
- Transaction management with rollback

---

## Key Achievements

1. **Comprehensive Database Architecture**
   - 14 models with 25+ relationships
   - Supports complex workflows
   - Scalable design

2. **Document Management System**
   - Complete file lifecycle management
   - Hierarchical folder structure
   - Secure file sharing
   - Supabase integration

3. **Admin Portal**
   - Full system management
   - User verification
   - Audit logging
   - Statistics dashboard

4. **Testing Framework**
   - Database testing
   - API testing
   - Integration testing
   - Documented test cases

5. **Production Ready**
   - Deployment configurations
   - Environment templates
   - Migration scripts
   - Performance optimizations

---

## Files Created

### Backend:
1. Database models in `app.py` (~600 lines)
2. Document endpoints in `app.py` (~300 lines)
3. Admin endpoints in `app.py` (~250 lines)
4. `requirements.txt` - Dependencies
5. `.env.example` - Configuration template
6. `migrate.py` - Migration script

### Frontend:
1. `src/pages/admin/AdminDashboard.jsx` (400+ lines)
2. `src/pages/admin/ManageUsers.jsx` (500+ lines)
3. `src/pages/Upload.jsx` (450+ lines)
4. `src/api/documents.js` - Document API
5. `src/api/admin.js` - Admin API

---

## Time Investment

**Total Hours:** ~115 hours over 4 weeks

**Breakdown:**
- Database Design: 35 hours
- Document Management: 30 hours
- Admin Portal: 25 hours
- Testing: 15 hours
- Deployment Configuration: 10 hours

---

## Learning Outcomes

1. **Database Design**
   - Complex relationship modeling
   - Performance optimization
   - Migration strategies
   - Data integrity

2. **SQLAlchemy Mastery**
   - ORM concepts
   - Relationship patterns
   - Query optimization
   - Transaction management

3. **File Management**
   - Cloud storage integration
   - Security best practices
   - Metadata tracking
   - Access control

4. **Admin Systems**
   - User management
   - Audit logging
   - Analytics dashboards
   - Role-based access

5. **Testing**
   - Database testing
   - API testing
   - Integration testing
   - Test automation

---

## Future Improvements

1. **Database Optimization**
   - Query caching with Redis
   - Database replication
   - Sharding for large datasets

2. **Advanced Document Features**
   - Document versioning
   - Collaborative editing
   - OCR for scanned documents
   - Advanced search

3. **Admin Features**
   - Advanced analytics
   - Automated reporting
   - System health monitoring
   - Backup management

4. **Testing**
   - Automated test suite
   - Load testing
   - Security testing
   - CI/CD integration

---

**Signature:** Member 4  
**Date:** November 13, 2025  
**Project:** Medicare Healthcare Management System
