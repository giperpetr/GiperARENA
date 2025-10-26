# WebRTC Integration Guide - ArenaHUB

**Дата создания:** 26 октября 2025  
**Статус:** Планируется  
**Приоритет:** Критический

---

## 🎯 Цель

Реализовать WebRTC интеграцию для управления роботами в реальном времени с задержкой <100ms.

---

## 🏗️ Архитектура WebRTC

### Общая схема
```
Player Browser (WebRTC Client)
    ↓ WebRTC Data Channel + Media Stream
Media Server (mediasoup/Janus)
    ↓ WebRTC
Arena Control Software (Raspberry Pi)
    ↓ Serial/GPIO/ROS
Robot/Device
```

### Компоненты
1. **Media Server** - mediasoup для WebRTC routing
2. **Signaling Server** - Socket.io для обмена метаданными
3. **Arena Control Software** - Node.js + Python на Raspberry Pi
4. **Robot Controller** - ROS 2 для управления роботами

---

## 🛠️ Технологический стек

### Media Server
- **mediasoup** - WebRTC SFU (Selective Forwarding Unit)
- **Node.js** - JavaScript runtime
- **Socket.io** - Signaling server

### Arena Control
- **Raspberry Pi OS** - Linux для роботов
- **Node.js** - WebRTC client
- **Python** - ROS 2 integration
- **GStreamer** - Video streaming

### Frontend
- **WebRTC API** - Нативные браузерные API
- **Socket.io Client** - Signaling
- **React Hooks** - State management

---

## 📦 Установка и настройка

### 1. Media Server (mediasoup)

```bash
# Создание нового сервиса
mkdir media-server
cd media-server
npm init -y

# Установка зависимостей
npm install mediasoup socket.io express cors
npm install -D @types/node typescript ts-node

# TypeScript конфигурация
npx tsc --init
```

```typescript
// media-server/src/index.ts
import { Worker, Router, WebRtcTransport } from 'mediasoup';
import { Server as SocketIOServer } from 'socket.io';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const server = app.listen(3002, () => {
  console.log('Media server running on port 3002');
});

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// mediasoup worker
const worker = await Worker.create({
  rtcMinPort: 40000,
  rtcMaxPort: 49999,
  logLevel: 'debug'
});

// WebRTC transport
const router = await worker.createRouter({
  mediaCodecs: [
    {
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2
    },
    {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000
      }
    }
  ]
});

// Socket.io signaling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', async (data) => {
    const { roomId, userId } = data;
    
    // Создание WebRTC transport
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    });

    // Отправка transport параметров клиенту
    socket.emit('transport-created', {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    });

    // Обработка ICE candidates
    socket.on('ice-candidate', async (data) => {
      await transport.consume({
        id: data.candidateId,
        producerId: data.producerId,
        kind: data.kind,
        rtpParameters: data.rtpParameters
      });
    });
  });
});
```

### 2. Frontend WebRTC Client

```typescript
// frontend/src/hooks/useWebRTC.ts
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebRTCConfig {
  mediaServerUrl: string;
  roomId: string;
  userId: string;
}

export function useWebRTC(config: WebRTCConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    // Инициализация Socket.io соединения
    socketRef.current = io(config.mediaServerUrl);
    
    socketRef.current.on('connect', () => {
      console.log('Connected to media server');
      setIsConnected(true);
      
      // Присоединение к комнате
      socketRef.current?.emit('join-room', {
        roomId: config.roomId,
        userId: config.userId
      });
    });

    // Обработка transport параметров
    socketRef.current.on('transport-created', async (data) => {
      await setupWebRTCConnection(data);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const setupWebRTCConnection = async (transportData: any) => {
    // Создание RTCPeerConnection
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // Настройка data channel для команд управления
    dataChannelRef.current = peerConnectionRef.current.createDataChannel('robot-control', {
      ordered: true,
      maxRetransmits: 3
    });

    dataChannelRef.current.onopen = () => {
      console.log('Data channel opened');
    };

    dataChannelRef.current.onmessage = (event) => {
      const command = JSON.parse(event.data);
      console.log('Received command:', command);
    };

    // Настройка медиа потоков
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, frameRate: 30 },
      audio: true
    });

    setLocalStream(stream);

    // Добавление треков в peer connection
    stream.getTracks().forEach(track => {
      peerConnectionRef.current?.addTrack(track, stream);
    });

    // Обработка ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: config.roomId
        });
      }
    };

    // Обработка remote stream
    peerConnectionRef.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
  };

  const sendCommand = (command: RobotCommand) => {
    if (dataChannelRef.current?.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify(command));
    }
  };

  return {
    isConnected,
    localStream,
    remoteStream,
    sendCommand
  };
}
```

### 3. Robot Control Commands

