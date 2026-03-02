from database.app.repositories.user_repository import UserRepository

repo = UserRepository()

user = repo.authenticate_user("admin@kydy.com", "StrongAdmin123")

print("Login success:", user is not None)