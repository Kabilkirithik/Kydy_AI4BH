from datetime import datetime
from boto3.dynamodb.conditions import Key
from database.app.db.dynamodb import get_kydy_table
import uuid


class SessionRepository:

    def __init__(self):
        self.table = get_kydy_table()

    def start_session(self, user_id: str, course_id: str, lesson_id: str):
        session_id = str(uuid.uuid4())

        item = {
            "PK": f"USER#{user_id}",
            "SK": f"SESSION#{session_id}",
            "course_id": course_id,
            "lesson_id": lesson_id,
            "started_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat(),
            "status": "active",
            "tokens_used": 0
        }

        self.table.put_item(Item=item)
        return session_id

    def add_message(self, session_id: str, role: str, content: str, token_count: int):
        item = {
            "PK": f"SESSION#{session_id}",
            "SK": f"MESSAGE#{datetime.utcnow().isoformat()}",
            "role": role,
            "content": content,
            "token_count": token_count
        }

        self.table.put_item(Item=item)

    def get_messages(self, session_id: str):
        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"SESSION#{session_id}") &
                                   Key("SK").begins_with("MESSAGE#")
        )

        return response.get("Items", [])
    
    def get_active_sessions(self, user_id: str):
        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"USER#{user_id}") &
                                Key("SK").begins_with("SESSION#")
        )

        sessions = response.get("Items", [])
        active_sessions = [s for s in sessions if s.get("status") == "active"]

        return active_sessions
    
    def increment_tokens(self, user_id: str, session_id: str, tokens: int):
        self.table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"SESSION#{session_id}"
            },
            UpdateExpression="SET tokens_used = tokens_used + :val",
            ExpressionAttributeValues={
                ":val": tokens
            }
        )

    def get_last_messages(self, session_id: str, limit: int = 10):
        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"SESSION#{session_id}") &
                                Key("SK").begins_with("MESSAGE#"),
            ScanIndexForward=False,  # newest first
            Limit=limit
        )

        return response.get("Items", [])
    
    def add_message(self, user_id: str, session_id: str, role: str, content: str, token_count: int):
        timestamp = datetime.utcnow().isoformat()

        # Store message
        self.table.put_item(
            Item={
                "PK": f"SESSION#{session_id}",
                "SK": f"MESSAGE#{timestamp}",
                "role": role,
                "content": content,
                "token_count": token_count
            }
        )

        # Update last_activity
        self.table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"SESSION#{session_id}"
            },
            UpdateExpression="SET last_activity = :ts ADD tokens_used :val",
            ExpressionAttributeValues={
                ":ts": timestamp,
                ":val": token_count
            }
        )

    def resume_or_create_session(self, user_id: str, course_id: str, lesson_id: str):
        active_sessions = self.get_active_sessions(user_id)

        if active_sessions:
            # Return most recent active session
            active_sessions.sort(key=lambda x: x["last_activity"], reverse=True)
            return active_sessions[0]["SK"].replace("SESSION#", "")

        return self.start_session(user_id, course_id, lesson_id)
    

    def close_session(self, user_id: str, session_id: str):
        self.table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"SESSION#{session_id}"
            },
            UpdateExpression="SET #status = :val",
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":val": "completed"
            }
        )

    
    def save_summary(self, session_id: str, summary: str):
        self.table.put_item(
            Item={
                "PK": f"SESSION#{session_id}",
                "SK": "SUMMARY",
                "content": summary,
                "created_at": datetime.utcnow().isoformat()
            }
        )

    def get_summary(self, session_id: str):
        response = self.table.get_item(
            Key={
                "PK": f"SESSION#{session_id}",
                "SK": "SUMMARY"
            }
        )
        return response.get("Item")
    

    def soft_delete_session(self, user_id: str, session_id: str):
        self.table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"SESSION#{session_id}"
            },
            UpdateExpression="SET #status = :val",
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":val": "deleted"
            }
        )

    def create_media_record(self, session_id: str, user_id: str, version: int):
        item = {
            "PK": f"SESSION#{session_id}",
            "SK": f"MEDIA#v{version}",

            "user_id": user_id,

            "svg_s3_key": None,
            "audio_s3_key": None,
            "timeline_s3_key": None,

            "generation_status": "pending",
            "generated_at": None,
            "version": version
        }

        self.table.put_item(Item=item)
        return item
    
    def update_media_record(self, session_id: str, version: int,
                        svg_key: str, audio_key: str, timeline_key: str):

        self.table.update_item(
            Key={
                "PK": f"SESSION#{session_id}",
                "SK": f"MEDIA#v{version}"
            },
            UpdateExpression="""
                SET svg_s3_key = :svg,
                    audio_s3_key = :audio,
                    timeline_s3_key = :timeline,
                    generation_status = :status,
                    generated_at = :time
            """,
            ExpressionAttributeValues={
                ":svg": svg_key,
                ":audio": audio_key,
                ":timeline": timeline_key,
                ":status": "completed",
                ":time": datetime.utcnow().isoformat()
            }
        )


    def get_latest_media(self, session_id: str):

        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"SESSION#{session_id}") &
                                Key("SK").begins_with("MEDIA#"),
            ScanIndexForward=False,  # newest first
            Limit=1
        )

        items = response.get("Items", [])
        return items[0] if items else None
    

    def get_all_media_versions(self, session_id: str):

        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"SESSION#{session_id}") &
                                Key("SK").begins_with("MEDIA#")
        )

        return response.get("Items", [])