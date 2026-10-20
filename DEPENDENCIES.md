# 📦 Complete Dependencies Documentation

## Backend Dependencies (`full-stackauthentication/`)

### Production Dependencies

#### Core Framework
```json
"express": "^4.18.2"
```
- **Purpose**: Web application framework for Node.js
- **Why**: Handles HTTP requests, routing, middleware
- **Usage**: Foundation of the entire backend API

#### Database
```json
"mongoose": "^7.5.0"
```
- **Purpose**: MongoDB object modeling tool
- **Why**: Provides schema validation, type casting, query building
- **Usage**: All database operations (Staff, Tasks, Schedules, Users)

#### Authentication & Security
```json
"bcryptjs": "^2.4.3"
"jsonwebtoken": "^9.0.2"
"helmet": "^7.0.0"
"cors": "^2.8.5"
```
- **bcryptjs**: Password hashing and verification
- **jsonwebtoken**: JWT token generation and verification
- **helmet**: Secures Express apps by setting HTTP headers
- **cors**: Cross-Origin Resource Sharing middleware

#### Validation
```json
"joi": "^18.0.2"
"express-validator": "^7.0.1"
```
- **joi**: Object schema validation
- **express-validator**: Express middleware for validation
- **Usage**: Input validation for all API endpoints

#### Rate Limiting
```json
"express-rate-limit": "^8.2.1"
"rate-limiter-flexible": "^2.4.2"
```
- **Purpose**: Prevent brute force attacks and API abuse
- **Usage**: Limits requests to 100 per 15 minutes

#### Email Service
```json
"nodemailer": "^7.0.12"
```
- **Purpose**: Send emails from Node.js
- **Usage**: Schedule reminders, notifications, password reset

#### Utilities
```json
"dotenv": "^16.3.1"
"date-fns": "^4.1.0"
```
- **dotenv**: Load environment variables from .env file
- **date-fns**: Modern date utility library

### Development Dependencies
```json
"nodemon": "^3.0.1"
```
- **Purpose**: Auto-restart server on file changes
- **Usage**: Development workflow improvement

---

## Frontend Dependencies (`frontendauth/`)

### Production Dependencies

#### Core Framework
```json
"react": "^18.2.0"
"react-dom": "^18.2.0"
```
- **Purpose**: JavaScript library for building user interfaces
- **Why**: Component-based architecture, virtual DOM
- **Usage**: Entire frontend application

#### Routing
```json
"react-router-dom": "^6.30.2"
```
- **Purpose**: Declarative routing for React
- **Usage**: Navigation between pages (Dashboard, Staff, Tasks, Schedules)
- **Key Features**: Protected routes, nested routes, dynamic routing

#### HTTP Client
```json
"axios": "^1.13.2"
```
- **Purpose**: Promise-based HTTP client
- **Usage**: All API calls to backend
- **Features**: Request/response interceptors, automatic JSON transforms

#### State Management
```json
"react": "^18.2.0"  // Built-in Context API used
```
- **Usage**: AuthContext for global authentication state

#### Styling
```json
"styled-components": "^6.1.19"
```
- **Purpose**: CSS-in-JS styling
- **Usage**: Component-level styling with props

#### Icons
```json
"lucide-react": "^0.562.0"
"react-icons": "^4.12.0"
```
- **lucide-react**: Modern icon library (primary)
- **react-icons**: Additional icon sets (FontAwesome, Material, etc.)
- **Usage**: UI icons throughout the application

#### Charts & Visualization
```json
"chart.js": "^4.5.1"
"react-chartjs-2": "^5.3.1"
"recharts": "^3.6.0"
```
- **chart.js**: Flexible JavaScript charting library
- **react-chartjs-2**: React wrapper for Chart.js
- **recharts**: Composable charting library built on React components
- **Usage**: Dashboard statistics, analytics, reports

#### Animations
```json
"framer-motion": "^10.18.0"
```
- **Purpose**: Production-ready motion library for React
- **Usage**: Page transitions, component animations, micro-interactions
- **Features**: Spring animations, gestures, scroll animations

