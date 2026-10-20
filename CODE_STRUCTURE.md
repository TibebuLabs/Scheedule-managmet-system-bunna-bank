# Code Structure Documentation

## Project Overview

Bunna Bank Schedule Management System is a full-stack web application designed for managing staff schedules, tasks, and email notifications within Bunna Bank's IT Operations Division.

**Technology Stack:**
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Frontend:** React, Vite, TailwindCSS, Axios
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Nodemailer (Gmail)

---

## Backend Structure

**Location:** `d:\backup-t3\Desktop\Scheedule-managmet-system-bunna-bank\full-stackauthentication\`

### Directory Overview

```
full-stackauthentication/
├── server.js                 # Main application entry point
├── package.json              # Node.js dependencies
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment variables template
├── config/                   # Configuration files
├── controllers/              # Business logic handlers
│   ├── auth.controller.js    # Authentication logic
│   ├── staff.controller.js   # Staff management
│   ├── task.controller.js    # Task management
│   ├── schedule.controller.js# Schedule management
│   └── email.controller.js   # Email operations
├── middleware/               # Express middleware
│   └── auth.middleware.js    # JWT authentication & validation
├── models/                   # Mongoose schemas
│   ├── User.model.js         # User/staff member schema
│   ├── Task.model.js         # Task schema
│   ├── Schedule.model.js     # Schedule schema
│   └── Staff.model.js        # Staff details schema
├── routes/                   # API route definitions
│   ├── auth.routes.js        # /api/auth routes
│   ├── staff.routes.js       # /api/staff routes
│   ├── task.routes.js        # /api/tasks routes
│   ├── schedule.routes.js    # /api/schedules routes
│   └── email.routes.js       # /api/email routes
└── services/                 # Reusable business logic
    └── email.service.js      # Email sending service
```

### Key Backend Files

#### `server.js`
Main application entry point. Responsibilities:
- Express app initialization
- Middleware setup (CORS, helmet, rate limiting, NoSQL injection protection)
- MongoDB connection with automatic retry logic
- Route registration
- Global error handling
- Graceful shutdown handling

**Key Features:**
- MongoDB auto-reconnect (5 retries every 10 seconds in development)
- Separate rate limiting for auth endpoints (10 req/15min) vs general API (100 req/15min)
- Request logging with timestamps and duration
- Comprehensive health check endpoint at `/health`

#### `controllers/auth.controller.js`
Handles user authentication and registration.

**Endpoints:**
- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - User login with JWT generation
- `GET /api/auth/profile` - Get logged-in user profile (protected)

**Security Features:**
- Password hashing with bcrypt (10 salt rounds)
- JWT token generation with expiration info
- Duplicate email/phone detection
- Account activation status checking
- JWT_SECRET strength warning on startup

#### `controllers/task.controller.js`
Manages task CRUD operations.

**Endpoints:**
- `GET /api/tasks` - List all tasks with filtering
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### `controllers/schedule.controller.js`
Manages weekly/daily schedules and staff assignments.

**Endpoints:**
- `GET /api/schedules` - List schedules
- `POST /api/schedules` - Create schedule
- `GET /api/schedules/:id` - Get schedule details
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule
- `POST /api/schedules/:id/send-emails` - Send assignment emails

#### `controllers/email.controller.js`
Handles email operations.

**Endpoints:**
- `POST /api/email/send` - Send single email
- `POST /api/email/test` - Test email configuration
- `GET /api/email/status` - Check email service status

#### `services/email.service.js`
Centralized email sending service using Nodemailer.

**Features:**
- Gmail SMTP integration
- Graceful degradation when credentials missing
- Retry logic for failed sends
- Professional email templates for task assignments
- Bulk email sending with rate limiting
- Email statistics tracking

**Key Methods:**
- `sendEmail(to, subject, html, options)` - Send single email
- `sendBulkEmails(recipients, subject, htmlGenerator)` - Send to multiple recipients
- `testEmailService(testEmail)` - Test configuration
- `getEmailStatus()` - Get service status
- `generateTaskAssignmentTemplate(schedule, assignment)` - Generate formatted emails

#### `middleware/auth.middleware.js`
Authentication and validation middleware.

**Functions:**
- `protect()` - Verifies JWT token and attaches user to request
  - Extracts Bearer token from Authorization header
  - Validates token expiration
  - Checks user exists and is active
  - Returns specific error codes: `TOKEN_EXPIRED`, `INVALID_TOKEN`, `USER_NOT_FOUND`, `ACCOUNT_DEACTIVATED`

- `validateRegistration()` - Validates registration data
  - Checks required fields
  - Validates password strength (min 8 chars, uppercase, lowercase, digit, special char)
  - Validates email format
  - Validates phone number (10 digits)
  - Checks password confirmation matches

#### `models/User.model.js`
User/staff member schema.

**Fields:**
- `firstName`, `lastName` - String, required, 2-50 chars
- `email` - String, required, unique, indexed, lowercase, email format
- `phone` - String, required, 10-15 digits
- `password` - String, required, min 8 chars, hashed, not returned in queries
- `isActive` - Boolean, default true, indexed
- `lastLogin` - Date
- `createdAt`, `updatedAt` - Timestamps

**Indexes:**
- Single index on `email` for fast lookups
- Single index on `isActive` for filtering
- Compound index on `(email, isActive)` for common queries

**Methods:**
- `comparePassword(candidatePassword)` - Verifies password
- `toJSON()` - Removes password and __v from responses

**Hooks:**
- `pre('save')` - Hashes password before saving (only if modified)

### Environment Variables

Required variables (set in `.env` file):

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/task_scheduler` |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | `your_strong_secret_key` |
| `JWT_EXPIRE` | JWT expiration duration | `7d` |
| `EMAIL_USER` | Gmail email address | `your@gmail.com` |
| `EMAIL_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |
| `FRONTEND_URL` | Frontend domain for CORS | `http://localhost:3000` |

