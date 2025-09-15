# Jira OAuth Scope Configuration Guide

## 🚨 Current Issue
Your Jira OAuth app is missing the required scopes. The error indicates:
> "This app has requested Jira API scopes that have not been added to the app. Configure the app at https://developer.atlassian.com/apps and add the following scopes to the Jira API: manage:jira-project."

## ✅ Solution

### Step 1: Update Your Jira OAuth App
1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps)
2. Select your Jira OAuth app
3. Go to "OAuth 2.0 (3LO)" settings
4. In the "Jira API" section, add these scopes:
   - `read:jira-work` ✅ (Read Jira issues, projects, etc.)
   - `write:jira-work` ✅ (Create and update Jira issues)
   - `read:jira-user` ✅ (Read user information)
   - `offline_access` ✅ (Refresh tokens)

### Step 2: Remove Unsupported Scopes
- ❌ Remove `manage:jira-project` (not available for your app type)
- ❌ Remove any other scopes that show as "not available"

### Step 3: Update Callback URL
Make sure your callback URL is set to:
```
http://localhost:5000/api/integrations/callback
```

## 🔧 Code Configuration

The server is now configured to use only basic scopes:

```javascript
const scopes = [
  'read:jira-work',    // Read Jira data
  'write:jira-work'    // Write Jira data
].join(' ');
```

## 📋 Available Jira OAuth Scopes

### Basic Scopes (Usually Available)
- `read:jira-work` - Read issues, projects, etc.
- `write:jira-work` - Create and update issues
- `read:jira-user` - Read user information
- `offline_access` - Refresh tokens

### Advanced Scopes (May Not Be Available)
- `manage:jira-project` - Manage projects (requires special permissions)
- `admin:jira-work` - Admin access (requires admin permissions)

## 🧪 Testing

After updating your Jira OAuth app:

1. **Test OAuth Connect**: Should generate URL without scope errors
2. **Test OAuth Flow**: Should complete successfully
3. **Check Server Logs**: Should show successful token exchange

## 🔍 Troubleshooting

If you still get scope errors:
1. Check which scopes are actually available in your Jira OAuth app
2. Update the `scopes` array in the code to match available scopes
3. Ensure your Jira OAuth app has the correct permissions

## 📝 Environment Variables

Make sure your `.env` file has:
```env
JIRA_CLIENT_ID=your-actual-client-id
JIRA_CLIENT_SECRET=your-actual-client-secret
CALLBACK_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```
