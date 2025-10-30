# System Patterns - ArenaHUB

**Дата обновления:** 26 октября 2025  
**Архитектурные решения и паттерны**

---

## 🏗️ Архитектурные принципы

### 1. Microservices Architecture
**Принцип:** Каждый сервис отвечает за одну бизнес-функцию  
**Реализация:**
- `frontend` - Next.js веб-приложение
- `backend` - Node.js API сервер
- `realtime` - Socket.io WebSocket сервер
- `media` - WebRTC media server (mediasoup)
- `blockchain` - Solana smart contracts integration

### 2. Event-Driven Communication
**Принцип:** Сервисы общаются через события и сообщения  
**Реализация:**
- **WebSocket** - real-time обновления игр
- **Redis Pub/Sub** - межсервисное общение
- **MQTT** - команды управления роботами
- **Database triggers** - автоматические обновления

### 3. CQRS (Command Query Responsibility Segregation)
**Принцип:** Разделение команд (запись) и запросов (чтение)  
**Реализация:**
- **Commands** - создание/обновление данных через API
- **Queries** - чтение данных через оптимизированные запросы
- **Event Sourcing** - сохранение событий для аудита

---

## 🔄 Паттерны данных

### 1. Repository Pattern
**Назначение:** Абстракция доступа к данным  
**Реализация:**
```typescript
interface ArenaRepository {
  findById(id: string): Promise<Arena | null>;
  create(arena: CreateArenaData): Promise<Arena>;
  update(id: string, data: UpdateArenaData): Promise<Arena>;
  delete(id: string): Promise<void>;
}
```

### 2. Service Layer Pattern
**Назначение:** Бизнес-логика отделена от контроллеров  
**Реализация:**
```typescript
class ArenaService {
  constructor(
    private arenaRepo: ArenaRepository,
    private userRepo: UserRepository,
    private eventBus: EventBus
  ) {}

  async createArena(data: CreateArenaData, userId: string): Promise<Arena> {
    // Бизнес-логика создания арены
    const arena = await this.arenaRepo.create(data);
    await this.eventBus.publish('arena.created', { arena, userId });
    return arena;
  }
}
```

### 3. Factory Pattern
**Назначение:** Создание сложных объектов  
**Реализация:**
```typescript
class GameSessionFactory {
  static create(type: SessionType, config: SessionConfig): GameSession {
    switch (type) {
      case 'practice': return new PracticeSession(config);
      case 'ranked': return new RankedSession(config);
      case 'tournament': return new TournamentSession(config);
      default: throw new Error('Unknown session type');
    }
  }
}
```

---

## 🌐 Сетевые паттерны

### 1. API Gateway Pattern
**Назначение:** Единая точка входа для всех API запросов  
**Реализация:**
- **Traefik** - reverse proxy с SSL
- **Rate limiting** - ограничение запросов
- **Authentication** - проверка токенов
- **Load balancing** - распределение нагрузки

### 2. Circuit Breaker Pattern
**Назначение:** Защита от каскадных сбоев  
**Реализация:**
```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

### 3. Retry Pattern
**Назначение:** Повторные попытки при временных сбоях  
**Реализация:**
```typescript
async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}
```

---

## 🔐 Паттерны безопасности

### 1. JWT Token Pattern
**Назначение:** Stateless аутентификация  
**Реализация:**
```typescript
interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  walletAddress?: string;
  iat: number;
  exp: number;
}

class AuthService {
  generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id, tokenVersion: user.tokenVersion },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    return { accessToken, refreshToken };
  }
}
```

### 2. Row Level Security (RLS)
**Назначение:** Защита данных на уровне базы данных  
**Реализация:**
```sql
-- Пользователи могут видеть только свои данные
CREATE POLICY user_data_policy ON users
  FOR ALL TO authenticated
  USING (auth.uid() = id);

-- Арены видны всем, но редактировать может только владелец
CREATE POLICY arena_view_policy ON arenas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY arena_edit_policy ON arenas
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id);
```

### 3. Rate Limiting Pattern
**Назначение:** Защита от DDoS и злоупотреблений  
**Реализация:**
```typescript
class RateLimiter {
  private requests = new Map<string, number[]>();

  isAllowed(key: string, limit: number, window: number): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Удаляем старые запросы
    const validRequests = userRequests.filter(time => now - time < window);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}
