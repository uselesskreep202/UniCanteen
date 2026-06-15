"""Скрипт начального заполнения БД тестовыми данными."""
from app.core.database import Base, engine, SessionLocal
from app.models import *  # noqa: F401, F403 — ensures all models are registered
from app.repositories.user_repository import UserRepository
from app.repositories.menu_repository import MenuRepository
from app.repositories.order_repository import OrderRepository
from app.models.user import UserRole

Base.metadata.create_all(bind=engine)

db = SessionLocal()

user_repo = UserRepository(db)
menu_repo = MenuRepository(db)
order_repo = OrderRepository(db)

# Пользователи
if not user_repo.get_by_email("admin@uni.ru"):
    user_repo.create("admin@uni.ru", "Администратор", "admin123", role=UserRole.ADMIN)
if not user_repo.get_by_email("staff@uni.ru"):
    user_repo.create("staff@uni.ru", "Сотрудник Столовой", "staff123", role=UserRole.STAFF)
if not user_repo.get_by_email("student@uni.ru"):
    user_repo.create("student@uni.ru", "Иван Студентов", "student123", role=UserRole.STUDENT)

# Категории и блюда
cats = {
    "Первые блюда": [
        {"name": "Борщ", "description": "Украинский борщ со сметаной", "price": 120.0},
        {"name": "Щи", "description": "Щи из свежей капусты", "price": 100.0},
        {"name": "Куриный суп", "description": "Лёгкий суп с лапшой", "price": 110.0},
    ],
    "Вторые блюда": [
        {"name": "Котлета с пюре", "description": "Домашняя котлета и картофельное пюре", "price": 180.0},
        {"name": "Гречка с курицей", "description": "Гречневая каша с куриным филе", "price": 160.0},
        {"name": "Рыба запечённая", "description": "Минтай с овощами в духовке", "price": 190.0},
    ],
    "Салаты": [
        {"name": "Оливье", "description": "Классический салат оливье", "price": 90.0},
        {"name": "Винегрет", "description": "Свёкла, морковь, картофель", "price": 70.0},
    ],
    "Напитки": [
        {"name": "Компот", "description": "Из сухофруктов", "price": 30.0},
        {"name": "Чай", "description": "Чёрный чай с сахаром", "price": 25.0},
        {"name": "Кофе", "description": "Растворимый кофе", "price": 40.0},
    ],
    "Выпечка": [
        {"name": "Булочка", "description": "Сдобная булочка с маком", "price": 35.0},
        {"name": "Пирожок с капустой", "description": "Печёный пирожок", "price": 45.0},
    ],
}

from datetime import date, timedelta

for cat_name, dishes in cats.items():
    existing = next((c for c in menu_repo.get_categories() if c.name == cat_name), None)
    cat = existing or menu_repo.create_category(cat_name)
    for d in dishes:
        if not any(x.name == d["name"] for x in menu_repo.get_dishes(cat.id)):
            menu_repo.create_dish(name=d["name"], description=d["description"], price=d["price"],
                                  category_id=cat.id, available=True, image_url="")

# Слоты на ближайшие 3 дня
today = date.today()
for delta in range(3):
    day = str(today + timedelta(days=delta))
    for start, end in [("11:30", "12:00"), ("12:00", "12:30"), ("12:30", "13:00"), ("13:00", "13:30")]:
        existing_slots = order_repo.get_slots(day)
        if not any(s.time_start == start for s in existing_slots):
            order_repo.create_slot(date=day, time_start=start, time_end=end, max_orders=20)

db.close()
print("   БД заполнена тестовыми данными")
print("   admin@uni.ru / admin123")
print("   staff@uni.ru / staff123")
print("   student@uni.ru / student123")
