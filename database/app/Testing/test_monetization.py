from database.app.repositories.monetization_repository import MonetizationRepository

repo = MonetizationRepository()

# Create subscription
repo.create_subscription(
    "kabil002",
    "pro",
    "monthly",
    100000,
    100,
    "2026-03-30"
)

# Record payment
repo.record_payment(
    "kabil002",
    499.0,
    "INR",
    "razorpay",
    "txn_123456"
)

# Update usage
repo.update_daily_usage("kabil002", 500)

print("Monetization layer working.")