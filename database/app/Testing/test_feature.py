from database.app.repositories.admin_repository import AdminRepository

repo = AdminRepository()

repo.create_feature_flag(
    "ai_animated_visuals",
    True,
    50,
    ["pro"]
)

feature = repo.get_feature_flag("ai_animated_visuals")

print("Feature:", feature)