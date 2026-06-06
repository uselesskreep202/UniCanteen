from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.deps import require_staff
from app.repositories.menu_repository import MenuRepository
from app.schemas.menu import CategoryOut, CategoryCreate, DishOut, DishCreate, DishUpdate

router = APIRouter(prefix="/menu", tags=["menu"])


@router.get("/categories", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return MenuRepository(db).get_categories()


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), _=Depends(require_staff)):
    return MenuRepository(db).create_category(data.name)


@router.get("/dishes", response_model=list[DishOut])
def get_dishes(category_id: Optional[int] = None, available: bool = False, db: Session = Depends(get_db)):
    return MenuRepository(db).get_dishes(category_id=category_id, available_only=available)


@router.get("/dishes/{dish_id}", response_model=DishOut)
def get_dish(dish_id: int, db: Session = Depends(get_db)):
    dish = MenuRepository(db).get_dish(dish_id)
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    return dish


@router.post("/dishes", response_model=DishOut, status_code=201)
def create_dish(data: DishCreate, db: Session = Depends(get_db), _=Depends(require_staff)):
    repo = MenuRepository(db)
    if not repo.get_category(data.category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return repo.create_dish(**data.model_dump())


@router.put("/dishes/{dish_id}", response_model=DishOut)
def update_dish(dish_id: int, data: DishUpdate, db: Session = Depends(get_db), _=Depends(require_staff)):
    repo = MenuRepository(db)
    dish = repo.get_dish(dish_id)
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    return repo.update_dish(dish, **data.model_dump(exclude_none=True))


@router.delete("/dishes/{dish_id}", status_code=204)
def delete_dish(dish_id: int, db: Session = Depends(get_db), _=Depends(require_staff)):
    repo = MenuRepository(db)
    dish = repo.get_dish(dish_id)
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    repo.delete_dish(dish)
