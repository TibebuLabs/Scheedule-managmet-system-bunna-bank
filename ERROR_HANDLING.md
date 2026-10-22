# Error Handling Guide - Bunna Bank Schedule Management System

This document describes all error codes, status codes, and troubleshooting steps for the Schedule Management System.

## Overview

The API uses structured error responses with a consistent format:

```json
{
  "success": false,
  "message": "User-friendly error message",
  "code": "ERROR_CODE_CONSTANT",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message",
      "value": "the_value_that_failed"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

All responses include a `code` property for programmatic error handling and a `message` property for user display.

---

## Authentication Errors

### NO_TOKEN (401)

**Cause**: Authorization header not provided or empty  
**User Message**: Authentication required. Please log in.  
**How to Fix**:
- Ensure your application is attaching the Authorization header: `Authorization: Bearer <token>`
- Check that the token is stored correctly in localStorage
- Log in again to get a fresh token

**Example**:
```
GET /api/auth/profile
→ Response: { code: "NO_TOKEN", message: "Not authorized to access this route" }
```

### INVALID_TOKEN (401)

**Cause**: Token is malformed, tampered, or signed with wrong key  
**User Message**: Your session is invalid. Please log in again.  
**How to Fix**:
- Clear browser cache and localStorage
- Log in again to get a fresh token
- Verify backend JWT_SECRET hasn't changed
- Check for network proxies that might modify headers

**Example**:
```
GET /api/auth/profile
Header: Authorization: Bearer invalid.token.here
→ Response: { code: "INVALID_TOKEN", message: "Invalid token" }
```

### TOKEN_EXPIRED (401)

**Cause**: Token has passed its expiration time (default 7 days)  
**User Message**: Your session has expired. Please log in again.  
**How to Fix**:
- Log in again to get a fresh token
- Tokens expire after 7 days; the frontend automatically redirects to login
- Plan for longer workflows: implement refresh tokens in future versions

**Example**:
```
GET /api/auth/profile
Header: Authorization: Bearer eyJhbGc... (token from 8 days ago)
→ Response: { code: "TOKEN_EXPIRED", message: "Token has expired. Please login again", expiredAt: "2024-01-08T..." }
```

### ACCOUNT_DEACTIVATED (403)

**Cause**: User account has been deactivated by administrator  
**User Message**: Your account has been deactivated. Please contact your administrator.  
**How to Fix**:
- Contact your administrator to reactivate your account
- Check if you've violated bank policies
- Verify you're using the correct account

**Example**:
```
POST /api/auth/login
Body: { email: "user@bank.com", password: "..." }
→ Response: { code: "ACCOUNT_DEACTIVATED", message: "Account is deactivated" }
```

### AUTH_FAILED (401)

**Cause**: General authentication verification failed  
**User Message**: Authentication failed. Please try again.  
**How to Fix**:
- Log in again
- Clear localStorage and cache
- Try in an incognito/private browser window
- Check network connectivity

### AUTH_SERVER_ERROR (500)

**Cause**: Unexpected error during authentication process  
**User Message**: Server error during authentication. Please try again later.  
**How to Fix**:
- Try again in a few moments
- Contact support if error persists
- Check server logs: `tail -f server.log`

---

## Login & Registration Errors

### MISSING_CREDENTIALS (400)

**Cause**: Email or password field is empty or not provided  
**User Message**: Please provide both email and password  
**How to Fix**:
- Enter your email address
- Enter your password
- Don't leave fields blank

### INVALID_CREDENTIALS (401)

**Cause**: Email doesn't exist or password is incorrect  
**User Message**: Invalid email or password. Please try again.  
**How to Fix**:
- Verify your email address is correct (check for typos)
- Verify your password is correct (note: passwords are case-sensitive)
- Use "Forgot Password" if available to reset
- Create a new account if you haven't registered yet

### DUPLICATE_FIELD (409)

**Cause**: Email or phone already registered in system  
**User Message**: This email or phone number is already registered  
**How to Fix**:
- If it's your account, log in instead of registering
- If you forgot your password, use password reset
- Use a different email or phone number
- Contact support if you believe this is an error

**Example**:
```
POST /api/auth/register
Body: { email: "existing@bank.com", ... }
→ Response: { code: "DUPLICATE_FIELD", field: "email", message: "email already exists" }
```

### REGISTRATION_ERROR (500)

**Cause**: Server error during registration  
**User Message**: Registration failed. Please try again later.  
**How to Fix**:
- Try registering again in a few moments
- Check your internet connection
- Try a different browser
- Contact support if error continues

### LOGIN_ERROR (500)

**Cause**: Server error during login  
**User Message**: Login failed. Please try again later.  
**How to Fix**:
- Try logging in again
- Check your internet connection
- Try a different browser
- Contact support if error continues

---

## Validation Errors

### VALIDATION_ERROR (400)

**Cause**: Form field validation failed (common on registration and task creation)  
**User Message**: Please check the form fields and try again  
**Field-Level Errors**:
The response includes an `errors` array with specific failures:

```json
{
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must contain at least 1 uppercase letter",
      "value": ""
    }
  ]
}
```

**Common Validation Rules**:

| Field | Rule | Example Error |
|-------|------|----------------|
| **First Name** | 2+ characters, required | "First name must be at least 2 characters" |
| **Last Name** | 2+ characters, required | "Last name must be at least 2 characters" |
| **Email** | Valid email format, required | "Please enter a valid email address" |
| **Phone** | 9-15 digits, required | "Please enter a valid phone number (9-15 digits)" |
| **Password** | 8+ chars, uppercase, lowercase, number, symbol | "Password must contain uppercase, lowercase, number, and symbol" |
| **Confirm Password** | Must match password | "Passwords do not match" |

**How to Fix**:
- Read the specific error message for each field
- Correct the field value according to the rule
- Re-submit the form

---

## Email Service Errors

### EMAIL_DISABLED (503)

**Cause**: Email service not configured or credentials missing  
**User Message**: Email service is currently unavailable. Notifications cannot be sent.  
**How to Fix** (Admin):
1. Check backend `.env` file has EMAIL_USER and EMAIL_PASSWORD set:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

2. Restart backend server:
   ```bash
   npm start
   ```

3. Test email service:
   ```bash
   curl http://localhost:5000/api/email/check
   ```

4. Verify Gmail app password (must use app-specific password, not account password):
   - Visit: https://myaccount.google.com/apppasswords
   - Generate new app password for "Mail" on "Windows" (or your platform)
   - Copy the 16-character password (remove spaces)
   - Paste into EMAIL_PASSWORD in .env

5. Staff won't receive schedule notifications until this is fixed

**Frontend Display**:
- Dashboard may show banner: "Email notifications are disabled"
- Schedule notifications won't be sent to assigned staff
- System continues to function; email is optional

---

## Rate Limiting

### RATE_LIMIT_EXCEEDED (429)

**Cause**: Too many requests from this IP in short time period  
**User Message**: Too many requests. Please wait a few minutes before trying again.  
**Rate Limits**:
- Auth endpoints (login, register): 10 requests per 15 minutes per IP
- General API: 100 requests per 15 minutes per IP

**How to Fix**:
- Wait 15 minutes before trying again
- Don't retry immediately; wait between attempts
- Check for automated tools/scripts making duplicate requests
- If you're behind a proxy/VPN, requests from multiple devices might hit same IP limit

---

## Network & Client Errors

### NETWORK_ERROR (0)

**Cause**: Cannot connect to server  
**User Message**: Network error. Please check your connection and try again.  
**How to Fix**:
- Check internet connection
- Verify backend server is running: `npm start`
- Check backend server port (default 5000): `http://localhost:5000`
- Check CORS configuration if frontend is on different origin
- Try accessing from same machine to isolate network vs CORS issue

