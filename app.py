import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional, List
from dotenv import load_dotenv

from flask import Flask, abort, jsonify, request, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Date, DateTime, ForeignKey, Text, Table, UniqueConstraint, Boolean, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, scoped_session, backref
import jwt
import bcrypt

# Load environment variables from .env file
load_dotenv()

try:
    from supabase import create_client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("[WARN] Supabase not installed. Run: pip install supabase")

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///medicare.db")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
print(f"[INFO] JWT_SECRET loaded: {JWT_SECRET[:30]}... (length: {len(JWT_SECRET)})")
JWT_EXPIRATION = 7 * 24 * 60 * 60  # 7 days in seconds

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    future=True,
)
SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True))
Base = declarative_base()


# Association tables
patient_symptom_table = Table(
    "patient_symptoms",
    Base.metadata,
    Column("patient_id", Integer, ForeignKey("patients.id"), primary_key=True),
    Column("symptom_id", Integer, ForeignKey("symptoms.id"), primary_key=True),
    UniqueConstraint("patient_id", "symptom_id", name="uq_patient_symptom"),
)

disease_symptom_table = Table(
    "disease_symptoms",
    Base.metadata,
    Column("disease_id", Integer, ForeignKey("diseases.id"), primary_key=True),
    Column("symptom_id", Integer, ForeignKey("symptoms.id"), primary_key=True),
    UniqueConstraint("disease_id", "symptom_id", name="uq_disease_symptom"),
)


# Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    medical_history = Column(Text, nullable=True)
    photo_url = Column(String(300), nullable=True)
    role = Column(String(20), default='patient', nullable=False)
    is_cured = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(), onupdate=lambda: datetime.now(), nullable=False)

    def set_password(self, password: str):
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'age': self.age,
            'gender': self.gender,
            'medical_history': self.medical_history,
            'photo_url': self.photo_url,
            'role': self.role,
            'is_cured': self.is_cured,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    dob = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(120), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(), nullable=False)

    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    symptoms = relationship("Symptom", secondary=patient_symptom_table, back_populates="patients")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    date = Column(DateTime, nullable=False)
    reason = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(), nullable=False)

    patient = relationship("Patient", back_populates="appointments")


class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True)
    name = Column(String(120), unique=True, nullable=False, index=True)

    patients = relationship("Patient", secondary=patient_symptom_table, back_populates="symptoms")
    diseases = relationship("Disease", secondary=disease_symptom_table, back_populates="symptoms")


class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True)
    name = Column(String(120), unique=True, nullable=False, index=True)
    medicine = Column(String(255), nullable=True)
    precaution = Column(Text, nullable=True)

    symptoms = relationship("Symptom", secondary=disease_symptom_table, back_populates="diseases")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    specialization = Column(String(100), nullable=True)
    hospital = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    photo_url = Column(String(300), nullable=True)
    id_card_url = Column(String(300), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_online = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(), nullable=False)
    
    consultations = relationship("Consultation", back_populates="doctor", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="doctor", cascade="all, delete-orphan")

    def set_password(self, password: str):
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'specialization': self.specialization,
            'hospital': self.hospital,
            'phone': self.phone,
            'photo_url': self.photo_url,
            'id_card_url': self.id_card_url,
            'is_active': self.is_active,
            'is_online': self.is_online,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'role': 'doctor'
        }


class DocumentFolder(Base):
    __tablename__ = "document_folders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    parent_id = Column(Integer, ForeignKey("document_folders.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User")
    children = relationship("DocumentFolder", backref=backref('parent', remote_side=[id]))
    documents = relationship("Document", back_populates="folder")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'parent_id': self.parent_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'document_count': len(self.documents) if self.documents else 0
        }


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(400), nullable=False)
    download_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    file_type = Column(String(120), nullable=True)
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    folder_id = Column(Integer, ForeignKey("document_folders.id"), nullable=True, index=True)

    owner = relationship("User")
    folder = relationship("DocumentFolder", back_populates="documents")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'download_url': self.download_url,
            'description': self.description,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'folder_id': self.folder_id,
        }


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(20), default='pending', nullable=False)  # pending, active, ended
    primary_symptoms = Column(Text, nullable=True)
    llm_summary = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(), nullable=False)
    
    doctor = relationship("Doctor", back_populates="consultations")
    patient = relationship("User", foreign_keys=[patient_id])
    messages = relationship("Message", back_populates="consultation", cascade="all, delete-orphan")
    documents = relationship("ConsultationDocument", back_populates="consultation", cascade="all, delete-orphan")
    rating = relationship("Rating", back_populates="consultation", uselist=False, cascade="all, delete-orphan")


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=False, unique=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    doctor_rating = Column(Integer, nullable=False)  # 1-5 stars
    platform_rating = Column(Integer, nullable=True)  # 1-5 stars for platform experience
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(), nullable=False)
    
    consultation = relationship("Consultation", back_populates="rating")
    doctor = relationship("Doctor", back_populates="ratings")
    patient = relationship("User", foreign_keys=[patient_id])


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=False, index=True)
    sender_type = Column(String(10), nullable=False)  # 'doctor' or 'patient'
    sender_id = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=lambda: datetime.now(), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    
    consultation = relationship("Consultation", back_populates="messages")