#### Notifications
```json
"react-hot-toast": "^2.6.0"
```
- **Purpose**: Lightweight toast notification library
- **Usage**: Success/error messages, user feedback
- **Features**: Customizable, accessible, promise-based

#### PDF Generation
```json
"jspdf": "^3.0.4"
"jspdf-autotable": "^5.0.2"
```
- **jspdf**: Client-side PDF generation
- **jspdf-autotable**: Plugin for generating tables
- **Usage**: Export schedules, reports, staff lists to PDF

#### Validation
```json
"validator": "^13.15.26"
```
- **Purpose**: String validation and sanitization library
- **Usage**: Email validation, URL validation, input sanitization

### Development Dependencies

#### Build Tool
```json
"vite": "^5.4.19"
"@vitejs/plugin-react": "^4.3.4"
```
- **vite**: Next-generation frontend build tool
- **Why**: Fast HMR, optimized builds, ESM-first
- **Features**: Instant server start, lightning-fast HMR

#### Styling Tools
```json
"tailwindcss": "^3.4.19"
"autoprefixer": "^10.4.23"
"postcss": "^8.5.6"
```
- **tailwindcss**: Utility-first CSS framework
- **autoprefixer**: Add vendor prefixes automatically
- **postcss**: CSS transformation tool
- **Usage**: Responsive design, custom utility classes

---

## Dependency Relationships

### Backend Flow
```
Express.js (Server)
    ├── Helmet (Security Headers)
    ├── CORS (Cross-Origin)
    ├── express-rate-limit (Rate Limiting)
    ├── express.json() (Body Parser)
    └── Routes
        ├── Authentication Routes
        │   ├── JWT (Token Generation)
        │   ├── bcryptjs (Password Hashing)
        │   └── Joi (Validation)
        ├── Staff Routes
        │   ├── Mongoose (Database)
        │   └── express-validator (Validation)
        ├── Task Routes
        │   ├── Mongoose (Database)
        │   └── date-fns (Date Handling)
        ├── Schedule Routes
        │   ├── Mongoose (Database)
        │   └── date-fns (Date Operations)
        └── Email Routes
            └── Nodemailer (Email Sending)
```

### Frontend Flow
```
React (UI Library)
    ├── React Router (Navigation)
    │   └── ProtectedRoute (Auth Guard)
    ├── Context API (State)
    │   └── AuthContext
    ├── Axios (HTTP)
    │   └── API Services
    ├── Components
    │   ├── Dashboard
    │   │   ├── Chart.js (Charts)
    │   │   ├── Recharts (Charts)
    │   │   └── framer-motion (Animations)
    │   ├── Staff
    │   │   ├── validator (Input Validation)
    │   │   └── lucide-react (Icons)
    │   ├── Tasks
    │   │   ├── react-hot-toast (Notifications)
    │   │   └── react-icons (Icons)
    │   ├── Schedule
    │   │   ├── date-fns (Date Handling)
    │   │   └── jspdf (PDF Export)
    │   └── Theme
    │       └── styled-components (Styling)
    └── TailwindCSS (Styling)
```

---

## Installation Order

### Backend
```bash
# Core dependencies install in parallel
npm install express mongoose dotenv

# Security layer
npm install bcryptjs jsonwebtoken helmet cors

# Validation & rate limiting
npm install joi express-validator express-rate-limit rate-limiter-flexible

# Utilities
npm install nodemailer date-fns

# Development
npm install --save-dev nodemon
```

### Frontend
```bash
# React core
npm install react react-dom react-router-dom

# Build tool & plugins
npm install --save-dev vite @vitejs/plugin-react

# Styling
npm install --save-dev tailwindcss postcss autoprefixer
npm install styled-components

# HTTP & State
npm install axios

# UI Libraries
npm install lucide-react react-icons framer-motion react-hot-toast

# Charts & Data Visualization
npm install chart.js react-chartjs-2 recharts

# Utilities
npm install jspdf jspdf-autotable validator
```

---

## Version Compatibility

### Node.js Requirements
- **Minimum**: Node.js 18.x
- **Recommended**: Node.js 20.x or 22.x ✅ (Current: 22.23.3)
- **npm**: 9.x or 10.x