**Important Notes:**
- `EMAIL_USER` and `EMAIL_PASSWORD` are optional in development - server will run with email features disabled
- `JWT_SECRET` should be at least 32 characters in production
- Use Gmail App Password, not your regular password

---

## Frontend Structure

**Location:** `d:\backup-t3\Desktop\Scheedule-managmet-system-bunna-bank\frontendauth\`

### Directory Overview

```
frontendauth/
├── index.html                # HTML entry point
├── package.json              # npm dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # TailwindCSS configuration
├── postcss.config.js         # PostCSS configuration
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment variables template
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # Main app component
    ├── index.css             # Global styles
    ├── assets/               # Static assets (images, fonts)
    ├── components/           # Reusable React components
    │   ├── Navbar.jsx        # Navigation bar
    │   ├── Sidebar.jsx       # Sidebar navigation
    │   ├── TaskCard.jsx      # Task display card
    │   ├── StaffTable.jsx    # Staff list table
    │   └── ...               # Other components
    ├── context/              # React Context providers
    │   └── AuthContext.jsx   # Authentication context
    ├── pages/                # Page components (routes)
    │   ├── LoginPage.jsx     # Login page
    │   ├── RegisterPage.jsx  # Registration page
    │   ├── Dashboard.jsx     # Main dashboard
    │   ├── StaffPage.jsx     # Staff management
    │   ├── TasksPage.jsx     # Task management
    │   └── SchedulePage.jsx  # Schedule management
    └── services/             # API integration
        ├── api.js            # Axios instance and interceptors
        ├── authService.js    # Auth API calls
        ├── taskService.js    # Task API calls
        └── ...               # Other services
```

### Key Frontend Files

#### `vite.config.js`
Vite build configuration.

**Features:**
- React plugin with Fast Refresh
- Path alias `@` pointing to `src/`
- Dev server on port 3000 with auto-open
- API proxy to backend (`/api` → `http://localhost:5000`)
- Optimized build with code splitting (vendor, icons chunks)

#### `src/App.jsx`
Main application component.

**Responsibilities:**
- React Router setup
- Route definitions and protection
- Global layout structure

**Routes:**
- `/login` - Login page (public)
- `/register` - Registration page (public)
- `/` - Dashboard (protected)
- `/staff` - Staff management (protected)
- `/tasks` - Task management (protected)
- `/schedules` - Schedule management (protected)

#### `src/context/AuthContext.jsx`
Global authentication state management.

**Features:**
- User state management
- Token persistence in localStorage
- Login/logout functions
- Protected route wrapper
- Auto-logout on token expiration (401 responses)

**Exports:**
- `AuthProvider` - Context provider component
- `useAuth()` - Hook to access auth state

#### `src/services/api.js`
Centralized Axios configuration.

