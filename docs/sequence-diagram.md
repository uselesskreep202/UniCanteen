# Диаграмма последовательностей — Оформление заказа

```
sequenceDiagram
    actor Student as Студент
    participant FE as Frontend (React)
    participant API as Backend (FastAPI)
    participant Auth as AuthService
    participant OS as OrderService
    participant OR as OrderRepository
    participant MR as MenuRepository
    participant DB as PostgreSQL

    Note over Student,DB: 1. Аутентификация
    Student->>FE: Вводит email и пароль
    FE->>API: POST /api/auth/login
    API->>Auth: login(email, password)
    Auth->>DB: SELECT user WHERE email=...
    DB-->>Auth: User (password_hash)
    Auth->>Auth: verify_password(plain, hash)
    Auth->>Auth: create_access_token(user.id)
    Auth-->>API: (JWT token, User)
    API-->>FE: { access_token, user }
    FE->>FE: Сохранить токен в localStorage
    FE-->>Student: Перенаправить на /menu

    Note over Student,DB: 2. Выбор блюд
    Student->>FE: Открывает страницу меню
    FE->>API: GET /api/menu/dishes?available=true
    API->>MR: get_dishes(available_only=True)
    MR->>DB: SELECT dishes WHERE available=true
    DB-->>MR: List[Dish]
    MR-->>API: List[Dish]
    API-->>FE: JSON список блюд
    FE-->>Student: Показать блюда по категориям
    Student->>FE: Нажимает "В корзину" для нескольких блюд
    FE->>FE: addItem(dish) в Zustand store

    Note over Student,DB: 3. Выбор слота времени
    Student->>FE: Открывает корзину
    FE->>API: GET /api/orders/slots?date=2026-06-10
    API->>OR: get_slots(date="2026-06-10")
    OR->>DB: SELECT time_slots WHERE date=...
    DB-->>OR: List[TimeSlot]
    OR-->>API: List[TimeSlot]
    API-->>FE: JSON список слотов
    FE-->>Student: Показать доступные слоты
    Student->>FE: Выбирает слот 12:00–12:30

    Note over Student,DB: 4. Оформление заказа
    Student->>FE: Нажимает "Оформить заказ"
    FE->>API: POST /api/orders {slot_id, items, notes}
    Note right of API: Bearer token в заголовке
    API->>API: get_current_user(token) → User
    API->>OS: create_order(user_id, data)
    OS->>OR: get_slot(slot_id)
    OR->>DB: SELECT time_slot WHERE id=...
    DB-->>OR: TimeSlot
    OR-->>OS: TimeSlot
    OS->>OS: Проверить slot.current_orders < max_orders
    loop Для каждого блюда в заказе
        OS->>MR: get_dish(dish_id)
        MR->>DB: SELECT dish WHERE id=...
        DB-->>MR: Dish
        MR-->>OS: Dish
        OS->>OS: Проверить dish.available == True
        OS->>OS: total += dish.price * quantity
    end
    OS->>OR: create_order(user_id, slot_id, total, notes, items)
    OR->>DB: INSERT INTO orders ...
    OR->>DB: INSERT INTO order_items ...
    OR->>DB: UPDATE time_slots SET current_orders += 1
    DB-->>OR: Order (id=42)
    OR-->>OS: Order
    OS-->>API: Order
    API-->>FE: HTTP 201 { order }
    FE->>FE: clear() корзины
    FE-->>Student: Toast "Заказ оформлен!" → /orders

    Note over Student,DB: 5. Отмена заказа (если нужно)
    Student->>FE: Нажимает "Отменить" в истории заказов
    FE->>API: DELETE /api/orders/42
    API->>API: get_current_user(token) → User
    API->>OR: get_order(42)
    OR->>DB: SELECT order WHERE id=42
    DB-->>OR: Order (status=pending)
    OR-->>API: Order
    API->>API: Проверить order.user_id == user.id
    API->>API: Проверить order.status == PENDING
    API->>OR: update_status(order, CANCELLED)
    OR->>DB: UPDATE orders SET status='cancelled'
    DB-->>OR: OK
    OR-->>API: Order (status=cancelled)
    API-->>FE: HTTP 200 { order }
    FE-->>Student: Статус изменён на "Отменён"
```

## Описание процесса

### Участники
| Участник | Описание |
|----------|----------|
| **Студент** | Конечный пользователь, работает через браузер |
| **Frontend** | React SPA, управляет состоянием через Zustand |
| **Backend** | FastAPI REST API, обрабатывает запросы |
| **AuthService** | Сервис аутентификации, выдаёт JWT |
| **OrderService** | Бизнес-логика заказов (валидация, расчёт суммы) |
| **OrderRepository** | Доступ к данным заказов и слотов |
| **MenuRepository** | Доступ к данным блюд и категорий |
| **PostgreSQL** | Реляционная БД, хранит все данные |

### Ключевые проверки при создании заказа
1. Слот существует и не переполнен (`current_orders < max_orders`)
2. Все блюда доступны (`available = True`)
3. Количество каждого блюда > 0
4. Пользователь аутентифицирован (валидный JWT)
