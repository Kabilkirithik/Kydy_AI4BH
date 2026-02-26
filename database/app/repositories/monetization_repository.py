from datetime import datetime
from database.app.db.dynamodb import get_kydy_table
import uuid
from decimal import Decimal


class MonetizationRepository:

    def __init__(self):
        self.table = get_kydy_table()

    # -------------------------
    # SUBSCRIPTION
    # -------------------------
    def create_subscription(self, user_id: str, plan: str,
                            billing_cycle: str, token_limit: int,
                            session_limit: int, expiry_date: str):

        item = {
            "PK": f"USER#{user_id}",
            "SK": "SUBSCRIPTION",
            "plan": plan,
            "billing_cycle": billing_cycle,
            "token_limit": token_limit,
            "session_limit": session_limit,
            "start_date": datetime.utcnow().isoformat(),
            "expiry_date": expiry_date,
            "status": "active"
        }

        self.table.put_item(Item=item)
        return item

    # -------------------------
    # PAYMENT
    # -------------------------
    def record_payment(self, user_id: str, amount: float,
                   currency: str, provider: str,
                   transaction_id: str):

        payment_id = str(uuid.uuid4())

        item = {
            "PK": f"USER#{user_id}",
            "SK": f"PAYMENT#{payment_id}",
            "amount": Decimal(str(amount)),   # FIXED
            "currency": currency,
            "provider": provider,
            "transaction_id": transaction_id,
            "status": "success",
            "created_at": datetime.utcnow().isoformat()
        }

        self.table.put_item(Item=item)
        return item

    # -------------------------
    # USAGE TRACKING
    # -------------------------
    def update_daily_usage(self, user_id: str, tokens: int):
        today = datetime.utcnow().strftime("%Y-%m-%d")

        self.table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"USAGE#{today}"
            },
            UpdateExpression="""
                ADD tokens_used :t,
                    sessions_count :s
            """,
            ExpressionAttributeValues={
                ":t": tokens,
                ":s": 1
            }
        )