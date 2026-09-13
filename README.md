# Job Automation Platform

A production-grade job automation platform where users can create, schedule, and manage automated jobs with full execution history, retry logic, and concurrent worker support.

## Features

- **Job Management** — Create, edit, pause/resume, and delete automated jobs
- **Multiple Job Types** — HTTP Request, Webhook (extensible to Data Sync, Script)
- **Cron Scheduling** — Schedule jobs using cron expressions or trigger manually
- **Concurrent Workers** — Multiple workers process jobs safely using database-level locking
- **Retry Logic** — Exponential backoff with configurable max retries
- **Execution History** — Full audit trail of every execution with logs
- **Failure Recovery** — Stale job detection, heartbeat monitoring, automatic retries
- **Dashboard** — Real-time stats, success rates, recent executions, worker health
- **Authentication** — JWT-based auth with per-user job isolation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend API | .NET 8, ASP.NET Core, Entity Framework Core |
| Background Workers | .NET BackgroundService |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |

## Quick Start (Docker)

```bash
# Clone the repository
git clone <repo-url>
cd job-automation-platform

# Start all services
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost:3000
# API:      http://localhost:8080
# Swagger:  http://localhost:8080/swagger
```

## Local Development Setup

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16](https://www.postgresql.org/download/)
- [Docker](https://www.docker.com/) (optional, for containerized setup)

### Database Setup

```bash
# Start PostgreSQL (or use Docker)
docker run -d --name jobplatform-db \
  -e POSTGRES_DB=jobplatform \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine

# Apply migrations
cd backend
dotnet ef database update --project JobPlatform.Infrastructure --startup-project JobPlatform.Api
```

### Backend

```bash
cd backend

# Restore dependencies
dotnet restore

# Run the API
dotnet run --project JobPlatform.Api

# In another terminal, run the worker
dotnet run --project JobPlatform.Worker
```

The API will be available at `http://localhost:8080` with Swagger at `http://localhost:8080/swagger`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment variable
export NEXT_PUBLIC_API_URL=http://localhost:8080

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | `Host=localhost;Port=5432;Database=jobplatform;Username=postgres;Password=postgres` |
| `Jwt__Key` | JWT signing key (min 32 chars) | Set in appsettings.json |
| `Jwt__Issuer` | JWT issuer | `JobPlatform` |
| `Jwt__Audience` | JWT audience | `JobPlatform` |
| `NEXT_PUBLIC_API_URL` | Backend API URL for frontend | `http://localhost:8080` |
| `ASPNETCORE_URLS` | API listen URL | `http://+:8080` |

## Running Tests

```bash
cd backend
dotnet test
```

## Deployment

### Docker Compose (Production)

```bash
docker-compose -f docker-compose.yml up --build -d
```

### Manual Deployment

1. Build the backend: `dotnet publish -c Release`
2. Build the frontend: `npm run build`
3. Set environment variables on your hosting platform
4. Run database migrations
5. Start the API, Worker(s), and Frontend processes

See [ENGINEERING.md](./ENGINEERING.md) for detailed architecture and deployment notes.

## Project Structure

```
├── backend/
│   ├── JobPlatform.Api/           # ASP.NET Core Web API
│   ├── JobPlatform.Core/          # Domain models, DTOs, interfaces
│   ├── JobPlatform.Infrastructure/# Data access, service implementations
│   ├── JobPlatform.Worker/        # Background job processor
│   └── JobPlatform.Tests/         # Automated tests
├── frontend/
│   └── src/
│       ├── app/                   # Next.js pages (App Router)
│       ├── components/            # React components
│       ├── lib/                   # API client, auth, utilities
│       └── types/                 # TypeScript types
├── docker-compose.yml
├── ENGINEERING.md
└── README.md
```

## License

MIT