### REQUEST_ERROR (400)

**Cause**: Malformed request or invalid data  
**User Message**: Error processing your request. Please try again.  
**How to Fix**:
- Verify all required fields are included
- Check data types (numbers vs strings)
- Verify JSON is valid if sending JSON body
- Check Content-Type header is `application/json`

---

## Server Errors

### SERVER_ERROR (500)

**Cause**: Unexpected server error  
**User Message**: Server error. Our team has been notified. Please try again later.  
**How to Fix**:
- Try the operation again in a few moments
- Check server logs for details: `tail -f app.log` (if using logging)
- Contact backend administrator
- Check that database is connected: `MongoDB connected successfully`

---

## Troubleshooting Guide

### "Registration failed" with no specific field errors

1. Check browser console for error details
2. Verify all fields are filled
3. Check that email follows format: `user@domain.com`
4. Check that password meets complexity: 8+ chars, uppercase, lowercase, number, symbol
5. Check browser network tab for actual response from backend

### "Login failed" but credentials seem correct

1. Verify email spelling (case-insensitive but check domain)
2. Verify password is correct (case-sensitive)
3. Check caps lock is off
4. Try copy-pasting password from secure password manager
5. Try registration with different email if this email is unknown

### "Too many login attempts" error

1. Wait 15 minutes before trying again
2. Try from different IP/network if available
3. Don't refresh page repeatedly while waiting
4. Contact administrator if you continue to see this after waiting

