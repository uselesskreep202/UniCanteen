from app.core.database import Base, engine, SessionLocal
from app.models import *
from app.repositories.user_repository import UserRepository
from app.repositories.menu_repository import MenuRepository
from app.repositories.order_repository import OrderRepository
from app.models.user import UserRole
from datetime import date, timedelta

Base.metadata.create_all(bind=engine)
db = SessionLocal()
user_repo = UserRepository(db)
menu_repo = MenuRepository(db)
order_repo = OrderRepository(db)

if not user_repo.get_by_email("admin@uni.ru"):
    user_repo.create("admin@uni.ru", "Администратор", "admin123", role=UserRole.ADMIN)
if not user_repo.get_by_email("staff@uni.ru"):
    user_repo.create("staff@uni.ru", "Сотрудник Мария", "staff123", role=UserRole.STAFF)
if not user_repo.get_by_email("student@uni.ru"):
    user_repo.create("student@uni.ru", "Студент Иван", "student123")

cats = {
    "Первые блюда": [("Борщ","Со сметаной",120),("Щи","Из капусты",100),("Куриный суп","С лапшой",110)],
    "Вторые блюда": [("Котлета с пюре","Домашняя котлета",180),("Гречка с курицей","С филе",160)],
    "Салаты":       [("Оливье","Классический",90),("Винегрет","Со свёклой",70)],
    "Напитки":      [("Компот","Из сухофруктов",30),("Чай","Чёрный",25),("Кофе","Растворимый",40)],
    "Выпечка":      [("Булочка","С маком",35),("Пирожок","С капустой",45)],
}
for cat_name, dishes in cats.items():
    existing = next((c for c in menu_repo.get_categories() if c.name == cat_name), None)
    cat = existing or menu_repo.create_category(cat_name)
    for name, desc, price in dishes:
        if not any(x.name == name for x in menu_repo.get_dishes(cat.id)):
            menu_repo.create_dish(name=name, description=desc, price=price, category_id=cat.id, available=True, image_url="")

today = date.today()
for delta in range(3):
    day = str(today + timedelta(days=delta))
    for start, end in [("11:30","12:00"),("12:00","12:30"),("12:30","13:00"),("13:00","13:30")]:
        if not any(s.time_start == start for s in order_repo.get_slots(day)):
            order_repo.create_slot(date=day, time_start=start, time_end=end, max_orders=20)
db.close()
print("✅ БД заполнена!")
print("   admin@uni.ru  / admin123")
print("   staff@uni.ru  / staff123")
print("   student@uni.ru / student123")