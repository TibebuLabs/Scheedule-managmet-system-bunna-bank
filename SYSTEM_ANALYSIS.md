# Bunna Bank Schedule Management System — Comprehensive Analysis

## Executive Summary

The Bunna Bank Schedule Management System is a full-stack web application designed to streamline staff scheduling, task management, and automated notifications for the Bunna Bank organization. Built with Node.js/Express on the backend and React on the frontend, the system enables managers to create schedules, assign staff to tasks, track completion status, and automatically notify team members via email. The platform supports both daily and weekly scheduling patterns with sophisticated features including staff rotation detection, performance tracking (ratings and hours worked), and workload analytics. This is a production-ready system deployed on Render cloud infrastructure with local development support via MongoDB and Gmail SMTP integration for email notifications.

The system serves multiple user personas: administrators who manage staff records, managers who create and monitor schedules, and staff members who receive assignments and task notifications. It provides a user-friendly interface with comprehensive error handling, real-time form validation, and professional banking-themed aesthetics aligned with Bunna Bank branding.

---

## System Architecture Overview

### Full-Stack Architecture

The system follows a classic three-tier architecture: frontend (React), backend (Node.js/Express), and database (MongoDB).

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React)                        │
│                                                                 │
│  RegisterPage ──> AuthContext ──> Dashboard                    │
│  LoginPage ───────^          ───> Protected Routes             │
│                   │                                            │
│              (Token Storage)                                    │
└──────────────────┼────────────────────────────────────────────┘
                   │ HTTPS / CORS
                   │ Bearer Token Authorization
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│               MIDDLEWARE LAYER (Express.js)                     │
│                                                                 │
│  Helmet (Security) ──> CORS ──> Rate Limiter ──> Auth Check   │
│       ↓                  ↓            ↓              ↓         │
│   JWT Verification ─────────────────────────────────────────   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
    ┌────────────┐  ┌────────────┐  ┌─────────────┐
    │Auth Routes │  │Task Routes │  │Schedule     │
    │            │  │            │  │Routes (most │
    │ Controllers│  │Controllers │  │complex)     │
    │            │  │            │  │             │
    │Services &  │  │Services &  │  │Services &   │
    │Validators  │  │Validators  │  │Validators   │
    └──────┬─────┘  └──────┬─────┘  └──────┬──────┘
           │                │                │
           └────────────────┼────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                            │
│                                                                 │
│  User Model ──> Staff Model ──> Task Model ──> Schedule Model  │
│     (Bcrypt)    (Validation)   (Auto-ID)     (Complex Schema)  │
│                                                                 │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (MongoDB)                           │
│                                                                 │
│  Local Dev: mongodb://localhost:27017/task_scheduler            │
│  Production: MongoDB Atlas (via MONGODB_URI)                    │
│                                                                 │
│  Collections: users, staff, tasks, schedules                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              EMAIL SERVICE (Nodemailer + Gmail SMTP)            │
│                                                                 │
│  Email Controller ──> Email Service ──> Gmail SMTP Server      │
│                       (Retry Logic)     (TLS Encrypted)        │
│                       (Connection Pool)                         │
└─────────────────────────────────────────────────────────────────┘
```

### How Layers Communicate

**Frontend to Backend**: React components use Axios HTTP client with interceptors. All requests include `Authorization: Bearer {token}` header. The API base URL is configured via `VITE_API_URL` environment variable pointing to the Express backend (e.g., `http://localhost:5000`).

**Backend REST API**: Express routes handle HTTP requests and delegate to controllers. Controllers invoke services for business logic. Services interact with MongoDB models. All responses follow a consistent JSON format: `{ success: boolean, message: string, data?: object, code?: string }`.

**Authentication Flow**: JWT tokens are generated on login/registration, stored in client `localStorage`, and sent with every request. The `protect` middleware validates tokens and attaches the decoded user to `req.user`.

**Database Queries**: Mongoose models enforce schema validation and run database queries. Indexes on frequently queried fields (`email`, `status`, `scheduleType`) optimize performance. Compound indexes speed up multi-field queries.

### Deployment Targets

**Local Development**:
- Backend: `http://localhost:5000` (Node.js with nodemon auto-restart)
- Frontend: `http://localhost:5173` (Vite dev server)
- Database: MongoDB local instance or Atlas

**Production Deployment** (Render):
- Backend: `https://scheedule-managmet-system-bunna-bank-1.onrender.com`
- Frontend: Deployed to Render static site hosting
- Database: MongoDB Atlas cloud database
- Environment variables configured in Render dashboard

---

