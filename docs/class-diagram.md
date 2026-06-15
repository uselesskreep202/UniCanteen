# Диаграмма классов — UniCanteen

```
classDiagram
    class User {
        +int id
        +str email
        +str full_name
        +str password_hash
        +UserRole role
        +datetime created_at
        +orders: List[Order]
    }

    class UserRole {
        <<enumeration>>
        STUDENT
        STAFF
        ADMIN
    }

    class Category {
        +int id
        +str name
        +dishes: List[Dish]
    }

    class Dish {
        +int id
        +str name
        +str description
        +float price
        +int category_id
        +bool available
        +str image_url
        +category: Category
        +order_items: List[OrderItem]
    }

    class TimeSlot {
        +int id
        +str date
        +str time_start
        +str time_end
        +int max_orders
        +int current_orders
        +orders: List[Order]
    }

    class Order {
        +int id
        +int user_id
        +int slot_id
        +OrderStatus status
        +float total_price
        +str notes
        +datetime created_at
        +user: User
        +slot: TimeSlot
        +items: List[OrderItem]
    }

    class OrderStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        READY
        COMPLETED
        CANCELLED
    }

    class OrderItem {
        +int id
        +int order_id
        +int dish_id
        +int quantity
        +float price
        +order: Order
        +dish: Dish
    }

    class UserRepository {
        -Session db
        +get_by_id(user_id) User
        +get_by_email(email) User
        +create(email, full_name, password, role) User
        +list_all() List[User]
    }

    class MenuRepository {
        -Session db
        +get_categories() List[Category]
        +get_category(id) Category
        +create_category(name) Category
        +get_dishes(category_id, available_only) List[Dish]
        +get_dish(id) Dish
        +create_dish(**kwargs) Dish
        +update_dish(dish, **kwargs) Dish
        +delete_dish(dish) void
    }

    class OrderRepository {
        -Session db
        +get_slots(date) List[TimeSlot]
        +get_slot(id) TimeSlot
        +create_slot(date, time_start, time_end, max_orders) TimeSlot
        +create_order(user_id, slot_id, total_price, notes, items_data) Order
        +get_order(id) Order
        +get_user_orders(user_id) List[Order]
        +get_all_orders(status) List[Order]
        +update_status(order, status) Order
        +cancel_order(order) Order
    }

    class AuthService {
        -UserRepository repo
        +register(data) User
        +login(email, password) Tuple[str, User]
    }

    class OrderService {
        -OrderRepository order_repo
        -MenuRepository menu_repo
        +create_order(user_id, data) Order
        +get_stats() dict
    }

    User --> UserRole : role
    Order --> OrderStatus : status
    Order --> User : user_id
    Order --> TimeSlot : slot_id
    Order "1" *-- "many" OrderItem : contains
    OrderItem --> Dish : dish_id
    Dish --> Category : category_id
    Category "1" *-- "many" Dish : contains

    UserRepository ..> User : manages
    MenuRepository ..> Dish : manages
    MenuRepository ..> Category : manages
    OrderRepository ..> Order : manages
    OrderRepository ..> TimeSlot : manages

    AuthService --> UserRepository : uses
    OrderService --> OrderRepository : uses
    OrderService --> MenuRepository : uses

```
## Описание классов

### Модели данных
- **User** — пользователь системы (студент / сотрудник / администратор)
- **Category** — категория блюд (супы, вторые блюда, напитки...)
- **Dish** — блюдо меню с ценой и описанием
- **TimeSlot** — временной слот получения заказа (дата + время + лимит)
- **Order** — заказ студента, привязан к слоту и пользователю
- **OrderItem** — позиция в заказе (блюдо + количество + цена на момент заказа)

### Слой репозиториев (Repository Pattern)
Изолируют логику работы с базой данных. Бизнес-слой не знает как данные хранятся.

### Слой сервисов (Service Layer)
Содержат бизнес-логику. `OrderService` валидирует слот, проверяет доступность блюд, считает сумму.
