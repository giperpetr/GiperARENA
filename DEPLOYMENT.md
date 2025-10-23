# ArenaHUB Deployment Guide

## Infrastructure Overview

ArenaHUB leverages your **existing server infrastructure**:

### Existing Stacks (DO NOT RECREATE):
- ✅ **Supabase Stack** - PostgreSQL, Redis, MinIO, n8n, Neo4j
- ✅ **Monitoring Stack** - Prometheus, Grafana, Loki, AlertManager
- ✅ **Traefik** - Reverse proxy with automatic SSL

### New Stack to Deploy:
- 🆕 **ArenaHUB Stack** - API, Frontend, WebRTC, Blockchain services

---

## Pre-Deployment Checklist

### 1. Database Setup

```bash
# Connect to Supabase PostgreSQL
psql postgresql://postgres:${POSTGRES_PASSWORD}@supavisor:5432/${POSTGRES_DB}

# Create ArenaHUB tenant/schema
CREATE SCHEMA IF NOT EXISTS arenahub;

# Grant permissions to pooler user
GRANT ALL ON SCHEMA arenahub TO "postgres.arenahub";
GRANT ALL ON ALL TABLES IN SCHEMA arenahub TO "postgres.arenahub";
GRANT ALL ON ALL SEQUENCES IN SCHEMA arenahub TO "postgres.arenahub";

# Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgvector";

# Set search path for arenahub tenant
ALTER ROLE "postgres.arenahub" SET search_path TO arenahub, public;
```

### 2. MinIO Bucket Setup

```bash
# Access MinIO at https://minio.${MAIN_DOMAIN}
# Login with: ${MINIO_ROOT_USER} / ${MINIO_ROOT_PASSWORD}

# Create 'arenahub' bucket
# Set bucket policy to public-read for public assets
# Configure CORS:
```

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://${MAIN_DOMAIN}"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 3. Redis Database Assignment

Redis databases are allocated as follows:
- **DB 0**: n8n (existing)
- **DB 1**: ArenaHUB API (caching, sessions)
- **DB 2**: ArenaHUB Realtime (Socket.io adapter)
- **DB 3**: ArenaHUB Media (WebRTC state)
- **DB 4**: ArenaHUB Blockchain (transaction queue)

No setup needed - just configure in `.env`

### 4. Supavisor Tenant Configuration

```sql
-- Add ArenaHUB tenant to Supavisor
INSERT INTO _supabase.tenants (external_id, name, database, pool_mode)
VALUES ('arenahub', 'ArenaHUB', '${POSTGRES_DB}', 'transaction');

-- Verify tenant
SELECT * FROM _supabase.tenants WHERE external_id = 'arenahub';
```

---

## Deployment Steps

### Step 1: Clone Repository

```bash
cd /path/to/projects
git clone <repository-url> arenahub
cd arenahub
```

### Step 2: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required values from existing stacks:**
```bash
# From supabase/.env
POSTGRES_PASSWORD=<from supabase stack>
ANON_KEY=<from supabase stack>
SERVICE_ROLE_KEY=<from supabase stack>
JWT_SECRET=<from supabase stack>
REDIS_PASSWORD=<from supabase stack>
MINIO_ROOT_USER=<from supabase stack>
MINIO_ROOT_PASSWORD=<from supabase stack>

# Your domain
MAIN_DOMAIN=<your-domain.com>
SERVER_IP=<your-server-ip>
```

### Step 3: Run Database Migrations

```bash
# Install dependencies
cd backend
npm install

# Run migrations (this will create all tables in arenahub schema)
npm run migrate

# Seed initial data (optional)
npm run seed
```

### Step 4: Build Docker Images

```bash
# Build all services
docker compose build

# Or build specific service
docker compose build api
docker compose build frontend
```

### Step 5: Deploy ArenaHUB Stack

```bash
# Start all services
docker compose up -d

# Check logs
docker compose logs -f

# Check status
docker compose ps
```

