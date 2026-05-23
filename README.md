# Hive Pal 🐝

[![Tests](https://github.com/martinhrvn/hive-pal/actions/workflows/check.yml/badge.svg)](https://github.com/martinhrvn/hive-pal/actions/workflows/check.yml)

A modern beekeeping management application designed for both mobile and desktop use. Track your apiaries, hives, inspections, and more with an intuitive interface.

**⚠️ IMPORTANT: This project is very much a Work In Progress. The API is mostly stable but there may be breaking changes.**

## Features

- **Apiary Management**: Create and track multiple apiaries with location information
- **Hive Tracking**: Monitor hives, their status, and configuration
- **Inspection Workflows**: Record detailed inspections with observations and actions
- **Queen Management**: Track queen lineage and replacement history
- **AI-Assisted Inspections**: Transcribe voice recordings to inspection drafts (optional)
- **Mobile-First Design**: Optimised for field use with easy data entry

## Self-Hosted Setup

### Prerequisites

- Docker and Docker Compose
- A domain name (if using HTTPS / Traefik)

### Quick Start (HTTP only)

Create a `.env` file and a `docker-compose.yaml`:

**.env**
```env
DOMAIN=yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
# Must be a bcrypt hash — see "Setting the Admin Password" below
ADMIN_PASSWORD=$2a$12$5m1UQcYmWiDRHrXrFFxoqeX4BTGOKQDINfhXX5j9CkUwdJ8F62hIq
POSTGRES_PASSWORD=change-me-strong-db-password
DATABASE_URL=postgres://postgres:${POSTGRES_PASSWORD}@postgres:5432/beekeeper
FRONTEND_URL=http://yourdomain.com
JWT_SECRET=change-me-long-random-string
```

**docker-compose.yaml**
```yaml
services:
  app:
    image: ghcr.io/martinhrvn/hive-pal:latest
    ports:
      - '80:3000'
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      FRONTEND_URL: ${FRONTEND_URL}
      JWT_SECRET: ${JWT_SECRET}
      STORAGE_TYPE: local
    volumes:
      - uploads:/data/uploads
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: beekeeper
    volumes:
      - /data/hive-pal-data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres -d beekeeper']
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  uploads:
```

Then run:

```bash
docker compose up -d
```

The application will be available at `http://yourdomain.com`.

---

### Setting the Admin Password

The `ADMIN_PASSWORD` environment variable **must be a bcrypt hash**. The application uses `bcrypt.compare()` to verify it, so a plain-text password will not work.

Generate a hash using Node.js (no extra dependencies required):

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-password-here', 12).then(h => console.log(h));"
```

Or using Python:

```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'your-password-here', bcrypt.gensalt(12)).decode())"
```

The resulting string (e.g. `$2a$12$...`) is what you set as `ADMIN_PASSWORD` in your `.env` file.

> The example hash in this README is for the password `password` and is **for demonstration only**. Always set a strong, unique password in production.

---

### HTTPS with Traefik

For production deployments with automatic TLS (via Let's Encrypt), use the Traefik setup. This is the recommended approach when exposing Hive Pal to the internet.

**.env**
```env
DOMAIN=hivepal.yourdomain.com
ACME_EMAIL=admin@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
# Must be a bcrypt hash — see "Setting the Admin Password"
ADMIN_PASSWORD=$2a$12$5m1UQcYmWiDRHrXrFFxoqeX4BTGOKQDINfhXX5j9CkUwdJ8F62hIq
POSTGRES_PASSWORD=change-me-strong-db-password
DATABASE_URL=postgres://postgres:${POSTGRES_PASSWORD}@postgres:5432/beekeeper
JWT_SECRET=change-me-long-random-string
```

**docker-compose.traefik.yaml**
```yaml
services:
  traefik:
    image: traefik:v3.0
    container_name: hive-pal-traefik
    command:
      - '--providers.docker=true'
      - '--providers.docker.exposedbydefault=false'
      - '--entrypoints.web.address=:80'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge=true'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web'
      - '--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
      - '--entrypoints.web.http.redirections.entrypoint.to=websecure'
      - '--entrypoints.web.http.redirections.entrypoint.scheme=https'
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - '/var/run/docker.sock:/var/run/docker.sock:ro'
      - '/data/hive-pal-data/letsencrypt:/letsencrypt'
    restart: unless-stopped

  app:
    image: ghcr.io/martinhrvn/hive-pal:latest
    container_name: hive-pal-app
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      FRONTEND_URL: https://${DOMAIN}
      JWT_SECRET: ${JWT_SECRET}
      STORAGE_TYPE: local
    volumes:
      - /data/hive-pal-data/uploads:/data/uploads
    depends_on:
      postgres:
        condition: service_healthy
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.app.rule=Host(`${DOMAIN}`)'
      - 'traefik.http.routers.app.entrypoints=websecure'
      - 'traefik.http.routers.app.tls.certresolver=letsencrypt'
      - 'traefik.http.services.app.loadbalancer.server.port=3000'
    restart: unless-stopped

  postgres:
    image: postgres:14
    container_name: hive-pal-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: beekeeper
    volumes:
      - '/data/hive-pal-data/postgres:/var/lib/postgresql/data'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres -d beekeeper']
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
```

Run with:

```bash
docker compose -f docker-compose.traefik.yaml up -d
```

Ensure ports 80 and 443 are open in your firewall and that your DNS A record points to the server's IP before starting. Traefik will obtain and renew certificates automatically.

---

### Email / SMTP Configuration

Email is optional but required for password reset functionality. Two providers are supported — the application will auto-detect which one to use based on the environment variables present.

**Option 1 — SMTP**

Add the following to your `.env`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=your-smtp-password
SMTP_SECURE=false              # true for port 465 (SSL), false for 587 (STARTTLS)
SMTP_REJECT_UNAUTHORIZED=true  # set to false only if using self-signed certs
FROM_EMAIL=noreply@example.com
```

