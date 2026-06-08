from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.schemas.user import UserRegister, UserOut, Token
from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository
from app.models.user import UserRole

router = APIRouter(prefix="/auth", tags=["auth"])

class RoleUpdate(BaseModel):
    role: UserRole

class ProfileUpdate(BaseModel):
    full_name: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    return AuthService(db).register(data)

@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    token, user = AuthService(db).login(form.username, form.password)
    return Token(access_token=token, user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return user

@router.put("/me", response_model=UserOut)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if len(data.full_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Имя слишком короткое")
    user.full_name = data.full_name.strip()
    db.commit()
    db.refresh(user)
    return user

@router.put("/me/password")
def change_password(data: PasswordChange, db: Session = Depends(get_db), user=Depends(get_current_user)):
    from app.core.security import verify_password, hash_password
    if not verify_password(data.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Неверный текущий пароль")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Минимум 6 символов")
    user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"detail": "Пароль изменён"}

@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    return UserRepository(db).list_all()

@router.put("/users/{user_id}/role", response_model=UserOut)
def update_role(user_id: int, data: RoleUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = data.role
    db.commit()
    db.refresh(user)
    return user