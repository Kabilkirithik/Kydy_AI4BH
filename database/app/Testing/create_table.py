import boto3

def create_kydy_table():
    """Create KydyMain table using STS role assumption"""
    try:
        # Create STS client
        sts = boto3.client("sts")
        
        # Assume the cross-account role
        response = sts.assume_role(
            RoleArn="arn:aws:iam::887803134546:role/CrossAccountDynamoDBAccess",
            RoleSessionName="kydy-session"
        )
        
        # Extract temporary credentials
        credentials = response["Credentials"]
        
        # Create DynamoDB client with assumed role credentials
        dynamodb = boto3.client(
            "dynamodb",
            region_name="ap-south-1",
            aws_access_key_id=credentials["AccessKeyId"],
            aws_secret_access_key=credentials["SecretAccessKey"],
            aws_session_token=credentials["SessionToken"]
        )
        
        # Check if table already exists
        try:
            existing_tables = dynamodb.list_tables()
            if "KydyMain" in existing_tables["TableNames"]:
                print("Table 'KydyMain' already exists!")
                return
        except Exception as e:
            print(f"Error checking existing tables: {e}")
        
        # Create the table
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
        
    except Exception as e:
        print(f"Error creating table: {e}")
        # Fallback to default credentials
        print("Trying with default credentials...")
        
        dynamodb = boto3.client("dynamodb", region_name="ap-south-1")
        
        # Check if table already exists
        try:
            existing_tables = dynamodb.list_tables()
            if "KydyMain" in existing_tables["TableNames"]:
                print("Table 'KydyMain' already exists!")
                return
        except Exception as e:
            print(f"Error checking existing tables: {e}")
        
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

        print("Creating table with default credentials...")
        print(response)

        # Wait until table exists
        waiter = dynamodb.get_waiter('table_exists')
        waiter.wait(TableName="KydyMain")

        print("Table created successfully!")

if __name__ == "__main__":
    create_kydy_table()