**Features:**
- Base URL from environment variable (`VITE_API_URL`)
- Request interceptor: Automatically adds Authorization header with JWT token
- Response interceptor:
  - Handles 401 errors (auto-logout)
  - Handles 403 errors (permission denied)
  - Handles network errors
  - Shows user-friendly toast notifications

#### `src/pages/Dashboard.jsx`
Main dashboard after login.

**Features:**
- Statistics overview (total tasks, staff, schedules)
- Recent tasks list
- Quick actions
- Loading states
- Error handling

#### `src/pages/LoginPage.jsx` & `RegisterPage.jsx`
Authentication pages.

**Features:**
- Form validation (email format, password strength)
- Loading states during submission
- Error message display
- Redirect to dashboard on success
- Links to switch between login/register

### Frontend Environment Variables

Required variables (set in `.env` file):

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## How to Run Locally

### Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **MongoDB** (v5.0 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Windows: Install as a service or run `mongod` manually
   - Linux: `sudo systemctl start mongod`
   - Mac: `brew services start mongodb-community`
   - Verify: `mongosh` (should connect to localhost:27017)

3. **Gmail Account with App Password** (for email features)
   - Enable 2-Factor Authentication
   - Generate App Password at: https://myaccount.google.com/apppasswords

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd "d:\backup-t3\Desktop\Scheedule-managmet-system-bunna-bank\full-stackauthentication"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update values in `.env`:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/task_scheduler
     JWT_SECRET=your_strong_random_string_minimum_32_characters_long
     EMAIL_USER=your.email@gmail.com
     EMAIL_PASSWORD=your_app_password_without_spaces
     FRONTEND_URL=http://localhost:3000
     NODE_ENV=development
     ```

4. **Start MongoDB:**
   ```bash
   # Windows (if not running as service)
   mongod

   # Linux
   sudo systemctl start mongod

   # Mac
   brew services start mongodb-community
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```

   Expected output:
   ```
   ============================================================
   🚀 Task Management System - Server Started
   ============================================================
   📍 Port: 5000
   🌍 Environment: development
   🔗 Health check: http://localhost:5000/health
   📊 Database: ✅ Connected
   📧 Email: ✅ Configured
   ...
   ```

### Frontend Setup

1. **Navigate to frontend directory (new terminal):**
   ```bash
   cd "d:\backup-t3\Desktop\Scheedule-managmet-system-bunna-bank\frontendauth"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env` (if not exists)
   - Verify `.env` contains:
     ```
     VITE_API_URL=http://localhost:5000/api
     ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Expected output:
   ```
   VITE v5.4.21  ready in 342 ms
   ➜  Local:   http://localhost:3000/
   ```

5. **Open in browser:**
   - Navigate to: http://localhost:3000
   - Register a new account or login

### Verification

1. **Check backend health:**
   - Open: http://localhost:5000/health
   - Should show: `{"status":"OK","database":"connected","email":"configured",...}`

2. **Test registration:**
   - Go to: http://localhost:3000/register
   - Fill in form and submit
   - Should redirect to dashboard with success message

3. **Check MongoDB:**
   - Open MongoDB Compass or mongosh
   - Connect to: `mongodb://localhost:27017/task_scheduler`
   - Verify `users` collection exists with your registered user

---

## Known Issues and Fixes

### Issue 1: MongoDB Connection Failed
**Error:** `ECONNREFUSED ::1:27017` or `ECONNREFUSED 127.0.0.1:27017`

**Cause:** MongoDB is not running

**Fix:**
```bash
# Windows
# Option 1: Start MongoDB service
services.msc # Find MongoDB and start it

# Option 2: Run manually
mongod --dbpath "C:\data\db"

# Linux
sudo systemctl start mongod
sudo systemctl status mongod

# Mac
brew services start mongodb-community
brew services list
```

### Issue 2: Email Service Failed
**Error:** `Missing credentials for "PLAIN"` or connection timeout

**Cause:** Email credentials not set or invalid

**Fix:**
1. Ensure `EMAIL_USER` and `EMAIL_PASSWORD` are set in backend `.env`
2. Use Gmail App Password, not regular password:
   - Go to: https://myaccount.google.com/apppasswords
   - Create new app password
   - Copy the 16-character password (remove spaces)
   - Paste into `.env` as `EMAIL_PASSWORD`
3. Server will run without email if credentials missing (features disabled)

### Issue 3: PostCSS or Vite Not Found
**Error:** `Cannot find module 'postcss'` or `'vite' is not recognized`

**Cause:** Frontend dependencies not installed or corrupted

