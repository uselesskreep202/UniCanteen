from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus
from app.schemas.user import UserOut


class TimeSlotOut(BaseModel):
    id: int
    date: str
    time_start: str
    time_end: str
    max_orders: int
    current_orders: int

    model_config = {"from_attributes": True}


class TimeSlotCreate(BaseModel):
    date: str
    time_start: str
    time_end: str
    max_orders: int = 20


class OrderItemCreate(BaseModel):
    dish_id: int
    quantity: int


class OrderItemOut(BaseModel):
    id: int
    dish_id: int
    quantity: int
    price: float
    dish_name: str = ""

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    slot_id: int
    items: List[OrderItemCreate]
    notes: str = ""


class OrderOut(BaseModel):
    id: int
    user_id: int
    slot_id: int
    status: OrderStatus
    total_price: float
    notes: str
    created_at: Optional[datetime] = None
    items: List[OrderItemOut] = []
    slot: Optional[TimeSlotOut] = None
    user: Optional[UserOut] = None

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
