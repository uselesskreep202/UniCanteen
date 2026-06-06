from fastapi import APIRouter
from app.api.routes import auth, menu, orders

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(menu.router)
api_router.include_router(orders.router)
