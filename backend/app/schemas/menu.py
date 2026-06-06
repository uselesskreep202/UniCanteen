from pydantic import BaseModel
from typing import Optional


class CategoryOut(BaseModel):
    id: int
    name: str
    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str


class DishCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    category_id: int
    available: bool = True
    image_url: str = ""


class DishUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    available: Optional[bool] = None
    image_url: Optional[str] = None


class DishOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category_id: int
    available: bool
    image_url: str
    category: CategoryOut

    model_config = {"from_attributes": True}
