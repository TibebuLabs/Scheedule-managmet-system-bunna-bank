# Error Handling Guide

This document describes the error handling system for the Bunna Bank Schedule Management System. All API endpoints follow a consistent error response format with user-friendly messages, machine-readable error codes, and appropriate HTTP status codes.

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Human-readable message",
  "code": "ERROR_CODE",
  "status": 400,
  "timestamp": "2024-10-22T15:30:45.123Z",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": null
    }
  ]
}
```

**Fields:**
- `success`: Always `false` for error responses
- `message`: User-friendly message (safe to display in UI)
- `code`: Machine-readable error code for frontend conditional logic
- `status`: HTTP status code
- `timestamp`: ISO 8601 timestamp for traceability
- `errors`: (Optional) Array of field-level validation errors

---

## Error Codes Reference

### Authentication Errors (400–401)

| Code | Status | Message | Cause | Action |
|------|--------|---------|-------|--------|
| MISSING_CREDENTIALS | 400 | Missing required fields | Email or password not provided | Provide both email and password |
| INVALID_CREDENTIALS | 401 | Invalid email or password | Email/password mismatch | Verify credentials and try again |
| DUPLICATE_FIELD | 409 | Email already registered | Email exists in database | Use a different email or log in |
| VALIDATION_ERROR | 400 | Validation failed | Field validation failed (e.g., invalid email format, weak password) | Fix errors shown per field and resubmit |
| ACCOUNT_DEACTIVATED | 403 | Your account has been deactivated | Admin disabled the account | Contact your administrator |
| NO_TOKEN | 401 | No authorization token provided | Token missing from Authorization header | Include `Authorization: Bearer <token>` header |
| TOKEN_EXPIRED | 401 | Your session has expired | JWT token expired | Log in again to get a new token |
| INVALID_TOKEN | 401 | Invalid or malformed token | JWT signature invalid or malformed | Log in again |
| AUTH_FAILED | 401 | Authentication failed | Catch-all auth error (usually token issue) | Log in again |
| USER_NOT_FOUND | 404 | User not found | User ID in token no longer exists | Log in again (administrator may have deleted account) |
| REGISTRATION_ERROR | 500 | Registration failed | Unexpected server error during registration | Try again; contact support if persists |
| LOGIN_ERROR | 500 | Login failed | Unexpected server error during login | Try again; contact support if persists |

### Rate Limiting (429)

| Code | Status | Message | Cause | Action |
|------|--------|---------|-------|--------|
| RATE_LIMIT_EXCEEDED | 429 | Too many requests. Please try again in a few minutes. | Too many API calls within time window | Wait 15 minutes and retry |

**Limits:**
- Auth endpoints (`/api/auth/*`): 10 requests per 15 minutes (strict to prevent brute force)
- General API: 100 requests per 15 minutes

### Task Errors (400–500)

| Code | Status | Message | Cause | Action |
|------|--------|---------|-------|--------|
| VALIDATION_ERROR | 400 | Validation failed | Task field validation failed (e.g., missing title, invalid deadline) | Fix errors shown per field and resubmit |
| INVALID_ID | 400 | Invalid task ID | Task ID is not a valid MongoDB ObjectId | Use a valid task ID |
| TASK_NOT_FOUND | 404 | Task not found | Task ID does not exist | Verify the task ID and try again |

### Staff Errors (400–500)

| Code | Status | Message | Cause | Action |
|------|--------|---------|-------|--------|
| VALIDATION_ERROR | 400 | Validation failed | Staff field validation failed | Fix errors shown per field and resubmit |
| INVALID_ID | 400 | Invalid staff member ID | ID is not a valid MongoDB ObjectId | Use a valid staff ID |
| STAFF_NOT_FOUND | 404 | Staff member not found | Staff ID does not exist | Verify the staff ID and try again |

### Server Errors (500)

| Code | Status | Message | Cause | Action |
|------|--------|---------|-------|--------|
| SERVER_ERROR | 500 | An unexpected error occurred | Unhandled exception or database error | Contact support; include the timestamp from the error response |

### Network & Client Errors

| Code | Status | Message | Cause | Frontend Handling |
|------|--------|---------|-------|-------------------|
| NETWORK_ERROR | N/A | Network error. Please check your connection. | No internet connection or backend unreachable | Show offline message; user can retry |
| REQUEST_ERROR | N/A | Request setup failed | Malformed request or CORS issue | Contact support; likely a frontend code issue |

---

## HTTP Status Code Guide

| Status | Meaning | Common Codes |
|--------|---------|--------------|
| 400 | Bad Request | VALIDATION_ERROR, MISSING_CREDENTIALS, INVALID_ID |
| 401 | Unauthorized | INVALID_CREDENTIALS, NO_TOKEN, TOKEN_EXPIRED, INVALID_TOKEN, AUTH_FAILED |
| 403 | Forbidden | ACCOUNT_DEACTIVATED |
| 404 | Not Found | USER_NOT_FOUND, TASK_NOT_FOUND, STAFF_NOT_FOUND |
| 409 | Conflict | DUPLICATE_FIELD |
| 429 | Too Many Requests | RATE_LIMIT_EXCEEDED |
| 500 | Server Error | SERVER_ERROR, REGISTRATION_ERROR, LOGIN_ERROR |

---

## Validation Error Details

When validation fails (e.g., during registration), the `errors` array includes field-level information:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "status": 400,
  "timestamp": "2024-10-22T15:30:45.123Z",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters",
      "value": "pass123"
    }
  ]
}
```

Frontend should display these errors under their respective form fields.

---

## Common Troubleshooting

### "Your session has expired" (TOKEN_EXPIRED)
- **Cause**: JWT token validity period exceeded (default 7 days)
- **Fix**: Log in again
- **Note**: There is no automatic token refresh; users must log in again upon expiry

### "Invalid email or password" (INVALID_CREDENTIALS)
- **Cause**: Email and password do not match, or email not registered
- **Fix**: Check that you entered your email correctly; verify the password is correct
- **Tip**: If you forgot your password, use the password reset feature (if available)

### "Email already registered" (DUPLICATE_FIELD)
- **Cause**: Account already exists with that email
- **Fix**: Log in with that email, or use a different email to register a new account

### "Validation failed" with field errors (VALIDATION_ERROR)
- **Cause**: Form data does not meet requirements (invalid format, too short, missing field, etc.)
- **Fix**: Read the error message for each field and correct your input before resubmitting

### "Too many requests" (RATE_LIMIT_EXCEEDED)
- **Cause**: Made more than 10 auth requests in 15 minutes (or 100 general API requests in 15 minutes)
- **Fix**: Wait 15 minutes, then retry; avoid refreshing rapidly
- **Prevent**: Don't attempt login/registration more than a few times; ask for help instead

### "Your account has been deactivated" (ACCOUNT_DEACTIVATED)
- **Cause**: An administrator disabled your account
- **Fix**: Contact your administrator or Bunna Bank support

### "Network error" (NETWORK_ERROR)
- **Cause**: Backend is unreachable (no internet, server down, etc.)
- **Fix**: Check your internet connection; verify the backend is running; try again in a moment
- **If persists**: Server may be down; contact support

### "An unexpected error occurred" (SERVER_ERROR)
- **Cause**: Unhandled exception or database error
- **Fix**: Try again; if the error persists, contact support and include the timestamp shown in the error
- **For Admins**: Check backend logs (Render dashboard or local server console) for the timestamp to find the root cause

---

## Development vs. Production Error Responses

### Development Mode (NODE_ENV=development)

Error responses include stack traces and detailed error information:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "status": 400,
  "error": {
    "message": "...",
    "stack": "Error: ...\n    at ...",
    "name": "ValidationError"
  }
}
```

**Use in:** Local development, debugging, internal testing

### Production Mode (NODE_ENV=production)

Error responses are sanitized; no stack traces or internal details are shown:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "status": 400,
  "timestamp": "2024-10-22T15:30:45.123Z"
}
```

**Use in:** Render, live deployments, production environments

---

## Deployment Configuration

### Setting NODE_ENV on Render

1. Go to your Render backend service dashboard
2. Navigate to **Settings** → **Environment**
3. Add or update the environment variable:
   - **Key**: `NODE_ENV`
   - **Value**: `production`
4. Click **Save**; your service will redeploy

### Required Environment Variables Checklist

Before deploying to production, verify all of these are set in your Render backend environment:

- [ ] `PORT` — Server port (default: 5000)
- [ ] `NODE_ENV` — Set to `production`
- [ ] `MONGODB_URI` — MongoDB Atlas connection string with credentials
- [ ] `JWT_SECRET` — Strong random string, minimum 32 characters (generated locally)
- [ ] `JWT_EXPIRE` — Token expiry (default: `7d`)
- [ ] `FRONTEND_URL` — HTTPS URL of deployed frontend (for CORS)
- [ ] `EMAIL_USER` — Gmail app password email
- [ ] `EMAIL_PASSWORD` — Gmail app password (not your Gmail password)
- [ ] `EMAIL_FROM` — Display name and email for sent emails

### Email Configuration for Production

If you want staff to receive task notifications in production:

1. Set `EMAIL_USER` and `EMAIL_PASSWORD` in Render environment
2. On startup, the server will log: ✅ Email service enabled
3. If these are missing, the server will log: ⚠️ Email service disabled
4. Check the dashboard for a banner indicating email is down (if implemented)

If email credentials are not configured, task notifications will fail silently. Staff will not receive emails and won't know why. Implement a dashboard banner or add a warning to the admin console.

---

## Testing Error Scenarios

To verify error handling is working:

### Test Rate Limiting
```bash
for i in {1..15}; do curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{}'; done
```
Should return RATE_LIMIT_EXCEEDED after 10 requests.

### Test Validation Error
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid"}'
```
Should return VALIDATION_ERROR with field-level errors.

### Test Duplicate Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"existing@example.com","password":"Pass123!","firstName":"Test","lastName":"User","phone":"1234567890"}'
```
If email already registered, should return DUPLICATE_FIELD.

### Test Invalid Token
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid_token"
```
Should return INVALID_TOKEN.

### Test Missing Token
```bash
curl -X GET http://localhost:5000/api/auth/profile
```
Should return NO_TOKEN.

---

## Security Notes

- **NoSQL Injection Protection**: All request bodies are sanitized via `express-mongo-sanitize`, which strips `$` and `.` characters. Malicious operators like `{"email":{"$gt":""}}` will not work.
- **Password Hashing**: All passwords are hashed with bcryptjs before storage and comparison. Plaintext passwords are never logged or returned.
- **Rate Limiting**: Auth endpoints are strictly limited to prevent brute force attacks. General API is limited to prevent abuse.
- **CORS**: Only whitelisted frontend URLs can access the API. Cross-origin requests from unknown domains will fail.
- **Error Messages**: Production error messages don't leak stack traces, file paths, or internal details.
- **JWT Secret**: The startup log warns if JWT_SECRET is shorter than 32 characters or using the default value. Use a strong random secret in production.

---

## Monitoring & Logging

All errors are logged to the server console with timestamps. In production (Render), check the logs via:

1. Render dashboard → Your service → **Logs**
2. Search for `ERROR`, `⚠️`, or `💥` to find error entries
3. Use the timestamp from the error response to locate the corresponding log

**Example log entries:**
```
⚠️ WARNING: Email service disabled (no credentials configured)
💥 Uncaught Exception: Error: listen EADDRINUSE
[2024-10-22 15:30:45] ERROR Duplicate key error: {email: "test@example.com"}
```

---

## Contact & Support

For issues not covered here:
- **Development**: Check the backend console logs for detailed error messages and stack traces
- **Production**: Check Render logs; contact support with the error timestamp
- **Code Issues**: See the error code and stack trace in development logs to debug

---

**Last Updated**: October 2024  
**Error Handling System Version**: 1.0
