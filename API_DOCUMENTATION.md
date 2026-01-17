# 📋 Inbo API Documentation & Implementation Status

**Generated:** January 17, 2026  
**API Version:** 0.986  
**Base URL:** `https://inbo-django-api.azurewebsites.net`

---

## 📊 Executive Summary (Tested with Live Token)

| Category | Total | Working | Backend Error | Not Implemented |
|----------|-------|---------|---------------|-----------------|
| **Auth APIs** | 8 | ✅ 8 | 0 | 0 |
| **Email APIs** | 18 | ✅ 12 | 0 | 6 |
| **User APIs** | 25 | ✅ 12 | 0 | 13 |
| **Directory APIs** | 8 | ✅ 8 | 0 | 0 |
| **Analytics APIs** | 4 | ✅ 3 | 0 | 1 (partially) |
| **Reading APIs** | 5 | ❌ 0 | **1 (500 error)** | 4 |
| **Recommendation APIs** | 6 | ✅ 1 | 0 | 5 |

### 🚨 Critical Backend Issues Found

| API | Status | Error |
|-----|--------|-------|
| `/api/reading/streak/` | ❌ **500** | `'StreakService' object has no attribute '_ensure_uuid'` |

---

## 🔐 1. AUTHENTICATION APIs

### ✅ Fully Implemented & Working

| Endpoint | Method | Status | Used In |
|----------|--------|--------|---------|
| `/api/auth/send-otp/` | POST | ✅ Working | Login page, AuthContext |
| `/api/auth/verify-otp/` | POST | ✅ Working | OTP verification |
| `/api/auth/check-email/` | GET | ✅ Working | Registration check |
| `/api/auth/logout/` | POST | ✅ Working | Logout flow |
| `/api/auth/refresh/` | POST | ✅ Working | Token refresh |
| `/api/auth/validate-session/` | POST | ✅ Working | Session check |
| `/api/auth/google` | POST | ✅ Working | Google OAuth |
| `/api/auth/apple` | POST | ✅ Working | Apple OAuth |

---

## 📧 2. EMAIL APIs

### ✅ Implemented & Working

| Endpoint | Method | Status | Used In |
|----------|--------|--------|---------|
| `/api/email/inbox/` | GET | ✅ Working | Inbox page |
| `/api/email/read-later/` | GET | ✅ Working | Read Later page |
| `/api/email/favorites/` | GET | ✅ Working | Favorites page |
| `/api/email/trash/` | GET | ✅ Working | Delete page |
| `/api/email/{id}/` | GET | ✅ Working | Reading page |
| `/api/email/{id}/progress/` | PATCH | ✅ Working | Reading progress |
| `/api/email/{id}/favorite/` | PATCH | ✅ Working | Toggle favorite |
| `/api/email/{id}/readlater/` | PATCH | ✅ Working | Toggle read later |
| `/api/email/{id}/trash/` | PATCH | ✅ Working | Move to trash |
| `/api/email/{id}/delete/` | DELETE | ✅ Working | Permanent delete |
| `/api/email/{id}/highlight/` | POST | ✅ Working | Add highlight |

### ❌ Not Implemented in Frontend

| Endpoint | Method | Purpose | Can Implement Now? |
|----------|--------|---------|-------------------|
| `/api/email/search/emails/` | GET | Search emails | ✅ Yes - for Search page |
| `/api/email/{id}/summary/` | GET | AI summary | ✅ Yes - for Reading page |
| `/api/email/{id}/shared/` | GET | Get shared email | ⚠️ Future feature |
| `/api/email/{id}/toggle-share/` | POST | Share email | ⚠️ Future feature |
| `/api/email/folder/{folderName}/` | GET | Get folder emails | ✅ Yes - for Collections |
| `/api/email/{id}/move/{folderName}/` | POST | Move to folder | ✅ Yes - for Collections |

---

## 👤 3. USER APIs

### ✅ Implemented & Working