```typescript
// shared/types/robot-commands.ts
export interface RobotCommand {
  type: 'move' | 'rotate' | 'action' | 'camera';
  timestamp: number;
  params: MoveCommand | RotateCommand | ActionCommand | CameraCommand;
}

export interface MoveCommand {
  direction: 'forward' | 'backward' | 'left' | 'right' | 'stop';
  speed: number; // 0.0 - 1.0
  duration?: number; // milliseconds
}

export interface RotateCommand {
  angle: number; // degrees
  speed: number; // 0.0 - 1.0
}

export interface ActionCommand {
  action: 'grab' | 'release' | 'jump' | 'shoot' | 'special';
  intensity?: number; // 0.0 - 1.0
}

export interface CameraCommand {
  pan: number; // -180 to 180 degrees
  tilt: number; // -90 to 90 degrees
  zoom?: number; // 1.0 - 10.0
}
```

### 4. Arena Control Software (Raspberry Pi)

```typescript
// arena-control/src/webrtc-client.ts
import { io, Socket } from 'socket.io-client';
import { spawn } from 'child_process';

class ArenaWebRTCClient {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private robotController: any = null;

  constructor(private config: ArenaConfig) {
    this.initializeRobotController();
  }

  async connect() {
    // Подключение к media server
    this.socket = io(this.config.mediaServerUrl);
    
    this.socket.on('connect', () => {
      console.log('Connected to media server');
      this.joinRoom();
    });

    this.socket.on('transport-created', (data) => {
      this.setupWebRTCConnection(data);
    });

    this.socket.on('ice-candidate', async (data) => {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(data.candidate);
      }
    });
  }

  private async setupWebRTCConnection(transportData: any) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Настройка data channel
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.dataChannel.onmessage = (event) => {
        const command = JSON.parse(event.data);
        this.executeCommand(command);
      };
    };

    // Настройка медиа потоков (камеры арены)
    const stream = await this.getArenaVideoStream();
    stream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, stream);
    });
  }

  private async executeCommand(command: RobotCommand) {
    console.log('Executing command:', command);
    
    switch (command.type) {
      case 'move':
        await this.robotController.move(command.params);
        break;
      case 'rotate':
        await this.robotController.rotate(command.params);
        break;
      case 'action':
        await this.robotController.performAction(command.params);
        break;
      case 'camera':
        await this.robotController.controlCamera(command.params);
        break;
    }
  }

  private initializeRobotController() {
    // Инициализация ROS 2 контроллера
    this.robotController = {
      move: async (params: MoveCommand) => {
        // ROS 2 команда для движения
        const rosCommand = `ros2 topic pub /cmd_vel geometry_msgs/msg/Twist '{linear: {x: ${params.speed}, y: 0, z: 0}}'`;
        spawn('bash', ['-c', rosCommand]);
      },
      
      rotate: async (params: RotateCommand) => {
        // ROS 2 команда для поворота
        const rosCommand = `ros2 topic pub /cmd_vel geometry_msgs/msg/Twist '{angular: {x: 0, y: 0, z: ${params.speed}}}'`;
        spawn('bash', ['-c', rosCommand]);
      },
      
      performAction: async (params: ActionCommand) => {
        // ROS 2 команда для действий
        const rosCommand = `ros2 service call /robot_action std_srvs/srv/Trigger '{action: "${params.action}"}'`;
        spawn('bash', ['-c', rosCommand]);
      },
      
      controlCamera: async (params: CameraCommand) => {
        // Команда для управления камерой
        const gstCommand = `gst-launch-1.0 v4l2src ! video/x-raw,width=1280,height=720 ! v4l2h264enc ! rtph264pay ! udpsink host=${this.config.playerIp} port=5000`;
        spawn('bash', ['-c', gstCommand]);
      }
    };
  }

  private async getArenaVideoStream(): Promise<MediaStream> {
    // Получение видео потока с камер арены
    // Используется GStreamer для захвата видео
    return new Promise((resolve, reject) => {
      // Реализация захвата видео с камер
      // Возвращает MediaStream для WebRTC
    });
  }
}
```

---

## 🎮 Frontend Game Controls

### 1. Keyboard Controls

