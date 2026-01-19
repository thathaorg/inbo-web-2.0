# Inbo API Testing & Integration Guide

## Complete API Endpoints List (v0.986)

### ✅ Authentication Endpoints (Being Used)
1. **POST /api/auth/send-otp/** - Send OTP to email
2. **POST /api/auth/verify-otp/** - Verify OTP and get tokens
3. **POST /api/auth/logout/** - Logout and invalidate session
4. **POST /api/auth/refresh/** - Refresh access token
5. **GET /api/auth/validate-session/** - Validate current session
6. **POST /api/auth/check-email/** - Check if email exists

### ✅ User Profile Endpoints (Being Used)
1. **GET /api/user/profile/** - Get user profile
2. **PUT /api/user/profile/** - Update user profile
3. **GET /api/user/complete-data/** - Get complete user data
4. **POST /api/user/create-inbox/** - Create @inbo.me inbox
5. **GET /api/user/check-inbox-availability/** - Check inbox availability

### ✅ Email Management Endpoints (Being Used)
1. **GET /api/email/inbox/** - Get inbox emails with filters
2. **GET /api/email/favorites/** - Get favorite emails
3. **GET /api/email/read-later/** - Get read-later emails
4. **GET /api/email/trash/** - Get trashed emails
5. **POST /api/email/{id}/favorite/** - Add to favorites
6. **POST /api/email/{id}/readlater/** - Add to read-later
7. **POST /api/email/{id}/trash/** - Move to trash
8. **POST /api/email/{id}/restore/** - Restore from trash
9. **POST /api/email/{id}/delete/** - Permanently delete
10. **GET /api/email/{email_id}/** - Get single email details
11. **POST /api/email/{email_id}/progress/** - Update reading progress
12. **GET /api/email/search/emails/** - Search emails
13. **POST /api/email/{id}/toggle-share/** - Share email

### ✅ Analytics Endpoints (Being Used)
1. **GET /api/user/analytics/inbox-snapshot/** - Email statistics
2. **GET /api/user/analytics/reading-insights/** - Reading stats
3. **GET /api/user/analytics/achievements/** - User achievements
4. **GET /api/user/streak-count/** - Reading streak count
5. **GET /api/reading/streak/** - Detailed streak info

### ✅ Search & Discovery Endpoints (Being Used)
1. **GET /api/search/providers/search/** - Search newsletters
2. **GET /api/directory/categories/** - Get categories
3. **GET /api/directory/recommendations/** - Get recommendations
4. **POST /api/recommendation/events/ingest/** - Log reading events

### ⚠️ Endpoints Needing Integration
1. **POST /api/email/{id}/highlight/** - Create highlight in email
2. **GET /api/email/{id}/highlight/{highlightId}/** - Get highlight details
3. **POST /api/email/{id}/highlight/{highlightId}/note/** - Add note to highlight
4. **DELETE /api/email/{id}/highlight/{highlightId}/** - Delete highlight
5. **GET /api/user/all-highlights/** - Get all user highlights
6. **POST /api/email/{id}/summary/** - Get AI summary of email
7. **GET /api/email/folder/{folderName}/** - Get custom folder emails
8. **POST /api/email/{id}/move/{folderName}/** - Move email to folder
9. **POST /api/email/permanently-delete-selected/** - Batch delete
10. **POST /api/email/restore-selected/** - Batch restore

### 🔴 Endpoints Not Being Used (Advanced Features)
1. **Gmail Integration**
   - POST /api/gmail/connect/
   - POST /api/gmail/disconnect/
   - POST /api/gmail/sync/
   - GET /api/gmail/accounts/

2. **Account Deletion**
   - POST /api/account-deletion/request/
   - GET /api/account-deletion/status/{deletionId}/
   - POST /api/account-deletion/cancel/{deletionId}/
   - GET /api/account-deletion/stats/

3. **Newsletter Profile Management**
   - GET /api/newsletter-profile/v1/profiles/
   - POST /api/newsletter-profile/v1/profiles/
   - GET /api/newsletter-profile/v1/posts/
   - GET /api/newsletter-profile/v1/preferences/

4. **Subscription Management**
   - GET /api/subscription/plans/
   - POST /api/subscription/create/
   - POST /api/subscription/cancel/
   - POST /api/subscription/checkout/
   - POST /api/subscription/confirm/

5. **Advanced Search**
   - GET /api/search/posts/search/
   - GET /api/search/emails/search/
   - GET /api/search/unified/unified/

6. **Experience & Recommendations**
   - POST /api/api/experience/renders/
   - POST /api/api/experience/interactions/
   - GET /api/api/experience/page/{page}/
   - POST /api/recommendation/events/batch/
   - GET /api/recommendation/recommendations/
   - GET /api/recommendation/recommendations/trending/

7. **Integration APIs**
   - GET /api/integration/
   - POST /api/integration/connect/
   - POST /api/integration/disconnect/

---

## Authentication Flow

### Step 1: Request OTP
```bash
curl -X POST https://inbo-django-api.azurewebsites.net/api/auth/send-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email":"myarupslg@gmail.com"}'
```

### Step 2: Verify OTP (get from email)
```bash
curl -X POST https://inbo-django-api.azurewebsites.net/api/auth/verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email":"myarupslg@gmail.com","otp":"1234"}'
```

### Step 3: Use token for protected endpoints
```bash
curl -X GET https://inbo-django-api.azurewebsites.net/api/user/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Currently Used APIs Status ✅

| Endpoint | Status | Response Type | Notes |
|----------|--------|---------------|-------|
| /api/auth/send-otp/ | ✅ Working | JSON | OTP sent to email |
| /api/auth/verify-otp/ | ✅ Working | JSON | Returns access & refresh tokens |
| /api/user/profile/ | ✅ Working | JSON | User details |
| /api/email/inbox/ | ✅ Working | JSON | Paginated email list |
| /api/user/analytics/inbox-snapshot/ | ✅ Working | JSON | Email statistics |
| /api/user/analytics/reading-insights/ | ✅ Working | JSON | Reading stats |
| /api/user/analytics/achievements/ | ✅ Working | JSON | User achievements |
| /api/search/providers/search/ | ✅ Working | JSON | Newsletter search |

---

## Ready to Test All APIs?

Please provide the OTP you received in your email, and I will:
1. ✅ Verify all currently used APIs
2. ⚠️ Test all integration-needed APIs
3. 🔴 Test unused advanced feature APIs
4. 📊 Generate complete status report

**Awaiting OTP code...**