class ConsultationDocument(Base):
    __tablename__ = "consultation_documents"

    id = Column(Integer, primary_key=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    shared_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    consultation = relationship("Consultation", back_populates="documents")
    document = relationship("Document")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    role = Column(String(20), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=True)
    type = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role': self.role,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# Paths
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"


# App factory
app = Flask(__name__, static_folder=str(FRONTEND_DIST), static_url_path='')

# CORS Configuration - Allow production frontend and local dev
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Add production frontend URL if provided
if FRONTEND_URL:
    ALLOWED_ORIGINS.append(FRONTEND_URL)

# Function to check if origin is allowed (for Vercel wildcard support)
def is_origin_allowed(origin):
    if not origin:
        return False
    # Allow localhost
    if origin.startswith("http://localhost"):
        return True
    # Allow Vercel domains
    if ".vercel.app" in origin:
        return True
    # Allow custom frontend URL
    if FRONTEND_URL and origin.startswith(FRONTEND_URL):
        return True
    return origin in ALLOWED_ORIGINS

# Allow all origins in development, specific origins in production
if os.getenv("FLASK_ENV") == "production":
    # For PythonAnywhere, use origin check function to allow Vercel domains
    # Also allow all origins as fallback for easier debugging
    CORS(app, 
         origins=is_origin_allowed, 
         supports_credentials=True, 
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
else:
    # Development: Allow all origins
    CORS(app)

# Supabase initialization for file uploads
if SUPABASE_AVAILABLE:
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://icvtjsfcuwqjhgduntyw.supabase.co")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    if SUPABASE_SERVICE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("[INFO] Supabase initialized for backend uploads")
    else:
        print("[WARN] SUPABASE_SERVICE_KEY not set - uploads may fail")
        supabase = None
else:
    supabase = None
    print("[WARN] Supabase not available - uploads disabled")

# Utilities

def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def seed_demo_data() -> None:
    db = SessionLocal()
    try:
        # Seed test doctor if not exists - Niharika Pandey
        if db.query(Doctor).filter(Doctor.email == 'niharika.pandey@medicare.com').first() is None:
            # Remove old doctor if exists
            old_doctor = db.query(Doctor).filter(Doctor.email == 'doctor@medicare.com').first()
            if old_doctor:
                db.delete(old_doctor)
            
            test_doctor = Doctor(
                name='Dr. Niharika Pandey',
                email='niharika.pandey@medicare.com',
                specialization='Dermatologist',
                hospital='Hospital Base Almora',
                phone='9917155180',
                is_active=True,
                is_online=False
            )
            test_doctor.set_password('doctor123')  # Test password
            db.add(test_doctor)
            print("[INFO] Test doctor created: niharika.pandey@medicare.com / doctor123")
        
        # Seed minimal demo data if empty
        if db.query(Symptom).count() == 0 and db.query(Disease).count() == 0:
            # Symptoms
            symptom_names = [
                "fever", "cough", "headache", "fatigue", "sore throat", "runny nose",
                "nausea", "vomiting", "diarrhea", "abdominal pain", "shortness of breath",
                "chest pain", "dizziness", "loss of taste", "loss of smell",
            ]
            name_to_symptom = {}
            for n in symptom_names:
                s = Symptom(name=n)
                db.add(s)
                name_to_symptom[n] = s
            db.flush()

            # Diseases with mappings, medicines, and precautions (simple demo set)
            def disease(name: str, symptom_list: List[str], med: str, prec: str) -> Disease:
                d = Disease(name=name, medicine=med, precaution=prec)
                d.symptoms = [name_to_symptom[x] for x in symptom_list if x in name_to_symptom]
                db.add(d)
                return d

            disease("Common Cold", ["cough", "runny nose", "sore throat"], "Rest, fluids, acetaminophen", "Stay hydrated; rest; avoid cold air")
            disease("Flu", ["fever", "cough", "fatigue", "headache"], "Oseltamivir in early onset; acetaminophen", "Rest; fluids; isolate if feverish")
            disease("Migraine", ["headache", "nausea", "vomiting", "dizziness"], "Triptans; NSAIDs", "Dark quiet room; avoid triggers")
            disease("Gastroenteritis", ["nausea", "vomiting", "diarrhea", "abdominal pain"], "ORS; antiemetic; rest", "Hydration; bland diet; hygiene")
            disease("COVID-19", ["fever", "cough", "loss of taste", "loss of smell", "fatigue"], "Supportive care; consult physician", "Isolate; mask; monitor oxygen")
            disease("Asthma Exacerbation", ["shortness of breath", "cough", "chest pain"], "Inhaled bronchodilator; corticosteroids", "Avoid triggers; follow action plan")

            db.commit()
        
        db.commit()  # Commit doctor creation
    finally:
        db.close()


def run_startup_migrations() -> None:
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    if 'documents' in existing_tables:
        columns = [col['name'] for col in inspector.get_columns('documents')]
        if 'folder_id' not in columns:
            with engine.begin() as conn:
                conn.execute(text('ALTER TABLE documents ADD COLUMN folder_id INTEGER'))
    
    if 'users' in existing_tables:
        columns = [col['name'] for col in inspector.get_columns('users')]
        if 'is_cured' not in columns:
            with engine.begin() as conn:
                conn.execute(text('ALTER TABLE users ADD COLUMN is_cured BOOLEAN DEFAULT 0'))
    
    if 'doctors' in existing_tables:
        columns = [col['name'] for col in inspector.get_columns('doctors')]
        if 'id_card_url' not in columns:
            with engine.begin() as conn:
                conn.execute(text('ALTER TABLE doctors ADD COLUMN id_card_url VARCHAR(300)'))


def get_token_identity():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None

    token = auth_header[7:]
    token_data = verify_token(token)
    return token_data


def create_notification(user_id: int, role: str, title: str, message: str = '', notif_type: str = 'general') -> None:
    try:
        db = SessionLocal()
        notification = Notification(
            user_id=user_id,
            role=role,
            title=title.strip()[:150] if title else 'Notification',
            message=message.strip() if message else '',
            type=notif_type,
            is_read=False
        )
        db.add(notification)
        db.commit()
    except Exception as exc:
        print(f"[WARN] Failed to create notification: {exc}")
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# JWT Token Functions
def create_token(user_id: int, role: str = 'patient') -> str:
    now = datetime.now(timezone.utc)
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': int((now + timedelta(seconds=JWT_EXPIRATION)).timestamp()),
        'iat': int(now.timestamp())
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return {
            'user_id': payload.get('user_id'),
            'role': payload.get('role', 'patient')
        }
    except jwt.InvalidTokenError as e:
        print(f"[ERROR] Token verification failed: {str(e)}")
        return None


def get_current_user() -> Optional[User]:
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header[7:]  # Remove 'Bearer ' prefix
    token_data = verify_token(token)
    if not token_data or token_data.get('role') != 'patient':
        return None
    
    db = SessionLocal()
    try:
        return db.query(User).filter(User.id == token_data.get('user_id')).first()
    finally:
        db.close()


def get_current_doctor() -> Optional[Doctor]:
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header[7:]  # Remove 'Bearer ' prefix
    token_data = verify_token(token)
    if not token_data or token_data.get('role') != 'doctor':
        return None
    
    db = SessionLocal()
    try:
        return db.query(Doctor).filter(Doctor.id == token_data.get('user_id')).first()
    finally:
        db.close()


def get_current_admin() -> Optional[User]:
    """Get current admin user from token"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header[7:]  # Remove 'Bearer ' prefix
    token_data = verify_token(token)
    if not token_data or token_data.get('role') != 'admin':
        return None
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == token_data.get('user_id')).first()
        if user and user.role and user.role.lower() == 'admin':
            return user
        return None
    finally:
        db.close()


# Admin Models
class PasswordReset(Base):
    __tablename__ = "password_resets"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(20), default='pending', nullable=False)  # pending, admin_set, link_sent, completed
    requested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    reason = Column(Text, nullable=True)
    
    user = relationship("User")


class AdminAudit(Base):
    __tablename__ = "admin_audit"
    
    id = Column(Integer, primary_key=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # add_doctor, remove_doctor, reset_password, change_email, etc.
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    meta = Column(Text, nullable=True)  # JSON as string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    admin = relationship("User", foreign_keys=[admin_id])
    target_user = relationship("User", foreign_keys=[target_user_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'admin_id': self.admin_id,
            'action': self.action,
            'target_user_id': self.target_user_id,
            'meta': self.meta,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


def log_admin_action(admin_id: int, action: str, target_user_id: Optional[int] = None, meta: Optional[dict] = None):
    """Log an admin action to audit log"""
    db = SessionLocal()
    try:
        import json
        audit = AdminAudit(
            admin_id=admin_id,
            action=action,
            target_user_id=target_user_id,
            meta=json.dumps(meta) if meta else None
        )
        db.add(audit)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to log admin action: {str(e)}")
    finally:
        db.close()


# Static/UI routes
@app.get("/")
def serve_index():
    if FRONTEND_DIST.exists():
        return send_from_directory(app.static_folder, "index.html")
    return (
        "<html><body><h1>MediCare API</h1><p>Build the frontend before serving. Run `npm install` and `npm run build` inside the frontend/ folder.</p></body></html>",
        200,
        {"Content-Type": "text/html"},
    )


@app.get("/favicon.ico")
def serve_favicon():
    if not FRONTEND_DIST.exists():
        return ("", 204)
    favicon_path = FRONTEND_DIST / "favicon.ico"
    if favicon_path.exists():
        return send_from_directory(app.static_folder, "favicon.ico")
    return ("", 204)


@app.get("/<path:path>")
def serve_frontend(path: str):
    if path.startswith("api/"):
        abort(404)
    if not FRONTEND_DIST.exists():
        abort(404)
    target = FRONTEND_DIST / path
    if target.exists() and target.is_file():
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


# Serialization helpers

def patient_to_dict(p: Patient) -> dict:
    return {
        "id": p.id,
        "first_name": p.first_name,
        "last_name": p.last_name,
        "dob": p.dob.isoformat() if p.dob else None,
        "gender": p.gender,
        "phone": p.phone,
        "email": p.email,
        "address": p.address,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "symptoms": [s.name for s in p.symptoms],
    }


def appointment_to_dict(a: Appointment) -> dict:
    return {
        "id": a.id,
        "patient_id": a.patient_id,
        "date": a.date.isoformat() if a.date else None,
        "reason": a.reason,
        "notes": a.notes,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


# Routes: Health
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


# Routes: Authentication
@app.post("/api/auth/register")
def register():
    data = request.get_json(force=True, silent=True) or {}
    
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    name = data.get('name', '').strip()
    role = data.get('role', 'patient')
    
    # Only patients can register - doctors are added by admin
    if role != 'patient':
        return jsonify({"error": "Only patients can register. Doctors are added by administrator."}), 403
    
    if not email or not password or not name:
        return jsonify({"error": "Email, password, and name are required"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return jsonify({"error": "Email already registered"}), 400
        
        # Create new user (patient only)
        user = User(
            name=name,
            email=email,
            role='patient'  # Force patient role
        )
        user.set_password(password)
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Generate token
        token = create_token(user.id, 'patient')
        
        return jsonify({
            "token": token,
            "user": user.to_dict(),
            "role": "patient"
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.post("/api/auth/login")
def login():
    data = request.get_json(force=True, silent=True) or {}
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    db = SessionLocal()
    try:
        # Check if it's a doctor first
        doctor = db.query(Doctor).filter(Doctor.email == email).first()
        if doctor and doctor.check_password(password):
            if not doctor.is_active:
                return jsonify({"error": "Doctor account is inactive"}), 403
            
            token = create_token(doctor.id, 'doctor')
            print(f"[INFO] Doctor login: {doctor.name}")
            return jsonify({
                "token": token,
                "user": doctor.to_dict(),
                "role": "doctor"
            }), 200
        
        # Check if it's a user (patient or admin)
        user = db.query(User).filter(User.email == email).first()
        if user and user.check_password(password):
            # Check if user is active (for all roles)
            if hasattr(user, 'is_active') and not user.is_active:
                return jsonify({"error": "Account is inactive"}), 403
            
            role = user.role.lower() if user.role else 'patient'
            token = create_token(user.id, role)
            print(f"[INFO] {role.capitalize()} login: {user.name}")
            return jsonify({
                "token": token,
                "user": user.to_dict(),
                "role": role
            }), 200
        
        return jsonify({"error": "Invalid email or password"}), 401
    finally:
        db.close()


@app.get("/api/auth/me")
def get_current_user_info():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify(user.to_dict()), 200


@app.put("/api/auth/me")
def update_current_user():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json(force=True, silent=True) or {}
    
    db = SessionLocal()
    try:
        # Get the user from the database
        db_user = db.query(User).filter(User.id == user.id).first()
        if not db_user:
            return jsonify({"error": "User not found"}), 404
        
        # Update allowed fields
        if 'age' in data:
            db_user.age = data['age']
        if 'gender' in data:
            db_user.gender = data['gender']
        if 'phone' in data:
            db_user.phone = data['phone']
        if 'medical_history' in data:
            db_user.medical_history = data['medical_history']
        if 'name' in data:
            db_user.name = data['name']
        if 'photo_url' in data:
            db_user.photo_url = data['photo_url']
        if 'email' in data:
            # Check if email is already taken
            existing = db.query(User).filter(User.email == data['email'], User.id != user.id).first()
            if existing:
                return jsonify({"error": "Email already in use"}), 400
            db_user.email = data['email']
        
        db.commit()
        db.refresh(db_user)
        
        return jsonify(db_user.to_dict()), 200
    finally:
        db.close()


@app.post("/api/auth/google")
def google_auth():
    data = request.get_json(force=True, silent=True) or {}
    
    token = data.get('token')
    role = data.get('role', 'patient')
    
    if not token:
        return jsonify({"error": "Google token is required"}), 400
    
    # TODO: Verify Google token with Google API
    # For now, we'll create a mock implementation
    
    db = SessionLocal()
    try:
        # This is a simplified implementation
        # In production, verify the token with Google's servers
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
        except:
            return jsonify({"error": "Invalid Google token"}), 401
        
        email = payload.get('email', '')
        name = payload.get('name', '')
        
        if not email or not name:
            return jsonify({"error": "Invalid Google token - missing email or name"}), 401
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user from Google data
            user = User(
                name=name,
                email=email,
                role=role,
                password=bcrypt.hashpw(os.urandom(32), bcrypt.gensalt()).decode('utf-8')
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Generate token
        auth_token = create_token(user.id)
        
        return jsonify({
            "token": auth_token,
            "user": user.to_dict()
        }), 200
    finally:
        db.close()


# Routes: Symptoms
@app.get("/api/symptoms")
def list_symptoms():
    q = (request.args.get("q") or "").strip().lower()
    db = SessionLocal()
    try:
        query = db.query(Symptom)
        if q and len(q) >= 2:
            query = query.filter(Symptom.name.like(f"%{q}%"))
        elif q:
            # If <2 chars provided, return empty for suggestions
            return jsonify([])
        syms = query.order_by(Symptom.name.asc()).limit(25).all()
        return jsonify([{"id": s.id, "name": s.name} for s in syms])
    finally:
        db.close()


@app.get("/api/patients/<int:patient_id>/symptoms")
def get_patient_symptoms(patient_id: int):
    db = SessionLocal()
    try:
        p = db.get(Patient, patient_id)
        if not p:
            return jsonify({"error": "Patient not found"}), 404
        return jsonify([{"id": s.id, "name": s.name} for s in p.symptoms])
    finally:
        db.close()


@app.post("/api/patients/<int:patient_id>/symptoms")
def set_patient_symptoms(patient_id: int):
    payload = request.get_json(force=True, silent=True) or {}
    names: List[str] = [str(x).strip().lower() for x in (payload.get("symptoms") or []) if str(x).strip()]
    db = SessionLocal()
    try:
        p = db.get(Patient, patient_id)
        if not p:
            return jsonify({"error": "Patient not found"}), 404
        # Fetch or create symptoms by name
        current: List[Symptom] = []
        for name in names:
            s = db.query(Symptom).filter(Symptom.name == name).one_or_none()
            if not s:
                s = Symptom(name=name)
                db.add(s)
                db.flush()
            current.append(s)
        p.symptoms = current
        db.add(p)
        db.commit()
        db.refresh(p)
        return jsonify([{"id": s.id, "name": s.name} for s in p.symptoms])
    finally:
        db.close()


# Routes: Prediction
@app.post("/api/predict")
def predict_disease():
    payload = request.get_json(force=True, silent=True) or {}
    names: List[str] = [str(x).strip().lower() for x in (payload.get("symptoms") or []) if str(x).strip()]
    if len(names) == 0:
        return jsonify({"error": "symptoms array required"}), 400

    db = SessionLocal()
    try:
        # Match diseases by overlap count with provided symptoms
        diseases = db.query(Disease).all()
        best = None
        best_score = -1
        provided = set(names)
        for d in diseases:
            disease_syms = set(s.name for s in d.symptoms)
            score = len(provided & disease_syms)
            if score > best_score:
                best = d
                best_score = score
        if not best or best_score == 0:
            return jsonify({
                "prediction": None,
                "score": 0,
                "medicine": None,
                "precaution": None,
                "note": "No close match found. Please consult a physician."
            })
        return jsonify({
            "prediction": best.name,
            "score": best_score,
            "medicine": best.medicine,
            "precaution": best.precaution,
        })
    finally:
        db.close()


# Routes: Patients
@app.get("/api/patients")
def get_patients():
    db = SessionLocal()
    try:
        patients = db.query(Patient).order_by(Patient.id.desc()).all()
        return jsonify([patient_to_dict(p) for p in patients])
    finally:
        db.close()


@app.get("/api/patients/<int:patient_id>")
def get_patient(patient_id: int):
    db = SessionLocal()
    try:
        patient = db.get(Patient, patient_id)
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        return jsonify(patient_to_dict(patient))
    finally:
        db.close()


@app.post("/api/patients")
def create_patient():
    payload = request.get_json(force=True, silent=True) or {}

    first_name = (payload.get("first_name") or "").strip()
    last_name = (payload.get("last_name") or "").strip()

    if not first_name or not last_name:
        return jsonify({"error": "first_name and last_name are required"}), 400

    dob_str: Optional[str] = payload.get("dob")
    dob_val: Optional[datetime] = None
    if dob_str:
        try:
            dob_val = datetime.fromisoformat(dob_str).date()
        except Exception:
            return jsonify({"error": "dob must be ISO date (YYYY-MM-DD)"}), 400

    db = SessionLocal()
    try:
        patient = Patient(
            first_name=first_name,
            last_name=last_name,
            dob=dob_val,
            gender=(payload.get("gender") or None),
            phone=(payload.get("phone") or None),
            email=(payload.get("email") or None),
            address=(payload.get("address") or None),
        )
        db.add(patient)
        db.flush()

        # Attach symptoms if provided
        names = [str(x).strip().lower() for x in (payload.get("symptoms") or []) if str(x).strip()]
        if names:
            current: List[Symptom] = []
            for name in names:
                s = db.query(Symptom).filter(Symptom.name == name).one_or_none()
                if not s:
                    s = Symptom(name=name)
                    db.add(s)
                    db.flush()
                current.append(s)
            patient.symptoms = current

        db.commit()
        db.refresh(patient)
        return jsonify(patient_to_dict(patient)), 201
    finally:
        db.close()


@app.put("/api/patients/<int:patient_id>")
def update_patient(patient_id: int):
    payload = request.get_json(force=True, silent=True) or {}
    db = SessionLocal()
    try:
        patient = db.get(Patient, patient_id)
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        if "first_name" in payload:
            if not str(payload["first_name"]).strip():
                return jsonify({"error": "first_name cannot be empty"}), 400
            patient.first_name = str(payload["first_name"]).strip()
        if "last_name" in payload:
            if not str(payload["last_name"]).strip():
                return jsonify({"error": "last_name cannot be empty"}), 400
            patient.last_name = str(payload["last_name"]).strip()
        if "dob" in payload:
            if payload["dob"]:
                try:
                    patient.dob = datetime.fromisoformat(payload["dob"]).date()
                except Exception:
                    return jsonify({"error": "dob must be ISO date (YYYY-MM-DD)"}), 400
            else:
                patient.dob = None
        if "gender" in payload:
            patient.gender = payload["gender"] or None
        if "phone" in payload:
            patient.phone = payload["phone"] or None
        if "email" in payload:
            patient.email = payload["email"] or None
        if "address" in payload:
            patient.address = payload["address"] or None

        # Optional: replace symptoms if provided
        if "symptoms" in payload:
            names = [str(x).strip().lower() for x in (payload.get("symptoms") or []) if str(x).strip()]
            current: List[Symptom] = []
            for name in names:
                s = db.query(Symptom).filter(Symptom.name == name).one_or_none()
                if not s:
                    s = Symptom(name=name)
                    db.add(s)
                    db.flush()
                current.append(s)
            patient.symptoms = current

        db.add(patient)
        db.commit()
        db.refresh(patient)
        return jsonify(patient_to_dict(patient))
    finally:
        db.close()


@app.delete("/api/patients/<int:patient_id>")
def delete_patient(patient_id: int):
    db = SessionLocal()
    try:
        patient = db.get(Patient, patient_id)
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        db.delete(patient)
        db.commit()
        return ("", 204)
    finally:
        db.close()


# Routes: Appointments
@app.get("/api/appointments")
def get_appointments():
    db = SessionLocal()
    try:
        appointments = db.query(Appointment).order_by(Appointment.date.desc()).all()
        return jsonify([appointment_to_dict(a) for a in appointments])
    finally:
        db.close()


@app.get("/api/appointments/<int:appointment_id>")
def get_appointment(appointment_id: int):
    db = SessionLocal()
    try:
        appt = db.get(Appointment, appointment_id)
        if not appt:
            return jsonify({"error": "Appointment not found"}), 404
        return jsonify(appointment_to_dict(appt))
    finally:
        db.close()


@app.post("/api/appointments")
def create_appointment():
    payload = request.get_json(force=True, silent=True) or {}

    try:
        patient_id = int(payload.get("patient_id"))
    except Exception:
        return jsonify({"error": "patient_id is required and must be an integer"}), 400

    date_str = payload.get("date")
    if not date_str:
        return jsonify({"error": "date is required (ISO datetime)"}), 400
    try:
        date_val = datetime.fromisoformat(date_str)
    except Exception:
        return jsonify({"error": "date must be ISO datetime (YYYY-MM-DDTHH:MM:SS)"}), 400

    db = SessionLocal()
    try:
        if not db.get(Patient, patient_id):
            return jsonify({"error": "Patient does not exist"}), 400

        appt = Appointment(
            patient_id=patient_id,
            date=date_val,
            reason=(payload.get("reason") or None),
            notes=(payload.get("notes") or None),
        )
        db.add(appt)
        db.commit()
        db.refresh(appt)
        return jsonify(appointment_to_dict(appt)), 201
    finally:
        db.close()


@app.put("/api/appointments/<int:appointment_id>")
def update_appointment(appointment_id: int):
    payload = request.get_json(force=True, silent=True) or {}
    db = SessionLocal()
    try:
        appt = db.get(Appointment, appointment_id)
        if not appt:
            return jsonify({"error": "Appointment not found"}), 404

        if "patient_id" in payload and payload["patient_id"] is not None:
            try:
                new_patient_id = int(payload["patient_id"])
            except Exception:
                return jsonify({"error": "patient_id must be an integer"}), 400
            if not db.get(Patient, new_patient_id):
                return jsonify({"error": "Patient does not exist"}), 400
            appt.patient_id = new_patient_id

        if "date" in payload:
            if payload["date"]:
                try:
                    appt.date = datetime.fromisoformat(payload["date"])  # type: ignore
                except Exception:
                    return jsonify({"error": "date must be ISO datetime (YYYY-MM-DDTHH:MM:SS)"}), 400
            else:
                return jsonify({"error": "date cannot be null"}), 400

        if "reason" in payload:
            appt.reason = payload["reason"] or None
        if "notes" in payload:
            appt.notes = payload["notes"] or None

        db.add(appt)
        db.commit()
        db.refresh(appt)
        return jsonify(appointment_to_dict(appt))
    finally:
        db.close()


@app.delete("/api/appointments/<int:appointment_id>")
def delete_appointment(appointment_id: int):
    db = SessionLocal()
    try:
        appt = db.get(Appointment, appointment_id)
        if not appt:
            return jsonify({"error": "Appointment not found"}), 404
        db.delete(appt)
        db.commit()
        return ("", 204)
    finally:
        db.close()


# ============================================
# DOCTOR API ENDPOINTS
# ============================================

@app.get("/api/doctor/dashboard")
def doctor_dashboard():
    """Get doctor dashboard statistics"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        from datetime import datetime, timedelta
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        new_requests = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id,
            Consultation.status == 'pending'
        ).count()
        
        active_consultations = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id,
            Consultation.status == 'active'
        ).count()
        
        total_patients = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id
        ).distinct(Consultation.patient_id).count()
        
        # Get reports from patients who have consultations with this doctor
        reports_awaiting = db.query(Consultation).join(
            User, Consultation.patient_id == User.id
        ).filter(
            Consultation.doctor_id == doctor.id
        ).count()
        
        # Today's activity stats
        patients_today = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id,
            Consultation.created_at >= today_start
        ).distinct(Consultation.patient_id).count()
        
        completed_today = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id,
            Consultation.status == 'ended',
            Consultation.ended_at >= today_start
        ).count()
        
        pending_today = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id,
            Consultation.status == 'pending',
            Consultation.created_at >= today_start
        ).count()
        
        return jsonify({
            "new_requests": new_requests,
            "active_consultations": active_consultations,
            "total_patients": total_patients,
            "reports_awaiting": reports_awaiting,
            "today_activity": {
                "patients": patients_today,
                "completed": completed_today,
                "pending": pending_today
            }
        }), 200
    finally:
        db.close()


