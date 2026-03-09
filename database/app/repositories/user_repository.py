from datetime import datetime
from database.app.db.dynamodb import get_kydy_table
from boto3.dynamodb.conditions import Key
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)
class UserRepository:

    def __init__(self):
        self.table = get_kydy_table()

    def create_user(self, user_id: str, name: str, email: str, password: str, role="student"):

        hashed_password = pwd_context.hash(password)

        item = {
            "PK": f"USER#{user_id}",
            "SK": "PROFILE",

            "name": name,
            "email": email,

            "password_hash": hashed_password,
            "role": role,

            "plan_type": "free",

            "status": "active",
            "is_verified": True,

            "failed_login_attempts": 0,
            "account_locked": False,

            "created_at": datetime.utcnow().isoformat(),
            "last_login": None
        }

        self.table.put_item(Item=item)
        return item

    def get_user(self, user_id: str):
        response = self.table.get_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": "PROFILE"
            }
        )

        item = response.get("Item")

        if item and item.get("status") == "deleted":
            return None

        return item

    def enroll_user_in_course(self, user_id: str, course_id: str):
        item = {
            "PK": f"USER#{user_id}",
            "SK": f"COURSE#{course_id}",
            "enrolled_at": datetime.utcnow().isoformat(),
            "progress_percentage": 0,
            "completion_status": "in_progress"
        }

        self.table.put_item(Item=item)
        return item
    
    def get_user_courses(self, user_id: str):
        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"USER#{user_id}") &
                                Key("SK").begins_with("COURSE#")
        )

        return response.get("Items", [])
    
    print("completed")


    def update_lesson_progress(self, user_id: str, lesson_id: str,
                           completed: bool, score: int):

        item = {
            "PK": f"USER#{user_id}",
            "SK": f"PROGRESS#{lesson_id}",
            "completed": completed,
            "score": score,
            "attempts": 1,
            "mastery_level": "beginner",
            "last_attempted": datetime.utcnow().isoformat()
        }

        self.table.put_item(Item=item)
        return item


    def get_lesson_progress(self, user_id: str):
        from boto3.dynamodb.conditions import Key

        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"USER#{user_id}") &
                                Key("SK").begins_with("PROGRESS#")
        )

        return response.get("Items", [])
    
    def update_xp(self, user_id: str, xp: int):
        self.table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": "GAMIFICATION"
            },
            UpdateExpression="ADD xp_points :val",
            ExpressionAttributeValues={
                ":val": xp
            }
        )


    def soft_delete_user(self, user_id: str):
        self.table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": "PROFILE"
            },
            UpdateExpression="SET #status = :val",
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":val": "deleted"
            }
        )

    
    def get_user_by_email(self, email: str):
        response = self.table.query(
            IndexName="EmailIndex",
            KeyConditionExpression=Key("email").eq(email)
        )

        items = response.get("Items", [])
        return items[0] if items else None
    

    def authenticate_user(self, email: str, password: str):

        user = self.get_user_by_email(email)

        if not user:
            return None

        if user.get("account_locked"):
            return None

        if not pwd_context.verify(password, user["password_hash"]):
            return None

        return user