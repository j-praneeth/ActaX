# ActaX AI - Setup Guide

This guide will help you set up the complete ActaX AI meeting management system with Google OAuth, Supabase, Recall.ai, and Jira integration.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use Supabase)
- Google Cloud Console project
- Recall.ai account
- Jira Cloud instance (optional)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/actax_db

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Recall.ai
RECALL_API_KEY=your-recall-api-key

# Jira Integration
JIRA_CLIENT_ID=your-jira-client-id
JIRA_CLIENT_SECRET=your-jira-client-secret

# Other Integrations (Optional)
LINEAR_CLIENT_ID=your-linear-client-id
LINEAR_CLIENT_SECRET=your-linear-client-secret

SALESFORCE_CLIENT_ID=your-salesforce-client-id
SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret

HUBSPOT_CLIENT_ID=your-hubspot-client-id
HUBSPOT_CLIENT_SECRET=your-hubspot-client-secret

SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret

NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret

# Application URLs
CALLBACK_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Setup Steps

### 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Run the database migrations:
   ```bash
   npm run db:push
   ```

### 2. Google OAuth Setup (CRITICAL - Required for Google Sign-In)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google+ API
   - Google Calendar API
   - Google Meet API (if available)
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application** as the application type
6. Set **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. **IMPORTANT**: Copy the Client ID and Client Secret exactly as shown
8. Add these to your `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

**Common Issues:**
- Make sure the Client ID ends with `.apps.googleusercontent.com`
- Ensure the redirect URI matches exactly (including http vs https)
- Don't include any extra spaces or quotes in the environment variables

### 3. Recall.ai Setup

1. Sign up at [recall.ai](https://recall.ai)
2. Get your API key from the dashboard
3. Add it to your `.env` file as `RECALL_API_KEY`

### 4. Jira Integration Setup

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Create a new app
3. Set the callback URL to: `http://localhost:5000/api/integrations/callback`
4. Add the required scopes:
   - `read:jira-work`
   - `write:jira-work`
5. Copy the Client ID and Client Secret to your `.env` file

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Features Implemented

### ✅ Google OAuth Authentication
- Secure user authentication with Google
- Automatic user and organization creation
- Session management with JWT tokens

### ✅ Supabase Database Integration
- Complete database schema for users, meetings, and integrations
- Automatic table creation and migrations
- Real-time data synchronization

### ✅ Recall.ai Integration
- Automatic Google Meet meeting recording
- Real-time transcription and AI analysis
- Webhook processing for meeting events
- Meeting insights generation (action items, key topics, decisions, takeaways)

### ✅ Jira Integration
- Automatic meeting summary creation in Jira
- Action items converted to Jira tasks
- Rich meeting descriptions with formatted content
- Issue linking between summary and action items

### ✅ Meeting Management UI
- Create meetings with Google Meet integration
- View detailed meeting insights
- Search and filter meetings
- Integration management panel

### ✅ Additional Integrations
- Slack (share meeting summaries)
- Notion (save meeting notes)
- Linear (create issues from action items)
- Salesforce (create tasks)
- HubSpot (CRM integration)

## API Endpoints

### Authentication
- `GET /api/auth/google` - Get Google OAuth URL
- `POST /api/auth/google/callback` - Handle OAuth callback
- `POST /api/auth/verify` - Verify session token

### Meetings
- `GET /api/meetings` - Get user's meetings
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/:id` - Get meeting details
- `POST /api/meetings/:id/sync` - Sync meeting to integration

### Integrations
- `GET /api/integrations` - Get user's integrations
- `POST /api/integrations/:provider/connect` - Connect integration
- `POST /api/integrations/callback` - Handle OAuth callback

### Webhooks
- `POST /api/webhooks/recall` - Recall.ai webhook handler

## Usage

1. **Sign in with Google** - Users can authenticate using their Google account
2. **Create Meetings** - Set up meetings with automatic Google Meet links
3. **Automatic Recording** - Recall.ai bots join meetings and record/transcribe
4. **AI Analysis** - Meeting content is analyzed for insights and action items
5. **Integration Sync** - Meeting summaries are automatically pushed to connected tools like Jira

## Troubleshooting

### Common Issues

1. **Google OAuth not working - "Missing required parameter: client_id"**
   - **Check your `.env` file exists** and contains:
     ```env
     GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-client-secret
     ```
   - **Restart your server** after adding environment variables
   - **Verify the Client ID format** - it should end with `.apps.googleusercontent.com`
   - **Check for typos** in environment variable names (case-sensitive)
   - **Ensure no extra spaces** around the values in `.env` file
   - **Test environment variables** by adding `console.log(process.env.GOOGLE_CLIENT_ID)` in your code

2. **Database connection issues**
   - Check DATABASE_URL format
   - Ensure database is running
   - Verify Supabase credentials

3. **Recall.ai integration failing**
   - Verify API key is correct
   - Check webhook URL is accessible
   - Ensure meeting URLs are valid Google Meet links

4. **Jira sync not working**
   - Verify Jira app permissions
   - Check callback URL configuration
   - Ensure user has access to target Jira project

## Security Notes

- All OAuth tokens are encrypted before storage
- Session tokens expire after 24 hours
- API endpoints are protected with authentication middleware
- Environment variables should never be committed to version control

## Support

For issues or questions, please check the troubleshooting section above or create an issue in the repository.