```

---

## 🎮 Игровые паттерны

### 1. State Machine Pattern
**Назначение:** Управление состояниями игровых сессий  
**Реализация:**
```typescript
enum SessionState {
  WAITING = 'waiting',
  STARTING = 'starting',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

class GameSession {
  private state: SessionState = SessionState.WAITING;
  private stateTransitions = new Map<SessionState, SessionState[]>([
    [SessionState.WAITING, [SessionState.STARTING, SessionState.CANCELLED]],
    [SessionState.STARTING, [SessionState.IN_PROGRESS, SessionState.CANCELLED]],
    [SessionState.IN_PROGRESS, [SessionState.PAUSED, SessionState.COMPLETED]],
    [SessionState.PAUSED, [SessionState.IN_PROGRESS, SessionState.CANCELLED]],
    [SessionState.COMPLETED, []],
    [SessionState.CANCELLED, []]
  ]);

  transitionTo(newState: SessionState): boolean {
    const allowedTransitions = this.stateTransitions.get(this.state) || [];
    if (allowedTransitions.includes(newState)) {
      this.state = newState;
      this.onStateChange(newState);
      return true;
    }
    return false;
  }
}
```

### 2. Observer Pattern
**Назначение:** Уведомления о изменениях в игре  
**Реализация:**
```typescript
interface GameObserver {
  onPlayerJoined(session: GameSession, player: Player): void;
  onPlayerLeft(session: GameSession, player: Player): void;
  onGameStateChanged(session: GameSession, state: GameState): void;
  onGameEnded(session: GameSession, results: GameResults): void;
}

class GameSession {
  private observers: GameObserver[] = [];

  addObserver(observer: GameObserver): void {
    this.observers.push(observer);
  }

  private notifyObservers(event: string, data: any): void {
    this.observers.forEach(observer => {
      if (observer[event]) {
        observer[event](data);
      }
    });
  }
}
```

### 3. Command Pattern
**Назначение:** Инкапсуляция команд управления роботами  
**Реализация:**
```typescript
interface RobotCommand {
  execute(): Promise<void>;
  undo(): Promise<void>;
  canExecute(): boolean;
}

class MoveCommand implements RobotCommand {
  constructor(
    private robot: Robot,
    private direction: Direction,
    private speed: number
  ) {}

  async execute(): Promise<void> {
    await this.robot.move(this.direction, this.speed);
  }

  async undo(): Promise<void> {
    await this.robot.move(this.getOppositeDirection(), this.speed);
  }

  canExecute(): boolean {
    return this.robot.isOnline() && this.robot.hasBattery();
  }
}
```

---

## 🔄 Паттерны WebRTC

### 1. Signaling Server Pattern
**Назначение:** Обмен метаданными для WebRTC соединений  
**Реализация:**
```typescript
class WebRTCSignaling {
  async createOffer(sessionId: string, playerId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = new RTCPeerConnection(this.config);
    
    // Настройка медиа потоков
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });
    
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // Отправка offer через Socket.io
    this.socket.emit('webrtc-offer', { sessionId, playerId, offer });
    
    return offer;
  }
}
```

### 2. Data Channel Pattern
**Назначение:** Передача команд управления роботами  
**Реализация:**
```typescript
class RobotControlChannel {
  private dataChannel: RTCDataChannel;

  setupDataChannel(peerConnection: RTCPeerConnection): void {
    this.dataChannel = peerConnection.createDataChannel('robot-control', {
      ordered: true,
      maxRetransmits: 3
    });

    this.dataChannel.onopen = () => {
      console.log('Robot control channel opened');
    };

    this.dataChannel.onmessage = (event) => {
      const command = JSON.parse(event.data);
      this.executeCommand(command);
    };
  }

  sendCommand(command: RobotCommand): void {
    if (this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(command));
    }
  }
}
```

---

## 📊 Паттерны мониторинга

### 1. Metrics Collection Pattern
**Назначение:** Сбор метрик производительности  
**Реализация:**
```typescript
class MetricsCollector {
  private metrics = new Map<string, number>();

  incrementCounter(name: string, value: number = 1): void {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
  }

