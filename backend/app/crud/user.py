from sqlalchemy.orm import Session

from app.models.user import User, UserRole # 假設 UserRole 在 models.user 中
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str) -> User | None:
    """透過電子郵件查詢使用者"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> User | None:
    """透過使用者名稱查詢使用者"""
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate) -> User:
    """建立新使用者"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=UserRole.USER  # 新註冊使用者預設為 USER 角色，或根據需求調整
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> User | None:
    """
    驗證使用者。
    如果驗證成功，返回使用者物件；否則返回 None。
    """
    user = get_user_by_username(db, username=username)
    if not user:
        return None
    if not user.is_active: # 可以選擇是否檢查使用者是否啟用
        return None # 或者拋出特定錯誤
    if not verify_password(password, user.hashed_password):
        return None
    return user

# 您可以根據需要新增更多 CRUD 操作，例如：
# def update_user(...)
# def delete_user(...)
# def get_users(...)