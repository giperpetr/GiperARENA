# Quick Start - GiperARENA Project Context

**Last Updated**: 2025-10-30 | **Version**: v0.2.1-arena-detail-fix

## 🎯 Current Status

✅ **Database**: 25 Goose migrations applied, PostgreSQL 17 with pgvector
✅ **Backend**: Node.js API working with real database data
✅ **Frontend**: Next.js 15, arena pages working with live data
✅ **Production**: https://giperarena.space (deployed via Docker)

## 🚀 Quick Commands

### Deployment
```bash
export DOCKER_HUB_TOKEN="dckr_pat_W2slXQiZOhpiOj9CX-DnITmfVro"
./scripts/deploy-reliable.sh
```

### Migrations
```bash
cd backend
goose -dir migrations postgres "postgresql://postgres.giper_prod:zCjkIBgBluvlO2Kt@api.gipergiraffe.com:5432/postgres" up
```

### API Testing
```bash
curl https://api.giperarena.space/api/v1/arenas | jq '.'
```

## 🔥 Recent Critical Fixes

### PostgreSQL DECIMAL Type (2025-10-30)
```typescript
// Problem: PostgreSQL returns DECIMAL as string
const rating = arena.rating; // "4.60" (string!)

// Solution: Always parseFloat() first
const ratingNumber = parseFloat(arena.rating).toFixed(1); // "4.6"
```

### API Data Structure (2025-10-30)
```typescript
// Features are in metadata, not root level
const features = arena.metadata?.features || arena.features || [];

// Optional fields need conditional rendering
{arena.devices && arena.devices.length > 0 && <DevicesSection />}
```

## 📊 Database Schema Essentials

### arenas table
- `id` - UUID (20000000-0000-0000-0000-00000000000X)
- `price_per_minute` - DECIMAL (returns as string "25.00")
- `rating` - DECIMAL (returns as string "4.80")
- `metadata` - JSONB (contains features array)
- `is_verified` - BOOLEAN

### Key Tables
- `arenas` - 5 seeded arenas (Moscow, London, Tokyo, California, Berlin)
- `users` - User accounts
- `game_sessions` - Active/past games (table exists but empty)
- `tournaments` - Tournament system
- `arena_media` - Media files with MinIO URLs

## 🐛 Known Issues

1. **Hydration Error**: Number formatting mismatch (47,234 vs 47 234)
2. **game_sessions table**: Empty, causes "Failed to fetch" (non-critical)
3. **Devices endpoint**: Not implemented yet (`/arenas/:id/devices`)
4. **Operator endpoint**: Not implemented yet (`/operators/:id`)

## 📁 Project Structure

```
GiperARENA/
├── frontend/          # Next.js 15 (port 3000)
├── backend/           # Node.js API (port 3000 in prod, 3001 in dev)
├── backend/migrations/   # Goose SQL migrations (25 files)
├── scripts/           # deploy-reliable.sh (only working deploy script!)
└── .claude-memory-bank/  # Session documentation
```

## 🔗 Important URLs

- **Production**: https://giperarena.space
- **API**: https://api.giperarena.space/api/v1
- **Database**: api.gipergiraffe.com:5432 (Supabase)

## 💡 Development Tips

### Always Use Real Data Paths
```typescript
// ✅ Good: Use real API fields
const address = arena.location_address;
const price = parseFloat(arena.price_per_minute) * 60;

// ❌ Bad: Assume different field names
const address = arena.address; // undefined!
const price = arena.hourly_rate; // undefined!
```

### CORS Configuration
```typescript
// Production domains in allowedOrigins
const allowedOrigins = [
  'http://localhost:3000',
  'https://giperarena.space',
  'https://www.giperarena.space',
];
```

### Deployment Flow
1. Commit changes → Git
2. Run `./scripts/deploy-reliable.sh` (takes 5-10 min)
3. Script auto-tags with git SHA (e.g., `4b1283d`)
4. Verify at https://giperarena.space

## 📚 Full Documentation

See [INDEX.md](.claude-memory-bank/INDEX.md) for complete session history and guides.

---

**Pro Tip**: When starting a new feature, check the latest session in memory bank first! It might have solutions to common issues you'll encounter.
