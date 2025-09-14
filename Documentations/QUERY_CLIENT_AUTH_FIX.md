# Query Client Authentication Fix

This document explains the fix for the 401 Unauthorized error when accessing the `GET /api/meetings` endpoint.

## Problem

The `GET /api/meetings` endpoint was returning 401 Unauthorized errors even when users were authenticated. The issue was in the `queryClient.ts` file where the authentication token retrieval was incomplete.

## Root Cause

The `queryClient.ts` was only checking Supabase sessions (`supabase.auth.getSession()`) but not using the enhanced `getCurrentSessionToken()` method that includes both Supabase JWT tokens and localStorage token fallbacks.

### Before (Problematic):
```typescript
// Only checked Supabase session
const { data: sessionData } = await supabase.auth.getSession();
const accessToken = sessionData.session?.access_token;
```

### After (Fixed):
```typescript
// Uses enhanced authentication that checks both sources
const accessToken = await authService.getCurrentSessionToken();
```

## Solution

### Updated `client/src/lib/queryClient.ts`

1. **Added import** for `authService`:
   ```typescript
   import { authService } from "./auth";
   ```

2. **Updated `apiRequest` function**:
   ```typescript
   export async function apiRequest(
     method: string,
     url: string,
     data?: unknown | undefined,
   ): Promise<Response> {
     // Get current session token (includes both Supabase and localStorage tokens)
     const accessToken = await authService.getCurrentSessionToken();

     const res = await fetch(url, {
       method,
       headers: {
         ...(data ? { "Content-Type": "application/json" } : {}),
         ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
       },
       body: data ? JSON.stringify(data) : undefined,
       credentials: "include",
     });

     await throwIfResNotOk(res);
     return res;
   }
   ```

3. **Updated `getQueryFn` function**:
   ```typescript
   export const getQueryFn: <T>(options: {
     on401: UnauthorizedBehavior;
   }) => QueryFunction<T> =
     ({ on401: unauthorizedBehavior }) =>
     async ({ queryKey }) => {
       // Get current session token (includes both Supabase and localStorage tokens)
       const accessToken = await authService.getCurrentSessionToken();

       const response = await safeFetch(queryKey.join("/") as string, {
         credentials: "include",
         headers: {
           ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
         },
       });

       // ... rest of the function
     };
   ```

## How It Works Now

### Authentication Flow for Queries

1. **User Signs In** → Supabase creates JWT token
2. **Token Storage** → Token stored in both Supabase session and localStorage
3. **Query Execution** → `getQueryFn` calls `authService.getCurrentSessionToken()`
4. **Token Retrieval** → Method checks both localStorage and Supabase session
5. **API Request** → Request includes proper Authorization header
6. **Server Response** → Server verifies token and returns data

### Token Priority

1. **localStorage Token** (if valid)
2. **Supabase Session Token** (fallback)
3. **null** (if neither available)

## Affected Endpoints

This fix resolves authentication issues for all endpoints that use:

- ✅ **React Query** (`useQuery` hook)
- ✅ **apiRequest** function
- ✅ **GET /api/meetings** (dashboard meetings list)
- ✅ **GET /api/integrations** (integrations list)
- ✅ **GET /api/agents** (agents list)
- ✅ **All other query-based endpoints**

## Testing

### Manual Testing

1. **Sign in to the application**
2. **Navigate to dashboard** - should load meetings without 401 errors
3. **Check browser dev tools** - Network tab should show Authorization headers
4. **Verify server logs** - should show successful authentication

### Automated Testing

```bash
# Test the meetings endpoint
node test-meetings-endpoint.js

# Test comprehensive authentication
node test-auth-comprehensive.js
```

### Expected Results

#### Before (Problematic):
```
❌ GET /api/meetings → 401 Unauthorized
❌ Dashboard shows "Please log in" message
❌ No meetings loaded
```

#### After (Fixed):
```
✅ GET /api/meetings → 200 OK with meeting data
✅ Dashboard loads properly
✅ Meetings list displays correctly
✅ All queries work with proper authentication
```

## Files Modified

- ✅ `client/src/lib/queryClient.ts` - Updated authentication token retrieval
- ✅ `client/src/lib/auth.ts` - Enhanced `getCurrentSessionToken()` method (previous fix)
- ✅ `client/src/components/meeting-modal.tsx` - Updated authentication (previous fix)
- ✅ `client/src/components/meeting-creation-modal.tsx` - Updated authentication (previous fix)
- ✅ `client/src/components/integrations-panel.tsx` - Updated authentication (previous fix)
- ✅ `client/src/components/meeting-details-card.tsx` - Updated authentication (previous fix)

## Benefits

1. **Consistent Authentication** - All API calls now use the same authentication method
2. **Robust Token Handling** - Supports both Supabase JWT and localStorage tokens
3. **Better User Experience** - Dashboard and other pages load properly
4. **Unified Authentication** - Single source of truth for token retrieval
5. **Backward Compatibility** - Still supports legacy authentication methods

## Troubleshooting

### If you still get 401 errors:

1. **Check browser console** for authentication errors
2. **Verify user is signed in** using the AuthDebug component
3. **Check server logs** for authentication failures
4. **Try refreshing the page** to refresh authentication state
5. **Sign out and sign in again** to refresh tokens

### Debug Steps:

1. **Add AuthDebug component** to see authentication state
2. **Check Network tab** in browser dev tools for Authorization headers
3. **Verify token format** - should be a valid JWT or base64 token
4. **Test with curl** using a valid token

## Conclusion

This fix ensures that all React Query-based API calls (including `GET /api/meetings`) now use proper authentication. The dashboard should now load meetings correctly, and all other query-based endpoints should work without 401 errors.

The authentication system is now fully unified and robust, supporting both Supabase JWT tokens and legacy localStorage tokens across all API calls.
