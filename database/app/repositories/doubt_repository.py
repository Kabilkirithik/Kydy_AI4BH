from datetime import datetime
from database.app.db.dynamodb import get_kydy_table
import uuid
from boto3.dynamodb.conditions import Key


class DoubtRepository:

    def __init__(self):
        self.table = get_kydy_table()

    def create_doubt(self, user_id: str, lesson_id: str, question: str):
        doubt_id = str(uuid.uuid4())

        item = {
            "PK": f"USER#{user_id}",
            "SK": f"DOUBT#{doubt_id}",
            "lesson_id": lesson_id,
            "question": question,
            "ai_answer": None,
            "rating": None,
            "created_at": datetime.utcnow().isoformat(),
            "status": "open"
        }

        self.table.put_item(Item=item)
        return doubt_id

    def answer_doubt(self, user_id: str, doubt_id: str, answer: str):
        self.table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"DOUBT#{doubt_id}"
            },
            UpdateExpression="SET ai_answer = :a, #status = :s",
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":a": answer,
                ":s": "answered"
            }
        )

    def get_user_doubts(self, user_id: str):
        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"USER#{user_id}") &
                                   Key("SK").begins_with("DOUBT#")
        )

        return response.get("Items", [])