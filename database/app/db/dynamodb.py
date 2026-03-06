import boto3

def get_dynamodb_resource():
    """Get DynamoDB resource using STS role assumption for cross-account access"""
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
        
        # Create DynamoDB resource with assumed role credentials
        dynamodb = boto3.resource(
            "dynamodb",
            region_name="ap-south-1",
            aws_access_key_id=credentials["AccessKeyId"],
            aws_secret_access_key=credentials["SecretAccessKey"],
            aws_session_token=credentials["SessionToken"]
        )
        
        return dynamodb
        
    except Exception as e:
        print(f"Error assuming role for DynamoDB access: {e}")
        # Fallback to default credentials (for local development)
        return boto3.resource("dynamodb", region_name="ap-south-1")

def get_kydy_table():
    """Get the KydyMain table with proper error handling"""
    try:
        dynamodb = get_dynamodb_resource()
        table = dynamodb.Table("KydyMain")
        
        # Test table access
        table.load()
        return table
        
    except Exception as e:
        print(f"Error accessing KydyMain table: {e}")
        raise e