**Fix:**
```bash
cd frontendauth
rm -rf node_modules package-lock.json  # or del on Windows
npm install
```

### Issue 4: CORS Error in Browser Console
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Cause:** Frontend URL not allowed in backend CORS config

**Fix:**
1. Verify `FRONTEND_URL=http://localhost:3000` in backend `.env`
2. Restart backend server
3. Or use Vite's proxy (already configured in `vite.config.js`)

### Issue 5: Token Expired or Invalid
**Error:** `TOKEN_EXPIRED` or `INVALID_TOKEN` response

**Cause:** JWT token expired (default 7 days) or JWT_SECRET changed

**Fix:**
1. Logout and login again
2. Frontend should auto-logout on 401 responses
3. Clear browser localStorage if persists:
   - Open DevTools → Application → Local Storage
   - Delete `token` key

### Issue 6: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Cause:** Another process using the port

**Fix:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Or change port in backend .env
PORT=5001
```

---

## Development Tips

### Backend Development

1. **Use nodemon for auto-restart:**
   ```bash
   npm run dev  # Already configured
   ```

2. **Check logs:**
   - All requests logged with timestamp: `[2026-10-20 07:13:14] GET /api/tasks 200 45ms`
   - MongoDB connection status logged
   - Email send attempts logged

3. **Test API with cURL:**
   ```bash
   # Health check
   curl http://localhost:5000/health

   # Register
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@test.com","phone":"1234567890","password":"Test@123","confirmPassword":"Test@123"}'

   # Login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"Test@123"}'
   ```

4. **MongoDB inspection:**
   ```bash
   mongosh
   use task_scheduler
   db.users.find().pretty()
   db.tasks.find().pretty()
   ```

### Frontend Development

1. **React DevTools:**
   - Install browser extension
   - Inspect component tree and state

2. **Network inspection:**
   - Open DevTools → Network tab
   - Filter by XHR to see API calls
   - Check request/response payloads

3. **Build for production:**
   ```bash
   npm run build
   npm run preview  # Test production build locally
   ```

4. **Tailwind CSS:**
   - All utility classes available
   - Custom colors in `tailwind.config.js`
   - Dark mode support ready (add `dark:` prefix)

---

## Security Considerations

1. **JWT Secrets:**
   - Use strong random strings (min 32 chars)
   - Never commit to git
   - Rotate periodically in production

2. **Email Credentials:**
   - Use App Passwords, not account passwords
   - Never commit to git
   - Restrict App Password to specific app

3. **MongoDB:**
   - Use authentication in production
   - Don't expose port 27017 to public
   - Regular backups

4. **CORS:**
   - Only allow trusted origins
   - Update `FRONTEND_URL` in production

5. **Rate Limiting:**
   - Auth endpoints: 10 req/15min
   - General API: 100 req/15min
   - Adjust in `server.js` if needed

6. **NoSQL Injection:**
   - `express-mongo-sanitize` enabled
   - Strips `$` and `.` from user input

7. **Input Validation:**
   - All auth endpoints validated
   - Add validation to other endpoints as needed

---

## Performance Notes

1. **Database Indexes:**
   - User model: indexed on `email`, `isActive`, `(email, isActive)`
   - Add indexes to other models for frequently queried fields

2. **API Response Times:**
   - Target: <200ms for simple queries
   - Use `.select()` to limit returned fields
   - Use `.lean()` for read-only queries (faster)

3. **Frontend Bundle:**
   - Code splitting enabled (vendor, icons chunks)
   - Lazy load routes if app grows
   - Use `React.memo()` for expensive components

4. **MongoDB Connection:**
   - Connection pooling enabled by default
   - Auto-reconnect on disconnect

---

## Maintenance Checklist

### Daily
- [ ] Check server logs for errors
- [ ] Monitor MongoDB disk usage

### Weekly
- [ ] Review API response times
- [ ] Check email delivery rates
- [ ] Clean up old/test data

### Monthly
- [ ] Update npm dependencies
- [ ] Review and rotate JWT secrets
- [ ] Backup MongoDB database
- [ ] Review error logs for patterns

### As Needed
- [ ] Scale MongoDB if growing large
- [ ] Add API caching if needed
- [ ] Optimize slow queries
- [ ] Add monitoring/alerting

---

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in server console
3. Check MongoDB connection status
4. Verify environment variables
5. Test with cURL to isolate frontend vs backend issues

---

**Last Updated:** January 2026
**Version:** 1.0.0