```typescript
// frontend/src/components/GameControls.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';

interface GameControlsProps {
  roomId: string;
  userId: string;
}

export function GameControls({ roomId, userId }: GameControlsProps) {
  const { sendCommand, isConnected } = useWebRTC({
    mediaServerUrl: process.env.NEXT_PUBLIC_MEDIA_URL!,
    roomId,
    userId
  });

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isConnected) return;

    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'w':
      case 'arrowup':
        sendCommand({
          type: 'move',
          timestamp: Date.now(),
          params: { direction: 'forward', speed: 0.8 }
        });
        break;
      case 's':
      case 'arrowdown':
        sendCommand({
          type: 'move',
          timestamp: Date.now(),
          params: { direction: 'backward', speed: 0.8 }
        });
        break;
      case 'a':
      case 'arrowleft':
        sendCommand({
          type: 'move',
          timestamp: Date.now(),
          params: { direction: 'left', speed: 0.8 }
        });
        break;
      case 'd':
      case 'arrowright':
        sendCommand({
          type: 'move',
          timestamp: Date.now(),
          params: { direction: 'right', speed: 0.8 }
        });
        break;
      case ' ':
        event.preventDefault();
        sendCommand({
          type: 'action',
          timestamp: Date.now(),
          params: { action: 'jump' }
        });
        break;
    }
  }, [sendCommand, isConnected]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="game-controls">
      <div className="control-panel">
        <button 
          onClick={() => sendCommand({
            type: 'move',
            timestamp: Date.now(),
            params: { direction: 'forward', speed: 0.8 }
          })}
          className="control-btn"
        >
          ↑ Forward
        </button>
        <button 
          onClick={() => sendCommand({
            type: 'move',
            timestamp: Date.now(),
            params: { direction: 'backward', speed: 0.8 }
          })}
          className="control-btn"
        >
          ↓ Backward
        </button>
        <button 
          onClick={() => sendCommand({
            type: 'move',
            timestamp: Date.now(),
            params: { direction: 'left', speed: 0.8 }
          })}
          className="control-btn"
        >
          ← Left
        </button>
        <button 
          onClick={() => sendCommand({
            type: 'move',
            timestamp: Date.now(),
            params: { direction: 'right', speed: 0.8 }
          })}
          className="control-btn"
        >
          → Right
        </button>
      </div>
      
      <div className="action-buttons">
        <button 
          onClick={() => sendCommand({
            type: 'action',
            timestamp: Date.now(),
            params: { action: 'grab' }
          })}
          className="action-btn"
        >
          Grab
        </button>
        <button 
          onClick={() => sendCommand({
            type: 'action',
            timestamp: Date.now(),
            params: { action: 'release' }
          })}
          className="action-btn"
        >
          Release
        </button>
        <button 
          onClick={() => sendCommand({
            type: 'action',
            timestamp: Date.now(),
            params: { action: 'jump' }
          })}
          className="action-btn"
        >
          Jump
        </button>
      </div>
    </div>
  );
}
```

### 2. Touch Controls (Mobile)

```typescript
// frontend/src/components/TouchControls.tsx
'use client';

import { useRef, useCallback } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';

interface TouchControlsProps {
  roomId: string;
  userId: string;
}

export function TouchControls({ roomId, userId }: TouchControlsProps) {
  const { sendCommand, isConnected } = useWebRTC({
    mediaServerUrl: process.env.NEXT_PUBLIC_MEDIA_URL!,
    roomId,
    userId
  });

  const joystickRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    isDragging.current = true;
    event.preventDefault();
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!isDragging.current || !isConnected) return;
    
    const touch = event.touches[0];
    const rect = joystickRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    
    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2;
    
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    if (normalizedDistance > 0.1) {
      const direction = Math.round(angle * 180 / Math.PI);
      
      sendCommand({
        type: 'move',
        timestamp: Date.now(),
        params: {
          direction: getDirectionFromAngle(direction),
          speed: normalizedDistance
        }
      });
    }
  }, [sendCommand, isConnected]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    
    if (isConnected) {
      sendCommand({
        type: 'move',
        timestamp: Date.now(),
        params: { direction: 'stop', speed: 0 }
      });
    }
  }, [sendCommand, isConnected]);

  return (
    <div className="touch-controls">
      <div 
        ref={joystickRef}
        className="joystick"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="joystick-knob" />
      </div>
      
      <div className="action-buttons">
        <button 
          className="action-btn"
          onTouchStart={() => sendCommand({
            type: 'action',
            timestamp: Date.now(),
            params: { action: 'grab' }
          })}
        >
          Grab
        </button>
        <button 
          className="action-btn"
          onTouchStart={() => sendCommand({
            type: 'action',
            timestamp: Date.now(),
            params: { action: 'release' }
          })}
        >
          Release
        </button>
      </div>
    </div>
  );
}

function getDirectionFromAngle(angle: number): string {
  if (angle >= -45 && angle < 45) return 'right';
  if (angle >= 45 && angle < 135) return 'backward';
  if (angle >= 135 || angle < -135) return 'left';
  return 'forward';
}
```

---

## 🧪 Тестирование

### Unit Tests