@app.get("/api/doctor/requests")
def doctor_requests():
    """Get pending consultation requests"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        # Get all pending requests for this doctor (or unassigned pending requests)
        requests = db.query(Consultation).filter(
            ((Consultation.doctor_id == doctor.id) | (Consultation.doctor_id == None)),
            Consultation.status == 'pending'
        ).order_by(Consultation.created_at.desc()).all()
        
        result = []
        for req in requests:
            patient = db.query(User).filter(User.id == req.patient_id).first()
            shared_doc_count = len(req.documents)
            result.append({
                "id": req.id,
                "patient_id": req.patient_id,
                "patient_name": patient.name if patient else "Unknown",
                "patient_age": patient.age if patient else None,
                "patient_gender": patient.gender if patient else None,
                "patient_photo_url": patient.photo_url if patient else None,
                "primary_symptoms": req.primary_symptoms or "",
                "llm_summary": req.llm_summary or "",
                "document_count": shared_doc_count,
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "status": req.status
            })
        
        return jsonify(result), 200
    finally:
        db.close()


@app.get("/api/doctor/consultations")
def doctor_consultations():
    """Get active consultations"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        consultations = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id,
            Consultation.status == 'active'
        ).order_by(Consultation.started_at.desc()).all()
        
        result = []
        for cons in consultations:
            patient = db.query(User).filter(User.id == cons.patient_id).first()
            result.append({
                "id": cons.id,
                "patient_id": cons.patient_id,
                "patient_name": patient.name if patient else "Unknown",
                "patient_photo_url": patient.photo_url if patient else None,
                "started_at": cons.started_at.isoformat() if cons.started_at else None,
                "status": cons.status
            })
        
        return jsonify(result), 200
    finally:
        db.close()


