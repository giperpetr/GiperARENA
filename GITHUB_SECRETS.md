# GitHub Secrets Configuration для GiperARENA

Этот документ содержит инструкции по настройке GitHub Secrets для автоматического деплоя GiperARENA.

## 📋 Список обязательных секретов

### 1. SSH доступ к серверу

| Секрет | Значение | Описание |
|--------|----------|----------|
| `VPS_HOST` | `83.222.20.168` | IP адрес production сервера |
| `VPS_USER` | `root` | SSH пользователь |
| `VPS_SSH_KEY` | `<ваш приватный SSH ключ>` | Приватный SSH ключ для доступа к серверу |
| `VPS_PORT` | `22` | SSH порт (опционально, по умолчанию 22) |

**Как получить SSH ключ:**
```bash
# На локальной машине
cat ~/.ssh/id_rsa
# Или создать новый ключ специально для CI/CD
ssh-keygen -t rsa -b 4096 -f ~/.ssh/giperarena_deploy -N ""
cat ~/.ssh/giperarena_deploy
```

Скопировать **приватный ключ** полностью (включая `-----BEGIN RSA PRIVATE KEY-----` и `-----END RSA PRIVATE KEY-----`).

**Добавить публичный ключ на сервер:**
```bash
# Добавить на сервер
cat ~/.ssh/giperarena_deploy.pub | ssh root@83.222.20.168 "cat >> ~/.ssh/authorized_keys"
```

### 2. Database (PostgreSQL через Supavisor)

| Секрет | Текущее значение | Описание |
|--------|----------|----------|
| `POSTGRES_PASSWORD` | `zCjkIBgBluvlO2Kt` | Пароль PostgreSQL |

**Важно:** Уже настроено в production environment на сервере.

### 3. Redis

| Секрет | Текущее значение | Описание |
|--------|----------|----------|
| `REDIS_PASSWORD` | `S6KViUy0yIzC` | Пароль Redis |

### 4. MinIO S3 Storage

| Секрет | Текущее значение | Описание |
|--------|----------|----------|
| `MINIO_ROOT_USER` | `anatoliy` | MinIO access key |
| `MINIO_ROOT_PASSWORD` | `S6KViUy0yIzC` | MinIO secret key |

### 5. Supabase

| Секрет | Текущее значение | Описание |
|--------|----------|----------|
| `ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzYxMTY4MTIwLCJleHAiOjE3OTI3MDQxMjB9.U-z-ETgPGldHSQh3OcYDCXIqcYkgCnlxoj2cGZ7kB-M` | Supabase anon (public) key |
| `SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NjExNjgxMjAsImV4cCI6MTc5MjcwNDEyMH0.YZsZdA8t8xjWWF7lUgwqoKWOVWvSjCDwvRlf5zkmwZQ` | Supabase service role (admin) key |

### 6. JWT Secret

| Секрет | Текущее значение | Описание |
|--------|----------|----------|
| `JWT_SECRET` | `Cj-qKfzQAasfMtDpRky5_pZwjN1h1NwkYhlo1Lx3M6RtySNAQDY_YP0BrYLM_rr4` | JWT signing secret |

---

## 🔧 Как добавить секреты в GitHub

### Способ 1: Через Web Interface

1. Перейдите в репозиторий: https://github.com/giperpetr/GiperARENA
2. Нажмите **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. Введите **Name** (например, `VPS_HOST`)
5. Введите **Secret** (значение из таблицы выше)
6. Нажмите **Add secret**
7. Повторите для всех секретов

### Способ 2: Через GitHub CLI

