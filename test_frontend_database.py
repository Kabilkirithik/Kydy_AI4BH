#!/usr/bin/env python3
"""
Test script for KYDY Frontend and Database integration
Tests the API endpoints and database connectivity
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000"

def test_api_health():
    """Test if the API server is running"""
    print("🏥 Testing API Health...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print("✅ API is healthy")
            print(f"   Status: {result['status']}")
            print(f"   Database: {result['components']['database']}")
            print(f"   Available endpoints: {len(result['endpoints'])}")
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server")
        print("💡 Make sure to run: python main.py")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_user_registration():
    """Test user registration endpoint"""
    print("\n👤 Testing User Registration...")
    
    test_user = {
        "name": "Test User",
        "email": f"test_{int(time.time())}@example.com",  # Unique email
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=test_user, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print("✅ User registration successful")
            print(f"   User ID: {result['user_id']}")
            print(f"   Name: {result['name']}")
            print(f"   Email: {result['email']}")
            return result
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return None

def test_user_login(user_data):
    """Test user login endpoint"""
    print("\n🔐 Testing User Login...")
    
    if not user_data:
        print("⚠️ Skipping login test - no user data")
        return False
    
    login_data = {
        "email": user_data["email"],
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print("✅ User login successful")
            print(f"   User ID: {result['user_id']}")
            print(f"   Role: {result['role']}")
            return True
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False

def test_database_connectivity():
    """Test database connectivity through API"""
    print("\n🗄️ Testing Database Connectivity...")
    
    try:
        # Test health endpoint which checks database
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            result = response.json()
            db_status = result['components']['database']
            
            if db_status == "connected":
                print("✅ Database connection successful")
                return True
            else:
                print("⚠️ Database connection issues")
                print("💡 Check AWS credentials and DynamoDB setup")
                return False
        else:
            print(f"❌ Cannot check database status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Database connectivity error: {e}")
        return False

def test_frontend_availability():
    """Test if frontend is accessible"""
    print("\n🌐 Testing Frontend Availability...")
    
    frontend_url = "http://localhost:5173"
    
    try:
        response = requests.get(frontend_url, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            print(f"   URL: {frontend_url}")
            return True
        else:
            print(f"⚠️ Frontend returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("⚠️ Frontend not running")
        print("💡 Start frontend with: cd kydy && npm run dev")
        return False
    except Exception as e:
        print(f"❌ Frontend test error: {e}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n🔗 Testing CORS Configuration...")
    
    try:
        # Make a preflight request
        headers = {
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        response = requests.options(f"{BASE_URL}/register", headers=headers, timeout=5)
        
        if 'Access-Control-Allow-Origin' in response.headers:
            print("✅ CORS is properly configured")
            print(f"   Allowed origins: {response.headers.get('Access-Control-Allow-Origin', 'Not specified')}")
            return True
        else:
            print("⚠️ CORS headers not found")
            return False
    except Exception as e:
        print(f"❌ CORS test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 KYDY Frontend & Database Test Suite")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 6
    
    # Test 1: API Health
    if test_api_health():
        tests_passed += 1
    
    # Test 2: Database Connectivity
    if test_database_connectivity():
        tests_passed += 1
    
    # Test 3: User Registration
    user_data = test_user_registration()
    if user_data:
        tests_passed += 1
        
        # Test 4: User Login (depends on registration)
        if test_user_login(user_data):
            tests_passed += 1
    else:
        print("⚠️ Skipping login test due to registration failure")
    
    # Test 5: Frontend Availability
    if test_frontend_availability():
        tests_passed += 1
    
    # Test 6: CORS Configuration
    if test_cors_configuration():
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! System is working correctly.")
        print("\n✅ What's Working:")
        print("   • API server running on http://localhost:8000")
        print("   • Database connectivity established")
        print("   • User registration and authentication")
        print("   • Frontend accessibility")
        print("   • CORS configuration for frontend-backend communication")
        
        print("\n🚀 Ready to use:")
        print("   • Frontend: http://localhost:5173")
        print("   • API: http://localhost:8000")
        print("   • API Health: http://localhost:8000/health")
        
    elif tests_passed >= 3:
        print("⚠️ Partial success - some components working")
        print("💡 Check the failed tests above for issues")
    else:
        print("❌ Multiple failures detected")
        print("💡 Setup steps:")
        print("   1. Start API: python main.py")
        print("   2. Start Frontend: cd kydy && npm run dev")
        print("   3. Configure AWS credentials for database")
        
        sys.exit(1)

if __name__ == "__main__":
    main()