#!/usr/bin/env python3
"""
Test script to verify database connection and create table if needed
"""

import sys
import boto3
from database.app.db.dynamodb import get_dynamodb_resource, get_kydy_table

def test_database_connection():
    """Test database connection and create table if needed"""
    print("🔍 Testing database connection...")
    
    try:
        # Test STS role assumption
        print("1. Testing STS role assumption...")
        dynamodb = get_dynamodb_resource()
        print("✅ STS role assumption successful")
        
        # List existing tables
        print("2. Checking existing tables...")
        client = dynamodb.meta.client
        existing_tables = client.list_tables()
        print(f"📋 Existing tables: {existing_tables['TableNames']}")
        
        # Check if KydyMain table exists
        if "KydyMain" not in existing_tables["TableNames"]:
            print("3. Creating KydyMain table...")
            create_table_response = client.create_table(
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
            
            print("⏳ Waiting for table to be created...")
            waiter = client.get_waiter('table_exists')
            waiter.wait(TableName="KydyMain")
            print("✅ Table created successfully!")
        else:
            print("✅ KydyMain table already exists")
        
        # Test table access
        print("4. Testing table access...")
        table = get_kydy_table()
        table.load()
        print("✅ Table access successful")
        
        # Test basic operations
        print("5. Testing basic table operations...")
        
        # Try to get a non-existent item (should not error)
        response = table.get_item(
            Key={
                "PK": "TEST#connection",
                "SK": "PROFILE"
            }
        )
        print("✅ Basic read operation successful")
        
        # Try to put a test item
        table.put_item(
            Item={
                "PK": "TEST#connection",
                "SK": "PROFILE",
                "test": True,
                "timestamp": "2024-01-01T00:00:00Z"
            }
        )
        print("✅ Basic write operation successful")
        
        # Clean up test item
        table.delete_item(
            Key={
                "PK": "TEST#connection",
                "SK": "PROFILE"
            }
        )
        print("✅ Basic delete operation successful")
        
        print("\n🎉 All database tests passed! Database is ready for use.")
        return True
        
    except Exception as e:
        print(f"\n❌ Database test failed: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Ensure AWS credentials are configured")
        print("2. Verify the IAM role 'CrossAccountDynamoDBAccess' exists and has proper permissions")
        print("3. Check if you have permission to assume the role")
        print("4. Ensure the role has DynamoDB permissions for account 887803134546")
        return False

def create_mock_user():
    """Create mock user for testing"""
    try:
        print("\n👤 Creating mock user...")
        from database.app.repositories.user_repository import UserRepository
        
        user_repo = UserRepository()
        
        # Check if mock user already exists
        existing_user = user_repo.get_user("mock_user_123")
        if existing_user:
            print("✅ Mock user already exists")
            return True
        
        # Create mock user
        user = user_repo.create_user(
            user_id="mock_user_123",
            name="Mock User",
            email="mock@kydy.com",
            password="mockpassword123",
            role="student"
        )
        
        print("✅ Mock user created successfully")
        
        # Enroll in sample courses
        sample_courses = ["web_development", "machine_learning", "ui_ux_design"]
        for course_id in sample_courses:
            try:
                user_repo.enroll_user_in_course("mock_user_123", course_id)
                print(f"✅ Enrolled in {course_id}")
            except Exception as e:
                print(f"⚠️ Failed to enroll in {course_id}: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to create mock user: {e}")
        return False

if __name__ == "__main__":
    print("🚀 KYDY Database Setup Test")
    print("=" * 50)
    
    # Test database connection
    db_success = test_database_connection()
    
    if db_success:
        # Create mock user
        user_success = create_mock_user()
        
        if user_success:
            print("\n🎯 Setup complete! You can now run:")
            print("   python main.py")
            print("\n🌐 Then visit: http://localhost:8000/health")
        else:
            print("\n⚠️ Database works but mock user creation failed")
            print("   You can still run: python main.py")
    else:
        print("\n❌ Database setup failed. Please fix the issues above.")
        sys.exit(1)