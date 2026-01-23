# Quick Start with Docker

This is a quick reference guide for deploying Guallet with Docker. For detailed information, see [DOCKER.md](./DOCKER.md).

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2.0+
- Supabase account (for authentication)

## Quick Deploy

```bash
# 1. Copy environment files
cp database.env.sample database.env
cp api.env.sample api.env
cp webapp.env.sample webapp.env

# 2. Edit .env files and configure:
#    - webapp.env: VITE_SUPABASE_URL, VITE_SUPABASE_KEY
#    - api.env: NORDIGEN_SECRET_ID, NORDIGEN_SECRET_KEY
#    - database.env: Change default passwords (optional for dev)

# 3. Start all services
docker-compose up -d

# 4. Access the application
# - Webapp: http://localhost:3000
# - API: http://localhost:5000
# - pgAdmin: http://localhost:5050
```

## Default Credentials

### Database (Internal Only - Not Exposed)
- Username: `guallet`
- Password: `guallet_password`
- Database: `guallet`

### Redis (Internal Only - Not Exposed)
- Password: `guallet_redis_password`

### pgAdmin (GUI)
- URL: http://localhost:5050
- Email: `admin@guallet.io`
- Password: `admin`

**⚠️ IMPORTANT**: Change all default passwords in production!

## Common Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Remove all data (including database)
docker-compose down -v

# Rebuild after code changes
docker-compose build
docker-compose up -d
```

## Accessing the Database

The PostgreSQL database is **not exposed** to your host machine for security. To access it:

1. **Via pgAdmin** (Recommended):
   - Go to http://localhost:5050
   - Add server with host: `postgres`, port: `5432`

2. **Via Docker exec**:
   ```bash
   docker exec -it guallet-postgres psql -U guallet -d guallet
   ```

3. **Via database client**: Not possible - database is internal only. Use pgAdmin instead.

## Troubleshooting

### Ports Already in Use

If you get port conflicts, you can change the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change host port (left side)
  - "5001:5000"
  - "5051:80"
```

### Services Not Starting

Check service health:
```bash
docker-compose ps
docker-compose logs <service-name>
```

### Database Connection Issues

The API connects to the database using the hostname `postgres` (not `localhost`). This is automatically handled by Docker networking.

## Architecture

```
Internet
   │
   ├─→ Port 3000 → Webapp (Nginx)
   │                  │
   └─→ Port 5000 → API (NestJS)
                      │
         ┌────────────┼────────────┐
         │            │            │
         ↓            ↓            ↓
    PostgreSQL      Redis      pgAdmin
    (internal)   (internal)  (port 5050)
```

## Next Steps

- Configure your Supabase authentication
- Set up Nordigen for bank integrations
- Configure email notifications (optional)
- Review security settings in DOCKER.md

For more information, see the comprehensive guide in [DOCKER.md](./DOCKER.md).
