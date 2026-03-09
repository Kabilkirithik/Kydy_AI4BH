from database.app.repositories.user_repository import UserRepository

repo = UserRepository()

# Create user
repo.create_user("nivi007", "Niveditha", "nivi@example.com")

# Fetch user
user = repo.get_user("nivi007")

print(user)


# from database.app.repositories.user_repository import UserRepository

# repo = UserRepository()

# for i in range(1, 6):
#     user_id = f"user{i:03}"
#     repo.create_user(user_id, f"User{i}", f"user{i}@example.com")

# print("5 users created.")