@app.post("/api/consultation/<int:consultation_id>/accept")
def accept_consultation(consultation_id):
    """Doctor accepts a consultation request"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        # Accept any pending consultation (doctor_id can be None or match)
        consultation = db.query(Consultation).filter(
            Consultation.id == consultation_id,
            ((Consultation.doctor_id == doctor.id) | (Consultation.doctor_id == None)),
            Consultation.status == 'pending'
        ).first()
        
        if not consultation:
            return jsonify({"error": "Consultation not found"}), 404
        
        consultation.status = 'active'
        consultation.started_at = datetime.now()
        consultation.doctor_id = doctor.id
        db.commit()
        patient = db.query(User).filter(User.id == consultation.patient_id).first()
        if patient:
            create_notification(
                patient.id,
                'patient',
                'Consultation accepted',
                f"{doctor.name} accepted your consultation request.",
                'consult_accept'
            )
        
        return jsonify({"success": True, "message": "Consultation accepted"}), 200
    finally:
        db.close()


@app.post("/api/consultation/<int:consultation_id>/reject")
def reject_consultation(consultation_id):
    """Doctor rejects a consultation request"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        consultation = db.query(Consultation).filter(
            Consultation.id == consultation_id,
            ((Consultation.doctor_id == doctor.id) | (Consultation.doctor_id == None)),
            Consultation.status == 'pending'
        ).first()
        
        if not consultation:
            return jsonify({"error": "Consultation not found"}), 404
        
        db.delete(consultation)
        db.commit()

        create_notification(
            consultation.patient_id,
            'patient',
            'Consultation update',
            f"{doctor.name} was unavailable for this request.",
            'consult_reject'
        )
        
        return jsonify({"success": True, "message": "Consultation rejected"}), 200
    finally:
        db.close()


@app.post("/api/consultation/<int:consultation_id>/end")
def end_consultation(consultation_id):
    """Doctor or patient ends an active consultation"""
    user = get_current_user()
    doctor = get_current_doctor()
    
    if not user and not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        consultation = db.query(Consultation).filter(
            Consultation.id == consultation_id,
            Consultation.status == 'active'
        ).first()
        
        if not consultation:
            return jsonify({"error": "Consultation not found"}), 404
        
        # Check authorization: doctor can end their own consultations, patient can end their own
        if doctor:
            if consultation.doctor_id != doctor.id:
                return jsonify({"error": "Forbidden"}), 403
        elif user:
            if consultation.patient_id != user.id:
                return jsonify({"error": "Forbidden"}), 403
        else:
            return jsonify({"error": "Unauthorized"}), 401
        
        consultation.status = 'ended'
        consultation.ended_at = datetime.now()
        db.commit()
        
        # Notify the other party
        if doctor:
            patient = db.query(User).filter(User.id == consultation.patient_id).first()
            if patient:
                create_notification(
                    patient.id,
                    'patient',
                    'Consultation ended',
                    f"Your consultation with {doctor.name} has ended. Please rate your experience.",
                    'consult_end'
                )
        elif user:
            doctor_obj = db.query(Doctor).filter(Doctor.id == consultation.doctor_id).first()
            if doctor_obj:
                create_notification(
                    doctor_obj.id,
                    'doctor',
                    'Consultation ended',
                    f"Consultation with {user.name} has ended.",
                    'consult_end'
                )
        
        return jsonify({"success": True, "message": "Consultation ended"}), 200
    finally:
        db.close()


@app.post("/api/consultation/<int:consultation_id>/rate")
def submit_rating(consultation_id):
    """Patient submits rating for a consultation"""
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json(force=True, silent=True) or {}
    doctor_rating = data.get('doctor_rating')
    platform_rating = data.get('platform_rating')
    feedback = data.get('feedback', '')
    
    if not doctor_rating or not isinstance(doctor_rating, int) or doctor_rating < 1 or doctor_rating > 5:
        return jsonify({"error": "Invalid doctor rating. Must be between 1 and 5."}), 400
    
    if platform_rating and (not isinstance(platform_rating, int) or platform_rating < 1 or platform_rating > 5):
        return jsonify({"error": "Invalid platform rating. Must be between 1 and 5."}), 400
    
    db = SessionLocal()
    try:
        consultation = db.query(Consultation).filter(
            Consultation.id == consultation_id,
            Consultation.patient_id == user.id,
            Consultation.status == 'ended'
        ).first()
        
        if not consultation:
            return jsonify({"error": "Consultation not found"}), 404
        
        if not consultation.doctor_id:
            return jsonify({"error": "Consultation has no assigned doctor"}), 400
        
        # Check if rating already exists
        existing_rating = db.query(Rating).filter(Rating.consultation_id == consultation_id).first()
        if existing_rating:
            return jsonify({"error": "Rating already submitted for this consultation"}), 400
        
        # Create rating
        rating = Rating(
            consultation_id=consultation_id,
            doctor_id=consultation.doctor_id,
            patient_id=user.id,
            doctor_rating=doctor_rating,
            platform_rating=platform_rating,
            feedback=feedback
        )
        db.add(rating)
        db.commit()
        
        return jsonify({
            "success": True,
            "message": "Rating submitted successfully",
            "rating": {
                "id": rating.id,
                "doctor_rating": rating.doctor_rating,
                "platform_rating": rating.platform_rating,
                "feedback": rating.feedback,
                "created_at": rating.created_at.isoformat() if rating.created_at else None
            }
        }), 201
    finally:
        db.close()


@app.get("/api/consultation/<int:consultation_id>/messages")
def get_consultation_messages(consultation_id):
    """Get messages for a consultation"""
    doctor = get_current_doctor()
    user = get_current_user()
    
    if not doctor and not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        # Verify access
        consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not consultation:
            return jsonify({"error": "Consultation not found"}), 404
        
        if doctor and consultation.doctor_id != doctor.id:
            return jsonify({"error": "Unauthorized"}), 403
        if user and consultation.patient_id != user.id:
            return jsonify({"error": "Unauthorized"}), 403
        
        messages = db.query(Message).filter(
            Message.consultation_id == consultation_id
        ).order_by(Message.sent_at.asc()).all()
        
        result = []
        for msg in messages:
            result.append({
                "id": msg.id,
                "sender_type": msg.sender_type,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "sent_at": msg.sent_at.isoformat() if msg.sent_at else None,
                "is_read": msg.is_read
            })
        
        return jsonify(result), 200
    finally:
        db.close()