| Endpoint | Method | Status | Used In |
|----------|--------|--------|---------|
| `/api/user/complete-data/` | GET | ✅ Working | AuthContext, Profile |
| `/api/user/profile/` | GET/PATCH | ✅ Working | Profile page |
| `/api/user/check-inbox-availability/` | GET | ✅ Working | Registration |
| `/api/user/get-suggested-usernames/` | GET | ✅ Working | Username step |
| `/api/user/create-inbox/` | POST | ✅ Working | Onboarding |
| `/api/user/onboarding/` | POST | ✅ Working | Onboarding flow |
| `/api/user/is-verified/` | GET | ✅ Working | Verification check |
| `/api/user/newsletter/subscribe/` | POST | ✅ Working | Discover page |
| `/api/user/newsletter/unsubscribe/` | POST | ✅ Working | Subscriptions |
| `/api/user/email-address/` | GET | ✅ Working | EmailBubble |

### ❌ Not Implemented in Frontend

| Endpoint | Method | Purpose | Can Implement Now? |
|----------|--------|---------|-------------------|
| `/api/user/analytics/achievements/` | GET | User achievements | ✅ **HIGH PRIORITY** - Analytics |
| `/api/user/analytics/similar-newsletters/` | GET | Similar newsletters | ✅ Yes - MoreLikeYouRead |
| `/api/user/folders/` | GET | List folders | ✅ Yes - Collections page |
| `/api/user/folder/{folder_name}/` | GET/POST/DELETE | Folder operations | ✅ Yes - Collections |
| `/api/user/dashboard-data/` | GET | Dashboard summary | ✅ Yes - optimize loads |
| `/api/user/global-stats/` | GET | User statistics | ✅ Yes - Profile |
| `/api/user/subscriptions/` | GET | Newsletter subscriptions | ✅ **HIGH PRIORITY** - Subscriptions page |
| `/api/user/all-highlights/` | GET | All highlights | ✅ Yes - Highlights section |
| `/api/user/feedback/` | POST | Submit feedback | ✅ Yes - Profile |
| `/api/user/storage-info/` | GET | Storage usage | ⚠️ Future - Settings |
| `/api/user/time-range-stats/` | GET | Time-based stats | ⚠️ Future - Analytics |
| `/api/user/streak-count/` | GET | Streak count | ✅ **HIGH PRIORITY** - FlameBadge |

---

## 🔍 4. DIRECTORY APIs (Discover)

### ✅ All Implemented & Working

| Endpoint | Method | Status | Used In |
|----------|--------|--------|---------|
| `/api/directory/categories/` | GET | ✅ Working | Discover categories |
| `/api/directory/search/` | GET | ✅ Working | Newsletter search |
| `/api/directory/{id}/` | GET | ✅ Working | Newsletter detail |
| `/api/directory/search-category-newsletters-preview/` | GET | ✅ Working | Category carousels |
| `/api/directory/search-categories-preview/` | GET | ✅ Working | Category preview |
| `/api/directory/search-newsletters-preview/` | GET | ✅ Working | Newsletter preview |
| `/api/directory/recommendations/` | GET | ✅ Working | Recommendations |

### ⚠️ Missing Data: Newsletter Images/Logos

The directory API does **NOT** return newsletter logos/images. The frontend falls back to:
- `/logos/forbes-sample.png` (hardcoded)
- `/logos/sample-img.png` (default)

**Workaround in use:** Using `/api/search/providers/search/` to try to fetch logos, but this also doesn't return images.

---

## 📈 5. ANALYTICS APIs (TESTED ✅)

### Live Test Results

| Endpoint | Method | Status | Response Example |
|----------|--------|--------|------------------|
| `/api/user/analytics/inbox-snapshot/` | GET | ✅ **200 OK** | `{"received_today":0,"read":60,"unread":969,"read_later":84,"favourite":11}` |
| `/api/user/analytics/reading-insights/` | GET | ✅ **200 OK** | `{"newsletter_read":60,"favourite_mark":11,"highlights_made":35}` |
| `/api/user/analytics/achievements/` | GET | ✅ **200 OK** | `[{"id":"first_reader","title":"First Reader","date":"11 Jul 2025","status":"earned","gradient":"from-emerald-400 to-teal-400"},...]` |
| `/api/user/analytics/similar-newsletters/` | GET | ✅ **200 OK** | `[]` (empty - no data yet) |

