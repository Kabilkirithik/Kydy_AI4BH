from datetime import datetime
from database.app.db.dynamodb import get_kydy_table


class CourseRepository:

    def __init__(self):
        self.table = get_kydy_table()

    def create_course(self, course_id: str, title: str, description: str):
        item = {
            "PK": f"COURSE#{course_id}",
            "SK": "META",
            "title": title,
            "description": description,
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }

        self.table.put_item(Item=item)
        return item

    def get_course(self, course_id: str):
        response = self.table.get_item(
            Key={
                "PK": f"COURSE#{course_id}",
                "SK": "META"
            }
        )
        return response.get("Item")
    

    def soft_delete_course(self, course_id: str):
        self.table.update_item(
            Key={
                "PK": f"COURSE#{course_id}",
                "SK": "META"
            },
            UpdateExpression="SET #status = :val",
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":val": "deleted"
            }
        )