### Email notifications not being sent

1. Check dashboard for email service disabled banner
2. Admin: verify EMAIL_USER and EMAIL_PASSWORD in .env
3. Admin: restart backend: `npm start`
4. Admin: test email service: `curl http://localhost:5000/api/email/check`
5. Check staff email addresses are valid

### "Session expired" after short time

1. Default token lifespan is 7 days
2. Log in again to get new token
3. Check server time is correct (system clock skew can cause premature expiry)

### CORS errors when accessing from frontend

1. Verify backend CORS allows your frontend origin
2. Check `FRONTEND_URL` environment variable on backend
3. Check browser console for origin being blocked
4. For localhost development:
   - Frontend on http://localhost:3000
   - Backend CORS should allow this origin
5. For production (Render):
   - Verify both frontend and backend URLs match deployed URLs

---

## HTTP Status Codes Reference

| Status | Code | Meaning |
|--------|------|---------|
| 200 | OK | Request succeeded |
| 201 | CREATED | Resource created successfully |
| 400 | Bad Request | Validation or client error |
| 401 | Unauthorized | Authentication required or invalid/expired |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate or conflicting resource |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected server error |
| 503 | Service Unavailable | Service temporarily unavailable (email disabled) |

---

## For Developers

### Testing Error Scenarios

```bash
# Test missing token
curl http://localhost:5000/api/auth/profile
# Expected: { code: "NO_TOKEN", httpStatus: 401 }

# Test invalid credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
# Expected: { code: "INVALID_CREDENTIALS", httpStatus: 401 }

# Test validation error
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","email":"invalid"}'
# Expected: { code: "VALIDATION_ERROR", errors: [...], httpStatus: 400 }

# Test rate limiting (run 11 times rapidly)
for i in {1..11}; do curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}'; done
# Expected on 11th: { code: "RATE_LIMIT_EXCEEDED", httpStatus: 429 }
```

### Adding New Error Codes

1. Add entry to `full-stackauthentication/config/ERROR_CODES.json`
2. Use same code in all relevant files (controllers, middleware, services)
3. Frontend can import and use codes from JSON for consistency
4. Update this documentation with description and fix steps

### Error Code Naming Convention

- Use UPPERCASE_SNAKE_CASE
- Be specific (e.g., TOKEN_EXPIRED not INVALID_TOKEN)
- Include error severity in message structure
- Use consistent codes across codebase

---

## Support & Escalation

**For Users**:
- Check this documentation first
- Email: support@bunnabank.com
- Internal IT: ext. 2267834

**For Admins**:
- Check server logs: `tail -f server.log`
- Check email service config: `curl http://localhost:5000/api/email/check`
- Check database connection in startup logs
- Review error code in ERROR_CODES.json for context

**For Developers**:
- Use ERROR_CODES.json for consistency
- Log with context (user ID, operation, timestamp)
- Return appropriate HTTP status code with error code
- Include field-level errors for validation failures
- Document new error codes in this file

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial documentation; all error codes documented |

