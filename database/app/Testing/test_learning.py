from database.app.repositories.learning_repository import LearningRepository
from database.app.repositories.user_repository import UserRepository

learning_repo = LearningRepository()
user_repo = UserRepository()

# Create module
learning_repo.create_module("python101", "module1", "Basics", 1)

# Create lesson
learning_repo.create_lesson(
    "module1",
    "lesson1",
    "Introduction to Variables",
    "s3://kydy-content/python101/lesson1/video.mp4",
    "Explain variables in simple terms.",
    15
)

# Fetch modules
modules = learning_repo.get_modules("python101")
print("Modules:", modules)

# Fetch lessons
lessons = learning_repo.get_lessons("module1")
print("Lessons:", lessons)

# Update progress
user_repo.update_lesson_progress("kabil002", "lesson1", True, 90)

progress = user_repo.get_lesson_progress("kabil002")
print("Progress:", progress)