## Technology Stack

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Frontend** | | | |
| Runtime | Node.js v18+ | JavaScript runtime | 18+ |
| Framework | React | UI component library | 18.2.0 |
| Build Tool | Vite | Fast development server and bundler | 5.4.19 |
| Router | React Router | Client-side routing and navigation | 6.30.2 |
| State Mgmt | Context API | Global authentication context | Native |
| HTTP Client | Axios | REST API communication with interceptors | 1.13.2 |
| Styling | Tailwind CSS | Utility-first CSS framework | 3.4.19 |
| Icons | Lucide React | Modern SVG icons | 0.562.0 |
| Notifications | React Hot Toast | Toast notifications (success, error, info) | 2.6.0 |
| Charts | Recharts | Data visualization and charts | 3.6.0 |
| PDF Export | jsPDF + jsPDF-AutoTable | Generate PDF reports | 3.0.4 + 5.0.2 |
| **Backend** | | | |
| Runtime | Node.js | JavaScript runtime | 22.23.3 |
| Framework | Express.js | Web application framework | 4.18.2 |
| Database | MongoDB (Mongoose) | NoSQL document database with ODM | 7.5.0 |
| Authentication | JWT (jsonwebtoken) | JSON Web Token generation and verification | 9.0.2 |
| Password Hashing | bcryptjs | Secure password hashing | 2.4.3 |
| Security | Helmet | HTTP security headers middleware | 7.0.0 |
| CORS | cors | Cross-Origin Resource Sharing | 2.8.5 |
| Rate Limiting | express-rate-limit | Brute-force and DoS protection | 8.2.1 |
| Validation | Joi | Schema description language and validator | 18.0.2 |
| Input Sanitization | express-mongo-sanitize | NoSQL injection prevention | 2.2.0 |
| Email | Nodemailer | Email sending with SMTP (Gmail) | 7.0.12 |
| Utilities | date-fns | Date formatting and manipulation | 4.1.0 |
| Dev Tools | nodemon | Auto-restart on file changes | 3.0.1 |
| Logging | Winston | Structured logging (configured but not actively used) | 3.11.0 |

### Why These Technologies

- **React + Vite**: Modern, fast development experience with Hot Module Replacement. Vite builds 10-100x faster than webpack.
- **Tailwind CSS**: Reduces CSS file size and simplifies responsive design with utility classes.
- **MongoDB**: Flexible document model suits evolving schedule schema. Easy horizontal scaling with sharding.
- **JWT**: Stateless authentication eliminates server-side session storage. Works well with microservices.
- **Express**: Lightweight, minimalist framework. Huge ecosystem of middleware. Easy to understand and extend.
- **Nodemailer**: Simple SMTP integration. Gmail support without complex OAuth flows. Reliable email delivery.
- **Helmet**: Automatically sets secure HTTP headers. Prevents common vulnerabilities (clickjacking, MIME sniffing, XSS).
- **Rate Limiting**: Protects against brute-force attacks on login. Prevents email flooding abuse.

---

## Backend Deep-Dive

### API Endpoints (Complete Reference)

#### Authentication Routes (`/api/auth`)

| Method | Endpoint | Purpose | Auth Required | Rate Limit |
|--------|----------|---------|---|---|
| GET | `/health` | Service status check | No | General (100/15min) |
| POST | `/register` | User registration with Joi validation | No | Auth limiter (10/15min) |
| POST | `/login` | User login, returns JWT token | No | Auth limiter (10/15min) |
| GET | `/profile` | Get current user's profile info | **Yes** | General |

**Register Request Body**:
```javascript
{
  firstName: String,        // min 2, max 50 chars
  lastName: String,         // min 2, max 50 chars
  email: String,            // unique, RFC 5322 format
  phone: String,            // min 10, max 15 digits
  password: String,         // min 8 chars
  confirmPassword: String   // must match password
}
```

**Login Request Body**:
```javascript
{
  email: String,            // registered email
  password: String          // account password
}
```

#### Staff Management Routes (`/api/staff`)

| Method | Endpoint | Purpose | Auth Required | Rate Limit |
|--------|----------|---------|---|---|
| GET | `/health` | Service status | No | General |
| POST | `/add` | Create new staff record | Yes | General |
| POST | `/check-email` | Check if email available | No | General |
| GET | `/all` | List all staff members | Yes | General |
| GET | `/:id` | Get single staff detail | Yes | General |
| GET | `/stats` | Staff statistics | Yes | General |
| PUT | `/:id` | Update staff information | Yes | General |
| DELETE | `/:id` | Hard delete staff | Yes | General |
| PATCH | `/:id/soft-delete` | Soft delete (preserve data) | Yes | General |