### React Requirements
- **React**: 18.2.0+
- **React DOM**: 18.2.0+
- **Modern browsers**: ES6+ support

### MongoDB Requirements
- **MongoDB**: 5.0+ or 6.0+
- **Mongoose**: 7.5.0+

---

## Security Dependencies

### Backend Security Stack
1. **helmet**: 7.0.0 - HTTP security headers
2. **bcryptjs**: 2.4.3 - Password hashing
3. **jsonwebtoken**: 9.0.2 - Token authentication
4. **express-rate-limit**: 8.2.1 - Rate limiting
5. **rate-limiter-flexible**: 2.4.2 - Advanced rate limiting
6. **cors**: 2.8.5 - CORS protection
7. **joi**: 18.0.2 - Input validation
8. **express-validator**: 7.0.1 - Request validation

### Security Features Provided
- ✅ Password hashing (bcrypt 10 rounds)
- ✅ JWT token authentication
- ✅ HTTP security headers (15+ headers)
- ✅ Rate limiting (100 req/15min)
- ✅ CORS protection
- ✅ Input validation & sanitization
- ✅ XSS protection
- ✅ SQL injection prevention (NoSQL via Mongoose)

---

## Optional Dependencies

### Not Currently Used (But May Be Useful)

#### Backend
```json
"compression": "^1.7.4"           // Gzip compression
"winston": "^3.11.0"              // Advanced logging
"morgan": "^1.10.0"               // HTTP request logger
"multer": "^1.4.5-lts.1"         // File upload handling
"socket.io": "^4.6.0"            // Real-time communication
"redis": "^4.6.0"                 // Caching layer
"swagger-jsdoc": "^6.2.8"        // API documentation
"swagger-ui-express": "^5.0.0"   // API documentation UI
```

#### Frontend
```json
"react-query": "^5.0.0"          // Server state management
"zustand": "^4.4.0"              // Client state management
"formik": "^2.4.0"               // Form management
"yup": "^1.3.0"                  // Schema validation
"react-table": "^8.0.0"          // Advanced tables
"react-datepicker": "^4.21.0"   // Date picker
"socket.io-client": "^4.6.0"    // Real-time client
```

---

## Dependency Sizes (Approximate)

### Backend (Production)
- Total: ~50 MB
- Largest: mongoose (~15 MB)
- Smallest: dotenv (~100 KB)

### Frontend (Production Build)
- Total bundle: ~800 KB (gzipped)
- Vendor chunk: ~600 KB
- Application code: ~200 KB

### Development (node_modules)
- Backend: ~150 MB
- Frontend: ~350 MB
- Total: ~500 MB

---

## Update Strategy

### Check for Updates
```bash
# Check outdated packages
npm outdated

# Update all packages (use with caution)
npm update

# Update specific package
npm update <package-name>
```

### Major Version Updates
⚠️ **Test thoroughly before updating major versions**

1. Review changelog
2. Check breaking changes
3. Update in development first
4. Run all tests
5. Deploy to staging
6. Monitor for issues

---

## Troubleshooting Dependencies

### Clear Cache & Reinstall
```bash
# Backend
cd full-stackauthentication
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Frontend
cd frontendauth
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Dependency Conflicts
```bash
# View dependency tree
npm list

# View specific package
npm list <package-name>

# Fix audit issues
npm audit fix
```

### Platform-Specific Issues
- **Windows**: Use PowerShell or cmd, not Git Bash
- **macOS/Linux**: May need `sudo` for global installs
- **Node-gyp errors**: Install build tools (`npm install --global windows-build-tools` on Windows)

---

## Production Considerations

### Backend
- Use production MongoDB cluster
- Set `NODE_ENV=production`
- Enable compression middleware
- Set up process manager (PM2)
- Configure logging (Winston)
- Set up monitoring (New Relic, DataDog)

### Frontend
- Build for production: `npm run build`
- Serve with CDN
- Enable caching headers
- Use environment variables for API URLs
- Implement error tracking (Sentry)
- Set up analytics (Google Analytics)

---

**Last Updated**: October 2026
**Node.js Version**: 22.23.3
**npm Version**: Check with `npm --version`
