"""
Backend Architecture Visualizer
Shows how all components connect in the Medicare system
"""

def show_architecture():
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                    MEDICARE BACKEND ARCHITECTURE                           ║
╚════════════════════════════════════════════════════════════════════════════╝

                              CLIENT (Browser)
                                    │
                                    ▼
         ┌──────────────────────────────────────────────────┐
         │        React Frontend (Port 3000)                │
         │  • Pages (Auth, Dashboard, Consult, etc.)       │
         │  • Components (Navigation, etc.)                │
         │  • API Client (/src/api/*.js)                   │
         └──────────────────┬───────────────────────────────┘
                            │ HTTP Requests (fetch/axios)
                            ▼
         ┌──────────────────────────────────────────────────┐
         │      Flask Backend (app.py - Port 5000)         │
         │                                                  │
         │  API ENDPOINTS:                                 │
         │  ┌────────────────────────────────────┐        │
         │  │ /api/auth/*     → Authentication   │        │
         │  │ /api/users/*    → User management  │        │
         │  │ /api/consult/*  → Consultations    │        │
         │  │ /api/messages/* → Chat messages    │        │
         │  │ /api/documents/* → File uploads    │        │
         │  │ /api/notifications/* → Alerts      │        │
         │  │ /api/admin/*    → Admin functions  │        │
         │  │ /api/analyze-symptoms → AI Analysis│        │
         │  └────────────────────────────────────┘        │
         │                                                  │
         │  MIDDLEWARE:                                    │
         │  • JWT Token Verification                       │
         │  • CORS Headers                                 │
         │  • Rate Limiting                                │
         │  • Error Handling                               │
         └──────────┬──────────────┬────────────┬──────────┘
                    │              │            │
        ┌───────────┘              │            └──────────┐
        ▼                          ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  llm_service.py │    │   SQLite DB      │    │ Supabase Cloud  │
│                 │    │ (medicare.db)    │    │   Storage       │
│ ┌─────────────┐ │    │                  │    │                 │
│ │ Gemini API  │ │    │ TABLES:          │    │ • Documents     │
│ │ Integration │ │    │ • users          │    │ • Images        │
│ └─────────────┘ │    │ • consultations  │    │ • Files         │
│                 │    │ • messages       │    │                 │
│ • Preprocessing │    │ • documents      │    │ upload_file()   │
│ • Retry Logic   │    │ • notifications  │    │ get_file()      │
│ • Enrichment    │    │ • doctors        │    │ delete_file()   │
│ • Fallback      │    │ • patients       │    │                 │
│ • Safety Filter │    │ • ratings        │    │ Env: SUPABASE_* │
│                 │    │ • admin_audit    │    └─────────────────┘
│ Env: GEMINI_*   │    │ • blocked_logs   │
└─────────────────┘    │                  │
                       │ SQLAlchemy ORM   │
                       └──────────────────┘

═══════════════════════════════════════════════════════════════════════════

                        DATA FLOW EXAMPLES

1. USER LOGIN:
   Browser → POST /api/auth/login → app.py
                                      ↓
                            Check password in DB
                                      ↓
                            Generate JWT token
                                      ↓
                         Return token to browser
                                      ↓
                       Browser stores in localStorage

2. SYMPTOM ANALYSIS:
   Browser → POST /api/analyze-symptoms → app.py
                                            ↓
                                    llm_service.py
                                            ↓
                                   Preprocess symptoms
                                            ↓
                                   Call Gemini API
                                            ↓
                                   Parse JSON response
                                            ↓
                                   Enrich with rules
                                            ↓
                            If blocked → Log to DB
                                            ↓
                            Return result to browser

3. START CONSULTATION:
   Browser → POST /api/consult/request → app.py
                                          ↓
                               Verify JWT token
                                          ↓
                        Create consultation in DB
                                          ↓
                        Create notification for doctor
                                          ↓
                         Return consultation ID

4. SEND MESSAGE:
   Browser → POST /api/messages → app.py
                                    ↓
                         Save message to DB
                                    ↓
                    Create notification for recipient
                                    ↓
                         Return message data

5. UPLOAD DOCUMENT:
   Browser → POST /api/documents/upload → app.py
                                            ↓
                                  Upload to Supabase
                                            ↓
                               Save metadata to DB
                                            ↓
                          Return document info

═══════════════════════════════════════════════════════════════════════════

                    AUTHENTICATION FLOW

┌─────────────┐
│  Browser    │
└──────┬──────┘
       │ 1. Login with email/password
       ▼
┌─────────────────────────────────┐
│  POST /api/auth/login           │
│                                 │
│  • Validate email format        │
│  • Query user from DB           │
│  • Check password hash (bcrypt) │
│  • Generate JWT with user_id    │
└──────────┬──────────────────────┘
           │ 2. Return JWT token
           ▼
┌─────────────────────────────────┐
│  Browser stores token           │
│  localStorage.setItem('token')  │
└──────────┬──────────────────────┘
           │ 3. All future requests
           ▼
┌─────────────────────────────────┐
│  Headers: Authorization: token  │
│                                 │
│  app.py extracts & verifies JWT │
│  Adds user_id to request        │
└─────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════

                    DATABASE RELATIONSHIPS

users (id, email, role, name)
  │
  ├─→ doctors (user_id, specialization, bio)
  │
  ├─→ patients (user_id, age, blood_group)
  │
  ├─→ consultations (patient_id, doctor_id, status)
  │     │
  │     ├─→ messages (consultation_id, sender_id, text)
  │     │
  │     └─→ consultation_documents (consultation_id, document_id)
  │
  ├─→ documents (uploaded_by, file_url, type)
  │
  ├─→ notifications (user_id, type, message)
  │
  ├─→ ratings (patient_id, doctor_id, rating, comment)
  │
  └─→ password_resets (user_id, token, expires_at)

═══════════════════════════════════════════════════════════════════════════

                    KEY PYTHON MODULES

app.py (2,934 lines)
  • Flask app initialization
  • All API route handlers
  • Database models (SQLAlchemy)
  • JWT authentication decorator
  • Error handling
  • CORS configuration

llm_service.py (543 lines)
  • SymptomAnalyzer class
  • Gemini API integration
  • Symptom preprocessing
  • JSON parsing with salvage
  • Local enrichment rules
  • Retry logic
  • OpenAI fallback (optional)
  • Blocked response logging

db_viewer.py
  • Interactive table browser
  • Schema viewer
  • Data export to CSV

scripts/init_db.py
  • Create all tables
  • Insert default users

═══════════════════════════════════════════════════════════════════════════

                    ENVIRONMENT VARIABLES

.env file:
  GEMINI_API_KEY        → llm_service.py (AI analysis)
  JWT_SECRET            → app.py (token signing)
  SUPABASE_URL          → app.py (file storage)
  SUPABASE_KEY          → app.py (storage auth)
  DATABASE_URL          → app.py (SQLite path)
  OPENAI_API_KEY        → llm_service.py (optional fallback)

═══════════════════════════════════════════════════════════════════════════

                    REQUEST FLOW WITH SECURITY

1. Request arrives at Flask
         ↓
2. CORS middleware (allow localhost:3000)
         ↓
3. Check if route needs authentication
         ↓
4. If yes → Extract JWT from Authorization header
         ↓
5. Verify JWT signature with JWT_SECRET
         ↓
6. Decode user_id from token
         ↓
7. Load user from database
         ↓
8. Check user role (patient/doctor/admin)
         ↓
9. Execute route handler
         ↓
10. Return JSON response with CORS headers

═══════════════════════════════════════════════════════════════════════════

                    COMMON PATTERNS

Pattern 1: Protected Route
  @app.route('/api/something')
  @token_required  # Decorator checks JWT
  def handler(current_user):
      # current_user is the User object
      return jsonify(result)

Pattern 2: Database Transaction
  try:
      new_record = Model(field=value)
      db.session.add(new_record)
      db.session.commit()
  except Exception as e:
      db.session.rollback()
      return error response

Pattern 3: Notification Creation
  notification = Notification(
      user_id=recipient_id,
      type='consultation_request',
      message='New consultation',
      related_id=consultation_id
  )
  db.session.add(notification)
  db.session.commit()

═══════════════════════════════════════════════════════════════════════════

                    ERROR HANDLING

All routes wrapped in try-except:
  try:
      # Business logic
      return jsonify(success_data), 200
  except ValueError as e:
      return jsonify({'error': str(e)}), 400
  except Exception as e:
      logger.error(f'Error: {e}')
      return jsonify({'error': 'Internal error'}), 500

Logged to: medicare.log

═══════════════════════════════════════════════════════════════════════════
    """)

if __name__ == "__main__":
    show_architecture()
    
    print("\n" + "="*80)
    print("QUICK SUMMARY:")
    print("="*80)
    print("""
1. React Frontend (src/) sends HTTP requests to Flask Backend (app.py)

2. Flask Backend:
   - Verifies JWT token for authentication
   - Handles business logic
   - Talks to SQLite database for data
   - Calls llm_service.py for AI analysis
   - Uses Supabase for file storage

3. llm_service.py:
   - Calls Google Gemini API for symptom analysis
   - Handles retries, parsing, enrichment
   - Logs blocked responses to database

4. Database (medicare.db):
   - Stores all user data, consultations, messages
   - SQLAlchemy ORM for easy querying
   - View with: python db_viewer.py

5. Security:
   - JWT tokens for authentication
   - Password hashing with bcrypt
   - CORS protection
   - Rate limiting

Everything connects through app.py as the central hub!
    """)
