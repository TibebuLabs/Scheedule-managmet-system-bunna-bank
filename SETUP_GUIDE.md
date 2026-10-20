# 🏦 Bunna Bank Schedule Management System - Quick Setup Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

**Double-click** `install-dependencies.bat` to automatically install all dependencies for both frontend and backend.

Alternatively, use **Command Prompt**:
```cmd
cd /d "d:\backup-t3\Desktop\Scheedule-managmet-system-bunna-bank"
install-dependencies.bat
```

### Step 2: Configure Environment Variables

#### Backend Configuration
Edit `full-stackauthentication/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task_scheduler
JWT_SECRET=your_super_secret_jwt_key_change_this_to_something_random
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Gmail Setup for Email Notifications**:
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification (enable if not enabled)
3. Go to App passwords: https://myaccount.google.com/apppasswords
4. Generate a new app password for "Mail"
5. Copy the 16-character password to `EMAIL_PASSWORD` in your `.env`

#### Frontend Configuration
Edit `frontendauth/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Install & Start MongoDB

**Option A: Local MongoDB**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Use default connection string in `.env`

**Option B: MongoDB Atlas (Cloud - Free)**
1. Create account at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster (M0)
3. Create database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and update `MONGODB_URI` in backend `.env`

---

## ▶️ Running the Application

### Easy Method (Recommended)
**Double-click** `start-app.bat` - This will open two terminal windows:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:3000

### Manual Method

**Terminal 1 - Backend**:
```cmd
cd /d "d:\backup-t3\Desktop\Scheedule-managmet-system-bunna-bank\full-stackauthentication"
npm run dev
```

**Terminal 2 - Frontend** (open new terminal):
```cmd
cd /d "d:\backup-t3\Desktop\Scheedule-managmet-system-bunna-bank\frontendauth"
npm run dev
```

The frontend will automatically open in your browser at `http://localhost:3000`

---

## 🔧 Troubleshooting

### PowerShell Execution Policy Error

If you see an error about "scripts disabled", open PowerShell as **Administrator** and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use

**Kill process on port 5000** (Backend):
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Kill process on port 3000** (Frontend):
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### MongoDB Connection Error

**Check if MongoDB is running**:
```cmd
# For local MongoDB
net start MongoDB

# Or check service status
sc query MongoDB
```

**For MongoDB Atlas**:
- Verify connection string is correct
- Check IP whitelist settings
- Ensure database user credentials are correct

### Cannot Find Module Errors

Re-install dependencies:
```cmd
cd full-stackauthentication
rmdir /s /q node_modules
del package-lock.json
npm install

cd ..\frontendauth
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## 📋 Project Structure

```
Scheedule-managmet-system-bunna-bank/
├── frontendauth/              # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   ├── .env                  # Frontend environment variables
│   └── package.json
│
├── full-stackauthentication/  # Express.js Backend
│   ├── config/               # Configuration files
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── .env                  # Backend environment variables
│   ├── server.js             # Main server file
│   └── package.json
│
├── install-dependencies.bat   # Auto-install script
├── start-app.bat             # Quick start script
└── SETUP_GUIDE.md            # This file
```

---

## 🎯 Key Features

- ✅ **Authentication System** - Secure JWT-based login/registration
- ✅ **Staff Management** - Add, edit, delete staff members
- ✅ **Task Management** - Create and assign tasks with priorities
- ✅ **Schedule Management** - Weekly and daily schedule views
- ✅ **Dashboard** - Statistics and quick actions
- ✅ **Notifications** - Real-time notifications and email alerts
- ✅ **Dark/Light Theme** - Toggle between themes
- ✅ **PDF Export** - Export reports and schedules
- ✅ **Charts & Analytics** - Visual data representation
- ✅ **Responsive Design** - Works on desktop and mobile

---

## 🔗 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:5000/api | REST API endpoints |
| Health Check | http://localhost:5000/health | Server status |
| API Root | http://localhost:5000 | API documentation |

---

## 📦 Technology Stack

### Frontend
- React 18
- Vite (Build tool)
- TailwindCSS (Styling)
- React Router (Navigation)
- Axios (HTTP client)
- Chart.js & Recharts (Charts)
- Framer Motion (Animations)
- jsPDF (PDF generation)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (Email)
- Helmet (Security)
- Rate Limiting

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Schedules
- `GET /api/schedules` - Get all schedules
- `POST /api/schedules` - Create schedule
- `GET /api/schedules/staff/:staffId` - Get staff schedules
- `GET /api/schedules/date/:date` - Get schedules by date

### Email
- `POST /api/email/send` - Send email notification

---

## 🔒 Security Features

- JWT token authentication
- Password hashing (bcrypt)
- Rate limiting (100 req/15min)
- HTTP security headers (Helmet)
- CORS protection
- Input validation
- XSS protection

---

## 🛠️ Development Commands

### Backend
```cmd
cd full-stackauthentication
npm run dev      # Start with auto-reload
npm start        # Start production mode
```

### Frontend
```cmd
cd frontendauth
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## ✅ Verification Checklist

Before running the application, ensure:

- [ ] Node.js is installed (v18 or higher)
- [ ] MongoDB is installed and running
- [ ] All dependencies are installed (run `install-dependencies.bat`)
- [ ] Backend `.env` file is configured
- [ ] Frontend `.env` file is configured
- [ ] MongoDB connection string is correct
- [ ] Email credentials are set (optional, for notifications)

---

## 📞 Need Help?

Common issues and solutions:

1. **"Cannot find module"** → Run `npm install` again
2. **"Port already in use"** → Kill the process or change port
3. **"MongoDB connection failed"** → Check if MongoDB is running
4. **"Script execution disabled"** → Fix PowerShell execution policy
5. **CORS errors** → Check `FRONTEND_URL` in backend `.env`

---

## 🎉 Success!

If everything is set up correctly, you should see:
- Backend terminal showing: `🚀 Server running on port 5000`
- Frontend opens automatically in your browser
- Login page appears without errors

**Default test user** (if seeded):
- Email: admin@bunnabank.com
- Password: admin123

Enjoy using the Bunna Bank Schedule Management System! 🏦✨
