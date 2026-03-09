import boto3

s3 = boto3.client("s3", region_name="ap-south-1")

bucket_name = "kydy-content-001"  # Must be globally unique

try:
    # s3.create_bucket(
    #     Bucket=bucket_name,
    #     CreateBucketConfiguration={
    #         "LocationConstraint": "ap-south-1"
    #     }
    # )

    # print("Bucket created successfully!")

    s3.put_bucket_versioning(
        Bucket=bucket_name,
        VersioningConfiguration={
            'Status': 'Enabled'
        }
    )

    print("Versioning enabled!")

except Exception as e:
    print("Error:", e)