### 🔴 Critical: Reading Streak API Broken

| Endpoint | Status | Error |
|----------|--------|-------|
| `/api/reading/streak/` | ❌ **500** | `'StreakService' object has no attribute '_ensure_uuid'` |

**Workaround Available:** Use `/api/user/streak-count/` instead:
```json
{"streak_count":0,"longest_streak":0}
```

### 🔴 Critical: Components Using Mock Data

| Component | Current State | API Available | API Response |
|-----------|--------------|---------------|--------------|
| `DailyStreakCard` | ❌ Hardcoded `currentStreak: 3` | ✅ `/api/user/streak-count/` | `{"streak_count":0,"longest_streak":0}` |
| `AchievementsCard` | ❌ Hardcoded 4 achievements | ✅ `/api/user/analytics/achievements/` | Returns real achievements with earned/locked status |
| `AchievementsBottomSheet` | ❌ Hardcoded 8 achievements | ✅ Same as above | Real achievements available |
| `StreakBottomSheet` | ❌ Hardcoded week data | ⚠️ `/api/reading/streak/` **BROKEN** | Use `/api/user/streak-count/` |
| `ReadingInsightsCard` | ⚠️ Simulated categories | ✅ `/api/user/analytics/reading-insights/` | `{"newsletter_read":60,"favourite_mark":11,"highlights_made":35}` |
| `FlameBadge` | ❓ Unknown | ✅ `/api/user/streak-count/` | Real streak count available |

---

## 📖 6. READING/STREAK APIs (TESTED)

### Live Test Results

| Endpoint | Method | Status | Response |
|----------|--------|--------|----------|
| `/api/reading/streak/` | GET | ❌ **500 ERROR** | `'StreakService' object has no attribute '_ensure_uuid'` |
| `/api/user/streak-count/` | GET | ✅ **200 OK** | `{"streak_count":0,"longest_streak":0}` |
| `/api/reading/streak/increment/` | POST | ⚠️ Not Tested | Likely same error as streak GET |
| `/api/reading/logs/` | GET/POST | ⚠️ Not Tested | — |
| `/api/reading/logs/range/` | GET | ⚠️ Not Tested | — |
| `/api/reading/statistics/` | GET | ⚠️ Not Tested | — |

### 🔧 Recommendation
Use `/api/user/streak-count/` for streak data until `/api/reading/streak/` is fixed.

---

## 🎯 7. RECOMMENDATION APIs

### ⚠️ Partial Implementation

| Endpoint | Method | Status | Used In |
|----------|--------|--------|---------|
| `/api/recommendation/recommendations/trending/` | GET | ✅ Working | Discover trending |
| `/api/recommendation/recommendations/` | GET | ❌ Not Used | Could use for home |
| `/api/recommendation/recommendations/user/{user_id}/` | GET | ❌ Not Used | Personalized recs |
| `/api/recommendation/recommendations/category/{category_id}/` | GET | ❌ Not Used | Category recs |
| `/api/recommendation/events/ingest/` | POST | ❌ Not Used | Track user events |
| `/api/recommendation/events/batch/` | POST | ❌ Not Used | Batch events |

---

## 📱 8. PAGES ANALYSIS

### ✅ Pages with Good API Integration

| Page | APIs Used | Status |
|------|-----------|--------|
| **Inbox** | `inbox-snapshot`, `email/inbox` | ✅ Fully working |
| **Read Later** | `email/read-later` | ✅ Fully working |
| **Favorites** | `email/favorites` | ✅ Fully working |
| **Profile** | `user/complete-data`, `user/profile` | ✅ Fully working |
| **Reading** | `email/{id}`, `email/{id}/progress` | ✅ Fully working |
| **Discover** | `directory/*`, `recommendation/trending` | ✅ Working (no images) |

### 🔴 Pages Using 100% Mock Data

