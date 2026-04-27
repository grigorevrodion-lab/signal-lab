# Signal Lab

Площадка для наблюдаемости: нажми кнопку в интерфейсе — увидь результат в Grafana, Loki и Sentry в течение 30 секунд.

## Требования

- Docker Desktop 4.x+ с Compose v2
- Git

## Быстрый старт

```bash
git clone <repo-url> signal-lab && cd signal-lab

cp .env.example .env
# Опционально: добавь SENTRY_DSN=https://... в .env для захвата событий Sentry

docker compose up -d
```

Подожди ~30 секунд, пока все сервисы станут здоровыми, затем:

| Сервис | URL |
|--------|-----|
| UI | http://localhost:3000 |
| API + Swagger | http://localhost:3001/api/docs |
| Метрики Prometheus | http://localhost:3001/metrics |
| Grafana | http://localhost:3100 (admin / admin) |
| Loki (через Grafana) | http://localhost:3100/explore |
| Prometheus UI | http://localhost:9090 |

## Остановка

```bash
docker compose down
# Удалить тома (очищает все данные):
docker compose down -v
```

---

## Проверка работоспособности

Выполни за 5 минут, чтобы убедиться, что всё работает.

### 1. UI загружается

Открой http://localhost:3000 — должен появиться заголовок "Signal Lab", форма "Run Scenario" и пустой "Run History".

### 2. Запуск сценариев

В UI запусти каждый из них и наблюдай за цветом бейджа в истории:

| Сценарий | Ожидаемый бейдж | Ожидаемый тост |
|----------|----------------|----------------|
| `success` | Зелёный "OK" | "Run completed in Xms" |
| `validation_error` | Жёлтый "Invalid" | "Run failed" + сообщение 400 |
| `system_error` | Красный "Error" | "Run failed" + сообщение 500 |
| `slow_request` | Зелёный "OK" через 2-5с | "Run completed in Xs" |
| `teapot` | Голубой "418" | "Teapot! Signal: 42" |

### 3. Проверка метрик Prometheus

```
open http://localhost:3001/metrics
```

Найди:
- `scenario_runs_total` — счётчики с метками `type` и `status`
- `scenario_run_duration_seconds_count` — счётчики гистограммы
- `http_requests_total` — счётчики HTTP-запросов

### 4. Проверка дашборда Grafana

Открой http://localhost:3100 → войди как `admin / admin`

Перейди в **Dashboards → Signal Lab → Signal Lab**.

Должно быть 5 панелей:
- "Scenario Runs by Type" — временные ряды с цветными линиями по типам сценариев
- "Error Rate" — временные ряды, красная линия для статуса `failed`
- "Latency Distribution (P50 / P95 / P99)" — после `slow_request` p99 поднимается до 5с
- "HTTP Requests Total" — все вызовы API
- "Application Logs (Loki)" — JSON-записи логов из бэкенда

### 5. Проверка логов Loki

В Grafana: **Explore → datasource: Loki**

Выполни запрос: `{app="signal-lab"}`

Должны появиться структурированные JSON-логи с полями: `level`, `msg`, `scenarioType`, `scenarioId`, `duration`.

Фильтр по типу сценария: `{app="signal-lab"} | json | scenarioType="system_error"`

### 6. Проверка Sentry (требует DSN)

Если `SENTRY_DSN` указан в `.env`:
- Запусти сценарий `system_error`
- Открой проект Sentry — новое исключение `Unhandled system exception in scenario execution` должно появиться в течение 30с

---

## Архитектура

```
localhost:3000  →  Next.js фронтенд (shadcn/ui, TanStack Query, RHF)
localhost:3001  →  NestJS бэкенд (Prisma/PG, prom-client, pino, Sentry)
localhost:9090  →  Prometheus (опрашивает бэкенд /metrics каждые 5с)
localhost:3100  →  Grafana (дашборды: источники данных Prometheus + Loki)
localhost:3200  →  Loki (получает логи от Promtail)
                   Promtail (читает логи Docker-контейнеров → Loki)
                   PostgreSQL (хранит записи ScenarioRun)
```

## Типы сценариев

| Тип | HTTP-статус | Сигнал |
|-----|------------|--------|
| `success` | 200 | metric++, лог info, строка в PG |
| `validation_error` | 400 | metric++, лог warn, breadcrumb в Sentry |
| `system_error` | 500 | metric++, лог error, исключение в Sentry |
| `slow_request` | 200 (через 2-5с) | metric++, spike гистограммы, лог warn |
| `teapot` | 418 🫖 | signal: 42, пасхальное яйцо в метаданных |

## Разработка

```bash
# Только бэкенд (требует локальный PG)
cd apps/backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev

# Только фронтенд
cd apps/frontend
cp .env.example .env
npm install
npm run dev
```

## Слой AI

Смотри [AI_LAYER.md](./AI_LAYER.md) — документация по навыкам Cursor, правилам, командам и хукам.
