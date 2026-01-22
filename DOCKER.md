# Docker Deployment Guide

This guide explains how to deploy the Guallet application using Docker and Docker Compose.

## Overview

The Docker setup includes the following services:

- **PostgreSQL**: Database for storing application data (not exposed externally)
- **Redis**: Message queue for background jobs (not exposed externally)
- **pgAdmin**: Web-based GUI for database management (accessible on port 5050)
- **API**: NestJS backend API (accessible on port 5000)
- **Webapp**: React frontend application (accessible on port 3000)

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose V2.0 or higher
- At least 2GB of free disk space
- Supabase project (for authentication)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Guallet/monorepo.git
   cd monorepo
   ```

2. **Create environment file**
   ```bash
   cp .env.docker.example .env
   ```

3. **Configure environment variables**
   
   Edit the `.env` file and fill in the required values:
   
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_KEY`: Your Supabase anon/public key
   - `NORDIGEN_SECRET_ID`: Nordigen API credentials for bank integrations
   - `NORDIGEN_SECRET_KEY`: Nordigen API secret key

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - **Webapp**: http://localhost:3000
   - **API**: http://localhost:5000
   - **pgAdmin**: http://localhost:5050 (Email: admin@guallet.local, Password: admin)

## Configuration

### Database Configuration

The PostgreSQL database is configured with environment variables that can be customized:

- **Host**: `postgres` (internal Docker network)
- **Port**: `5432` (not exposed externally)
- **Database**: `${POSTGRES_DB:-guallet}`
- **Username**: `${POSTGRES_USER:-guallet}`
- **Password**: `${POSTGRES_PASSWORD:-guallet_password}`

**⚠️ Security Note**: The database is NOT exposed to the host machine. It's only accessible from other containers within the Docker network. This is by design for security purposes.

**⚠️ Production Security**: The default passwords shown above are for development only. For production deployments, you MUST change these passwords in your `.env` file.

### Redis Configuration

Redis is used for background job processing with BullMQ:

- **Host**: `redis` (internal Docker network)
- **Port**: `6379` (not exposed externally)
- **Password**: `${REDIS_PASSWORD:-guallet_redis_password}`

**⚠️ Production Security**: Change the Redis password in your `.env` file for production deployments.

### pgAdmin - Database Management

To connect to the database from pgAdmin:

1. Open http://localhost:5050
2. Login with the credentials from your `.env` file (default: `admin@guallet.local` / `admin`)
3. Add a new server:
   - **General** tab:
     - Name: `Guallet Database`
   - **Connection** tab:
     - Host: `postgres`
     - Port: `5432`
     - Username: Value from `POSTGRES_USER` (default: `guallet`)
     - Password: Value from `POSTGRES_PASSWORD` (default: `guallet_password`)
     - Database: Value from `POSTGRES_DB` (default: `guallet`)

### Environment Variables

All environment variables can be configured in the `.env` file:

#### Required Variables

- `POSTGRES_USER`: PostgreSQL username (default: `guallet`)
- `POSTGRES_PASSWORD`: PostgreSQL password (default: `guallet_password`)
- `POSTGRES_DB`: PostgreSQL database name (default: `guallet`)
- `REDIS_PASSWORD`: Redis password (default: `guallet_redis_password`)
- `PGADMIN_EMAIL`: pgAdmin login email (default: `admin@guallet.local`)
- `PGADMIN_PASSWORD`: pgAdmin login password (default: `admin`)
- `VITE_SUPABASE_URL`: Supabase project URL for authentication
- `VITE_SUPABASE_KEY`: Supabase public/anon key
- `NORDIGEN_SECRET_ID`: API credentials for bank integrations
- `NORDIGEN_SECRET_KEY`: API secret for bank integrations

#### Optional Variables

- `RESEND_API_KEY`: For email notifications
- `EMAIL_FROM`: Email sender address
- `VITE_SENTRY_ENABLED`: Enable Sentry error tracking (true/false)
- `VITE_SENTRY_DSN`: Sentry DSN
- `APITALLY_ENABLED`: Enable API monitoring (true/false)
- `APITALLY_CLIENT_ID`: Apitally client ID
- `APITALLY_ENV`: Environment (dev/prod)

## Docker Commands

### Start all services
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f webapp
```

### Restart a service
```bash
docker-compose restart api
docker-compose restart webapp
```

### Rebuild a service
```bash
docker-compose build api
docker-compose build webapp
```

### Remove all data (including database)
```bash
docker-compose down -v
```

## Production Deployment

For production deployment, consider the following:

1. **Change default passwords**: Update all default passwords in the `docker-compose.yml` file
2. **Use secrets management**: Store sensitive data using Docker secrets or external secret managers
3. **Enable SSL/TLS**: Use a reverse proxy like Nginx or Traefik with SSL certificates
4. **Backup database**: Set up regular database backups
5. **Monitor resources**: Use monitoring tools to track CPU, memory, and disk usage
6. **Update regularly**: Keep Docker images and dependencies up to date

### Recommended docker-compose.override.yml for production

Create a `docker-compose.override.yml` file:

```yaml
version: '3.8'

services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # Use strong password
  
  redis:
    command: redis-server --requirepass ${REDIS_PASSWORD}  # Use strong password
  
  api:
    environment:
      DATABASE_PASSWORD: ${POSTGRES_PASSWORD}
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    restart: always
  
  webapp:
    restart: always
```

## Troubleshooting

### Database connection issues

If the API cannot connect to the database:

1. Check if PostgreSQL is healthy:
   ```bash
   docker-compose ps postgres
   ```

2. View PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify the database credentials in `.env` match those in `docker-compose.yml`

### Port conflicts

If you get port binding errors:

1. Check which services are using the ports:
   ```bash
   # On Linux/Mac
   lsof -i :3000
   lsof -i :5000
   lsof -i :5050
   
   # On Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   netstat -ano | findstr :5050
   ```

2. Either stop the conflicting service or change the port mapping in `docker-compose.yml`

### Build failures

If the build fails:

1. Clean Docker build cache:
   ```bash
   docker-compose build --no-cache
   ```

2. Ensure you have enough disk space:
   ```bash
   docker system df
   ```

3. Prune unused Docker resources:
   ```bash
   docker system prune -a
   ```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Internet                      │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    Port 3000               Port 5000
   ┌─────────┐            ┌─────────┐
   │ Webapp  │───────────▶│   API   │
   │ (Nginx) │            │ (NestJS)│
   └─────────┘            └────┬────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌──────────┐     ┌──────────┐    ┌─────────┐
       │PostgreSQL│     │  Redis   │    │pgAdmin  │
       │(internal)│     │(internal)│    │Port 5050│
       └──────────┘     └──────────┘    └─────────┘
                  
              └──────────────────────────┘
                   guallet-network
                  (Internal Bridge)
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/Guallet/monorepo/issues
- Documentation: Check the main README.md

## License

This project is licensed under AGPL-3.0 - see the LICENSE file for details.