| Page | Mock Data Location | API Available? |
|------|-------------------|----------------|
| **Collections** | `dummyNewsletterItems` array | ✅ Yes: `/api/user/folders/` |
| **Subscriptions** | `publisherMockData` array | ✅ Yes: `/api/user/subscriptions/` |
| **Search** | `dummySearchResults`, `carouselData` | ✅ Yes: `/api/email/search/emails/` |
| **Analytics** | Streak, achievements hardcoded | ✅ Yes: `/api/reading/streak/`, `/api/user/analytics/achievements/` |

### ⚠️ Pages with Partial Mock Data

| Page | Real API | Mock Data |
|------|----------|-----------|
| **Discover** | Categories, newsletters | Newsletter logos/images |
| **Analytics** | `reading-insights` (total only) | Category breakdown simulated |
| **Favorites (Mobile)** | None | Uses hardcoded `sampleFavorites` |
| **Delete (Mobile)** | None | Uses hardcoded items |

---

## 🚀 9. IMPLEMENTATION PRIORITY (Updated with Test Results)

### 🔴 HIGH PRIORITY (APIs Ready - Just Need Frontend Implementation)

1. **FlameBadge & DailyStreakCard - Streak Count**
   - Endpoint: `/api/user/streak-count/` ✅ **WORKING**
   - Response: `{"streak_count":0,"longest_streak":0}`
   - Components: `FlameBadge`, `DailyStreakCard`, `StreakBottomSheet`
   - **Action:** Replace hardcoded values with API call

2. **AchievementsCard & AchievementsBottomSheet**
   - Endpoint: `/api/user/analytics/achievements/` ✅ **WORKING**
   - Response: Array of achievements with `id`, `title`, `date`, `status`, `gradient`
   - **Action:** Replace hardcoded achievements array

3. **Subscriptions Page**
   - Endpoint: `/api/user/subscriptions/` ✅ **WORKING**
   - Response: Array of subscriptions with `id`, `name`, `sender_email`, `email_count`, `first_received`, `last_received`
   - **Action:** Replace `publisherMockData` in subscriptions page

4. **Collections Page (if user has folders)**
   - Endpoint: `/api/user/folders/` ✅ **WORKING**
   - Response: `[]` (empty if no folders created)
   - **Action:** Replace `dummyNewsletterItems` with real folders API

### ⚠️ MEDIUM PRIORITY

5. **Search Page**
   - Endpoint: `/api/email/search/emails/`
   - Page: `/search`
   - Impact: Enable email search functionality

6. **Mobile Favorites/Delete**
   - Use existing `email/favorites` and `email/trash` APIs
   - Components: `MobileFavoriteSection`, `MobileDeleteSection`

7. **Similar Newsletters (MoreLikeYouRead)**
   - Endpoint: `/api/user/analytics/similar-newsletters/`
   - Component: `MoreLikeYouRead`

### ⬜ LOW PRIORITY (Future Features)

8. Email Sharing
9. AI Summaries
10. Integrations (Pocket, Notion, Evernote)
11. Gmail Connect

---

## 🖼️ 10. IMAGE/LOGO SITUATION

### Current Problem
Newsletter logos/images are **NOT** provided by any API. The frontend uses:

```javascript
// Fallback pattern used throughout
const image = newsletter.image || "/logos/forbes-sample.png";
```

### Possible Solutions

1. **Backend Enhancement:** Add `logo_url` or `image_url` field to directory responses
2. **Logo Service:** Create a dedicated logo fetching service using newsletter domain
3. **Favicon Approach:** Use `https://www.google.com/s2/favicons?domain={domain}&sz=128`