### Step 6: Verify Deployment

```bash
# Check health endpoints
curl https://arenahub.${MAIN_DOMAIN}/health
curl https://${MAIN_DOMAIN}
curl https://ws.${MAIN_DOMAIN}/health
curl https://media.${MAIN_DOMAIN}/health

# Check Traefik routing
curl https://traefik.${MAIN_DOMAIN}/dashboard/
```

### Step 7: Configure Monitoring

#### Add Prometheus Scrape Config

Edit `monitoring/volumes/monitoring/prometheus/prometheus.yml`:

```yaml
scrape_configs:
  # ... existing configs ...

  - job_name: 'arenahub-api'
    static_configs:
      - targets: ['arenahub-api:9090']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'arenahub-api'
```

#### Import Grafana Dashboards

```bash
# Copy ArenaHUB dashboards to Grafana
cp ./monitoring/grafana-dashboards/*.json \
   ../monitoring/volumes/monitoring/grafana/dashboards/

# Reload Grafana
docker compose -f ../monitoring/docker-compose.yml restart grafana
```

#### Configure Loki Log Shipping

Edit `monitoring/volumes/monitoring/promtail/config.yml`:

```yaml
scrape_configs:
  # ... existing configs ...

  - job_name: arenahub
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: 'arenahub-.*'
        action: keep
```

### Step 8: Configure n8n Workflows

1. Access n8n at `https://n8n.${MAIN_DOMAIN}`
2. Import workflows from `./n8n-workflows/`
3. Configure webhooks:
   - Game notifications
   - Tournament reminders
   - Payment processing
   - Email notifications

---

## Post-Deployment Tasks

### 1. Deploy Solana Smart Contracts

```bash
cd blockchain

# Build contracts
anchor build

# Deploy to devnet (testing)
anchor deploy --provider.cluster devnet

# Deploy to mainnet (production)
anchor deploy --provider.cluster mainnet

# Update .env with program IDs
```

### 2. Configure Supabase Auth

Access Supabase Studio at `https://studio.${MAIN_DOMAIN}`:

1. **Authentication > Providers**
   - Enable Email
   - Configure OAuth providers (Google, Twitter, Discord)
   - Add redirect URLs:
     - `https://${MAIN_DOMAIN}/auth/callback`
     - `https://${MAIN_DOMAIN}/auth/callback/*`

2. **Authentication > URL Configuration**
   - Site URL: `https://${MAIN_DOMAIN}`
   - Redirect URLs: Add all necessary URLs

3. **Authentication > Email Templates**
   - Customize email templates for ArenaHUB branding

### 3. Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all ArenaHUB tables
ALTER TABLE arenahub.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.game_sessions ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables

-- Create policies (example for users table)
CREATE POLICY "Users can view own profile"
  ON arenahub.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON arenahub.users FOR UPDATE
  USING (auth.uid() = id);
