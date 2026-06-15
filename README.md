# UniCanteen — Система предзаказа в университетской столовой

## Состав команды

| Имя | Роль |
|-----|------|
| Александр Булгаков | Backend Developer (FastAPI, PostgreSQL) |
| Сергей Крылов | Frontend Developer (React, TypeScript) |
| Егор Зеленков | QA Engineer (pytest, Vitest) |
| Тимофей Ясонов | UI/UX Designer + Frontend |
| Артём Маслеников | Project Manager (CI/CD, Docker) |

## Технологический стек

| Слой | Технология |
|------|-----------|
| Бэкенд | Python 3.12, FastAPI, SQLAlchemy 2.0 |
| База данных | PostgreSQL 16 |
| Фронтенд | React 18, TypeScript, Vite, Zustand |
| Контейнеризация | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Линтеры | ruff (Python), ESLint (TS) |
| Тесты | pytest + coverage (≥60%), Vitest |

## Быстрый старт

### С Docker Compose (рекомендуется)

```bash
docker compose up --build
```

Затем заполнить БД тестовыми данными:
```bash
docker compose exec backend python seed.py
```

- Фронтенд: http://localhost:3000
- API docs: http://localhost:8000/docs

### Для разработки (без Docker)

**Бэкенд:**
```bash
cd backend
python -m venv .venv && .venv/Scripts/activate  # Windows
pip install -r requirements.txt
# Запустить PostgreSQL и установить DATABASE_URL в .env
uvicorn app.main:app --reload
python seed.py
```

**Фронтенд:**
```bash
cd frontend
npm install
npm run dev
```

## Тестирование

```bash
# Бэкенд
cd backend
pytest

# Фронтенд
cd frontend
npm test
```

## Архитектурные решения

### Паттерны проектирования
- **Repository Pattern** — изоляция слоя доступа к данным (`app/repositories/`)
- **Service Layer** — бизнес-логика вынесена из роутеров (`app/services/`)
- **Factory Pattern** — создание заказов в `OrderService.create_order()`
- **Observer Pattern** — изменение статуса слота при создании заказа

### Роли пользователей
- **student** — просмотр меню, оформление заказов, история заказов
- **staff** — управление статусами заказов, добавление блюд и слотов
- **admin** — полный доступ + статистика + управление меню

## Структура проекта

```
├── backend/
│   ├── app/
│   │   ├── api/routes/      # REST endpoints
│   │   ├── core/            # config, security, database, deps
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── repositories/    # data access layer
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # business logic
│   ├── tests/               # pytest tests
│   └── seed.py              # demo data
├── frontend/
│   └── src/
│       ├── api/             # axios API clients
│       ├── components/      # reusable UI
│       ├── pages/           # page components
│       ├── store/           # Zustand state
│       └── types/           # TypeScript types
├── .github/workflows/ci.yml
└── docker-compose.yml
```
