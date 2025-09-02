# Server JSON Configuration Fix

This document explains the server configuration changes made to ensure all API routes return JSON responses instead of HTML.

## Problem

The server was returning HTML responses for API routes, causing the "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" error when the client tried to parse HTML as JSON.

## Root Cause

1. **Vite middleware** was intercepting all routes, including API routes
2. **Static file serving** was serving HTML for non-existent routes
3. **Error handlers** were not properly configured for API routes
4. **Content-Type headers** were not being set correctly for API responses

## Solution

### 1. Server Index Configuration (`server/index.ts`)

#### Added API Route Content-Type Middleware
```typescript
// Set default content type to JSON for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json');
  }
  next();
});
```

#### Enhanced Error Handler
```typescript
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Always return JSON for API routes
  if (_req.path.startsWith('/api')) {
    res.status(status).json({ 
      error: 'Internal Server Error',
      message: message,
      status: status
    });
  } else {
    res.status(status).json({ message });
  }
  
  // Don't throw the error to prevent process exit
  console.error('Server error:', err);
});
```

### 2. Vite Configuration (`server/vite.ts`)

#### Skip API Routes in Vite Middleware
```typescript
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  // Skip API routes - they should be handled by the API middleware
  if (url.startsWith('/api')) {
    return next();
  }

  // ... rest of Vite HTML serving logic
});
```

#### API Route Handling in Static Serving
```typescript
app.use("*", (req, res) => {
  // Skip API routes - they should be handled by the API middleware
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `API endpoint ${req.method} ${req.originalUrl} not found`,
      path: req.originalUrl
    });
  }
  
  res.sendFile(path.resolve(distPath, "index.html"));
});
```

### 3. Routes Configuration (`server/routes.ts`)

#### API Route Middleware
```typescript
// Ensure all API routes return JSON
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});
```

#### API-Specific 404 Handler
```typescript
// API-specific 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    path: req.originalUrl
  });
});
```

#### Smart Catch-All Handler
```typescript
// Catch-all route for non-API routes (will be handled by Vite/static serving)
app.use('*', (req, res, next) => {
  // Only handle non-API routes here
  if (!req.originalUrl.startsWith('/api')) {
    return next();
  }
  
  // This should not be reached for API routes, but just in case
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    path: req.originalUrl
  });
});
```

## How It Works

### Request Flow for API Routes (`/api/*`)

1. **Content-Type Middleware** - Sets `Content-Type: application/json`
2. **API Route Middleware** - Ensures JSON content type
3. **Route Handlers** - Process the request and return JSON
4. **API 404 Handler** - Returns JSON 404 for non-existent API routes
5. **Error Handler** - Returns JSON error responses

### Request Flow for Non-API Routes

1. **Content-Type Middleware** - Skips non-API routes
2. **Vite/Static Middleware** - Serves HTML for client-side routing
3. **HTML Fallback** - Returns `index.html` for SPA routing

## Testing

### Manual Testing
```bash
# Test API endpoint (should return JSON)
curl -H "Content-Type: application/json" http://localhost:5000/api/auth/signup

# Test non-existent API endpoint (should return JSON 404)
curl http://localhost:5000/api/nonexistent

# Test non-API route (should return HTML)
curl http://localhost:5000/dashboard
```

### Automated Testing
```bash
node test-server-json.js
```

## Expected Results

### API Routes (`/api/*`)
- ✅ Always return `Content-Type: application/json`
- ✅ Return JSON responses for all status codes
- ✅ 404 errors return JSON with error details
- ✅ 500 errors return JSON with error details

### Non-API Routes
- ✅ Return `Content-Type: text/html`
- ✅ Serve the React app for client-side routing
- ✅ Fallback to `index.html` for unknown routes

## Benefits

1. **No More JSON Parsing Errors** - Client code won't try to parse HTML as JSON
2. **Consistent API Responses** - All API endpoints return JSON
3. **Better Error Handling** - Structured error responses
4. **Proper Content Types** - Correct headers for different route types
5. **SPA Support** - Non-API routes still serve the React app

## Troubleshooting

### If API routes still return HTML:

1. **Check middleware order** - API middleware should come before Vite middleware
2. **Verify route patterns** - Ensure `/api/*` patterns are correct
3. **Check error handlers** - Ensure they're not throwing errors
4. **Test with curl** - Use command line to test API endpoints

### If non-API routes return JSON:

1. **Check Vite configuration** - Ensure it's not interfering with API routes
2. **Verify catch-all handlers** - Ensure they properly distinguish route types
3. **Check static file serving** - Ensure it's configured correctly

## Files Modified

- ✅ `server/index.ts` - Added API content-type middleware and error handling
- ✅ `server/vite.ts` - Skip API routes in Vite and static serving
- ✅ `server/routes.ts` - Added API-specific middleware and 404 handlers

## Conclusion

This configuration ensures that:
- All API routes (`/api/*`) return JSON responses
- Non-API routes serve the React application
- Error handling is consistent and returns appropriate content types
- The client-side safe-fetch utility works correctly with all server responses

The server now properly separates API and non-API routes, eliminating the JSON parsing errors that were occurring when HTML was returned for API requests.
