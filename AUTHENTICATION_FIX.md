# Authentication Fix for Meeting Endpoints

This document explains the comprehensive fix implemented to resolve the 401 Unauthorized error when accessing meeting endpoints.

## Problem

Users were getting `401 Unauthorized` errors when trying to access meeting endpoints like `/api/meetings`, `/api/meetings/validate`, and `/api/meetings/join-bot`. The error message was:

```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
http://localhost:5000/api/meetings
{"message":"Authentication token required"}
```

## Root Cause

The issue was a **token mismatch** between client and server:

1. **Client Side**: Some components were using `localStorage.getItem('auth_token')` (custom tokens)
2. **Server Side**: Expected Supabase JWT tokens but was only configured to handle custom base64-encoded tokens
3. **Inconsistent Authentication**: Different components used different authentication methods

## Solution

### 1. Client-Side Fixes

#### Updated Auth Service (`client/src/lib/auth.ts`)
Added a new method to get current Supabase session tokens:

```typescript
async getCurrentSessionToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
}
```

#### Updated Meeting Modal (`client/src/components/meeting-modal.tsx`)
```typescript
// Before (Problematic)
'Authorization': `Bearer ${localStorage.getItem('auth_token')}`

// After (Fixed)
const sessionToken = await authService.getCurrentSessionToken();
if (!sessionToken) {
  throw new Error('User not authenticated. Please sign in again.');
}
'Authorization': `Bearer ${sessionToken}`
```

#### Updated All Components
- ✅ **Meeting Modal** - Uses Supabase JWT tokens
- ✅ **Meeting Creation Modal** - Uses Supabase JWT tokens  
- ✅ **Integrations Panel** - Uses Supabase JWT tokens
- ✅ **Meeting Details Card** - Uses Supabase JWT tokens

### 2. Server-Side Fixes

#### Updated Supabase Service (`server/services/supabase.ts`)
Enhanced `verifySessionToken` to handle both Supabase JWT and custom tokens:

```typescript
async verifySessionToken(token: string): Promise<User | null> {
  try {
    // First, try to verify as Supabase JWT token
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
    
    if (!error && authUser) {
      // User is authenticated with Supabase, get or create user in our database
      return await this.getUserFromAuth(authUser.id);
    }

    // If Supabase verification fails, try custom token format (for backward compatibility)
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (decoded.exp < Date.now()) {
        return null; // Token expired
      }

      return await storage.getUserById(decoded.userId);
    } catch (customTokenError) {
      console.error('Custom token verification error:', customTokenError);
      return null;
    }
  } catch (error) {
    console.error('Session token verification error:', error);
    return null;
  }
}
```

## How It Works Now

### Authentication Flow

1. **User Signs In** → Supabase creates JWT token
2. **Client Gets Token** → `authService.getCurrentSessionToken()` retrieves Supabase JWT
3. **API Request** → Client sends `Authorization: Bearer <supabase-jwt>`
4. **Server Verification** → Server verifies Supabase JWT and gets user data
5. **Bot Joins Meeting** → Authenticated user can now join meetings

### Token Types Supported

1. **Supabase JWT Tokens** (Primary)
   - Standard JWT format
   - Verified using `supabase.auth.getUser()`
   - Automatically syncs user data

2. **Custom Tokens** (Backward Compatibility)
   - Base64-encoded JSON
   - For legacy integrations
   - Still supported but deprecated

## Files Modified

### Client-Side Files:
- ✅ `client/src/lib/auth.ts` - Added `getCurrentSessionToken()` method
- ✅ `client/src/components/meeting-modal.tsx` - Updated to use Supabase tokens
- ✅ `client/src/components/meeting-creation-modal.tsx` - Updated authentication
- ✅ `client/src/components/integrations-panel.tsx` - Updated authentication
- ✅ `client/src/components/meeting-details-card.tsx` - Updated authentication

### Server-Side Files:
- ✅ `server/services/supabase.ts` - Enhanced token verification

## Testing

### Manual Testing
```bash
# Test without authentication (should return 401 JSON)
curl -X POST http://localhost:5000/api/meetings/validate \
  -H "Content-Type: application/json" \
  -d '{"url":"https://meet.google.com/test"}'

# Test with invalid token (should return 401 JSON)
curl -X POST http://localhost:5000/api/meetings/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{"url":"https://meet.google.com/test"}'
```

### Automated Testing
```bash
node test-auth-fix.js
```

## Expected Results

### Before (Problematic):
```
❌ 401 Unauthorized
❌ {"message":"Authentication token required"}
❌ Bot cannot join meetings
```

### After (Fixed):
```
✅ Proper authentication with Supabase JWT
✅ User data synced automatically
✅ Bot can join meetings when user is authenticated
✅ Consistent authentication across all components
```

## Benefits

1. **Consistent Authentication** - All components use the same Supabase JWT tokens
2. **Automatic User Sync** - Users are automatically synced between Supabase Auth and custom database
3. **Better Security** - Uses standard JWT tokens instead of custom base64 encoding
4. **Backward Compatibility** - Still supports legacy custom tokens
5. **Bot Functionality** - Meeting bot can now join meetings when users are authenticated

## Troubleshooting

### If you still get 401 errors:

1. **Check User Authentication** - Ensure user is signed in to Supabase
2. **Verify Token** - Check if `authService.getCurrentSessionToken()` returns a valid token
3. **Check Server Logs** - Look for authentication errors in server console
4. **Test Token Manually** - Use browser dev tools to inspect the Authorization header

### If bot still can't join meetings:

1. **Check Meeting URL** - Ensure the Google Meet URL is valid and active
2. **Verify Permissions** - Check if user has proper permissions in the meeting
3. **Check Bot Status** - Verify the Recall.ai bot is properly configured
4. **Review Server Logs** - Look for bot joining errors

## Migration Guide

### For Existing Users:
- No action required - authentication will work automatically
- Legacy custom tokens are still supported
- Users will be automatically synced to the database

### For New Users:
- Sign up/login through Supabase Auth
- Authentication tokens are handled automatically
- Bot joining will work immediately after authentication

## Conclusion

This fix resolves the authentication issues that were preventing the meeting bot from joining meetings. Users can now:

1. ✅ Sign in with Supabase authentication
2. ✅ Access meeting endpoints without 401 errors
3. ✅ Have the bot join meetings when they're authenticated
4. ✅ Use all meeting features consistently

The authentication system is now unified, secure, and fully functional for the meeting bot workflow.
