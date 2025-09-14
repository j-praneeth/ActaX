# Authentication Debug Guide

This guide helps you debug and resolve authentication issues in the Acta.ai application.

## Quick Diagnosis

### 1. Check Authentication State

Add the `AuthDebug` component to any page to see the current authentication status:

```tsx
import { AuthDebug } from '@/components/auth-debug';

// Add this to any page component
<AuthDebug />
```

This will show:
- ✅ **Auth Context User**: Whether the user is authenticated in the app
- ✅ **Session Token**: Whether a valid session token is available
- ✅ **LocalStorage Token**: Whether a stored token exists
- ✅ **Recommendations**: What to do if there are issues

### 2. Common Issues and Solutions

#### Issue: "User not authenticated. Please sign in again."

**Symptoms:**
- Meeting modal shows authentication error
- User appears to be signed in but can't access features

**Solutions:**
1. **Check if user is actually signed in:**
   ```tsx
   const { user } = useAuth();
   console.log('User:', user);
   ```

2. **Check session token:**
   ```tsx
   const token = await authService.getCurrentSessionToken();
   console.log('Token:', token ? 'Available' : 'Not available');
   ```

3. **Try refreshing the page** - Sometimes the session needs to be refreshed

4. **Sign out and sign in again** - This refreshes the authentication state

#### Issue: "Authentication token not available. Please refresh the page and try again."

**Symptoms:**
- User is authenticated in the app context
- But no session token is available for API calls

**Solutions:**
1. **Refresh the page** - This often resolves token issues
2. **Check browser console** for any authentication errors
3. **Clear localStorage and sign in again:**
   ```javascript
   localStorage.clear();
   // Then sign in again
   ```

#### Issue: 401 Unauthorized errors

**Symptoms:**
- API calls return 401 status
- Server logs show "Authentication token required"

**Solutions:**
1. **Verify the token is being sent:**
   - Open browser dev tools
   - Check Network tab
   - Look for Authorization header in API requests

2. **Check server logs** for authentication errors

3. **Test with curl:**
   ```bash
   # Test without token (should return 401)
   curl -X POST http://localhost:5000/api/meetings/validate \
     -H "Content-Type: application/json" \
     -d '{"url":"https://meet.google.com/test"}'
   
   # Test with token (should work if valid)
   curl -X POST http://localhost:5000/api/meetings/validate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"url":"https://meet.google.com/test"}'
   ```

## Authentication Flow

### How Authentication Works

1. **User Signs In** → Supabase creates JWT token
2. **Token Storage** → Token stored in both:
   - Supabase session (primary)
   - localStorage (backup)
3. **API Requests** → Client sends token in Authorization header
4. **Server Verification** → Server verifies token and gets user data

### Token Types

1. **Supabase JWT Tokens** (Primary)
   - Standard JWT format
   - Verified using `supabase.auth.getUser()`
   - Automatically synced with user data

2. **Custom Tokens** (Backup)
   - Base64-encoded JSON
   - For legacy compatibility
   - Still supported but deprecated

## Debugging Steps

### Step 1: Check Authentication State

```tsx
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/lib/auth';

function DebugAuth() {
  const { user, loading } = useAuth();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const sessionToken = await authService.getCurrentSessionToken();
      setToken(sessionToken);
    };
    checkToken();
  }, []);

  return (
    <div>
      <p>User: {user ? 'Authenticated' : 'Not authenticated'}</p>
      <p>Token: {token ? 'Available' : 'Not available'}</p>
      <p>Loading: {loading ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Step 2: Check Network Requests

1. Open browser dev tools (F12)
2. Go to Network tab
3. Try to submit the meeting form
4. Look for API requests to `/api/meetings/validate`
5. Check if the Authorization header is present

### Step 3: Check Server Logs

Look for these messages in the server console:
- `"Authentication token required"` - No token sent
- `"Invalid authentication token"` - Token is invalid
- `"Session token verification error"` - Token verification failed

### Step 4: Test Authentication Endpoints

```bash
# Test auth verification
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE"}'

# Test user sync
curl -X POST http://localhost:5000/api/auth/sync-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing Scripts

### Run Comprehensive Test

```bash
node test-auth-comprehensive.js
```

This tests:
- ✅ Unauthenticated requests (should return 401 JSON)
- ✅ Invalid token requests (should return 401 JSON)
- ✅ Auth endpoints (should work without auth)
- ✅ Non-API routes (should return HTML)

### Run Authentication Fix Test

```bash
node test-auth-fix.js
```

This specifically tests the meeting endpoints for proper authentication.

## Common Solutions

### Solution 1: Refresh Authentication

```tsx
const refreshAuth = async () => {
  // Clear any stored tokens
  localStorage.removeItem('auth_token');
  
  // Get fresh session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // User is still authenticated
    console.log('User is authenticated');
  } else {
    // User needs to sign in again
    console.log('User needs to sign in');
  }
};
```

### Solution 2: Force Re-authentication

```tsx
const forceReauth = async () => {
  // Sign out completely
  await supabase.auth.signOut();
  
  // Clear all stored data
  localStorage.clear();
  
  // Redirect to login
  window.location.href = '/login';
};
```

### Solution 3: Check Token Validity

```tsx
const checkTokenValidity = async (token: string) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Token invalid:', error);
      return false;
    }
    
    if (user) {
      console.log('Token valid for user:', user.email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token check failed:', error);
    return false;
  }
};
```

## Prevention

### Best Practices

1. **Always check authentication state** before making API calls
2. **Handle authentication errors gracefully** in the UI
3. **Provide clear error messages** to users
4. **Implement automatic token refresh** if needed
5. **Use the AuthDebug component** during development

### Error Handling

```tsx
const handleApiCall = async () => {
  try {
    const token = await authService.getCurrentSessionToken();
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    // Make API call with token
    const response = await fetch('/api/endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    // Handle error appropriately
  }
};
```

## Conclusion

The authentication system now supports both Supabase JWT tokens and legacy custom tokens. If you're still experiencing issues:

1. **Use the AuthDebug component** to check authentication state
2. **Check browser console** for error messages
3. **Check server logs** for authentication errors
4. **Try refreshing the page** or signing out/in again
5. **Run the test scripts** to verify the system is working

The system is designed to be robust and handle various authentication scenarios gracefully.