# Track active viewers for consultations (in-memory, resets on server restart)
active_viewers = {}  # {consultation_id: {user_id: timestamp, ...}}

@app.post("/api/consultation/<int:consultation_id>/viewing")
def mark_viewing(consultation_id):
    """Mark that user is currently viewing this consultation"""
    doctor = get_current_doctor()
    user = get_current_user()
    
    if not doctor and not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    viewer_id = doctor.id if doctor else user.id
    viewer_role = 'doctor' if doctor else 'patient'
    
    if consultation_id not in active_viewers:
        active_viewers[consultation_id] = {}
    
    active_viewers[consultation_id][f"{viewer_role}_{viewer_id}"] = datetime.now()
    
    # Clean up old entries (older than 30 seconds)
    cutoff = datetime.now() - timedelta(seconds=30)
    active_viewers[consultation_id] = {
        k: v for k, v in active_viewers[consultation_id].items()
        if v > cutoff
    }
    
    return jsonify({"success": True}), 200


@app.post("/api/consultation/<int:consultation_id>/messages")
def send_message(consultation_id):
    """Send a message in a consultation"""
    doctor = get_current_doctor()
    user = get_current_user()
    
    if not doctor and not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json(force=True, silent=True) or {}
    content = data.get('content', '').strip()
    document_ids = data.get('document_ids', [])  # New: support sharing documents
    
    if not content and not document_ids:
        return jsonify({"error": "Message content or documents are required"}), 400
    
    db = SessionLocal()
    try:
        consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not consultation:
            return jsonify({"error": "Consultation not found"}), 404
        
        sender_type = 'doctor' if doctor else 'patient'
        sender_id = doctor.id if doctor else user.id
        
        # Verify access
        if doctor and consultation.doctor_id != doctor.id:
            return jsonify({"error": "Unauthorized"}), 403
        if user and consultation.patient_id != user.id:
            return jsonify({"error": "Unauthorized"}), 403
        
        message = Message(
            consultation_id=consultation_id,
            sender_type=sender_type,
            sender_id=sender_id,
            content=content or f"Shared {len(document_ids)} document(s)"
        )
        
        db.add(message)
        db.commit()
        db.refresh(message)
        
        # Link documents to consultation if provided (only patients can share documents)
        if document_ids and user:
            for doc_id in document_ids:
                doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user.id).first()
                if doc:
                    # Create consultation document link if not exists
                    existing = db.query(ConsultationDocument).filter(
                        ConsultationDocument.consultation_id == consultation_id,
                        ConsultationDocument.document_id == doc_id
                    ).first()
                    if not existing:
                        link = ConsultationDocument(
                            consultation_id=consultation_id,
                            document_id=doc_id
                        )
                        db.add(link)
            db.commit()

        # Check if recipient is actively viewing this consultation
        recipient_viewing = False
        if consultation_id in active_viewers:
            if sender_type == 'doctor':
                recipient_key = f"patient_{consultation.patient_id}"
            else:
                recipient_key = f"doctor_{consultation.doctor_id}"
            
            if recipient_key in active_viewers[consultation_id]:
                # Check if viewing is recent (within last 30 seconds)
                last_view = active_viewers[consultation_id][recipient_key]
                if (datetime.now() - last_view).total_seconds() < 30:
                    recipient_viewing = True

        # Only send notification if recipient is NOT actively viewing
        if not recipient_viewing:
            try:
                preview = (content[:120] + '...') if len(content) > 120 else content
                if document_ids:
                    preview = f"Shared {len(document_ids)} document(s)" + (f": {preview}" if content else "")
                
                if sender_type == 'doctor':
                    create_notification(
                        consultation.patient_id,
                        'patient',
                        f"New message from {doctor.name}",
                        preview,
                        'consult_message'
                    )
                else:
                    if consultation.doctor_id:
                        create_notification(
                            consultation.doctor_id,
                            'doctor',
                            f"New message from {user.name or 'Patient'}",
                            preview,
                            'consult_message'
                        )
            except Exception as notify_err:
                print(f"[WARN] Failed to push message notification: {notify_err}")
        
        return jsonify({
            "id": message.id,
            "sender_type": message.sender_type,
            "sender_id": message.sender_id,
            "content": message.content,
            "sent_at": message.sent_at.isoformat() if message.sent_at else None
        }), 201
    finally:
        db.close()


@app.get("/api/doctor/reports")
def doctor_reports():
    """Get all documents/reports from patients who have consulted with this doctor"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        # Get all consultations with this doctor
        consultations = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id
        ).all()
        
        patient_ids = [c.patient_id for c in consultations]
        
        if not patient_ids:
            return jsonify([]), 200
        
        # Get all documents from these patients
        documents = db.query(Document).filter(
            Document.user_id.in_(patient_ids)
        ).order_by(Document.created_at.desc()).all()
        
        # Get patient info for each document
        result = []
        for doc in documents:
            patient = db.query(User).filter(User.id == doc.user_id).first()
            result.append({
                "id": doc.id,
                "file_name": doc.file_name,
                "file_url": doc.file_path,
                "download_url": doc.download_url or doc.file_path,
                "file_size": doc.file_size,
                "mime_type": doc.file_type or "application/octet-stream",
                "uploaded_at": doc.created_at.isoformat() if doc.created_at else None,
                "created_at": doc.created_at.isoformat() if doc.created_at else None,
                "patient_id": doc.user_id,
                "patient_name": patient.name if patient else "Unknown",
                "patient_email": patient.email if patient else None,
                "description": doc.description or ""
            })
        
        return jsonify(result), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.get("/api/doctor/patients")
def doctor_patients():
    """Get all patients who have consulted with this doctor"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Optional query parameter to filter by cured status
    cured_only = request.args.get('cured', 'false').lower() == 'true'
    
    db = SessionLocal()
    try:
        consultations = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id
        ).distinct(Consultation.patient_id).all()
        
        patient_ids = [c.patient_id for c in consultations]
        query = db.query(User).filter(User.id.in_(patient_ids))
        
        # Filter by cured status if specified
        if cured_only:
            query = query.filter(User.is_cured == True)
        else:
            # If not specifically asking for cured, show all (or can filter uncured)
            pass
        
        patients = query.all()
        
        result = []
        for patient in patients:
            result.append(patient.to_dict())
        
        return jsonify(result), 200
    finally:
        db.close()


@app.post("/api/doctor/patients/<int:patient_id>/mark-cured")
def mark_patient_cured(patient_id):
    """Mark a patient as cured"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        # Verify patient has consulted with this doctor
        consultation = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id,
            Consultation.patient_id == patient_id
        ).first()
        
        if not consultation:
            return jsonify({"error": "Patient not found or not associated with this doctor"}), 404
        
        # Get and update patient
        patient = db.query(User).filter(User.id == patient_id).first()
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        
        patient.is_cured = True
        db.commit()
        db.refresh(patient)
        
        return jsonify(patient.to_dict()), 200
    finally:
        db.close()


@app.post("/api/doctor/patients/<int:patient_id>/mark-uncured")
def mark_patient_uncured(patient_id):
    """Mark a patient as not cured (move back to active)"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        # Verify patient has consulted with this doctor
        consultation = db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id,
            Consultation.patient_id == patient_id
        ).first()
        
        if not consultation:
            return jsonify({"error": "Patient not found or not associated with this doctor"}), 404
        
        # Get and update patient
        patient = db.query(User).filter(User.id == patient_id).first()
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        
        patient.is_cured = False
        db.commit()
        db.refresh(patient)
        
        return jsonify(patient.to_dict()), 200
    finally:
        db.close()