For Gmail, generate an [App Password](https://support.google.com/accounts/answer/185833) and use that as `SMTP_PASS` with `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587`.

**Option 2 — Resend**

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

If both are configured, Resend takes priority. To force a specific provider set `MAIL_PROVIDER=smtp` or `MAIL_PROVIDER=resend`. Set `MAIL_PROVIDER=none` to explicitly disable email.

---

### AI Module (Voice-to-Inspection)

Hive Pal includes an optional AI module that transcribes voice recordings into inspection drafts. It uses [Faster-Whisper](https://github.com/SYSTRAN/faster-whisper) for speech-to-text and [Ollama](https://ollama.com) to parse the transcript into a structured inspection.

**Step 1 — Prepare the data directory**

The AI service expects the following folder structure on the host:

```
/data/hivepal/ai/
  incoming/     # Drop audio files here
  processed/    # Processed audio files are moved here
  transcripts/  # Raw transcripts are saved here
  ollama/       # Ollama model storage
```

Create the directories and ensure the container user (ID 999) has read/write access:

```bash
mkdir -p /data/hivepal/ai/{incoming,processed,transcripts,ollama}
chmod -R 777 /data/hivepal/ai
```

**Step 2 — Add the AI services to your compose file**

```yaml
  hivepal-ai:
    image: ghcr.io/martinhrvn/hivepal-ai:latest
    container_name: hivepal-ai
    depends_on:
      - ollama
    environment:
      OLLAMA_URL: http://ollama:11434/api/chat
      OLLAMA_MODEL: qwen2.5:3b
      WHISPER_MODEL: small
      WHISPER_COMPUTE_TYPE: int8
      AUDIO_INPUT_DIR: /data/incoming
      TRANSCRIPTS_DIR: /data/transcripts
      OUTPUT_DIR: /data/processed
      AI_API_KEY: change-me-long-random-string
    ports:
      - '8008:8008'
    volumes:
      - /data/hivepal/ai:/data
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    container_name: hivepal-ollama
    ports:
      - '11434:11434'
    volumes:
      - /data/hivepal/ai/ollama:/root/.ollama
    restart: unless-stopped
```

**Step 3 — Enable AI in the main app**

Add these variables to the `app` service environment:

```env
AI_ENABLED=true
AI_SERVICE_URL=http://hivepal-ai:8008
AI_SERVICE_API_KEY=change-me-long-random-string   # must match AI_API_KEY above
AI_REQUEST_TIMEOUT_MS=300000
STORAGE_TYPE=local
```

**Step 4 — Pull the Ollama model**

After the stack starts, pull the language model (approximately 2 GB):

```bash
docker exec hivepal-ollama ollama pull qwen2.5:3b
```

Alternatively, trigger the pull via the API:

```bash
curl -X POST http://your-server:11434/api/pull \
  -d '{"model": "qwen2.5:3b", "stream": false}'
```

You can use a different model by changing `OLLAMA_MODEL`. Larger models produce better results but require more RAM. The `qwen2.5:3b` model works well on CPU-only servers.

**Verify the AI service is running:**

```bash
curl http://your-server:8008/health
```

---

## Inspection Types

Each apiary can be configured to use one of two inspection workflows. The setting is per-apiary and can be changed at any time from the apiary settings screen.

### Data Driven (default)

Inspections record concrete counts and measurements: frames of brood, frames of bees, honey stores, etc. The application uses these values to calculate a hive health score automatically. This mode is best for beekeepers who want structured, comparable data across inspections and hives.

### Subjective

Inspections use qualitative 0–10 ratings for each observed attribute (brood quality, temper, stores, etc.). There are no frame counts or auto-scoring. This mode suits beekeepers who prefer a quicker, impression-based record without counting individual frames.

### Switching Inspection Type

1. Navigate to **Apiaries** and select the apiary you want to configure.
2. Open **Edit Apiary** (pencil icon).
3. Under **Inspection Type**, choose *Data Driven* or *Subjective*.
4. Save. All new inspections for hives in that apiary will use the selected workflow.

Existing inspection records are not affected when you switch — they remain stored with their original values.

---

## Environment Variables Reference

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_EMAIL` | Email address for the built-in admin account |
| `ADMIN_PASSWORD` | **bcrypt hash** of the admin password |
| `FRONTEND_URL` | Public URL of the application (used in emails and CORS) |
| `JWT_SECRET` | Secret key used to sign JWT tokens |

### Optional — Email

| Variable | Description |
|----------|-------------|
| `MAIL_PROVIDER` | Force a provider: `resend`, `smtp`, or `none` |
| `RESEND_API_KEY` | API key for Resend (takes priority over SMTP) |
| `MAIL_PROVIDER` | Force a specific provider: `resend`, `smtp`, or `none` (auto-selects if unset) |
| `RESEND_API_KEY` | API key for Resend email provider |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_SECURE` | `true` for port 465 (SSL), `false` for port 587 (STARTTLS) |
| `SMTP_REJECT_UNAUTHORIZED` | Reject self-signed TLS certificates (`true` recommended for production) |
| `SMTP_REJECT_UNAUTHORIZED` | Reject invalid TLS certificates (default `true`; set `false` for self-signed) |
| `FROM_EMAIL` | Sender address for outgoing emails |

### Optional — Storage

| Variable | Description |
|----------|-------------|
| `STORAGE_TYPE` | `local` for filesystem storage, `s3` for S3-compatible (default: `s3`) |
| `STORAGE_LOCAL_PATH` | Directory for local file storage (default: `/data/uploads`) |
| `S3_ENDPOINT` | S3-compatible endpoint URL |
| `S3_REGION` | S3 region (default: `us-east-1`) |
| `S3_BUCKET` | S3 bucket name |
| `S3_ACCESS_KEY_ID` | S3 access key |
| `S3_SECRET_ACCESS_KEY` | S3 secret key |

### Optional — AI Module

| Variable | Description |
|----------|-------------|
| `AI_ENABLED` | Set to `true` to enable AI voice processing |
| `AI_SERVICE_URL` | Base URL of the AI service (e.g. `http://hivepal-ai:8008`) |
| `AI_SERVICE_API_KEY` | Shared secret between the app and the AI service |
| `AI_REQUEST_TIMEOUT_MS` | Timeout for AI requests in milliseconds (default: `300000`) |

### Optional — Monitoring / Error Tracking

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | Backend Sentry DSN |
| `SENTRY_ENVIRONMENT` | Backend Sentry environment tag |
| `VITE_SENTRY_DSN` | Frontend Sentry DSN |
| `VITE_SENTRY_ENVIRONMENT` | Frontend Sentry environment tag |

---

## Development

### Prerequisites

- Node.js 22+
- PNPM package manager
- Docker (for the database)

```bash
# Clone the repository
git clone https://github.com/martinhrvn/hive-pal.git
cd hive-pal

# Install dependencies
pnpm install

# Copy and edit the backend env file
cp apps/backend/.env.example apps/backend/.env

# Start the development stack (frontend + backend + database)
pnpm dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3000/api`.
Swagger UI is available at `http://localhost:3000/api-docs`.

### Useful Commands

```bash
# Build all packages
turbo build

# Run backend E2E tests (requires Docker for Testcontainers)
cd apps/backend && pnpm test:e2e

# Run frontend component tests
cd apps/frontend && pnpm test:ct

# Lint and format
turbo lint
turbo format
```

---

## Project Structure

```
apps/
  frontend/    React application
  backend/     NestJS API server
  ai-app/      Optional AI voice transcription service
  e2e/         Playwright end-to-end tests
packages/
  shared-schemas/   Zod validation schemas (used by both frontend and backend)
  page-objects/     Page objects for E2E testing
```

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand + React Query (TanStack Query)
- **Routing**: React Router
- **Build Tool**: Vite

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL 14
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Winston with Loki integration
- **Monitoring**: Prometheus metrics, health checks

### DevOps & Tooling
- **Package Management**: PNPM with workspaces
- **Build System**: Turborepo
- **Containerisation**: Docker with multi-stage builds
- **Testing**: Jest, Playwright, Testcontainers
- **CI/CD**: GitHub Actions

## License

This project is licensed under the MIT License — see the LICENSE file for details.

## Acknowledgments

- Inspired by beekeepers who needed a better way to track their hives