  setGauge(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  recordHistogram(name: string, value: number): void {
    // Запись в Prometheus histogram
    this.prometheusClient.recordHistogram(name, value);
  }
}
```

### 2. Health Check Pattern
**Назначение:** Проверка состояния сервисов  
**Реализация:**
```typescript
class HealthChecker {
  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkWebRTC(),
      this.checkBlockchain()
    ]);

    const status = checks.every(check => check.status === 'fulfilled') 
      ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: checks.map((check, index) => ({
        name: ['database', 'redis', 'webrtc', 'blockchain'][index],
        status: check.status,
        error: check.status === 'rejected' ? check.reason : undefined
      }))
    };
  }
}
```

---

## 🎯 Паттерны тестирования

### 1. Test Double Pattern
**Назначение:** Замена зависимостей в тестах  
**Реализация:**
```typescript
// Mock для тестирования
class MockArenaRepository implements ArenaRepository {
  private arenas = new Map<string, Arena>();

  async findById(id: string): Promise<Arena | null> {
    return this.arenas.get(id) || null;
  }

  async create(arena: CreateArenaData): Promise<Arena> {
    const newArena = { id: generateId(), ...arena, createdAt: new Date() };
    this.arenas.set(newArena.id, newArena);
    return newArena;
  }
}
```

### 2. Page Object Pattern
**Назначение:** Инкапсуляция элементов страницы в тестах  
**Реализация:**
```typescript
class ArenaPage {
  constructor(private page: Page) {}

  async gotoArena(arenaId: string): Promise<void> {
    await this.page.goto(`/arenas/${arenaId}`);
  }

  async clickPlayButton(): Promise<void> {
    await this.page.click('[data-testid="play-button"]');
  }