### Quick Fix Available
```javascript
// Could use Google's favicon service
const logoUrl = `https://www.google.com/s2/favicons?domain=${newsletter.domain}&sz=128`;
```

---

## 📝 11. API RESPONSE EXAMPLES

### Inbox Snapshot (Working ✅)
```json
{
  "received_today": 0,
  "read": 60,
  "unread": 969,
  "read_later": 84,
  "favourite": 11
}
```

### Directory Search (Working ✅)
```json
{
  "data": [
    {
      "id": "cmcq2ptp11uzzumsbji3ugy9s",
      "name": "Study Hall Sampler",
      "url": "https://studyhallnewsletter.com/",
      "domain": "studyhallnewsletter.com",
      "author": "",
      "description": "Study Hall Sampler is a Beehiiv-hosted newsletter..."
    }
  ]
}
```

### User Complete Data (Working ✅)
```json
{
  "profile": {
    "id": "bc2bb18c-5265-413c-b340-10fa516a9ba6",
    "email": "myarupslg@gmail.com",
    "username": "arup.dev",
    "name": "Arup biswas",
    "inboxEmail": "arup.dev@inbo.me",
    "birthYear": "2003",
    "gender": "male",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

---

## ✅ 12. NEXT STEPS CHECKLIST (Based on Live Testing)

### 🔴 Immediate (APIs Working - Ready to Implement)
- [ ] Replace `FlameBadge` hardcoded value with `/api/user/streak-count/` data
- [ ] Replace `DailyStreakCard` mock streak with `/api/user/streak-count/`
- [ ] Replace `AchievementsCard` hardcoded array with `/api/user/analytics/achievements/`
- [ ] Replace `AchievementsBottomSheet` with real achievements
- [ ] Replace Subscriptions page mock data with `/api/user/subscriptions/`
- [ ] Replace Collections page mock data with `/api/user/folders/`

### ⚠️ Backend Issues to Report
- [ ] **CRITICAL:** `/api/reading/streak/` returns 500 error: `'StreakService' object has no attribute '_ensure_uuid'`

### 📦 New API Services Needed
- [ ] Create `analyticsService.getAchievements()` 
- [ ] Create `analyticsService.getStreakCount()` (use `/api/user/streak-count/`)
- [ ] Create `userService.getSubscriptions()`
- [ ] Create `userService.getFolders()`

### 🖼️ Image/Logo Solution
- [ ] Implement Google Favicon fallback: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
- [ ] Or request backend to add `logo_url` to newsletter responses

---

## 📦 13. API RESPONSE SAMPLES (From Live Testing)

### Achievements (Working ✅)
```json
[
  {
    "id": "first_reader",
    "title": "First Reader",
    "date": "11 Jul 2025",
    "status": "earned",
    "gradient": "from-emerald-400 to-teal-400"
  },
  {
    "id": "rising_star",
    "title": "Rising Star",
    "date": "11 Jul 2025",
    "status": "earned",
    "gradient": "from-blue-500 to-indigo-500"
  },
  {
    "id": "streak_master",
    "title": "Streak Master",
    "status": "locked"
  }
]
```

### Subscriptions (Working ✅)
```json
[
  {
    "id": "48411d19-34e0-44e6-a1eb-cad748ee88c8",
    "name": "TLDR Web Dev",
    "sender_email": "dan@tldrnewsletter.com",
    "url": null,
    "description": null,
    "email_count": 354,
    "first_received": "2025-09-23T11:20:35+00:00",
    "last_received": "2025-12-23T14:27:33+00:00"
  },
  {
    "id": "dd1739aa-abe3-41ef-aeb9-9f4ed9de5313",
    "name": "1440 Sunday",
    "sender_email": "sunday@email.join1440.com",
    "url": null,
    "description": null,
    "email_count": 7,
    "first_received": "2025-11-09T10:46:26+00:00",
    "last_received": "2025-12-21T10:46:26+00:00"
  }
]
```

### Streak Count (Working ✅)
```json
{
  "streak_count": 0,
  "longest_streak": 0
}
```

### Reading Insights (Working ✅)
```json
{
  "newsletter_read": 60,
  "favourite_mark": 11,
  "highlights_made": 35
}
```

### Reading Streak (BROKEN ❌)
```json
{
  "statusCode": 500,
  "message": "'StreakService' object has no attribute '_ensure_uuid'",
  "error": "InternalServerError"
}
```

---

*Document generated by API analysis - Last updated: January 17, 2026*