**Staff Schema**:
- `firstName`, `lastName`: 2-50 character strings
- `email`: Unique, RFC 5322 validated
- `phone`: Ethiopian format (+251XXXXXXXXX)
- `role`: Enum: Junior IT Officer, IT Officer, Senior IT Officer, developer, Database Admin, Staff
- `department`: Enum: IT Infrastructure, core banking, Mobile application and development, digital channal, HR
- `status`: Enum: Active, Inactive, On Leave
- `employeeId`: Auto-generated (EMPYYYYxxxx)
- `hireDate`: Date of hire (defaults to today)

#### Task Management Routes (`/api/tasks`)

| Method | Endpoint | Purpose | Auth Required | Rate Limit |
|--------|----------|---------|---|---|
| GET | `/health` | Service status | No | General |
| POST | `/add` | Create new task | Yes | General |
| GET | `/` | List tasks with filters | Yes | General |
| GET | `/:id` | Get single task detail | Yes | General |
| PUT | `/:id` | Update task | Yes | General |
| PATCH | `/:id/status` | Update only task status | Yes | General |
| DELETE | `/:id` | Delete task | Yes | General |

**Task Schema**:
- `title`: Task name/title (required)
- `description`: Detailed task description
- `status`: Enum: pending, in-progress, completed, cancelled
- `taskId`: Auto-generated unique ID (format: TASKYYxxxxx, e.g., TASK24A4K9)
- `createdAt`, `updatedAt`: Timestamps

#### Schedule Management Routes (`/api/schedules`) — MOST COMPLEX

| Method | Endpoint | Purpose | Auth Required | Rate Limit |
|--------|----------|---------|---|---|
| GET | `/health` | Service status | No | General |
| POST | `/` | Create single schedule | Yes | General |
| GET | `/` | List schedules with filters | Yes | General |
| GET | `/upcoming` | Get upcoming schedules | Yes | General |
| GET | `/:id` | Get schedule detail | Yes | General |
| PUT | `/:id` | Update schedule | Yes | General |
| PATCH | `/:id/status` | Update schedule status | Yes | General |
| DELETE | `/:id` | Delete schedule | Yes | General |
| GET | `/staff/:staffId/workload` | Calculate staff workload | Yes | General |
| GET | `/availability/:date` | Check date availability | Yes | General |
| GET | `/report` | Generate schedule report | Yes | General |
| GET | `/stats/overview` | Schedule statistics | Yes | General |
| GET | `/recommendations/times` | Suggest optimal times | Yes | General |
| POST | `/bulk/create` | Create multiple schedules at once | Yes | General |
| PATCH | `/:scheduleId/assignments/:staffId/status` | Update assignment status | Yes | General |
| GET | `/staff/:staffId/schedules` | Get staff's assigned schedules | Yes | General |
| GET | `/calendar/view` | Calendar view of schedules | Yes | General |
| GET | `/search` | Search schedules by query | Yes | General |
| GET | `/staff/:staffId/weekly/:week/:year` | Weekly schedule for staff | Yes | General |
| GET | `/check/consecutive/:staffId/:category/:date` | Check rotation rules | Yes | General |

