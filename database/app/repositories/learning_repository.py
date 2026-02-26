from datetime import datetime
from database.app.db.dynamodb import get_kydy_table
from boto3.dynamodb.conditions import Key

class LearningRepository:

    def __init__(self):
        self.table = get_kydy_table()

    # ----------------------
    # MODULE
    # ----------------------
    def create_module(self, course_id: str, module_id: str, title: str, order_index: int):
        item = {
            "PK": f"COURSE#{course_id}",
            "SK": f"MODULE#{module_id}",
            "title": title,
            "order_index": order_index,
            "version": 1,
            "created_at": datetime.utcnow().isoformat()
        }

        self.table.put_item(Item=item)
        return item

    # ----------------------
    # LESSON
    # ----------------------
    def create_lesson(self, module_id: str, lesson_id: str, title: str,
                      content_s3_url: str, ai_prompt_template: str,
                      estimated_duration: int):

        item = {
            "PK": f"MODULE#{module_id}",
            "SK": f"LESSON#{lesson_id}#v1",
            "title": title,
            "order_index": 1,
            "content_s3_url": content_s3_url,
            "ai_prompt_template": ai_prompt_template,
            "estimated_duration": estimated_duration,
            "version": 1,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }

        self.table.put_item(Item=item)
        return item

    # ----------------------
    # FETCH MODULES
    # ----------------------
    def get_modules(self, course_id: str):
        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"COURSE#{course_id}") &
                                   Key("SK").begins_with("MODULE#")
        )
        return response.get("Items", [])

    def get_lessons(self, module_id: str):
        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"MODULE#{module_id}") &
                                   Key("SK").begins_with("LESSON#")
        )
        return response.get("Items", [])
    

    def soft_delete_lesson(self, module_id: str, lesson_id: str):
        self.table.update_item(
            Key={
                "PK": f"MODULE#{module_id}",
                "SK": f"LESSON#{lesson_id}#v1"
            },
            UpdateExpression="SET #status = :val",
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":val": "deleted"
            }
        )