```typescript
// __tests__/webrtc.test.ts
import { useWebRTC } from '../hooks/useWebRTC';
import { renderHook, act } from '@testing-library/react';

// Mock Socket.io
jest.mock('socket.io-client', () => ({
  io: () => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn()
  })
}));

describe('useWebRTC', () => {
  it('should initialize WebRTC connection', () => {
    const { result } = renderHook(() => useWebRTC({
      mediaServerUrl: 'ws://localhost:3002',
      roomId: 'test-room',
      userId: 'test-user'
    }));

    expect(result.current.isConnected).toBe(false);
  });

  it('should send commands when connected', () => {
    const { result } = renderHook(() => useWebRTC({
      mediaServerUrl: 'ws://localhost:3002',
      roomId: 'test-room',
      userId: 'test-user'
    }));

    act(() => {
      result.current.sendCommand({
        type: 'move',
        timestamp: Date.now(),
        params: { direction: 'forward', speed: 0.8 }
      });
    });

    // Проверка что команда отправлена
  });
});
```

### E2E Tests

```typescript
// e2e/webrtc.spec.ts
import { test, expect } from '@playwright/test';

test('should connect to WebRTC and send commands', async ({ page }) => {
  await page.goto('/arenas/test-arena');
  
  // Ожидание подключения
  await page.waitForSelector('[data-testid="webrtc-connected"]');
  
  // Отправка команды движения
  await page.click('[data-testid="move-forward"]');
  
  // Проверка что команда отправлена
  await expect(page.locator('[data-testid="command-sent"]')).toBeVisible();
});
```

---

## 📊 Мониторинг

### WebRTC Stats

```typescript
// utils/webrtc-stats.ts
export class WebRTCStats {
  private peerConnection: RTCPeerConnection;
  private statsInterval: NodeJS.Timeout | null = null;

  constructor(peerConnection: RTCPeerConnection) {
    this.peerConnection = peerConnection;
  }

  startMonitoring() {
    this.statsInterval = setInterval(async () => {
      const stats = await this.peerConnection.getStats();
      this.processStats(stats);
    }, 1000);
  }

  private processStats(stats: RTCStatsReport) {
    stats.forEach((report) => {
      if (report.type === 'outbound-rtp') {
        console.log('Bitrate:', report.bytesSent);
        console.log('Packets sent:', report.packetsSent);
      }
      
      if (report.type === 'inbound-rtp') {
        console.log('Packets received:', report.packetsReceived);
        console.log('Packets lost:', report.packetsLost);
      }
    });
  }

  stopMonitoring() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }
}
```

### Latency Monitoring

```typescript
// utils/latency-monitor.ts
export class LatencyMonitor {
  private pingInterval: NodeJS.Timeout | null = null;
  private latency: number = 0;

  startPing(dataChannel: RTCDataChannel) {
    this.pingInterval = setInterval(() => {
      const timestamp = Date.now();
      dataChannel.send(JSON.stringify({
        type: 'ping',
        timestamp
      }));
    }, 1000);
  }

  handlePong(timestamp: number) {
    this.latency = Date.now() - timestamp;
    console.log('Latency:', this.latency, 'ms');
  }

  getLatency(): number {
    return this.latency;
  }
}
```

---

## 🚀 Деплой

### Docker Configuration

```dockerfile
# media-server/Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3002
EXPOSE 40000-49999/udp

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
services:
  media-server:
    build: ./media-server
    ports:
      - "3002:3002"
      - "40000-49999:40000-49999/udp"
    environment:
      - MEDIASOUP_ANNOUNCED_IP=${SERVER_IP}
    networks:
      - proxy
```

### Environment Variables

```bash
# .env
MEDIASOUP_ANNOUNCED_IP=83.222.20.168
MEDIASOUP_MIN_PORT=40000
MEDIASOUP_MAX_PORT=49999
REDIS_URL=redis://:${REDIS_PASSWORD}@queue-redis:6379/3
```

---

## 📋 Checklist

### Media Server
- [ ] mediasoup установлен и настроен
- [ ] Socket.io signaling работает
- [ ] WebRTC transport создается
- [ ] ICE candidates обмениваются
- [ ] Media streams передаются

### Frontend
- [ ] WebRTC client подключается
- [ ] Data channel открывается
- [ ] Команды отправляются
- [ ] Видео поток отображается
- [ ] Управление работает

### Arena Control
- [ ] Raspberry Pi подключен
- [ ] ROS 2 установлен
- [ ] WebRTC client работает
- [ ] Команды выполняются
- [ ] Видео поток передается

### Testing
- [ ] Unit tests проходят
- [ ] E2E tests проходят
- [ ] Latency < 100ms
- [ ] Video quality хорошая
- [ ] Commands выполняются

---

**Последнее обновление:** 26 октября 2025  
**Статус:** Планируется  
**Следующий обзор:** 2 ноября 2025
