from database.app.db.dynamodb import get_kydy_table
from datetime import datetime


class AdminRepository:

    def __init__(self):
        self.table = get_kydy_table()

    def create_feature_flag(self, feature_name: str,
                            enabled: bool,
                            rollout_percentage: int,
                            allowed_plans: list):

        item = {
            "PK": "FEATURE",
            "SK": feature_name,
            "enabled": enabled,
            "rollout_percentage": rollout_percentage,
            "allowed_plans": allowed_plans,
            "created_at": datetime.utcnow().isoformat()
        }

        self.table.put_item(Item=item)

    def get_feature_flag(self, feature_name: str):
        response = self.table.get_item(
            Key={
                "PK": "FEATURE",
                "SK": feature_name
            }
        )

        return response.get("Item")
    

    from datetime import datetime

    def log_user_event(self, user_id: str, event_type: str, description: str):
        self.table.put_item(
            Item={
                "PK": f"USER#{user_id}",
                "SK": f"AUDIT#{datetime.utcnow().isoformat()}",
                "event_type": event_type,
                "description": description
            }
        )