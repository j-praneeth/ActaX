# Supabase User Synchronization Setup

This document explains how to set up proper user synchronization between Supabase Authentication and your custom users table.

## Overview

The application now supports dual user storage:
1. **Supabase Authentication** - Handles login/signup and session management
2. **Custom Users Table** - Stores additional user data and relationships

## Setup Instructions

### 1. Database Tables

Make sure your Supabase database has the following tables (already defined in `shared/schema.ts`):

- `users` - Custom user data
- `organizations` - User organizations
- `meetings` - Meeting records
- `integrations` - Third-party integrations
- `agents` - AI agents
- `webhook_events` - Webhook processing

### 2. Supabase Auth Webhook (Recommended)

To automatically sync users when they sign up through Supabase Auth:

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Webhooks**
3. Create a new webhook with these settings:
   - **Table**: `auth.users`
   - **Events**: `INSERT`
   - **Type**: `HTTP Request`
   - **URL**: `https://your-domain.com/api/auth/webhook`
   - **HTTP Headers**: 
     ```json
     {
       "Content-Type": "application/json",
       "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"
     }
     ```

### 3. Environment Variables

Make sure these environment variables are set:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_connection_string
```

## How It Works

### User Signup Flow

1. User submits signup form
2. Supabase Auth creates user in `auth.users` table
3. Client calls `/api/auth/signup` to create user in custom `users` table
4. Default organization is created for the user
5. User is redirected to dashboard

### User Signin Flow

1. User submits login form
2. Supabase Auth validates credentials
3. Client calls `/api/auth/sync-user` to ensure user exists in custom table
4. User is redirected to dashboard

### Automatic Synchronization

- **Webhook**: Automatically creates users in custom table when they sign up via Supabase Auth
- **Sync Endpoint**: Ensures existing users are synced when they sign in
- **Fallback**: Multiple sync mechanisms ensure data consistency

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/signup` - Create user in custom table (no auth required)
- `POST /api/auth/sync-user` - Sync existing user (requires auth)
- `POST /api/auth/webhook` - Supabase webhook handler
- `POST /api/auth/create-user` - Legacy endpoint (requires auth)

### User Management

- `GET /api/users/me` - Get current user data
- `PUT /api/users/me` - Update user data

## Testing

To test the setup:

1. **Sign up a new user** - Should create entries in both `auth.users` and `users` tables
2. **Sign in existing user** - Should sync user data if missing
3. **Check database** - Verify data exists in both tables

## Troubleshooting

### User Not Created in Custom Table

1. Check server logs for errors
2. Verify database connection
3. Ensure webhook is properly configured
4. Test sync endpoint manually

### Duplicate Users

The system prevents duplicate users by checking email uniqueness before creation.

### Missing Organizations

Each user should have a default organization created automatically. If missing, the sync endpoint will create one.

## Security Notes

- Webhook endpoint should be protected with service role key
- User data is validated before database insertion
- Authentication tokens are properly verified
- No sensitive data is logged

## Migration for Existing Users

If you have existing users in Supabase Auth but not in your custom table:

1. Use the sync endpoint to migrate them
2. Or run a one-time migration script
3. Or let them sign in normally (auto-sync will handle it)
