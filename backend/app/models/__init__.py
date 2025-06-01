# backend/app/models/__init__.py
from .user import User, UserRole # 假設 UserRole 在 user.py
from .refresh_token import RefreshToken # 新增這一行

# 如果您有 user_role.py 和 role.py，也一併匯入
# from .role import Role
# from .user_role import user_roles_table

__all__ = ["User", "UserRole", "RefreshToken"] # 將 RefreshToken 加入 __all__