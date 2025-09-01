# Acta - AI Meeting Assistant

## Overview

Acta is a modern full-stack web application that serves as an AI-powered meeting assistant. The application transforms meeting conversations into structured, actionable insights including summaries, action items, key topics, and takeaways. Built with a React frontend and Express backend, Acta provides comprehensive meeting management with AI-powered transcription and analysis capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system featuring purple/blue gradients
- **State Management**: TanStack Query for server state, React Context for auth and language
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with custom path aliases

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Module System**: ES modules with Node.js
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Supabase Auth integration
- **API Design**: RESTful endpoints with middleware-based auth
- **Storage**: Abstracted storage layer with in-memory implementation for development

### Database Design
- **Users**: Authentication and profile management
- **Organizations**: Multi-tenant structure with ownership model
- **Meetings**: Core meeting data with AI-generated insights
- **Integrations**: Third-party service connections (Jira, Linear, Salesforce, etc.)
- **Webhook Events**: Event processing for external integrations

### Authentication & Authorization
- **Provider**: Supabase Auth for user authentication
- **Architecture**: JWT-based token authentication with middleware protection
- **User Management**: Role-based access control (owner/member)
- **Organization Model**: Users belong to organizations with ownership hierarchy

### AI Integration
- **Recall.ai**: Meeting bot deployment for recording and transcription
- **Processing Pipeline**: Webhook-based event processing for meeting analysis
- **AI Features**: Automatic summary generation, action item extraction, sentiment analysis

## External Dependencies

### Core Services
- **Supabase**: Authentication, user management, and real-time subscriptions
- **Neon Database**: PostgreSQL hosting with serverless architecture
- **Recall.ai**: AI meeting bot service for recording and transcription

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Backend bundling for production deployment
- **Replit**: Development environment integration with cartographer plugin

### Integration Partners
- **Video Platforms**: Google Meet, Microsoft Teams, Zoom
- **Productivity Tools**: Jira, Linear, Notion, Slack
- **CRM Systems**: Salesforce, HubSpot
- **Calendar**: Google Calendar, Microsoft Teams Calendar

### UI & Design
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Google Fonts**: Typography (Inter, DM Sans, Fira Code, Geist Mono)
- **Tailwind CSS**: Utility-first styling framework

### Development Dependencies
- **TypeScript**: Type safety across full stack
- **React Hook Form**: Form handling with Zod validation
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Component variant management

## Database Migrations

- Drizzle schema is defined in `shared/schema.ts`. Ensure `DATABASE_URL` is set.
- Run:
  - `npx drizzle-kit generate`
  - `npx drizzle-kit push`