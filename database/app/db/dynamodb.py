import boto3

def get_dynamodb_resource():
    return boto3.resource("dynamodb", region_name="ap-south-1")

def get_kydy_table():
    dynamodb = get_dynamodb_resource()
    return dynamodb.Table("KydyMain")