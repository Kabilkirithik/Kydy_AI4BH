from datetime import datetime
import boto3
from botocore.exceptions import ClientError
from database.app.db.dynamodb import get_kydy_table

BUCKET_NAME = "kydy-content"

class NotebookRepository:

    def __init__(self):
        self.table = get_kydy_table()
        self.s3 = boto3.client("s3")

    # -------------------------------------------------
    # 1️⃣ Ensure Notebook Exists
    # -------------------------------------------------
    def ensure_notebook(self, user_id: str, course_id: str):

        response = self.table.get_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"NOTEBOOK#{course_id}"
            }
        )

        if "Item" in response:
            return response["Item"]

        return self.create_notebook(user_id, course_id)

    # -------------------------------------------------
    # 2️⃣ Create Notebook (First Time)
    # -------------------------------------------------
    def create_notebook(self, user_id: str, course_id: str):

        s3_key = f"notebooks/{user_id}/{course_id}.md"

        # Create empty markdown file in S3
        self.s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body="",
            ContentType="text/markdown"
        )

        item = {
            "PK": f"USER#{user_id}",
            "SK": f"NOTEBOOK#{course_id}",
            "course_id": course_id,
            "notebook_s3_key": s3_key,
            "version": 1,
            "created_at": datetime.utcnow().isoformat(),
            "last_updated": datetime.utcnow().isoformat(),
            "status": "active"
        }

        self.table.put_item(Item=item)
        return item

    # -------------------------------------------------
    # 3️⃣ Autosave Notebook
    # -------------------------------------------------
    def autosave_notebook(self, user_id: str, course_id: str, content: str):

        s3_key = f"notebooks/{user_id}/{course_id}.md"

        # Upload markdown to S3
        self.s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=content.encode("utf-8"),
            ContentType="text/markdown"
        )

        # Update metadata
        self.table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"NOTEBOOK#{course_id}"
            },
            UpdateExpression="""
                SET last_updated = :time,
                    version = if_not_exists(version, :zero) + :inc
            """,
            ExpressionAttributeValues={
                ":time": datetime.utcnow().isoformat(),
                ":inc": 1,
                ":zero": 0
            }
        )

        return {"status": "saved"}

    # -------------------------------------------------
    # 4️⃣ Get Notebook
    # -------------------------------------------------
    def get_notebook(self, user_id: str, course_id: str):

        response = self.table.get_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"NOTEBOOK#{course_id}"
            }
        )

        item = response.get("Item")

        if not item:
            return None

        s3_key = item["notebook_s3_key"]

        s3_object = self.s3.get_object(
            Bucket=BUCKET_NAME,
            Key=s3_key
        )

        content = s3_object["Body"].read().decode("utf-8")

        return {
            "metadata": item,
            "content": content
        }

    # -------------------------------------------------
    # 5️⃣ Soft Delete
    # -------------------------------------------------
    def delete_notebook(self, user_id: str, course_id: str):

        self.table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"NOTEBOOK#{course_id}"
            },
            UpdateExpression="SET status = :deleted",
            ExpressionAttributeValues={
                ":deleted": "deleted"
            }
        )

        return {"status": "deleted"}