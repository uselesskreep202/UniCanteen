import enum
from sqlalchemy import Column, Integer, Float, String, Enum, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)  
    time_start = Column(String, nullable=False) 
    time_end = Column(String, nullable=False)
    max_orders = Column(Integer, default=20)
    current_orders = Column(Integer, default=0)

    orders = relationship("Order", back_populates="slot")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("time_slots.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    total_price = Column(Float, nullable=False)
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="orders")
    slot = relationship("TimeSlot", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    dish_id = Column(Integer, ForeignKey("dishes.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    dish = relationship("Dish", back_populates="order_items")
