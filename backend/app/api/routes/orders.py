from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_staff, require_admin
from app.repositories.order_repository import OrderRepository
from app.services.order_service import OrderService
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate, TimeSlotOut, TimeSlotCreate

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/slots", response_model=list[TimeSlotOut])
def get_slots(date: Optional[str] = None, db: Session = Depends(get_db)):
    return OrderRepository(db).get_slots(date=date)


@router.post("/slots", response_model=TimeSlotOut, status_code=201)
def create_slot(data: TimeSlotCreate, db: Session = Depends(get_db), _=Depends(require_staff)):
    return OrderRepository(db).create_slot(**data.model_dump())


@router.post("", response_model=OrderOut, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return OrderService(db).create_order(user.id, data)


@router.get("/my", response_model=list[OrderOut])
def my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    orders = OrderRepository(db).get_user_orders(user.id)
    return _serialize_orders(orders)


@router.get("/all", response_model=list[OrderOut])
def all_orders(status: Optional[str] = None, db: Session = Depends(get_db), _=Depends(require_staff)):
    from app.models.order import OrderStatus
    status_enum = OrderStatus(status) if status else None
    orders = OrderRepository(db).get_all_orders(status=status_enum)
    return _serialize_orders(orders)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = OrderRepository(db).get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    from app.models.user import UserRole
    if user.role not in (UserRole.STAFF, UserRole.ADMIN) and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return _serialize_order(order)


@router.put("/{order_id}/status", response_model=OrderOut)
def update_status(order_id: int, data: OrderStatusUpdate, db: Session = Depends(get_db), _=Depends(require_staff)):
    repo = OrderRepository(db)
    order = repo.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _serialize_order(repo.update_status(order, data.status))


@router.delete("/{order_id}", response_model=OrderOut)
def cancel_own_order(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Студент отменяет свой заказ (только если статус pending)."""
    from app.models.order import OrderStatus
    repo = OrderRepository(db)
    order = repo.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="Можно отменить только заказ со статусом 'ожидает'")
    return _serialize_order(repo.update_status(order, OrderStatus.CANCELLED))


@router.get("/stats/summary")
def stats(_=Depends(require_admin), db: Session = Depends(get_db)):
    return OrderService(db).get_stats()


def _serialize_order(order):
    result = OrderOut.model_validate(order)
    for i, item in enumerate(result.items):
        if order.items and i < len(order.items):
            item.dish_name = order.items[i].dish.name if order.items[i].dish else ""
    return result


def _serialize_orders(orders):
    return [_serialize_order(o) for o in orders]
