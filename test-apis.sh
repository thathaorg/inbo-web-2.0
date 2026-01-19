#!/bin/bash

# Inbo API Testing Script
# This script tests all APIs to identify which are working and which need integration

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY4ODA1NjkzLCJpYXQiOjE3Njg4MDQ3OTMsImp0aSI6IjEyMzIzOGI5MzNmMTQ1MTFhNGU3MTY3OWI3NGEzMGMxIiwic3ViIjoiYmMyYmIxOGMtNTI2NS00MTNjLWIzNDAtMTBmYTUxNmE5YmE2In0.C3d_sYHDLh5av5Jovq_XtAUTtbAc9_oRgiyUJPwbkfE"
BASE_URL="https://inbo-django-api.azurewebsites.net"

echo "======================================================================"
echo "🚀 INBO API TESTING SUITE v0.986"
echo "======================================================================"
echo ""

test_api() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📍 $description"
    echo "Method: $method | Endpoint: $endpoint"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "✅ Status: $http_code (Working)"
        echo "Response:"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        echo "❌ Status: $http_code (Error)"
        echo "Response:"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    fi
    echo ""
}

# ============================================================================
# SECTION 1: USER & PROFILE ENDPOINTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "📋 SECTION 1: USER & PROFILE ENDPOINTS (Being Used)"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

test_api "GET" "/api/user/profile/" "Get User Profile"
test_api "GET" "/api/user/complete-data/" "Get Complete User Data"
test_api "GET" "/api/user/check-inbox-availability/" "Check Inbox Availability"

# ============================================================================
# SECTION 2: EMAIL ENDPOINTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "📧 SECTION 2: EMAIL MANAGEMENT (Being Used)"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

test_api "GET" "/api/email/inbox/?page=1&limit=10" "Get Inbox Emails"
test_api "GET" "/api/email/favorites/" "Get Favorite Emails"
test_api "GET" "/api/email/read-later/" "Get Read-Later Emails"
test_api "GET" "/api/email/trash/" "Get Trash Emails"

# ============================================================================
# SECTION 3: ANALYTICS ENDPOINTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "📊 SECTION 3: ANALYTICS (Being Used)"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

test_api "GET" "/api/user/analytics/inbox-snapshot/" "Get Inbox Snapshot"
test_api "GET" "/api/user/analytics/reading-insights/" "Get Reading Insights"
test_api "GET" "/api/user/analytics/achievements/" "Get Achievements"
test_api "GET" "/api/reading/streak/" "Get Streak Information"

# ============================================================================
# SECTION 4: SEARCH & DISCOVERY
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "🔍 SECTION 4: SEARCH & DISCOVERY (Being Used)"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

test_api "GET" "/api/directory/categories/" "Get Categories"
test_api "GET" "/api/directory/recommendations/" "Get Recommendations"
test_api "GET" "/api/search/providers/search/?q=substack" "Search Providers"

# ============================================================================
# SECTION 5: FEATURES NEEDING INTEGRATION
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "⚠️  SECTION 5: FEATURES NEEDING INTEGRATION (Not Yet Used)"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

test_api "GET" "/api/user/all-highlights/" "Get All Highlights"
test_api "GET" "/api/user/dashboard-data/" "Get Dashboard Data"
test_api "GET" "/api/user/directory/search-newsletters/" "Search Newsletters"

# ============================================================================
# SECTION 6: ADVANCED FEATURES (Not Used)
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "🔴 SECTION 6: ADVANCED FEATURES (Not Yet Used)"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

test_api "GET" "/api/gmail/accounts/" "Get Gmail Accounts"
test_api "GET" "/api/subscription/plans/" "Get Subscription Plans"
test_api "GET" "/api/recommendation/recommendations/" "Get Recommendations"

echo ""
echo "======================================================================"
echo "✅ TESTING COMPLETE"
echo "======================================================================"
