# KYDY Frontend & Database Setup Guide

## 🎯 Overview

This guide will help you run and test the KYDY EdTech platform with just the frontend and database components.

## 📁 Current Project Structure

```
KYDY/
├── kydy/                    # React Frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Lessons.tsx
│   │   ├── Notes.tsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── database/                # Database Layer
│   ├── app/
│   │   ├── repositories/    # DynamoDB repositories
│   │   └── db/             # Database connection
│   └── complete_database.py
├── main.py                 # Simple API server
└── requirements files
```

## 🚀 Quick Start

### 1. **Setup Frontend (React + Vite)**

```bash
# Navigate to frontend directory
cd kydy

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### 2. **Setup Database (DynamoDB)**

```bash
# Install Python dependencies
pip install boto3 botocore fastapi uvicorn python-dotenv

# Configure AWS credentials (if using real DynamoDB)
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 3. **Run Simple API Server**

```bash
# Start the API server
python main.py
```

The API will be available at: `http://localhost:8000`

## 🧪 Testing the Components

### Frontend Testing

1. **Start the frontend:**
   ```bash
   cd kydy
   npm run dev
   ```

2. **Test the UI components:**
   - **Dashboard**: View learning progress and stats
   - **Lessons**: AI tutor chat interface with visualizations
   - **Notes**: Create, edit, and organize study notes
   - **Visualizer**: Interactive SVG animations

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for any JavaScript errors
   - Check network requests to API

### Database Testing

1. **Test database repositories:**
   ```bash
   # Run database tests
   python database/app/Testing/test_user.py
   python database/app/Testing/test_course.py
   python database/app/Testing/test_session.py
   ```

2. **Test API endpoints:**
   ```bash
   # Test user registration
   curl -X POST "http://localhost:8000/register" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

   # Test user login
   curl -X POST "http://localhost:8000/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'

   # Test health check
   curl http://localhost:8000/
   ```

## 🔧 Configuration

### Frontend Configuration

**File: `kydy/vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

### Database Configuration

**File: `.env`** (create this file)
```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1

# DynamoDB Configuration
DYNAMODB_TABLE_NAME=kydy-main-table
DYNAMODB_ENDPOINT=https://dynamodb.us-east-1.amazonaws.com

# For local DynamoDB (optional)
# DYNAMODB_ENDPOINT=http://localhost:8000
```

## 📊 Available Features

### Frontend Features
- ✅ **Dashboard**: Learning progress visualization
- ✅ **Lessons**: AI chat interface with animations
- ✅ **Notes**: CRUD operations with localStorage
- ✅ **Visualizer**: Interactive SVG animations
- ✅ **Responsive Design**: Works on all devices

### Database Features
- ✅ **User Management**: Registration, login, profiles
- ✅ **Course Management**: Course creation and enrollment
- ✅ **Session Tracking**: Chat sessions and progress
- ✅ **Notebook Storage**: Notes with S3 integration
- ✅ **Learning Analytics**: Progress tracking

### API Endpoints
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /` - Health check
- `POST /generate-video` - Video content generation (if backend available)

## 🔍 Troubleshooting

### Frontend Issues

**Port already in use:**
```bash
# Kill process on port 5173
npx kill-port 5173
# Or use different port
npm run dev -- --port 3000
```

**Dependencies issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build issues:**
```bash
# Check TypeScript errors
npm run build
```

### Database Issues

**AWS Credentials:**
```bash
# Check AWS configuration
aws sts get-caller-identity

# Test DynamoDB access
aws dynamodb list-tables
```

**DynamoDB Table Creation:**
```bash
# Create tables using the test script
python database/app/Testing/create_table.py
```

**Connection Issues:**
```bash
# Test database connection
python -c "from database.app.db.dynamodb import get_kydy_table; print(get_kydy_table())"
```

### API Issues

**Port conflicts:**
```bash
# Check what's running on port 8000
lsof -i :8000
# Kill the process
kill -9 <PID>
```

**Import errors:**
```bash
# Install missing dependencies
pip install fastapi uvicorn boto3 botocore
```

## 🧪 Testing Scenarios

### 1. **Frontend-Only Testing**
```bash
# Start only frontend
cd kydy
npm run dev

# Test UI components without backend
# Notes will use localStorage
# Other features will show mock data
```

### 2. **Database-Only Testing**
```bash
# Test database repositories directly
python database/app/Testing/test_user.py
python database/app/Testing/test_course.py
python database/app/Testing/test_learning.py
```

### 3. **Full Integration Testing**
```bash
# Terminal 1: Start API
python main.py

# Terminal 2: Start Frontend
cd kydy && npm run dev

# Terminal 3: Run tests
curl http://localhost:8000/
curl http://localhost:5173/
```

## 📈 Performance Testing

### Frontend Performance
```bash
# Build for production
cd kydy
npm run build

# Serve production build
npm run preview

# Lighthouse audit
npx lighthouse http://localhost:4173
```

### Database Performance
```bash
# Test database operations
python -c "
from database.app.repositories.user_repository import UserRepository
import time

repo = UserRepository()
start = time.time()
# Perform operations
end = time.time()
print(f'Operation took {end - start:.2f} seconds')
"
```

## 🔮 Next Steps

### Enhance Frontend
1. Add error boundaries
2. Implement loading states
3. Add offline support
4. Optimize bundle size

### Enhance Database
1. Add data validation
2. Implement caching
3. Add backup strategies
4. Monitor performance

### Integration
1. Connect frontend to database APIs
2. Add real-time updates
3. Implement authentication flow
4. Add comprehensive testing

## 📞 Support

### Common Commands
```bash
# Frontend
cd kydy && npm run dev          # Start development
cd kydy && npm run build        # Build for production
cd kydy && npm run preview      # Preview production build

# Database
python main.py                  # Start API server
python database/app/Testing/test_*.py  # Run database tests

# General
pip install -r requirements.txt # Install Python dependencies
npm install                     # Install Node dependencies
```

### Useful URLs
- Frontend: http://localhost:5173
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs (if FastAPI docs enabled)

---

## 🎉 Ready to Go!

Your KYDY platform is now ready for frontend and database testing. The system provides a solid foundation for educational technology with React frontend and DynamoDB backend integration.

**Happy coding! 🚀📚**