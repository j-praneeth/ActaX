# ActaX - Meeting Intelligence Platform

A modern, scalable meeting intelligence platform built with React, Node.js, and TypeScript, following SOLID principles and clean architecture patterns.

## 🏗️ Architecture

This project is structured as a monorepo with three independent packages:

- **`client/`** - React frontend application
- **`server/`** - Node.js backend API
- **`shared/`** - Shared types and schemas

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Supabase account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ActaX
```

2. Install dependencies for all packages:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Copy example files
cp client/env.example client/.env
cp server/env.example server/.env

# Edit the .env files with your actual values
```

4. Set up the database:
```bash
cd server
npm run db:push
```

### Development

Start both client and server in development mode:
```bash
npm run dev
```

Or start them individually:
```bash
# Start only the client (runs on http://localhost:3000)
npm run dev:client

# Start only the server (runs on http://localhost:5000)
npm run dev:server
```

### Production

Build all packages:
```bash
npm run build
```

Start in production mode:
```bash
npm run start
```

## 📁 Project Structure

```
ActaX/
├── client/                 # React frontend
│   ├── src/
│   │   ├── core/          # Core business logic
│   │   │   ├── interfaces/ # Service interfaces
│   │   │   ├── services/   # Service implementations
│   │   │   └── container/  # Dependency injection
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── hooks/         # Custom React hooks
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Node.js backend
│   ├── core/              # Core business logic
│   │   ├── interfaces/    # Repository and service interfaces
│   │   ├── repositories/  # Data access layer
│   │   ├── services/      # Business logic services
│   │   └── container/     # Dependency injection
│   ├── routes/            # API route handlers
│   ├── package.json
│   └── index.ts
├── shared/                 # Shared types and schemas
│   ├── types/             # TypeScript type definitions
│   ├── schemas/           # Zod validation schemas
│   └── package.json
└── package.json           # Workspace configuration
```

## 🎯 SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Each service has a single, well-defined responsibility
- Repositories handle only data access
- Services handle only business logic
- Components handle only UI concerns

### Open/Closed Principle (OCP)
- Services are open for extension through interfaces
- New implementations can be added without modifying existing code
- Plugin architecture for integrations

### Liskov Substitution Principle (LSP)
- All implementations properly implement their interfaces
- Subtypes are substitutable for their base types
- Interface contracts are maintained

### Interface Segregation Principle (ISP)
- Interfaces are focused and specific
- Clients depend only on methods they use
- No fat interfaces

### Dependency Inversion Principle (DIP)
- High-level modules don't depend on low-level modules
- Both depend on abstractions
- Dependency injection container manages dependencies

## 🔧 Development

### Adding New Features

1. **Define interfaces** in the appropriate `interfaces/` directory
2. **Implement services** in the `services/` directory
3. **Register dependencies** in the container setup
4. **Create API routes** in the `routes/` directory
5. **Add client services** for API communication

### Testing

```bash
# Run type checking for all packages
npm run check

# Run tests (when implemented)
npm test
```

### Code Quality

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Zod for runtime validation

## 🌐 API Documentation

### Authentication
- `POST /api/auth/verify` - Verify session token
- `POST /api/auth/refresh` - Refresh session
- `GET /api/auth/google` - Get Google OAuth URL
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `POST /api/auth/signup` - Create new user

### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/:id` - Get meeting by ID
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `POST /api/meetings/validate` - Validate meeting URL
- `POST /api/meetings/join-bot` - Join meeting with bot

### Integrations
- `GET /api/integrations` - Get all integrations
- `POST /api/integrations/:provider/connect` - Connect integration
- `POST /api/integrations/callback` - Handle OAuth callback
- `DELETE /api/integrations/:id` - Disconnect integration

### Analytics
- `GET /api/analytics/meetings` - Get meeting analytics

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d
```

### Manual Deployment

1. Build all packages:
```bash
npm run build
```

2. Deploy server:
```bash
cd server
npm start
```

3. Deploy client (static files):
```bash
# Serve the client/dist directory with your web server
```

## 📝 Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=ActaX
VITE_APP_VERSION=1.0.0
```

### Server (.env)
```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RECALL_API_KEY=...
GEMINI_API_KEY=...
FRONTEND_URL=http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following SOLID principles
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
