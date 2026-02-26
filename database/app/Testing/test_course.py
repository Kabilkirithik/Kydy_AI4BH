# from database.app.repositories.course_repository import CourseRepository
# from database.app.repositories.user_repository import UserRepository

# course_repo = CourseRepository()
# user_repo = UserRepository()

# # Create course
# course_repo.create_course(
#     "python101",
#     "Python Basics",
#     "Learn Python from scratch"
# )

# # Enroll existing user
# user_repo.enroll_user_in_course("kabil002", "python101")

# print("Course created and user enrolled.")


from database.app.repositories.course_repository import CourseRepository
from database.app.repositories.user_repository import UserRepository

course_repo = CourseRepository()
user_repo = UserRepository()

# Create second course
course_repo.create_course(
    "ai101",
    "Intro to AI",
    "Basics of Artificial Intelligence"
)

# Enroll user in second course
user_repo.enroll_user_in_course("kabil002", "ai101")

# Fetch enrolled courses
courses = user_repo.get_user_courses("kabil002")

print("User Enrolled Courses:")
print(courses)