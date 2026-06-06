from sqlalchemy.orm import Session, joinedload
from app.models.order import Order, OrderItem, OrderStatus, TimeSlot
from typing import Optional


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_slots(self, date: Optional[str] = None) -> list[TimeSlot]:
        q = self.db.query(TimeSlot)
        if date:
            q = q.filter(TimeSlot.date == date)
        return q.all()

    def get_slot(self, slot_id: int) -> Optional[TimeSlot]:
        return self.db.query(TimeSlot).filter(TimeSlot.id == slot_id).first()

    def create_slot(self, date: str, time_start: str, time_end: str, max_orders: int) -> TimeSlot:
        slot = TimeSlot(date=date, time_start=time_start, time_end=time_end, max_orders=max_orders)
        self.db.add(slot)
        self.db.commit()
        self.db.refresh(slot)
        return slot

    def create_order(self, user_id: int, slot_id: int, total_price: float, notes: str, items_data: list) -> Order:
        order = Order(user_id=user_id, slot_id=slot_id, total_price=total_price, notes=notes)
        self.db.add(order)
        self.db.flush()
        for item in items_data:
            oi = OrderItem(order_id=order.id, dish_id=item["dish_id"], quantity=item["quantity"], price=item["price"])
            self.db.add(oi)
        slot = self.get_slot(slot_id)
        if slot:
            slot.current_orders += 1
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_order(self, order_id: int) -> Optional[Order]:
        return (
            self.db.query(Order)
            .options(joinedload(Order.items), joinedload(Order.slot), joinedload(Order.user))
            .filter(Order.id == order_id)
            .first()
        )

    def get_user_orders(self, user_id: int) -> list[Order]:
        return (
            self.db.query(Order)
            .options(joinedload(Order.items), joinedload(Order.slot))
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .all()
        )

    def get_all_orders(self, status: Optional[OrderStatus] = None) -> list[Order]:
        q = self.db.query(Order).options(
            joinedload(Order.items), joinedload(Order.slot), joinedload(Order.user)
        )
        if status:
            q = q.filter(Order.status == status)
        return q.order_by(Order.created_at.desc()).all()

    def update_status(self, order: Order, status: OrderStatus) -> Order:
        order.status = status
        self.db.commit()
        self.db.refresh(order)
        return order