@app.put("/api/doctor/me")
def update_doctor_profile():
    """Update doctor profile"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json(force=True, silent=True) or {}
    
    db = SessionLocal()
    try:
        db_doctor = db.query(Doctor).filter(Doctor.id == doctor.id).first()
        if not db_doctor:
            return jsonify({"error": "Doctor not found"}), 404
        
        if 'name' in data:
            db_doctor.name = data['name']
        if 'specialization' in data:
            db_doctor.specialization = data['specialization']
        if 'hospital' in data:
            db_doctor.hospital = data['hospital']
        if 'phone' in data:
            db_doctor.phone = data['phone']
        if 'photo_url' in data:
            db_doctor.photo_url = data['photo_url']
        if 'id_card_url' in data:
            db_doctor.id_card_url = data['id_card_url']
        if 'is_online' in data:
            db_doctor.is_online = data['is_online']
        if 'email' in data:
            # Check if email is already taken
            existing = db.query(Doctor).filter(Doctor.email == data['email'], Doctor.id != doctor.id).first()
            if existing:
                return jsonify({"error": "Email already in use"}), 400
            db_doctor.email = data['email']
        
        db.commit()
        db.refresh(db_doctor)
        
        return jsonify(db_doctor.to_dict()), 200
    finally:
        db.close()


# ============================================
# PATIENT CONSULTATION REQUEST
# ============================================


@app.get("/api/patient/documents")
def list_patient_documents():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    db = SessionLocal()
    try:
        folder_id_param = request.args.get('folder_id', default=None, type=int)
        uncategorized = request.args.get('uncategorized', default='false').lower() == 'true'
        limit_param = request.args.get('limit', default=None, type=int)
        sort_param = request.args.get('sort', default='created_at:desc')

        query = db.query(Document).filter(Document.user_id == user.id)
        if folder_id_param is not None:
            query = query.filter(Document.folder_id == folder_id_param)
        elif uncategorized:
            query = query.filter(Document.folder_id.is_(None))

        # Handle sorting
        if sort_param == 'created_at:desc':
            query = query.order_by(Document.created_at.desc())
        elif sort_param == 'created_at:asc':
            query = query.order_by(Document.created_at.asc())
        else:
            query = query.order_by(Document.created_at.desc())  # Default

        # Apply limit if specified
        if limit_param:
            docs = query.limit(limit_param).all()
        else:
            docs = query.all()
        
        return jsonify([doc.to_dict() for doc in docs]), 200
    finally:
        db.close()


@app.post("/api/patient/folders")
def create_document_folder():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True, silent=True) or {}
    name = (data.get('name') or '').strip()
    parent_id = data.get('parent_id')

    if not name:
        return jsonify({"error": "Folder name is required"}), 400

    db = SessionLocal()
    try:
        parent = None
        if parent_id is not None:
            parent = db.query(DocumentFolder).filter(DocumentFolder.id == parent_id, DocumentFolder.user_id == user.id).first()
            if not parent:
                return jsonify({"error": "Parent folder not found"}), 404

        folder = DocumentFolder(user_id=user.id, name=name, parent_id=parent.id if parent else None)
        db.add(folder)
        db.commit()
        db.refresh(folder)
        return jsonify(folder.to_dict()), 201
    finally:
        db.close()


@app.get("/api/patient/folders")
def list_document_folders():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    db = SessionLocal()
    try:
        folders = db.query(DocumentFolder).filter(DocumentFolder.user_id == user.id).order_by(DocumentFolder.name.asc()).all()
        return jsonify([folder.to_dict() for folder in folders]), 200
    finally:
        db.close()


@app.delete("/api/patient/folders/<int:folder_id>")
def delete_document_folder(folder_id: int):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    db = SessionLocal()
    try:
        folder = db.query(DocumentFolder).filter(DocumentFolder.id == folder_id, DocumentFolder.user_id == user.id).first()
        if not folder:
            return jsonify({"error": "Folder not found"}), 404

        if folder.documents:
            return jsonify({"error": "Folder is not empty"}), 400
        if folder.children:
            return jsonify({"error": "Folder has subfolders"}), 400

        db.delete(folder)
        db.commit()
        return ("", 204)
    finally:
        db.close()


@app.put("/api/patient/documents/<int:document_id>")
def update_document(document_id: int):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True, silent=True) or {}
    db = SessionLocal()
    try:
        document = db.query(Document).filter(Document.id == document_id, Document.user_id == user.id).first()
        if not document:
            return jsonify({"error": "Document not found"}), 404

        if 'folder_id' in data:
            new_folder_id = data.get('folder_id')
            if new_folder_id is None:
                document.folder_id = None
            else:
                folder = db.query(DocumentFolder).filter(DocumentFolder.id == new_folder_id, DocumentFolder.user_id == user.id).first()
                if not folder:
                    return jsonify({"error": "Folder not found"}), 404
                document.folder_id = folder.id

        if 'description' in data:
            document.description = data.get('description')

        db.commit()
        db.refresh(document)
        return jsonify(document.to_dict()), 200
    finally:
        db.close()


@app.delete("/api/patient/documents/<int:document_id>")
def delete_document(document_id: int):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    db = SessionLocal()
    try:
        document = db.query(Document).filter(Document.id == document_id, Document.user_id == user.id).first()
        if not document:
            return jsonify({"error": "Document not found"}), 404

        file_path = document.file_path
        db.delete(document)
        db.commit()

        try:
            if supabase:
                supabase.storage.from_('medical-documents').remove([file_path])
        except Exception as supabase_err:
            print(f"[WARN] Failed to delete file from storage: {supabase_err}")

        return ("", 204)
    finally:
        db.close()


@app.get("/api/notifications")
def list_notifications():
    identity = get_token_identity()
    if not identity:
        return jsonify({"error": "Unauthorized"}), 401

    summary_only = request.args.get('summary', 'false').lower() == 'true'

    db = SessionLocal()
    try:
        base_query = db.query(Notification).filter(
            Notification.user_id == identity['user_id'],
            Notification.role == identity.get('role', 'patient')
        )

        if summary_only:
            total = base_query.count()
            unread = base_query.filter(Notification.is_read == False).count()
            return jsonify({'total': total, 'unread': unread}), 200

        notifications = base_query.order_by(Notification.created_at.desc()).all()
        return jsonify([n.to_dict() for n in notifications]), 200
    finally:
        db.close()


@app.post("/api/notifications/<int:notification_id>/read")
def mark_notification_read(notification_id: int):
    identity = get_token_identity()
    if not identity:
        return jsonify({"error": "Unauthorized"}), 401

    db = SessionLocal()
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == identity['user_id'],
            Notification.role == identity.get('role', 'patient')
        ).first()

        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        notification.is_read = True
        db.commit()
        return jsonify(notification.to_dict()), 200
    finally:
        db.close()


@app.post("/api/notifications/read_all")
def mark_all_notifications_read():
    identity = get_token_identity()
    if not identity:
        return jsonify({"error": "Unauthorized"}), 401

    db = SessionLocal()
    try:
        db.query(Notification).filter(
            Notification.user_id == identity['user_id'],
            Notification.role == identity.get('role', 'patient'),
            Notification.is_read == False
        ).update({Notification.is_read: True}, synchronize_session=False)
        db.commit()
        return ("", 204)
    finally:
        db.close()


@app.delete("/api/notifications/<int:notification_id>")
def delete_notification(notification_id: int):
    identity = get_token_identity()
    if not identity:
        return jsonify({"error": "Unauthorized"}), 401

    db = SessionLocal()
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == identity['user_id'],
            Notification.role == identity.get('role', 'patient')
        ).first()

        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        db.delete(notification)
        db.commit()
        return ("", 204)
    finally:
        db.close()


@app.post("/api/consultation/request")
def request_consultation():
    """Patient requests a consultation with a doctor"""
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json(force=True, silent=True) or {}
    doctor_id = data.get('doctor_id')  # Optional - can be None for general request
    primary_symptoms = data.get('primary_symptoms', '')
    llm_summary = data.get('llm_summary', '')
    document_ids = data.get('document_ids', [])

    if document_ids and not isinstance(document_ids, list):
        return jsonify({"error": "document_ids must be a list"}), 400
    
    db = SessionLocal()
    try:
        # Verify doctor exists if doctor_id provided
        doctor = None
        if doctor_id:
            doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
            if not doctor:
                return jsonify({"error": "Doctor not found"}), 404
        
        # Create consultation request - doctor_id can be None for general requests
        consultation = Consultation(
            doctor_id=doctor_id if doctor_id else None,
            patient_id=user.id,
            status='pending',
            primary_symptoms=primary_symptoms,
            llm_summary=llm_summary
        )
        
        db.add(consultation)
        db.commit()
        db.refresh(consultation)

        shared_document_ids = []
        if document_ids:
            valid_documents = db.query(Document).filter(
                Document.id.in_(document_ids),
                Document.user_id == user.id
            ).all()

            for doc in valid_documents:
                link = ConsultationDocument(
                    consultation_id=consultation.id,
                    document_id=doc.id
                )
                db.add(link)
                shared_document_ids.append(doc.id)

            db.commit()
            db.refresh(consultation)
        
            patient_name = user.name or 'A patient'
        
        if doctor_id and doctor:
            # Specific doctor request - notify that doctor
            create_notification(
                doctor.id,
                'doctor',
                'New consultation request',
                f"{patient_name} requested a consultation with you.",
                'consult_request'
            )
            create_notification(
                user.id,
                'patient',
                'Consultation requested',
                f"We notified {doctor.name} about your request.",
                'consult_request'
            )
        else:
            # General request - notify all active doctors
            active_doctors = db.query(Doctor).filter(Doctor.is_active == True).all()
            for doc in active_doctors:
                create_notification(
                    doc.id,
                    'doctor',
                    'New consultation request',
                    f"{patient_name} requested a consultation. Review and accept if available.",
                    'consult_request'
                )
            # Notify patient
            create_notification(
                user.id,
                'patient',
                'Consultation requested',
                "Your consultation request has been sent to available doctors.",
                'consult_request'
            )

        return jsonify({
            "id": consultation.id,
            "doctor_id": consultation.doctor_id,
            "patient_id": consultation.patient_id,
            "status": consultation.status,
            "created_at": consultation.created_at.isoformat() if consultation.created_at else None,
            "shared_document_ids": shared_document_ids
        }), 201
    finally:
        db.close()


@app.get("/api/doctors")
def list_doctors():
    """List all active doctors"""
    db = SessionLocal()
    try:
        doctors = db.query(Doctor).filter(Doctor.is_active == True).all()
        result = []
        for doctor in doctors:
            result.append({
                "id": doctor.id,
                "name": doctor.name,
                "specialization": doctor.specialization,
                "hospital": doctor.hospital,
                "photo_url": doctor.photo_url,
                "is_online": doctor.is_online
            })
        return jsonify(result), 200
    finally:
        db.close()


@app.get("/api/doctors/<int:doctor_id>")
def get_doctor(doctor_id):
    """Get a single doctor by ID"""
    db = SessionLocal()
    try:
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id, Doctor.is_active == True).first()
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404
        
        return jsonify({
            "id": doctor.id,
            "name": doctor.name,
            "email": doctor.email,
            "specialization": doctor.specialization,
            "hospital": doctor.hospital,
            "photo_url": doctor.photo_url,
            "is_online": doctor.is_online,
            "is_verified": doctor.is_verified if hasattr(doctor, 'is_verified') else False,
            "experience": doctor.experience if hasattr(doctor, 'experience') else None,
            "language": doctor.language if hasattr(doctor, 'language') else None,
            "bio": doctor.bio if hasattr(doctor, 'bio') else None,
        }), 200
    finally:
        db.close()


@app.get("/api/consultation/active")
def get_active_consultations_patient():
    """Get active consultations for current patient"""
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        consultations = db.query(Consultation).filter(
            Consultation.patient_id == user.id,
            Consultation.status == 'active'
        ).order_by(Consultation.started_at.desc()).all()
        
        result = []
        for cons in consultations:
            doctor = db.query(Doctor).filter(Doctor.id == cons.doctor_id).first()
            result.append({
                "id": cons.id,
                "doctor_id": cons.doctor_id,
                "doctor_name": doctor.name if doctor else "Unknown",
                "doctor_photo_url": doctor.photo_url if doctor else None,
                "started_at": cons.started_at.isoformat() if cons.started_at else None,
                "status": cons.status
            })
        
        return jsonify(result), 200
    finally:
        db.close()


# FILE UPLOAD ENDPOINT (Backend upload to bypass RLS)
@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Backend file upload endpoint - bypasses RLS issues"""
    try:
        print("[INFO] Backend upload requested")
        
        # Check authentication
        auth_header = request.headers.get('Authorization', '')
        print(f"[DEBUG] Authorization header: {auth_header[:50] if auth_header else 'EMPTY'}...")
        if not auth_header.startswith('Bearer '):
            print("[ERROR] No token provided")
            return jsonify({'error': 'No token provided'}), 401
        
        token = auth_header.replace('Bearer ', '')
        print(f"[DEBUG] Token extracted: {token[:30]}...")
        token_data = verify_token(token)
        print(f"[DEBUG] verify_token returned: {token_data}")
        if not token_data or token_data.get('role') not in ['patient', 'doctor']:
            print("[ERROR] Unauthorized - invalid token or not a patient/doctor")
            return jsonify({'error': 'Unauthorized'}), 401
        
        user_id = token_data.get('user_id')
        user_role = token_data.get('role')
        
        # Get user/doctor from database
        db = SessionLocal()
        try:
            if user_role == 'doctor':
                current_user = db.query(Doctor).filter(Doctor.id == user_id).first()
            else:
                current_user = db.query(User).filter(User.id == user_id).first()
            
            if not current_user:
                print(f"[ERROR] User not found: {user_id}")
                return jsonify({'error': 'User not found'}), 404
            print(f"[INFO] User authenticated: {current_user.name}")
        finally:
            db.close()
        
        # Check file
        if 'file' not in request.files:
            print("[ERROR] No file provided")
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            print("[ERROR] No file selected")
            return jsonify({'error': 'No file selected'}), 400
        
        file_size_mb = file.content_length / 1024 / 1024 if file.content_length else 0
        print(f"[INFO] File: {file.filename}, Size: {file_size_mb:.2f} MB")
        
        # Validate file size (6 MB)
        max_size = 6 * 1024 * 1024
        if file.content_length and file.content_length > max_size:
            error_msg = f'File too large. Max 6 MB, got {file_size_mb:.2f} MB'
            print(f"[ERROR] {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        # Validate file type - allow images for profile photos, PDFs for documents
        is_profile_photo = any(keyword in file.filename.lower() for keyword in ['profile', 'photo', 'avatar', 'pic', 'picture'])
        if is_profile_photo:
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        else:
            allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        
        if file.content_type not in allowed_types:
            error_msg = f'File type not supported: {file.content_type}'
            print(f"[ERROR] {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        # Check if Supabase is available
        if not supabase:
            print("[ERROR] Supabase not configured")
            return jsonify({'error': 'File upload not configured'}), 503
        
        # Create unique filename
        timestamp = int(datetime.now().timestamp() * 1000)
        filename = f"{timestamp}_{file.filename}"
        
        # Check if it's a profile photo (from form data or filename)
        is_profile_photo = request.form.get('isProfilePhoto', 'false').lower() == 'true' or \
                          any(keyword in file.filename.lower() for keyword in ['profile', 'photo', 'avatar', 'pic', 'picture'])
        
        # Check if it's a doctor ID card
        is_doctor_card = request.form.get('isDoctorCard', 'false').lower() == 'true' or \
                        any(keyword in file.filename.lower() for keyword in ['id', 'card', 'license', 'certificate'])

        description = request.form.get('description', '').strip() or None
        folder_id_value = None
        folder_field = request.form.get('folder_id')
        if not is_profile_photo and not is_doctor_card and folder_field:
            try:
                folder_id_value = int(folder_field)
            except ValueError:
                return jsonify({'error': 'Invalid folder id'}), 400

            db_folder = SessionLocal()
            try:
                folder = db_folder.query(DocumentFolder).filter(
                    DocumentFolder.id == folder_id_value,
                    DocumentFolder.user_id == user_id
                ).first()
                if not folder:
                    return jsonify({'error': 'Folder not found'}), 404
            finally:
                db_folder.close()
        
        if user_role == 'doctor':
            if is_profile_photo:
                file_path = f"doctors/{user_id}/profile/{filename}"
            elif is_doctor_card:
                file_path = f"doctors/{user_id}/id_card/{filename}"
            else:
                file_path = f"doctors/{user_id}/documents/{filename}"
        else:
            if is_profile_photo:
                file_path = f"users/{user_id}/profile/{filename}"
            else:
                file_path = f"users/{user_id}/documents/{filename}"
        
        print(f"[DEBUG] Upload path: {file_path}")
        print(f"[INFO] Uploading to Supabase...")
        
        # Read file content
        file_content = file.read()
        file_size_bytes = len(file_content)
        
        try:
            # Upload to Supabase
            response = supabase.storage.from_('medical-documents').upload(
                file_path,
                file_content,
                {'content-type': file.content_type}
            )
            
            print(f"[INFO] Upload response received")
            
            # Get public URL
            url_response = supabase.storage.from_('medical-documents').get_public_url(file_path)
            public_url = url_response if isinstance(url_response, str) else url_response.get('publicUrl', '')
            
            print(f"[INFO] Public URL: {public_url}")
            
            # If it's a profile photo or ID card, update user/doctor's photo_url or id_card_url
            document_record = None
            if is_profile_photo or is_doctor_card:
                db_session = SessionLocal()
                try:
                    if user_role == 'doctor':
                        db_doctor = db_session.query(Doctor).filter(Doctor.id == user_id).first()
                        if db_doctor:
                            if is_profile_photo:
                                db_doctor.photo_url = public_url
                                print(f"[INFO] Profile photo updated for doctor {user_id}")
                            elif is_doctor_card:
                                db_doctor.id_card_url = public_url
                                print(f"[INFO] ID card updated for doctor {user_id}")
                            db_session.commit()
                    else:
                        if is_profile_photo:
                            db_user = db_session.query(User).filter(User.id == user_id).first()
                            if db_user:
                                db_user.photo_url = public_url
                                db_session.commit()
                                print(f"[INFO] Profile photo updated for user {user_id}")
                finally:
                    db_session.close()
            else:
                db_session = SessionLocal()
                try:
                    document_record = Document(
                        user_id=user_id,
                        file_name=file.filename,
                        file_path=file_path,
                        download_url=public_url,
                        description=description,
                        file_type=file.content_type,
                        file_size=file_size_bytes,
                        folder_id=folder_id_value
                    )
                    db_session.add(document_record)
                    db_session.commit()
                    db_session.refresh(document_record)
                    print(f"[INFO] Document record created for user {user_id} -> document_id={document_record.id}")
                finally:
                    db_session.close()

                create_notification(
                    user_id,
                    user_role,
                    'Document uploaded',
                    f"{file.filename} uploaded successfully.",
                    'document_upload'
                )
            
            result = {
                'success': True,
                'fileName': file.filename,
                'filePath': file_path,
                'downloadURL': public_url,
                'uploadedAt': datetime.now().isoformat(),
                'isProfilePhoto': is_profile_photo,
                'isDoctorCard': is_doctor_card,
                'document': document_record.to_dict() if not is_profile_photo and not is_doctor_card and document_record else None
            }
            
            print(f"[INFO] Upload complete: {result}")
            return jsonify(result), 200
            
        except Exception as supabase_error:
            error_msg = f'Supabase error: {str(supabase_error)}'
            print(f"[ERROR] {error_msg}")
            return jsonify({'error': error_msg}), 500
        
    except Exception as err:
        error_msg = str(err)
        print(f"[ERROR] Upload error: {error_msg}")
        return jsonify({'error': error_msg}), 500


@app.get("/api/consultation/<int:consultation_id>/patient_profile")
def get_consultation_patient_profile(consultation_id):
    """Allow doctors to view detailed patient profile for a consultation"""
    doctor = get_current_doctor()
    if not doctor:
        return jsonify({"error": "Unauthorized"}), 401

    db = SessionLocal()
    try:
        consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not consultation:
            return jsonify({"error": "Consultation not found"}), 404

        # Allow viewing if consultation is assigned to doctor or is pending/unassigned
        if consultation.doctor_id not in (None, doctor.id):
            return jsonify({"error": "Forbidden"}), 403

        patient = db.query(User).filter(User.id == consultation.patient_id).first()

        documents = []
        for link in consultation.documents:
            if link.document:
                documents.append(link.document.to_dict())

        return jsonify({
            "id": consultation.id,
            "status": consultation.status,
            "requested_at": consultation.created_at.isoformat() if consultation.created_at else None,
            "primary_symptoms": consultation.primary_symptoms,
            "llm_summary": consultation.llm_summary,
            "patient": patient.to_dict() if patient else None,
            "documents": documents,
            "document_count": len(documents)
        }), 200
    finally:
        db.close()


# ============================================
# ADMIN API ENDPOINTS
# ============================================

@app.get("/api/admin/dashboard/stats")
def admin_dashboard_stats():
    """Get admin dashboard statistics"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        total_doctors = db.query(Doctor).count()
        active_doctors = db.query(Doctor).filter(Doctor.is_active == True).count()
        pending_doctors = db.query(Doctor).filter(Doctor.is_active == False).count()
        total_patients = db.query(User).filter(User.role == 'patient').count()
        active_consultations = db.query(Consultation).filter(Consultation.status == 'active').count()
        pending_resets = db.query(PasswordReset).filter(PasswordReset.status == 'pending').count()
        
        return jsonify({
            'total_doctors': total_doctors,
            'active_doctors': active_doctors,
            'pending_doctors': pending_doctors,
            'total_patients': total_patients,
            'active_consultations': active_consultations,
            'pending_password_resets': pending_resets,
        }), 200
    finally:
        db.close()


@app.get("/api/admin/doctors")
def admin_list_doctors():
    """List all doctors (admin only)"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        doctors = db.query(Doctor).all()
        return jsonify([doctor.to_dict() for doctor in doctors]), 200
    finally:
        db.close()


@app.post("/api/admin/doctors")
def admin_add_doctor():
    """Add a new doctor (admin only)"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or '').strip()
    password = (data.get('password') or '').strip()
    specialization = data.get('specialization', '').strip()
    hospital = data.get('hospital', '').strip()
    phone = data.get('phone', '').strip()
    
    if not email or not name or not password:
        return jsonify({"error": "Email, name, and password are required"}), 400
    
    db = SessionLocal()
    try:
        # Check if doctor already exists
        existing = db.query(Doctor).filter(Doctor.email == email).first()
        if existing:
            return jsonify({"error": "Doctor with this email already exists"}), 409
        
        # Create new doctor
        doctor = Doctor(
            name=name,
            email=email,
            specialization=specialization or None,
            hospital=hospital or None,
            phone=phone or None,
            is_active=False,  # Pending verification
        )
        doctor.set_password(password)
        
        db.add(doctor)
        db.flush()  # Get the ID without committing
        
        # Serialize doctor data before commit (to avoid detached instance issues)
        doctor_dict = {
            'id': doctor.id,
            'name': doctor.name,
            'email': doctor.email,
            'specialization': doctor.specialization,
            'hospital': doctor.hospital,
            'phone': doctor.phone,
            'is_active': doctor.is_active,
            'created_at': doctor.created_at.isoformat() if doctor.created_at else None
        }
        
        db.commit()
        
        # Log admin action
        log_admin_action(admin.id, 'add_doctor', doctor.id, {'email': email, 'name': name})
        
        return jsonify({
            "message": "Doctor added successfully. Status: Pending Verification",
            "doctor": doctor_dict
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.patch("/api/admin/doctors/<int:doctor_id>")
def admin_update_doctor(doctor_id):
    """Update doctor details (admin only)"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json(force=True, silent=True) or {}
    db = SessionLocal()
    try:
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404
        
        # Update fields
        if 'name' in data:
            doctor.name = data['name']
        if 'email' in data:
            doctor.email = data['email'].strip().lower()
        if 'specialization' in data:
            doctor.specialization = data['specialization']
        if 'hospital' in data:
            doctor.hospital = data['hospital']
        if 'phone' in data:
            doctor.phone = data['phone']
        if 'is_active' in data:
            doctor.is_active = bool(data['is_active'])
        if 'password' in data and data['password']:
            doctor.set_password(data['password'])
        
        # Serialize doctor data before commit (to avoid detached instance issues)
        doctor_dict = {
            'id': doctor.id,
            'name': doctor.name,
            'email': doctor.email,
            'specialization': doctor.specialization,
            'hospital': doctor.hospital,
            'phone': doctor.phone,
            'is_active': doctor.is_active,
            'created_at': doctor.created_at.isoformat() if doctor.created_at else None
        }
        
        db.commit()
        
        # Log admin action
        log_admin_action(admin.id, 'update_doctor', doctor_id, {'fields_updated': list(data.keys())})
        
        return jsonify({
            "message": "Doctor updated successfully",
            "doctor": doctor_dict
        }), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.delete("/api/admin/doctors/<int:doctor_id>")
def admin_delete_doctor(doctor_id):
    """Delete a doctor from database (admin only)"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404
        
        # Log admin action before delete
        log_admin_action(admin.id, 'remove_doctor', doctor_id, {'email': doctor.email, 'name': doctor.name})
        
        # Delete the doctor from database
        db.delete(doctor)
        db.commit()
        
        return jsonify({"message": "Doctor deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.get("/api/admin/patients")
def admin_list_patients():
    """List all patients (admin only)"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        patients = db.query(User).filter(User.role == 'patient').all()
        return jsonify([user.to_dict() for user in patients]), 200
    finally:
        db.close()


@app.delete("/api/admin/patients/<int:patient_id>")
def admin_delete_patient(patient_id):
    """Delete a patient (admin only)"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        patient = db.query(User).filter(User.id == patient_id, User.role == 'patient').first()
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        
        # Log before delete
        log_admin_action(admin.id, 'delete_patient', patient_id, {'email': patient.email})
        
        db.delete(patient)
        db.commit()
        
        return jsonify({"message": "Patient deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.patch("/api/admin/patients/<int:patient_id>/password")
def admin_reset_patient_password(patient_id):
    """Reset patient password (admin only)"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json(force=True, silent=True) or {}
    new_password = (data.get('password') or '').strip()
    
    if not new_password:
        return jsonify({"error": "Password is required"}), 400
    
    db = SessionLocal()
    try:
        patient = db.query(User).filter(User.id == patient_id, User.role == 'patient').first()
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        
        patient.set_password(new_password)
        db.commit()
        
        # Log admin action
        log_admin_action(admin.id, 'reset_password', patient_id, {'user_type': 'patient'})
        
        return jsonify({"message": "Password reset successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.get("/api/admin/password-resets")
def admin_list_password_resets():
    """List all password reset requests (admin only)"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        resets = db.query(PasswordReset).order_by(PasswordReset.requested_at.desc()).all()
        result = []
        for reset in resets:
            user = db.query(User).filter(User.id == reset.user_id).first()
            result.append({
                'id': reset.id,
                'user_id': reset.user_id,
                'user_email': user.email if user else None,
                'user_name': user.name if user else None,
                'status': reset.status,
                'requested_at': reset.requested_at.isoformat() if reset.requested_at else None,
                'resolved_at': reset.resolved_at.isoformat() if reset.resolved_at else None,
                'reason': reset.reason,
            })
        return jsonify(result), 200
    finally:
        db.close()


@app.patch("/api/admin/password-resets/<int:reset_id>")
def admin_resolve_password_reset(reset_id):
    """Resolve a password reset request (admin only)"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json(force=True, silent=True) or {}
    action = data.get('action')  # 'approve' or 'reject'
    new_password = data.get('password', '').strip()
    reason = data.get('reason', '').strip()
    
    db = SessionLocal()
    try:
        reset = db.query(PasswordReset).filter(PasswordReset.id == reset_id).first()
        if not reset:
            return jsonify({"error": "Password reset request not found"}), 404
        
        user = db.query(User).filter(User.id == reset.user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if action == 'approve':
            if not new_password:
                return jsonify({"error": "Password is required for approval"}), 400
            
            user.set_password(new_password)
            reset.status = 'admin_set'
            reset.resolved_at = datetime.now(timezone.utc)
            reset.reason = reason or 'Password reset by admin'
            
            # Log admin action
            log_admin_action(admin.id, 'reset_password', user.id, {'via': 'password_reset_request', 'reset_id': reset_id})
            
            db.commit()
            return jsonify({"message": "Password reset approved and new password set"}), 200
        elif action == 'reject':
            reset.status = 'completed'
            reset.resolved_at = datetime.now(timezone.utc)
            reset.reason = reason or 'Request rejected by admin'
            db.commit()
            return jsonify({"message": "Password reset request rejected"}), 200
        else:
            return jsonify({"error": "Invalid action. Use 'approve' or 'reject'"}), 400
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.get("/api/admin/audit-logs")
def admin_audit_logs():
    """Get admin audit logs (admin only)"""
    admin = get_current_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = SessionLocal()
    try:
        logs = db.query(AdminAudit).order_by(AdminAudit.created_at.desc()).limit(100).all()
        return jsonify([log.to_dict() for log in logs]), 200
    finally:
        db.close()


@app.post("/api/auth/forgot")
def forgot_password():
    """Request password reset - creates a request for admin"""
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    db = SessionLocal()
    try:
        # Check if user exists (patient or doctor)
        user = db.query(User).filter(User.email == email).first()
        doctor = None
        if not user:
            doctor = db.query(Doctor).filter(Doctor.email == email).first()
        
        if not user and not doctor:
            # Don't reveal if email exists
            return jsonify({"message": "If this email exists, a password reset request has been created"}), 200
        
        # Create password reset request
        target_user = user if user else None
        if doctor and not user:
            # Create a user record for doctor if needed, or handle separately
            # For now, we'll create reset request for the user_id if doctor has one
            # This is a simplified approach
            return jsonify({"message": "If this email exists, a password reset request has been created"}), 200
        
        if target_user:
            # Check for existing pending request
            existing = db.query(PasswordReset).filter(
                PasswordReset.user_id == target_user.id,
                PasswordReset.status == 'pending'
            ).first()
            
            if existing:
                return jsonify({"message": "Password reset request already pending"}), 200
            
            reset = PasswordReset(
                user_id=target_user.id,
                status='pending'
            )
            db.add(reset)
            db.commit()
            
            return jsonify({"message": "Password reset request created. Admin will review it."}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


# Initialize database on startup
with app.app_context():
    init_db()
    run_startup_migrations()
    seed_demo_data()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
