from database.app.repositories.user_repository import UserRepository

repo = UserRepository()

repo.create_user(
    "admin001",
    "System Admin",
    "admin@kydy.com",
    "StrongAdmin123",
    role="admin"
)

print("Admin created")