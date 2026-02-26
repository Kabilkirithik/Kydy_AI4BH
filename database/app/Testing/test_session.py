from database.app.repositories.session_repository import SessionRepository

repo = SessionRepository()

# Start session
session_id = repo.start_session("kabil002", "python101", "lesson1")
print("Session ID:", session_id)

# Add messages
repo.add_message(session_id, "user", "What is a variable?", 10)
repo.add_message(session_id, "ai", "A variable stores data in memory.", 20)

# Fetch messages
messages = repo.get_messages(session_id)

print("Messages:")
print(messages)