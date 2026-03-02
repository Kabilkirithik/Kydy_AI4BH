import boto3

dynamodb = boto3.client("dynamodb", region_name="ap-south-1")

response = dynamodb.create_table(
    TableName="KydyMain",
    AttributeDefinitions=[
        {"AttributeName": "PK", "AttributeType": "S"},
        {"AttributeName": "SK", "AttributeType": "S"}
    ],
    KeySchema=[
        {"AttributeName": "PK", "KeyType": "HASH"},
        {"AttributeName": "SK", "KeyType": "RANGE"}
    ],
    ProvisionedThroughput={
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5
    },
    BillingMode="PROVISIONED",
    SSESpecification={
        "Enabled": True
    }
)

print("Creating table...")
print(response)

# Wait until table exists
waiter = dynamodb.get_waiter('table_exists')
waiter.wait(TableName="KydyMain")

print("Table created successfully!")