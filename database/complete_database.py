import boto3
import uuid
from datetime import datetime
from boto3.dynamodb.conditions import Key
from passlib.context import CryptContext


# ==============================
# CONFIGURATION
# ==============================

TABLE_NAME = "KydyMain"
REGION = "ap-south-1"

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


# ==============================
# USER & AUTH DOMAIN
# ==============================

class UserDB:

    # Create User (Student/Admin)
    def create_user(self, user_id, name, email, password, role="student"):
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

        table.put_item(Item=item)
        return item

    def get_user(self, user_id):
        response = table.get_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": "PROFILE"
            }
        )
        return response.get("Item")

    def get_user_by_email(self, email):
        response = table.query(
            IndexName="EmailIndex",
            KeyConditionExpression=Key("email").eq(email)
        )
        items = response.get("Items", [])
        return items[0] if items else None

    def authenticate_user(self, email, password):
        user = self.get_user_by_email(email)
        if not user:
            return None

        if user.get("account_locked"):
            return None

        if not pwd_context.verify(password, user["password_hash"]):
            return None

        return user


# ==============================
# COURSE DOMAIN
# ==============================

class CourseDB:

    def create_course(self, course_id, title, description):
        item = {
            "PK": f"COURSE#{course_id}",
            "SK": "META",
            "title": title,
            "description": description,
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }
        table.put_item(Item=item)
        return item

    def create_module(self, course_id, module_id, title, order_index):
        item = {
            "PK": f"COURSE#{course_id}",
            "SK": f"MODULE#{module_id}",
            "title": title,
            "order_index": order_index,
            "created_at": datetime.utcnow().isoformat()
        }
        table.put_item(Item=item)

    def create_lesson(self, module_id, lesson_id, title, order_index, content_s3_key):
        item = {
            "PK": f"MODULE#{module_id}",
            "SK": f"LESSON#{lesson_id}#v1",
            "title": title,
            "order_index": order_index,
            "content_s3_key": content_s3_key,
            "created_at": datetime.utcnow().isoformat(),
            "version": 1,
            "status": "active"
        }
        table.put_item(Item=item)


# ==============================
# ENROLLMENT & PROGRESS
# ==============================

class LearningDB:

    def enroll_user(self, user_id, course_id):
        item = {
            "PK": f"USER#{user_id}",
            "SK": f"COURSE#{course_id}",
            "enrolled_at": datetime.utcnow().isoformat(),
            "progress_percentage": 0,
            "completion_status": "in_progress"
        }
        table.put_item(Item=item)

    def update_progress(self, user_id, lesson_id, completed, score):
        item = {
            "PK": f"USER#{user_id}",
            "SK": f"PROGRESS#{lesson_id}",
            "completed": completed,
            "score": score,
            "attempts": 1,
            "mastery_level": "beginner",
            "last_attempted": datetime.utcnow().isoformat()
        }
        table.put_item(Item=item)


# ==============================
# AI SESSION DOMAIN
# ==============================

class SessionDB:

    def start_session(self, user_id, course_id, lesson_id):
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

        table.put_item(Item=item)
        return session_id

    def add_message(self, session_id, role, content):
        item = {
            "PK": f"SESSION#{session_id}",
            "SK": f"MESSAGE#{datetime.utcnow().isoformat()}",
            "role": role,
            "content": content
        }
        table.put_item(Item=item)

    def create_media_record(self, session_id, user_id, version=1):
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
        table.put_item(Item=item)

    def update_media_record(self, session_id, version, svg_key, audio_key, timeline_key):
        table.update_item(
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


# ==============================
# MONETIZATION DOMAIN
# ==============================

class MonetizationDB:

    def create_subscription(self, user_id, plan, billing_cycle):
        item = {
            "PK": f"USER#{user_id}",
            "SK": "SUBSCRIPTION",
            "plan": plan,
            "billing_cycle": billing_cycle,
            "status": "active",
            "start_date": datetime.utcnow().isoformat()
        }
        table.put_item(Item=item)

    def record_payment(self, user_id, amount, currency, transaction_id):
        payment_id = str(uuid.uuid4())

        item = {
            "PK": f"USER#{user_id}",
            "SK": f"PAYMENT#{payment_id}",
            "amount": amount,
            "currency": currency,
            "transaction_id": transaction_id,
            "created_at": datetime.utcnow().isoformat(),
            "status": "completed"
        }
        table.put_item(Item=item)


# ==============================
# DOUBT SYSTEM
# ==============================

class DoubtDB:

    def create_doubt(self, user_id, lesson_id, question, ai_answer):
        doubt_id = str(uuid.uuid4())

        item = {
            "PK": f"USER#{user_id}",
            "SK": f"DOUBT#{doubt_id}",
            "lesson_id": lesson_id,
            "question": question,
            "ai_answer": ai_answer,
            "status": "answered",
            "created_at": datetime.utcnow().isoformat()
        }

        table.put_item(Item=item)
        return item