**Schedule Schema Structure**:
```javascript
{
  scheduleType: 'daily' | 'weekly',           // Type of schedule
  taskId: ObjectId,                           // Reference to Task
  taskTitle: String,                          // Task name (denormalized)
  taskDescription: String,
  taskCategory: String,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'overdue',
  
  // Date/Recurrence
  scheduledDate: Date,                        // When schedule starts
  endDate: Date,                              // When schedule ends
  recurrence: 'once' | 'daily' | 'weekly',
  
  // Exclusions & Rules
  excludeWeekends: Boolean,
  excludeDates: [Date],
  weeklyLimit: Number,
  
  // Meta Fields for Reporting
  weekNumber: Number,
  month: Number,
  year: Number,
  
  // Complex Assignment Tracking
  assignments: [{
    staffId: ObjectId,
    staffName: String,
    email: String,
    status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled',
    
    // Completion Tracking
    completedAt: Date,
    hoursWorked: Number (0-24),
    rating: Number (1-5),
    feedback: String,
    notes: String,
    
    // Email Notification
    notificationSent: Boolean,
    notificationSentAt: Date,
    emailStatus: 'pending' | 'sent' | 'failed',
    emailError: String,
    
    // Rotation Tracking
    rotationStatus: 'new' | 'rotated' | 'maintained'
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

#### Email Routes (`/api/email`)

| Method | Endpoint | Purpose | Auth Required | Rate Limit |
|--------|----------|---------|---|---|
| GET | `/test` | Test email service | No | Email (50/15min) |
| GET | `/check` | Check email server connection | No | Email (50/15min) |
| GET | `/stats` | Get email statistics | Yes | General |
| DELETE | `/stats/reset` | Reset email statistics | Yes | General |
| POST | `/send` | Send single email | Yes | Email (50/15min) |
| POST | `/send/bulk` | Send bulk emails | Yes | Email (50/15min) |

### Database Models

#### User Model
```javascript
{
  firstName: String,                // 2-50 chars, required
  lastName: String,                 // 2-50 chars, required
  email: String,                    // Unique, indexed, RFC 5322 format
  phone: String,                    // 10-15 digits
  password: String,                 // Hashed with bcryptjs (10 rounds), not returned in JSON
  isActive: Boolean,                // Default: true, indexed for filtering
  lastLogin: Date,
  createdAt: Date,                  // Auto-generated timestamp
  updatedAt: Date                   // Auto-generated timestamp
}
```

**Indexes**:
- `email` (unique): Fast lookup by email
- `isActive` (non-unique): Filter active users
- `(email, isActive)` (compound): Optimized for common query pattern

**Methods**:
- `comparePassword(candidatePassword)`: Verify password during login (returns boolean)
- `toJSON()`: Remove password and __v before serialization

#### Staff Model
```javascript
{
  firstName: String,                // 2-50 chars, required
  lastName: String,                 // 2-50 chars, required
  email: String,                    // Unique, RFC 5322 validated
  phone: String,                    // Ethiopian format: +251XXXXXXXXX or 0XXXXXXXXX
  role: String,                     // Enum: Junior IT Officer, IT Officer, Senior IT Officer, developer, Database Admin, Staff
  department: String,               // Enum: IT Infrastructure, core banking, Mobile application and development, digital channal, HR
  status: String,                   // Enum: Active, Inactive, On Leave
  employeeId: String,               // Unique, auto-generated (EMPYYYYxxxx)
  hireDate: Date,                   // Auto-generated to current date
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (unique): Email-based lookup
- `employeeId` (unique): Employee lookup
- `department` (non-unique): Filter by department

#### Task Model
```javascript
{
  title: String,                    // Task name, required
  description: String,              // Detailed description
  status: String,                   // Enum: pending, in-progress, completed, cancelled
  taskId: String,                   // Unique, auto-generated (TASKYYxxxxx format)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `taskId` (unique): Task lookup by ID
- `status` (non-unique): Filter by status

#### Schedule Model (Most Complex)
- **Indexes**: 
  - `(scheduleType, scheduledDate, status)`: Multi-column index for common query
  - `(assignments.staffId, scheduledDate)`: Find schedules assigned to staff on date
  - `(scheduleType, weekNumber, year)`: Group by week/year

- **Auto-Generation**: 
  - Daily: `DAYSYYMMDD####` (e.g., DAYS241022A4K9)
  - Weekly: `WKSYYMMDD####` (e.g., WKS241022A4K9)

### Middleware Chain

**Order of Execution**:
1. **Helmet**: Sets security headers (X-Frame-Options, X-Content-Type-Options, etc.)
2. **CORS**: Dynamic origin checking, allows credentials
3. **express.json()**: Parse JSON request bodies
4. **express.urlencoded()**: Parse form data
5. **express-mongo-sanitize**: Strips $ and . characters to prevent NoSQL injection
6. **express-rate-limit**: General rate limiter (100 requests/15 min)
7. **Custom request logger**: Logs request with timestamp and response duration
8. **Route handlers**: Process the actual request
9. **protect middleware** (on protected routes): JWT verification and user attachment

**Rate Limiting Configuration**:
```javascript
authLimiter: 10 requests per 15 minutes
generalLimiter: 100 requests per 15 minutes
emailLimiter: 50 requests per 15 minutes
```

### Authentication & Authorization Flow

**Registration Flow**:
```
User Input → Joi Validation (schema check)
  ↓
Check Duplicate (email, phone)
  ↓
Hash Password (bcryptjs, 10 rounds)
  ↓
Create User Document
  ↓
Generate JWT Token (7 day expiry)
  ↓
Return Token + User Data (password excluded)
  ↓
Client: Store Token in localStorage
```

**Login Flow**:
```
Email + Password → Database Lookup
  ↓
User Not Found? → 400 Error
  ↓
Password Compare (bcryptjs.compare)
  ↓
Password Mismatch? → 401 Unauthorized
  ↓
Check isActive Flag
  ↓
Generate JWT Token (7 day expiry)
  ↓
Update lastLogin Timestamp
  ↓
Return Token + User Data
```

**Protected Route Access**:
```
Request with Authorization Header
  ↓
Extract Bearer Token
  ↓
Verify JWT Signature & Expiry
  ↓
Decode Token → Get User ID
  ↓
Database Lookup by ID
  ↓
Check isActive Status
  ↓
Token Valid? → Attach user to req.user → Next Middleware
  ↓
Token Invalid/Expired? → 401 Response
```

**Token Expiration Handling**:
- JWT tokens expire after 7 days (configurable via JWT_EXPIRE)
- No refresh token mechanism implemented
- Client must re-login when token expires (401 response triggers logout)

### Email Notification System

**Architecture**:
```
Schedule Controller
  ↓
Calls: EmailService.sendScheduleNotifications(schedule)
  ↓
For Each Assignment:
  - Check email status
  - Generate HTML template
  - Call sendEmail()
  ↓
sendEmail() Function:
  - Check if email service enabled
  - Create Nodemailer transport (Gmail SMTP)
  - Send via TLS (port 587) or implicit TLS (port 465)
  - Track success/failure
  - Update assignment.emailStatus
  ↓
Response: Array of { staffName, email, success, error }
```

**Configuration**:
- **Service**: Gmail with SMTP
- **Authentication**: App Password (not regular account password)
- **Ports**: 587 (STARTTLS) with fallback to 465 (implicit TLS)
- **Connection Pool**: Reused across requests
- **Retry Logic**: Automatic retry with different port if first fails
- **Timeout**: 30 seconds for connection, greeting, and socket

**Features**:
- Per-assignment email status tracking (pending, sent, failed)
- Bulk email sending with rate limiting (50/15 min)
- HTML email templates with task details
- Priority headers (X-Priority: 1)
- Reply-to support
- Message ID tracking for debugging
- Statistics tracking (sent count, failed count)
- Graceful degradation when credentials not configured

**Email Template Example**:
```html
<h1>You've Been Assigned a Task</h1>
<p>Task: [taskTitle]</p>
<p>Scheduled: [scheduledDate]</p>
<p>Priority: [priority]</p>
<p>Description: [taskDescription]</p>
<p>Please confirm receipt and update your status in the system.</p>
```

### Scheduling Engine

**Schedule Types**:
- **Daily**: Repeats every day with optional exclusions (weekends, specific dates)
- **Weekly**: Repeats on specific days of week

**Assignment Algorithm**:
1. Parse schedule definition
2. Validate date range
3. Check staff availability/workload
4. Detect rotation requirements (consecutive weeks)
5. Assign to available staff members
6. Generate unique schedule ID
7. Create email notification entries
8. Save to database

**Advanced Features**:
- **Rotation Detection**: Tracks if staff member is new, rotated from previous, or maintained
- **Weekly Limits**: Enforces maximum assignments per staff per week
- **Consecutive Restriction**: Prevents assigning same staff multiple consecutive weeks
- **Workload Calculation**: Sums hours worked across all assignments
- **Calendar Generation**: Creates month/week view of schedules

---

## Frontend Deep-Dive

### Component Architecture

**App Component Hierarchy**:
```
<App>
  └─ <ErrorBoundary>
      └─ <AuthProvider>
          ├─ <Toaster /> (react-hot-toast)
          └─ <Routes>
              ├─ /register → <RegisterPage />
              │             ├─ Form (firstName, lastName, email, phone, password)
              │             ├─ Password Strength Meter
              │             ├─ Error Messages (field-level)
              │             └─ Success Modal
              │
              ├─ /login → <LoginPage />
              │           ├─ Email + Password Form
              │           ├─ Error Banner
              │           └─ Redirect to Dashboard
              │
              └─ /dashboard → <ProtectedRoute>
                              └─ <Dashboard />
                                  ├─ Welcome Section
                                  ├─ Stats Cards
                                  ├─ Recent Activities
                                  └─ Action Buttons
```

### State Management Strategy

**Context API Implementation**:
```javascript
<AuthContext>
  ├─ State:
  │   ├─ user: { _id, firstName, lastName, email, phone, createdAt }
  │   ├─ loading: boolean
  │   └─ isAuthenticated: derived from !!user
  │
  ├─ Methods:
  │   ├─ register(userData)
  │   ├─ login(credentials)
  │   └─ logout()
  │
  └─ Persistence:
      ├─ Token stored in localStorage['token']
      └─ User stored in localStorage['user']
```

**Token Management**:
- Stored in `localStorage` under key `'token'`
- Retrieved on app startup and attached to all API requests
- Auto-logout triggered on 401 response
- User object normalized to handle `_id` vs `id` variations

### Routing & Navigation

**Route Structure**:
- `/register`: Public route for new user signup
- `/login`: Public route for user login (redirected to if not authenticated)
- `/dashboard`: Protected route (requires valid token)
- `/`: Root redirects to `/login` if not authenticated
- `*`: 404 handling (implicit, falls to root redirect)

**ProtectedRoute Component**:
```javascript
// Checks for token + user in context
// If missing: redirects to /login
// If present: renders child component
```

### API Integration Layer

**Axios Configuration**:
```javascript
const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Add Bearer Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Show toast notifications
    return Promise.reject(error);
  }
);
```

### Pages & Features

#### RegisterPage

**Form Fields**:
- `firstName`: Text input, 2-50 characters
- `lastName`: Text input, 2-50 characters
- `email`: Email input, RFC 5322 validation
- `phone`: Tel input, auto-formats and validates 10+ digits
- `password`: Password input, strength indicator
- `confirmPassword`: Password input, must match
- `terms`: Checkbox, must accept

**Validation**:
- **Client-side** (real-time):
  - Email format (@ and . required)
  - Phone format (10+ digits only)
  - Password confirmation match
  - Field length validation
  
- **Server-side** (Joi schemas):
  - Field types and constraints
  - Duplicate email/phone check
  - Password strength requirements

**Password Strength Meter**:
```
Weak:       < 2 criteria met (red)
Fair:       2-3 criteria met (orange)
Strong:     3-4 criteria met (blue)
Very Strong: all criteria met (green)

Criteria: length ≥ 8, uppercase, lowercase, numbers, special chars
```

**Success Flow**:
1. Form submit → Client validation
2. API call to `/api/auth/register`
3. Success → Show animated modal
4. Auto-countdown (3 seconds)
5. User clicks button or countdown expires → Redirect to login

**Error Display**:
- **Field-level errors**: Red text below input
- **API errors**: Red banner at form top
- **Toast notifications**: Transient alerts

#### LoginPage (Similar Structure)

**Form Fields**:
- `email`: Email input
- `password`: Password input
- `rememberMe`: Checkbox (optional)

**Error Handling**:
- Invalid credentials → Display toast
- Network error → Retry prompt
- Server error → Detailed error message

#### Dashboard

**Sections**:
1. **Welcome**: "Hi [firstName]!" greeting with timestamp
2. **Statistics Cards**: 
   - Total Tasks
   - Assigned Staff
   - Pending Schedules
   - Completion Rate %
3. **Recent Activities**: List of recent schedules/tasks
4. **Quick Actions**: Buttons to create new items

**Data Fetching**:
- `useEffect` on component mount
- Fetch stats, recent activities, assignments
- Loading spinners during fetch
- Error handling with retry option

### UI Patterns & Components

**Form Input Component**:
```javascript
// Pattern: Icon + Input + Error Message
<div className="form-group">
  <label>Email <FaEnvelope /></label>
  <input 
    type="email"
    value={email}
    onChange={handleChange}
    className={error ? 'input-error' : ''}
  />
  {error && <span className="error-text">{error}</span>}
</div>
```

**Button States**:
```javascript
// States: Normal, Hover, Active, Disabled, Loading
<button 
  disabled={loading}
  className="btn-primary"
>
  {loading ? <LoadingSpinner /> : 'Submit'}
</button>
```

**Error Banner**:
```javascript
// Dismissible alert at form top
{apiError && (
  <div className="alert alert-error">
    <FaExclamationCircle />
    {apiError}
    <button onClick={() => setApiError('')}>×</button>
  </div>
)}
```

**Toast Notifications**:
- `toast.success(message)` - Green, 3 sec
- `toast.error(message)` - Red, 4 sec
- `toast.loading(message)` - Spinner, until resolved
- Auto-dismiss or manual dismiss

### Styling Approach

**Tailwind CSS Utilities**:
```javascript
// Colors (Bunna Bank branding)
bg-[#3d1209]   // Dark brown primary
text-amber-500 // Amber accents (#f59e0b)

// Responsive
md:w-1/2       // 50% width on medium screens
lg:flex        // Flex layout on large screens
hidden lg:block // Hide on mobile, show on desktop

// Spacing
px-6 py-4      // 1.5rem padding horizontal/vertical
gap-4          // 1rem gap between items

// Effects
shadow-lg      // Large drop shadow
rounded-lg     // Large border radius
hover:shadow-xl// Deeper shadow on hover
```

**CSS-in-JS (Styled Components)**:
```javascript
const StyledInput = styled.input`
  border: 2px solid ${props => props.error ? '#ef4444' : '#9ca3af'};
  padding: 0.75rem;
  border-radius: 0.5rem;
  
  &:focus {
    outline: none;
    border-color: #3d1209;
    box-shadow: 0 0 0 3px rgba(61, 18, 9, 0.1);
  }
`;
```

**Color Palette**:
- Primary Brown: `#3d1209` (buttons, headers, borders)
- Accent Amber: `#f59e0b` (highlights, icons)
- Success Green: `#22c55e` (confirmations)
- Error Red: `#ef4444` (errors, validations)
- Warning Orange: `#f97316` (warnings)
- Info Blue: `#3b82f6` (information)

### Browser & Build Configuration

**Vite Configuration** (`vite.config.js`):
```javascript
export default {
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,  // Disable in production
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'icons': ['lucide-react']
        }
      }
    }
  }
}
```

---

## Data Flow Diagrams

### Registration Flow

```
User fills form
  ↓
Client-side validation (email, phone, password strength)
  ↓
POST /api/auth/register with {firstName, lastName, email, phone, password}
  ↓
[Backend: Joi validation]
  ↓
[Backend: Check email/phone not duplicate]
  ↓
[Backend: Hash password with bcryptjs]
  ↓
[Backend: Create User document in MongoDB]
  ↓
[Backend: Generate JWT token (7 day expiry)]
  ↓
Response: {success: true, token, user: {firstName, lastName, email, phone, _id}}
  ↓
Frontend: Store token in localStorage
  ↓
Frontend: Store user in localStorage
  ↓
Frontend: Show success modal
  ↓
Frontend: Auto-redirect to /login after 3 seconds
```

### Login Flow

```
User enters email + password
  ↓
POST /api/auth/login with {email, password}
  ↓
[Backend: Joi validation]
  ↓
[Backend: Database lookup by email]
  ↓
[Backend: User not found? → 400 error]
  ↓
[Backend: Password comparison (bcryptjs.compare)]
  ↓
[Backend: Password mismatch? → 401 error]
  ↓
[Backend: Check isActive flag]
  ↓
[Backend: Generate JWT token]
  ↓
[Backend: Update lastLogin timestamp]
  ↓
Response: {success: true, token, user: {...}}
  ↓
Frontend: Store token in localStorage
  ↓
Frontend: Update AuthContext with user
  ↓
Frontend: Redirect to /dashboard
```

### Task Creation Flow

```
Manager: Create new task form
  ↓
Form data: {title, description, status, taskId}
  ↓
POST /api/tasks/add with Joi validation
  ↓
[Backend: Task created, auto-generate taskId if not provided]
  ↓
Response: {success: true, task: {_id, title, taskId, ...}}
  ↓
Frontend: Show success toast
  ↓
Frontend: Add task to task list
  ↓
Frontend: (Task ready for scheduling)
```

### Schedule Creation & Notification Flow

```
Manager: Create schedule
  Input: {taskId, staffIds[], scheduledDate, priority, recurrence}
  ↓
POST /api/schedules with validation
  ↓
[Backend: Create Schedule document with assignments]
  ↓
[Backend: Trigger EmailService for each assignment]
  ↓
For Each Assignment:
  [Backend: Generate HTML email template]
  [Backend: Call nodemailer.transporter.sendMail()]
  [Backend: If success: set emailStatus='sent', else 'failed']
  [Backend: Update assignment.emailStatus and emailError]
  ↓
[Backend: Return schedule + email results array]
  ↓
Response: {
    success: true,
    schedule: {...},
    emailResults: [
      { staffName, email, success, error },
      ...
    ]
  }
  ↓
Frontend: Show toast with email summary
  ↓
Frontend: Display schedule in calendar/list
```

### Staff Assignment Status Update Flow

```
Staff: Mark assignment as complete
  Input: {scheduleId, hoursWorked, rating, feedback}
  ↓
PATCH /api/schedules/:scheduleId/assignments/:staffId/status
  ↓
[Backend: Find schedule and specific assignment]
  ↓
[Backend: Update assignment fields]
  [Backend: Set status='completed']
  [Backend: Set completedAt = now]
  [Backend: Record hoursWorked and rating]
  ↓
[Backend: Update parent schedule status if all assignments done]
  ↓
Response: {success: true, assignment: {...}}
  ↓
Frontend: Update UI
  ↓
Frontend: Show success toast
```

---

## Configuration & Environment

### Backend Environment Variables

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/task_scheduler

# Authentication
JWT_SECRET=your-strong-secret-at-least-32-characters-long
JWT_EXPIRE=7d

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password-from-google

# CORS
FRONTEND_URL=http://localhost:3000,http://localhost:5173

# Deployment
RENDER_EXTERNAL_URL=https://scheedule-managmet-system-bunna-bank-1.onrender.com
```

### Frontend Environment Variables

```bash
# API Base URL
VITE_API_URL=http://localhost:5000

# Or for production:
VITE_API_URL=https://scheedule-managmet-system-bunna-bank-1.onrender.com
```

### Configuration Features

**Database Retry Logic**:
- Attempts to connect 5 times if initial connection fails
- Waits 10 seconds between retries
- Logs detailed connection status

**Email Service Degradation**:
- If credentials not configured: logs warning and disables email
- If connection fails: disables email and logs troubleshooting tips
- Server continues to run without email functionality

**CORS Dynamic Checking**:
- Supports multiple frontend origins (dev + production)
- Regex matching for Render deployment URLs
- Allows requests from multiple ports during development

---

## Deployment Guide

### Local Development Setup

**Prerequisites**:
- Node.js v18+ installed
- MongoDB running locally (or MongoDB Atlas connection string)
- Gmail account with 2FA enabled and App Password generated

**Backend Setup**:
```bash
cd full-stackauthentication

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task_scheduler
JWT_SECRET=your-secret-key-at-least-32-chars
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
FRONTEND_URL=http://localhost:3000,http://localhost:5173
EOF

# Start dev server with auto-reload
npm run dev
# Server runs on http://localhost:5000
```

**Frontend Setup**:
```bash
cd frontendauth

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000
EOF

# Start dev server
npm run dev
# Frontend runs on http://localhost:5173
```

**Testing**:
1. Open `http://localhost:5173` in browser
2. Navigate to `/register`
3. Create test account
4. Login and verify dashboard loads
5. Check backend console for request logs

### Production Deployment to Render

**Prerequisites**:
- GitHub repository with code pushed
- MongoDB Atlas account with cluster created
- Gmail App Password generated

**Backend Deployment**:

1. **Create Render Web Service**:
   - Connect GitHub repository
   - Branch: main
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: Free tier (will sleep after 15 min inactivity)

2. **Set Environment Variables** in Render dashboard:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/task_scheduler
   JWT_SECRET=[generate strong random string]
   EMAIL_USER=[your-email@gmail.com]
   EMAIL_PASSWORD=[app-password]
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

3. **Deploy**: Push to GitHub → Render auto-deploys
4. **Verify**: Check logs and test health endpoint

**Frontend Deployment**:

1. **Create Render Static Site**:
   - Connect GitHub repository
   - Branch: main
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

3. **Deploy**: Auto-deploys on push to main

**Post-Deployment Verification**:
```bash
# Test backend health
curl https://your-backend.onrender.com/api/health

# Test CORS
curl -H "Origin: https://your-frontend.onrender.com" \
  -H "Access-Control-Request-Method: POST" \
  https://your-backend.onrender.com/api/auth/register

# Test registration
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Test",
    "lastName":"User",
    "email":"test@example.com",
    "phone":"5551234567",
    "password":"TestPass@123"
  }'
```

### Monitoring & Maintenance

**Logs**:
- Render: View in dashboard → Service → Logs
- Local: Check console output from `npm run dev`

**Database**:
- MongoDB Atlas: Monitor connections, storage usage
- Backups: Enable automated backups in MongoDB Atlas

**Performance**:
- Monitor API response times (visible in Render logs)
- Track database query performance
- Check error rates and patterns

**Scaling for Production**:
- Upgrade Render plan from Free to Paid (to prevent sleep)
- Enable MongoDB connection pooling
- Implement API caching (Redis)
- Add CDN for static assets
- Consider microservices architecture for schedule processing

---

## Summary

The Bunna Bank Schedule Management System is a modern, full-stack application combining React frontend, Node.js/Express backend, and MongoDB database. It provides comprehensive staff scheduling with automated email notifications, sophisticated role-based assignment management, and detailed performance tracking. The architecture is scalable, secure, and ready for both local development and cloud deployment. Key features include JWT authentication, rate limiting, NoSQL injection prevention, email service with retry logic, and a user-friendly interface with real-time validation. The system demonstrates best practices in error handling, security, and code organization while maintaining clarity and maintainability for future enhancements.

---

**Document Version**: 1.0.0  
**Last Updated**: October 2024  
**System Status**: Production-Ready  
**Deployment Platforms**: Local Development, Render Cloud  
**Backend Framework**: Express.js 4.18.2  
**Frontend Framework**: React 18.2.0  
**Database**: MongoDB (Local + Atlas)  
**Authentication**: JWT with bcryptjs  
**Email Service**: Nodemailer (Gmail SMTP)
