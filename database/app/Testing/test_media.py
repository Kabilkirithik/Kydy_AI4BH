from database.app.repositories.session_repository import SessionRepository

repo = SessionRepository()

session_id = "abc123"
user_id = "nivi007"

# Create v1
repo.create_media_record(session_id, user_id, 1)

# Update v1
repo.update_media_record(
    session_id,
    1,
    "sessions/nivi007/abc123/v1/animation.svg",
    "sessions/nivi007/abc123/v1/voiceover.mp3",
    "sessions/nivi007/abc123/v1/timeline.json"
)

# Fetch latest
media = repo.get_latest_media(session_id)
print("Latest media:", media)