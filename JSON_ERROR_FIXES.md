# JSON Error Handling Fixes

This document explains the comprehensive solution implemented to resolve "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" errors throughout the application.

## Problem Description

The error occurs when:
1. API endpoints return HTML error pages instead of JSON
2. Server returns 404 HTML pages for non-existent routes
3. Client code tries to parse HTML as JSON using `.json()`
4. Network errors or server misconfigurations return HTML responses

## Solution Overview

### 1. Safe Fetch Utility (`client/src/lib/safe-fetch.ts`)

Created a comprehensive utility that:
- **Detects HTML responses** before parsing
- **Provides detailed error messages** for debugging
- **Handles timeouts** and network errors gracefully
- **Returns structured responses** with error information
- **Prevents JSON parsing crashes**

#### Key Features:
```typescript
// Safe JSON parsing with HTML detection
async function safeJsonParse<T>(response: Response): Promise<T> {
  const text = await response.text();
  
  // Check if response is HTML (error page)
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
  }
  
  return JSON.parse(text);
}

// Safe fetch wrapper
export async function safeFetch<T>(url: string, options: SafeFetchOptions = {}): Promise<SafeFetchResponse<T>>
```

### 2. Updated Client-Side Code

#### Authentication Service (`client/src/lib/auth.ts`)
- ✅ All fetch calls now use `safeFetch`
- ✅ Proper error handling for HTML responses
- ✅ Graceful fallbacks when sync fails

#### Meeting Modal (`client/src/components/meeting-modal.tsx`)
- ✅ Safe JSON parsing for meeting validation
- ✅ Error handling for bot joining requests
- ✅ User-friendly error messages

#### Integrations Panel (`client/src/components/integrations-panel.tsx`)
- ✅ Safe fetching of integrations list
- ✅ Error handling for OAuth connections
- ✅ Proper error display to users

#### Query Client (`client/src/lib/queryClient.ts`)
- ✅ Updated to use safe fetch utility
- ✅ Better error handling for API requests
- ✅ Consistent error responses

### 3. Server-Side Improvements (`server/routes.ts`)

#### JSON Error Handler Middleware
```typescript
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message || 'Something went wrong'
  });
});
```

#### 404 Handler
```typescript
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    path: req.originalUrl
  });
});
```

## Files Modified

### Client-Side Files:
- ✅ `client/src/lib/safe-fetch.ts` - New utility
- ✅ `client/src/lib/auth.ts` - Updated fetch calls
- ✅ `client/src/components/meeting-modal.tsx` - Safe JSON parsing
- ✅ `client/src/components/integrations-panel.tsx` - Error handling
- ✅ `client/src/lib/queryClient.ts` - Safe fetch integration
- ✅ `client/src/components/meeting-creation-modal.tsx` - Safe requests
- ✅ `client/src/pages/integrations.tsx` - Error handling

### Server-Side Files:
- ✅ `server/routes.ts` - JSON error handlers

## Error Types Handled

### 1. HTML Error Pages
**Before:** `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
**After:** `Server returned HTML instead of JSON. Status: 500. This usually means the endpoint doesn't exist or there's a server error.`

### 2. Empty Responses
**Before:** `Unexpected end of JSON input`
**After:** `Empty response from server. Status: 200`

### 3. Invalid JSON
**Before:** `Unexpected token 'x' in JSON at position 0`
**After:** `Invalid JSON response: <response preview>...`

### 4. Network Errors
**Before:** Unhandled promise rejections
**After:** `Request timeout` or `Network error: <details>`

### 5. Server Errors
**Before:** HTML error pages
**After:** `HTTP 500: Internal Server Error`

## Testing

### Manual Testing
1. **Test non-existent endpoints** - Should return JSON 404
2. **Test server errors** - Should return JSON error responses
3. **Test network timeouts** - Should handle gracefully
4. **Test invalid responses** - Should provide clear error messages

### Automated Testing
Run the test script:
```bash
node test-json-errors.js
```

This will test all major endpoints and verify they return JSON responses.

## Benefits

### 1. **User Experience**
- ✅ No more cryptic JSON parsing errors
- ✅ Clear, actionable error messages
- ✅ Graceful degradation when services fail
- ✅ Better error reporting for debugging

### 2. **Developer Experience**
- ✅ Easier debugging with detailed error messages
- ✅ Consistent error handling across the app
- ✅ Type-safe error responses
- ✅ Centralized error handling logic

### 3. **Reliability**
- ✅ Application doesn't crash on server errors
- ✅ Handles network issues gracefully
- ✅ Provides fallback mechanisms
- ✅ Better error recovery

## Usage Examples

### Before (Problematic):
```typescript
const response = await fetch('/api/endpoint');
const data = await response.json(); // ❌ Crashes on HTML response
```

### After (Safe):
```typescript
const response = await safeFetch<DataType>('/api/endpoint');
if (!response.ok || response.error) {
  throw new Error(response.error || 'Request failed');
}
const data = response.data; // ✅ Always safe
```

### Error Handling:
```typescript
try {
  const response = await safeFetch('/api/endpoint');
  if (response.error) {
    console.error('API Error:', response.error);
    // Handle error gracefully
  }
} catch (error) {
  console.error('Network Error:', error.message);
  // Handle network issues
}
```

## Migration Guide

### For Existing Code:
1. **Replace `fetch()` calls** with `safeFetch()`
2. **Update error handling** to check `response.error`
3. **Remove `.json()` calls** - data is in `response.data`
4. **Add proper error messages** for users

### For New Code:
1. **Always use `safeFetch()`** for API calls
2. **Handle both `response.error` and exceptions**
3. **Provide user-friendly error messages**
4. **Test with various error scenarios**

## Monitoring

### Error Tracking
- All errors are logged with context
- HTML responses are detected and reported
- Network issues are tracked separately
- User-facing errors are sanitized

### Debugging
- Detailed error messages include response previews
- Server errors include stack traces (in development)
- Network errors include timeout information
- 404 errors include the requested path

## Future Improvements

1. **Retry Logic** - Automatic retry for transient errors
2. **Circuit Breaker** - Prevent cascading failures
3. **Error Analytics** - Track error patterns
4. **User Feedback** - Allow users to report issues
5. **Offline Support** - Handle network disconnections

## Conclusion

This comprehensive solution eliminates JSON parsing errors throughout the application while providing better error handling, user experience, and debugging capabilities. All API interactions are now safe and provide meaningful error messages when things go wrong.
