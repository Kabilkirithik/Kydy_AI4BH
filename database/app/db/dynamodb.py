import boto3
import os
from botocore.exceptions import ClientError

def get_dynamodb_resource():
    """Get DynamoDB resource using STS role assumption for cross-account access"""
    # Get configuration from environment variables
    role_arn = os.getenv('CROSS_ACCOUNT_ROLE_ARN', 
                        'arn:aws:iam::887803134546:role/CrossAccountDynamoDBAccess')
    session_name = os.getenv('ROLE_SESSION_NAME', 'kydy-agentcore-session')
    region = os.getenv('AWS_DEFAULT_REGION', 'ap-south-1')
    
    try:
        # Create STS client
        sts = boto3.client("sts", region_name=region)
        
        # Assume the cross-account role
        response = sts.assume_role(
            RoleArn=role_arn,
            RoleSessionName=session_name
        )
        
        # Extract temporary credentials
        credentials = response["Credentials"]
        
        # Create DynamoDB resource with assumed role credentials
        dynamodb = boto3.resource(
            "dynamodb",
            region_name=region,
            aws_access_key_id=credentials["AccessKeyId"],
            aws_secret_access_key=credentials["SecretAccessKey"],
            aws_session_token=credentials["SessionToken"]
        )
        
        print(f"✅ Successfully assumed role: {role_arn}")
        return dynamodb
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'AccessDenied':
            print(f"❌ Access denied when assuming role: {role_arn}")
            print("Please check IAM permissions and role trust policy")
        else:
            print(f"❌ Error assuming role: {e}")
        
        # Fallback to default credentials (for local development)
        print("🔄 Falling back to default AWS credentials...")
        return boto3.resource("dynamodb", region_name=region)
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        # Fallback to default credentials
        return boto3.resource("dynamodb", region_name=region)

def get_kydy_table():
    """
    Get the main KYDY DynamoDB table with cross-account role assumption
    Compatible with both local development and AWS AgentCore deployment
    """
    # Get table name from environment variable
    table_name = os.getenv('DYNAMODB_TABLE_NAME', 'KydyMain')
    
    try:
        dynamodb = get_dynamodb_resource()
        table = dynamodb.Table(table_name)
        
        # Test table access
        table.load()
        print(f"✅ Successfully connected to DynamoDB table: {table_name}")
        return table
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'ResourceNotFoundException':
            print(f"❌ DynamoDB table not found: {table_name}")
            print("Please ensure the table exists and is accessible")
        elif error_code == 'AccessDenied':
            print(f"❌ Access denied to table: {table_name}")
            print("Please check IAM permissions for DynamoDB access")
        else:
            print(f"❌ Error accessing table {table_name}: {e}")
        raise
        
    except Exception as e:
        print(f"❌ Unexpected error accessing table {table_name}: {e}")
        raise