```bash
# Установить GitHub CLI (если ещё не установлен)
brew install gh

# Авторизоваться
gh auth login

# Добавить секреты
gh secret set VPS_HOST -b "83.222.20.168"
gh secret set VPS_USER -b "root"
gh secret set VPS_SSH_KEY < ~/.ssh/giperarena_deploy
gh secret set VPS_PORT -b "22"

gh secret set POSTGRES_PASSWORD -b "zCjkIBgBluvlO2Kt"
gh secret set REDIS_PASSWORD -b "S6KViUy0yIzC"
gh secret set MINIO_ROOT_USER -b "anatoliy"
gh secret set MINIO_ROOT_PASSWORD -b "S6KViUy0yIzC"

gh secret set ANON_KEY -b "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzYxMTY4MTIwLCJleHAiOjE3OTI3MDQxMjB9.U-z-ETgPGldHSQh3OcYDCXIqcYkgCnlxoj2cGZ7kB-M"

gh secret set SERVICE_ROLE_KEY -b "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NjExNjgxMjAsImV4cCI6MTc5MjcwNDEyMH0.YZsZdA8t8xjWWF7lUgwqoKWOVWvSjCDwvRlf5zkmwZQ"

gh secret set JWT_SECRET -b "Cj-qKfzQAasfMtDpRky5_pZwjN1h1NwkYhlo1Lx3M6RtySNAQDY_YP0BrYLM_rr4"
```

---

## ✅ Проверка добавления секретов

### Через Web Interface:
1. **Settings** → **Secrets and variables** → **Actions**
2. Убедитесь, что все секреты присутствуют в списке

### Через CLI:
```bash
gh secret list
```

Вы должны увидеть:
```
ANON_KEY                 Updated 2025-XX-XX
JWT_SECRET               Updated 2025-XX-XX
MINIO_ROOT_PASSWORD      Updated 2025-XX-XX
MINIO_ROOT_USER          Updated 2025-XX-XX
POSTGRES_PASSWORD        Updated 2025-XX-XX
REDIS_PASSWORD           Updated 2025-XX-XX
SERVICE_ROLE_KEY         Updated 2025-XX-XX
VPS_HOST                 Updated 2025-XX-XX
VPS_PORT                 Updated 2025-XX-XX
VPS_SSH_KEY              Updated 2025-XX-XX
VPS_USER                 Updated 2025-XX-XX
```

---

## 🚀 Тестирование деплоя

После добавления всех секретов:

1. **Запустить workflow вручную:**
   - Перейти в **Actions** → **Build and Deploy GiperARENA**
   - Нажать **Run workflow** → **Run workflow**

2. **Или сделать push в main:**
   ```bash
   git add .
   git commit -m "feat: настройка CI/CD"
   git push origin main
   ```

3. **Проверить логи:**
   - **Actions** → выбрать последний запуск
   - Посмотреть логи каждого job'а

---

## 🔒 Безопасность

### ⚠️ ВАЖНО:

1. **НИКОГДА не коммитьте секреты в git**
2. **Используйте `.env.example` для шаблонов** (без реальных значений)
3. **Регулярно ротируйте ключи и пароли**
4. **SSH ключ должен быть уникальным** для CI/CD (не используйте личный)
5. **Проверьте права доступа** на сервере (SSH ключ должен иметь минимальные права)

### Рекомендации:

```bash
# На сервере: ограничить SSH ключ только командами docker
# В ~/.ssh/authorized_keys добавить перед ключом:
command="docker" ssh-rsa AAAAB3NzaC1yc2E...
```

---

## 📊 Размеры SLIM контейнеров

После успешного деплоя ожидаемые размеры:

| Сервис | Размер | Экономия |
|--------|--------|----------|
| Frontend | ~150 MB | 5x меньше обычного |
| Backend | ~120 MB | 5x меньше обычного |
| Realtime | ~100 MB | 5x меньше обычного |
| Media | ~180 MB | 4x меньше обычного |
| Blockchain | ~130 MB | 5x меньше обычного |

**Общий размер:** ~680 MB вместо ~3.5 GB! 🎉

---

## 🆘 Troubleshooting

### Ошибка: "Permission denied (publickey)"
**Решение:** Проверьте, что публичный ключ добавлен на сервер в `~/.ssh/authorized_keys`

### Ошибка: "docker: command not found"
**Решение:** Убедитесь, что Docker установлен на сервере и добавлен в PATH

### Ошибка: "network proxy not found"
**Решение:** На сервере создайте external сеть:
```bash
docker network create proxy
```

### Ошибка: "Unable to connect to database"
**Решение:** Проверьте, что Supabase запущен и доступен:
```bash
docker ps | grep supavisor
docker logs supavisor
```

---

**Документ обновлён:** 2025-10-22
**Проект:** GiperARENA
**Репозиторий:** https://github.com/giperpetr/GiperARENA
