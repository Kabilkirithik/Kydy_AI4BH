# KYDY Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements_minimal.txt
```

### 2. Setup Database

```bash
# Test database connection and create table
python test_database_setup.py
```

### 3. Start Backend API

```bash
# Start the FastAPI server
python main.py
```

The API will be available at: http://localhost:8000

### 4. Start Frontend

```bash
# Navigate to frontend directory
cd kydy

# Install Node.js dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The frontend will be available at: http://localhost:5173

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health check with component status

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/courses` - Get course progress

### Chat
- `POST /api/chat` - AI chat interface

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note
- `POST /api/notes/{id}/pin` - Toggle pin status

## Database Configuration

The system uses AWS DynamoDB with STS role assumption for cross-account access:

- **Role ARN**: `arn:aws:iam::887803134546:role/CrossAccountDynamoDBAccess`
- **Session Name**: `kydy-session`
- **Table Name**: `KydyMain`
- **Region**: `ap-south-1`

## Mock User

For testing, a mock user is automatically created:
- **User ID**: `mock_user_123`
- **Email**: `mock@kydy.com`
- **Password**: `mockpassword123`

## Troubleshooting

### Database Connection Issues

1. **ResourceNotFoundException**: Run `python test_database_setup.py` to create the table
2. **Access Denied**: Ensure AWS credentials are configured and you have permission to assume the role
3. **Role Not Found**: Verify the IAM role exists and has proper DynamoDB permissions

### API Issues

1. **404 Errors**: Ensure the backend is running on port 8000
2. **CORS Errors**: The API is configured for localhost:5173 and localhost:3000
3. **Import Errors**: Install dependencies with `pip install -r requirements_minimal.txt`

### Frontend Issues

1. **Connection Refused**: Ensure backend is running on port 8000
2. **Module Not Found**: Run `npm install` in the kydy directory
3. **Build Errors**: Check Node.js version compatibility

## Development Notes

- The system uses a single DynamoDB table with composite keys (PK, SK)
- All repositories follow the same pattern for data access
- The API includes fallback mechanisms for database failures
- Mock data is generated when database operations fail