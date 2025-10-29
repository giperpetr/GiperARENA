# Quick Reference: Next Steps After Database Migration

**Status as of Oct 29, 2025**: ✅ All 25 migrations applied, 39 tables in production

---

## 🎯 Immediate Next Actions

### 1. Create MinIO Bucket (PRIORITY)

**Via Supabase Storage API:**
```bash
# Endpoint: https://api.gipergiraffe.com/storage/v1
# Research how to create bucket via Kong gateway
# Expected structure:
# POST /storage/v1/bucket
# Headers: Authorization: Bearer {SERVICE_ROLE_KEY}
# Body: {"id": "giperarena", "name": "giperarena", "public": false}
```

**Bucket structure to create:**
```
giperarena/
├── users/avatars/{user_id}/
├── arenas/photos/{arena_id}/
├── games/replays/{session_id}/
└── tournaments/banners/{tournament_id}/
```

### 2. Backend Service Completion

**Location**: `backend/src/services/`

**Missing implementations:**
- `MediaFilesService.ts` - MinIO file upload/download
- `DevicesService.ts` - Robot/drone management
- `AchievementsService.ts` - Achievement tracking
- `ChatService.ts` - Real-time chat via Socket.io
- `KYCService.ts` - Email verification workflow
- `PaymentMockService.ts` - Mock payment processing

**Example structure:**
```typescript
// backend/src/services/MediaFilesService.ts
import { S3Client } from '@aws-sdk/client-s3';

export class MediaFilesService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: 'https://api.gipergiraffe.com/storage/v1',
      credentials: {
        accessKeyId: process.env.SUPABASE_SERVICE_KEY,
        secretAccessKey: process.env.SUPABASE_SERVICE_KEY
      }
    });
  }

  async uploadFile(bucket: string, path: string, file: Buffer) {
    // Implementation
  }
}
```

### 3. Fix Frontend Dev Mode → Production

**File**: `frontend/Dockerfile`

**Current (WRONG - dev mode):**
```dockerfile
CMD ["npm", "run", "dev"]
```

**Should be (production):**
```dockerfile
RUN npm run build
CMD ["npm", "start"]
```

**Or optimized:**
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production
CMD ["npm", "start"]
```

### 4. API Integration in Frontend

**Create API client:**
```typescript
// frontend/src/lib/api-client.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class ApiClient {
  async getArenas() {
    const { data, error } = await supabase
      .from('arenas')
      .select('*')
      .eq('status', 'active');
    return data;
  }

  // Add more methods...
}

export const api = new ApiClient();
```

**Replace mock data in components:**
```typescript
// Before (mock):
const arenas = mockArenas;

// After (real API):
const { data: arenas } = await api.getArenas();
```

---

## 📝 Seed Data Scripts

### Create default achievements:
```sql
INSERT INTO giperarena.achievements (
  name, slug, achievement_category, tier,
  description, requirements, pac_reward
) VALUES
  ('First Blood', 'first-blood', 'gameplay', 'bronze',
   'Win your first game', '{"games_won": 1}', 10.00),
  ('Arena Tourist', 'arena-tourist', 'social', 'silver',
   'Visit 5 different arenas', '{"arenas_visited": 5}', 25.00),
  ('Tournament Champion', 'tournament-champion', 'tournament', 'gold',
   'Win a tournament', '{"tournaments_won": 1}', 100.00);
```

### Create default system settings:
```sql
-- Already populated by migration 00024
-- Check with: SELECT * FROM giperarena.system_settings;
```

### Create test arena:
```sql
INSERT INTO giperarena.arenas (
  name, slug, description, arena_type,
  address, city, country, latitude, longitude,
  status, base_price_per_minute
) VALUES (
  'Moscow Battle Arena', 'moscow-battle-arena',
  'Premium battle arena in Moscow city center',
  'indoor',
  'Tverskaya St, 1', 'Moscow', 'Russia',
  55.7558, 37.6173,
  'active', 1.50
);
```

---

## 🔧 Backend Server Start

**Current status**: Backend NOT running in production

**To start backend:**
```bash
cd backend
npm install
npm run build
npm start
```

**Or with Docker:**
```bash
docker compose up -d backend
```

**Backend should expose:**
- REST API: `https://api.gipergiraffe.com/api/v1/*`
- WebSocket: `wss://api.gipergiraffe.com/socket.io`

---

## 🚨 Known Issues to Fix

### 1. Background Deploy Processes
Multiple deploy scripts stuck running (see reminders):
- Kill them: `ps aux | grep deploy | awk '{print $2}' | xargs kill`

### 2. Server Path Error
Some scripts still use `/root/arenahub` instead of `/root/giperarena`
- Check: `scripts/deploy.sh`, `scripts/deploy-reliable.sh`

### 3. Hydration Error
Frontend has hydration mismatch in `not-found.tsx`:
- `lang="ru"` vs `lang="en"`
- Fix in layout.tsx

---

## 📊 Monitoring Setup

### Add Grafana Dashboard

**Connect to Prometheus:**
- Endpoint: `https://prometheus.gipergiraffe.com`
- Add datasource in Grafana

**Key metrics to track:**
- Active game sessions
- API response times
- Database query performance
- WebSocket connections
- Error rates

### Loki Logs

**Send logs to Loki:**
```bash
# In docker-compose.yml
services:
  backend:
    logging:
      driver: loki
      options:
        loki-url: "http://loki:3100/loki/api/v1/push"
```

---

## 🧪 Testing Checklist

### Database Tests:
- [ ] Can create user
- [ ] Can create arena
- [ ] Can start game session
- [ ] Can upload file to MinIO
- [ ] Can send friend request
- [ ] Can unlock achievement
- [ ] Can send chat message
- [ ] Can create mock payment

### API Tests:
- [ ] Authentication works (Supabase Auth)
- [ ] CORS configured correctly
- [ ] Rate limiting works
- [ ] Error handling returns proper status codes

### Frontend Tests:
- [ ] Registration flow works
- [ ] Login flow works
- [ ] Dashboard loads user data
- [ ] Arena list loads from API
- [ ] File upload works
- [ ] WebSocket connection established

---

## 📞 Quick Commands

### Check database:
```bash
PGPASSWORD=zCjkIBgBluvlO2Kt psql -h api.gipergiraffe.com -p 5432 -U postgres.giper_prod -d postgres -c "SELECT COUNT(*) FROM giperarena.users;"
```

### Check tables:
```bash
PGPASSWORD=zCjkIBgBluvlO2Kt psql -h api.gipergiraffe.com -p 5432 -U postgres.giper_prod -d postgres -c "\dt giperarena.*"
```

### Deploy frontend:
```bash
export DOCKER_HUB_TOKEN="dckr_pat_W2slXQiZOhpiOj9CX-DnITmfVro"
./scripts/deploy-reliable.sh
```

### SSH to server:
```bash
ssh root@83.222.20.168
cd /root/giperarena
docker compose ps
docker compose logs -f frontend
```

---

## 🎯 Success Criteria

**Before going live:**
- [ ] MinIO bucket created and tested
- [ ] Backend services implemented and running
- [ ] Frontend uses production build (not dev)
- [ ] All API endpoints return real data
- [ ] Authentication flow works end-to-end
- [ ] File uploads work (avatars, replays)
- [ ] WebSocket real-time features work
- [ ] Monitoring dashboards configured
- [ ] Error logging to Loki works
- [ ] Seed data populated
- [ ] Performance: pages load <2 seconds

---

*Quick reference created: Oct 29, 2025*
*For full details see: database-migrations-completed.md*
