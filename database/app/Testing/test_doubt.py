from database.app.repositories.doubt_repository import DoubtRepository

repo = DoubtRepository()

doubt_id = repo.create_doubt(
    "kabil002",
    "lesson1",
    "What is the difference between list and tuple?"
)

repo.answer_doubt(
    "kabil002",
    doubt_id,
    "Lists are mutable, tuples are immutable."
)

doubts = repo.get_user_doubts("kabil002")

print("Doubts:", doubts)