  async waitForGameStart(): Promise<void> {
    await this.page.waitForSelector('[data-testid="game-controls"]');
  }
}
```

---

## 📋 Рекомендации по использованию

### 1. Выбор паттернов
- **Для новых функций** - используйте проверенные паттерны
- **Для критических компонентов** - применяйте Circuit Breaker и Retry
- **Для игровой логики** - используйте State Machine и Observer
- **Для WebRTC** - применяйте Signaling Server и Data Channel

### 2. Антипаттерны
- **Избегайте** God Objects - разбивайте на мелкие сервисы
- **Не используйте** Singleton без необходимости - затрудняет тестирование
- **Избегайте** Tight Coupling - используйте Dependency Injection
- **Не создавайте** Circular Dependencies - используйте Event Bus

### 3. Мониторинг паттернов
- **Отслеживайте** использование паттернов через метрики
- **Документируйте** решения о выборе паттернов
- **Регулярно пересматривайте** эффективность паттернов
- **Обновляйте** паттерны при изменении требований

---

**Последнее обновление:** 26 октября 2025  
**Следующий обзор:** 2 ноября 2025

---

## 🆕 NEW PATTERNS (Oct 30, 2025) - PostgreSQL API Integration

### PostgreSQL DECIMAL Type Handling Pattern
**Проблема:** PostgreSQL возвращает DECIMAL как string, не number  
**Использование:** Для всех DECIMAL полей (price, rating, revenue)

**Реализация:**
\`\`\`typescript
// ПАТТЕРН: ВСЕГДА parseFloat() для DECIMAL полей
interface Arena {
  price_per_minute: string;  // DECIMAL as string from PostgreSQL
  rating: string;             // DECIMAL as string
  total_revenue: string;      // DECIMAL as string
}

// Использование:
const rating = parseFloat(arena.rating).toFixed(1);  // "4.8"
const hourlyRate = parseFloat(arena.price_per_minute) * 60;  // 1500
const revenue = parseFloat(arena.total_revenue).toFixed(2);  // "1234.56"

// Для отображения:
<span>{parseFloat(arena.rating).toFixed(1)}</span>
\`\`\`

**Почему важно:**
- PostgreSQL DECIMAL → JSON → JavaScript string
- Без parseFloat() будет `TypeError: toFixed is not a function`
- Применяется ко ВСЕМ числовым полям из БД

---

### Nested API Data Fallback Pattern
**Проблема:** Данные могут быть в разных местах (root vs nested)  
**Использование:** Для optional или nested полей в API responses

**Реализация:**
\`\`\`typescript
// ПАТТЕРН: Fallback chain для nested data
const features = arena.metadata?.features || arena.features || [];

// ПАТТЕРН: Для множественных fallbacks
const value = obj?.nested?.deep?.value || obj?.value || defaultValue;

// ПАТТЕРН: Для массивов с map
{(arena.metadata?.features || []).map(feature => (
  <Badge key={feature}>{feature}</Badge>
))}
\`\`\`

**Почему важно:**
- API структуры меняются
- Backward compatibility важна
- Избегает `Cannot read property of undefined`

---

### Conditional Section Rendering Pattern
**Проблема:** Опциональные поля могут быть undefined  
**Использование:** Для секций UI которые зависят от данных

**Реализация:**
\`\`\`typescript
// ПАТТЕРН: Conditional rendering для optional sections
{data && data.length > 0 && (
  <Section>
    {data.map(item => <Item key={item.id} {...item} />)}
  </Section>
)}

// ПАТТЕРН: Для optional objects
{user?.profile && (
  <ProfileCard profile={user.profile} />
)}

// ПАТТЕРН: Для optional arrays с fallback
{(items || []).length > 0 && (
  <List items={items} />
)}
\`\`\`

**Почему важно:**
- Предотвращает runtime errors
- Улучшает UX (не показывает пустые секции)
- Обрабатывает loading/error states

---

### Flexible TypeScript Interface Pattern
**Проблема:** API структуры нестабильны в процессе разработки  
**Использование:** Для быстрой интеграции с evolving APIs

**Реализация:**
\`\`\`typescript
// ПАТТЕРН 1: Временный any для быстрой интеграции
interface ArenaPageProps {
  arena: any;  // TODO: Define proper Arena type
}

// ПАТТЕРН 2: Partial types для optional fields
interface Arena {
  id: string;
  name: string;
  price_per_minute?: string;  // Optional
  metadata?: {
    features?: string[];
  };
}

// ПАТТЕРН 3: Постепенная типизация
interface ArenaBase {
  id: string;
  name: string;
}

interface ArenaWithPricing extends ArenaBase {
  price_per_minute: string;
  currency: string;
}

// ПАТТЕРН 4: Runtime validation с Zod (future)
import { z } from 'zod';

const ArenaSchema = z.object({
  id: z.string().uuid(),
  price_per_minute: z.string().regex(/^\d+\.\d{2}$/),
  rating: z.string().transform(val => parseFloat(val))
});
\`\`\`

**Почему важно:**
- Позволяет быстро интегрировать API
- Потом можно добавить строгие типы
- Balance между скоростью и безопасностью

---

### API Field Mapping Pattern
**Проблема:** Frontend и Backend используют разные naming conventions  
**Использование:** Для трансформации API responses

**Реализация:**
\`\`\`typescript
// ПАТТЕРН: Вычисляемые поля из API data
function ArenaCard({ arena }: { arena: any }) {
  // API field → Computed field
  const hourlyRate = arena.price_per_minute 
    ? (parseFloat(arena.price_per_minute) * 60).toFixed(0)
    : '0';
  
  // API field → Mapped field
  const verified = arena.is_verified || arena.verified || false;
  
  // Nested API field → Flat field
  const features = arena.metadata?.features || arena.features || [];
  
  return (
    <div>
      <p>{hourlyRate} {arena.currency}/hour</p>
      {verified && <Badge>Verified</Badge>}
      {features.map(f => <Badge key={f}>{f}</Badge>)}
    </div>
  );
}
\`\`\`

**Почему важно:**
- API и UI имеют разные требования
- Избегает дублирования логики
- Централизует трансформации

---

## 📋 Pattern Usage Guidelines (UPDATED)

### Когда использовать PostgreSQL DECIMAL Pattern:
- ✅ Любое числовое поле из PostgreSQL
- ✅ Перед .toFixed(), math операциями
- ✅ Для price, rating, revenue, balance

### Когда использовать Nested Data Fallback:
- ✅ API возвращает nested objects
- ✅ Поддержка старых и новых API versions
- ✅ Optional или conditional fields

### Когда использовать Conditional Rendering:
- ✅ Секции зависящие от наличия данных
- ✅ Optional arrays или objects
- ✅ Loading/error states

---

**Последнее обновление:** 30 октября 2025
**Новых паттернов:** 5
**Источник:** Session 2 - Arena Detail API Fix