```

### 4. Configure Alerts

Edit `monitoring/volumes/monitoring/prometheus/rules/arenahub.yml`:

```yaml
groups:
  - name: arenahub_alerts
    interval: 30s
    rules:
      - alert: ArenaHUBAPIDown
        expr: up{job="arenahub-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "ArenaHUB API is down"

      - alert: HighLatency
        expr: arenahub_api_latency_seconds > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency detected"

      - alert: HighErrorRate
        expr: rate(arenahub_api_errors_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate in ArenaHUB API"
```

---

## Maintenance

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api

# Last 100 lines
docker compose logs --tail=100 api

# Since specific time
docker compose logs --since 2024-10-22T10:00:00
```

### Updating Services

```bash
# Pull latest code
git pull origin main

# Rebuild specific service
docker compose build api
docker compose up -d api

# Or update all
docker compose build
docker compose up -d
```

### Database Migrations

```bash
# Create new migration
cd backend
npm run migration:create add_new_feature

# Run pending migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback
```

### Backup & Restore

```bash
# Database backup (via Supabase)
pg_dump -h supavisor -U postgres.arenahub -d ${POSTGRES_DB} \
  --schema=arenahub > arenahub_backup_$(date +%Y%m%d).sql

# Restore
psql -h supavisor -U postgres.arenahub -d ${POSTGRES_DB} \
  < arenahub_backup_20241022.sql

# MinIO backup
mc mirror minio/arenahub /backup/minio/arenahub/
```

### Scaling

```bash
# Scale API horizontally
docker compose up -d --scale api=3

# Scale WebSocket servers
docker compose up -d --scale realtime=2

# Note: Redis adapter will handle session distribution
```

---

## Troubleshooting

### API not accessible

```bash
# Check container status
docker compose ps

# Check logs
docker compose logs api

# Check Traefik routing
docker compose -f ../proxy/docker-compose.yml logs traefik | grep arenahub

# Verify network connectivity
docker exec arenahub-api ping supavisor
docker exec arenahub-api ping queue-redis
```

### Database connection issues

```bash
# Test Supavisor connection
docker exec arenahub-api psql postgresql://postgres.arenahub:${POSTGRES_PASSWORD}@supavisor:5432/${POSTGRES_DB} -c "SELECT 1"

# Check Supavisor logs
docker compose -f ../supabase/docker-compose.yml logs supavisor

# Verify tenant exists
docker exec supabase-db psql -U postgres -d _supabase -c "SELECT * FROM tenants WHERE external_id='arenahub'"
```

### Redis connection issues

```bash
# Test Redis connection
docker exec arenahub-api redis-cli -h queue-redis -a ${REDIS_PASSWORD} -n 1 PING

# Check Redis info
docker exec queue-redis redis-cli -a ${REDIS_PASSWORD} INFO

# Monitor Redis
docker exec queue-redis redis-cli -a ${REDIS_PASSWORD} MONITOR
```

### WebRTC/Media Server issues

```bash
# Check media server logs
docker compose logs media

# Test STUN/TURN connectivity
# Verify ${SERVER_IP} is correct and ports 40000-49999 are open
```

### SSL Certificate issues

```bash
# Check Traefik certificates
docker compose -f ../proxy/docker-compose.yml exec traefik \
  cat /letsencrypt/acme.json | jq

# Force certificate renewal
docker compose -f ../proxy/docker-compose.yml restart traefik
```

---

## Performance Tuning

### PostgreSQL (via Supabase)

Already optimized in Supabase stack, but you can add ArenaHUB-specific indexes:

```sql
-- Add indexes for frequently queried fields
CREATE INDEX CONCURRENTLY idx_game_sessions_arena_id ON arenahub.game_sessions(arena_id);
CREATE INDEX CONCURRENTLY idx_game_sessions_status ON arenahub.game_sessions(status);
CREATE INDEX CONCURRENTLY idx_users_username ON arenahub.users(username);
```

### Redis

```bash
# Monitor slow queries
docker exec queue-redis redis-cli -a ${REDIS_PASSWORD} SLOWLOG GET 10

# Check memory usage
docker exec queue-redis redis-cli -a ${REDIS_PASSWORD} INFO MEMORY
```

### Node.js Services

```yaml
# In docker-compose.yml, adjust resources:
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Security Checklist

- [ ] All services use HTTPS via Traefik
- [ ] No ports exposed directly (except WebRTC range)
- [ ] Strong passwords in `.env`
- [ ] RLS policies enabled on all tables
- [ ] JWT secrets are unique and strong
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Regular security updates (Watchtower enabled)
- [ ] Monitoring and alerts configured

---

## Support

For issues or questions:
1. Check logs: `docker compose logs`
2. Review this guide
3. Check existing Supabase/Monitoring stack health
4. Contact system administrator

**Last Updated**: October 22, 2025
