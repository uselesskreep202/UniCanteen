from sqlalchemy.orm import Session
from app.models.menu import Category, Dish
from typing import Optional


class MenuRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_categories(self) -> list[Category]:
        return self.db.query(Category).all()

    def get_category(self, category_id: int) -> Optional[Category]:
        return self.db.query(Category).filter(Category.id == category_id).first()

    def create_category(self, name: str) -> Category:
        cat = Category(name=name)
        self.db.add(cat)
        self.db.commit()
        self.db.refresh(cat)
        return cat

    def get_dishes(self, category_id: Optional[int] = None, available_only: bool = False) -> list[Dish]:
        q = self.db.query(Dish)
        if category_id:
            q = q.filter(Dish.category_id == category_id)
        if available_only:
            q = q.filter(Dish.available == True)  # noqa: E712
        return q.all()

    def get_dish(self, dish_id: int) -> Optional[Dish]:
        return self.db.query(Dish).filter(Dish.id == dish_id).first()

    def create_dish(self, **kwargs) -> Dish:
        dish = Dish(**kwargs)
        self.db.add(dish)
        self.db.commit()
        self.db.refresh(dish)
        return dish

    def update_dish(self, dish: Dish, **kwargs) -> Dish:
        for key, value in kwargs.items():
            if value is not None:
                setattr(dish, key, value)
        self.db.commit()
        self.db.refresh(dish)
        return dish

    def delete_dish(self, dish: Dish) -> None:
        self.db.delete(dish)
        self.db.commit()
