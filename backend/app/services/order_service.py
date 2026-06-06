from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.order_repository import OrderRepository
from app.repositories.menu_repository import MenuRepository
from app.schemas.order import OrderCreate


class OrderService:
    """Service layer for order business logic (Factory + Service patterns)."""

    def __init__(self, db: Session):
        self.order_repo = OrderRepository(db)
        self.menu_repo = MenuRepository(db)

    def create_order(self, user_id: int, data: OrderCreate):
        slot = self.order_repo.get_slot(data.slot_id)
        if not slot:
            raise HTTPException(status_code=404, detail="Time slot not found")
        if slot.current_orders >= slot.max_orders:
            raise HTTPException(status_code=400, detail="Time slot is full")

        items_data = []
        total = 0.0
        for item in data.items:
            dish = self.menu_repo.get_dish(item.dish_id)
            if not dish or not dish.available:
                raise HTTPException(status_code=400, detail=f"Dish {item.dish_id} not available")
            if item.quantity <= 0:
                raise HTTPException(status_code=400, detail="Quantity must be positive")
            total += dish.price * item.quantity
            items_data.append({"dish_id": dish.id, "quantity": item.quantity, "price": dish.price})

        return self.order_repo.create_order(
            user_id=user_id,
            slot_id=data.slot_id,
            total_price=round(total, 2),
            notes=data.notes,
            items_data=items_data,
        )

    def get_stats(self):
        all_orders = self.order_repo.get_all_orders()
        from app.models.order import OrderStatus
        return {
            "total": len(all_orders),
            "pending": sum(1 for o in all_orders if o.status == OrderStatus.PENDING),
            "confirmed": sum(1 for o in all_orders if o.status == OrderStatus.CONFIRMED),
            "ready": sum(1 for o in all_orders if o.status == OrderStatus.READY),
            "completed": sum(1 for o in all_orders if o.status == OrderStatus.COMPLETED),
            "cancelled": sum(1 for o in all_orders if o.status == OrderStatus.CANCELLED),
            "revenue": round(sum(o.total_price for o in all_orders if o.status == OrderStatus.COMPLETED), 2),
        }
