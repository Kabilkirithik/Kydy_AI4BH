# KYDY Frontend-Backend Setup Guide

## Overview
This guide will help you run the KYDY EdTech platform with the frontend connected to the backend using the mock user `mock_user_123`.

## Prerequisites
- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- AWS credentials configured (for database access)

## Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements_minimal.txt
   ```

2. **Start the backend server:**
   ```bash
   python main.py
   ```
   
   The backend will:
   - Start on `http://localhost:8000`
   - Automatically create mock user `mock_user_123`
   - Set up sample courses and data
   - Enable CORS for frontend connection

3. **Verify backend is running:**
   - Visit `http://localhost:8000/health` in your browser
   - You should see API status and available endpoints

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd kydy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will:
   - Start on `http://localhost:5173`
   - Automatically connect to backend at `http://localhost:8000`
   - Use mock user `mock_user_123` by default

## Testing the Connection

1. **Access the application:**
   - Open `http://localhost:5173` in your browser
   - Click "EXPLORE KYDY" or "START FREE" to enter the app

2. **Test features with mock user:**
   - **Dashboard**: View learning statistics and course progress
   - **Lessons**: Chat with AI tutor (uses mock responses)
   - **Notes**: Create, edit, and manage study notes
   - **Visualizer**: Interactive learning visualizations

## Mock User Details

- **User ID**: `mock_user_123`
- **Name**: Mock User
- **Email**: mock@kydy.com
- **Role**: student
- **Enrolled Courses**: Web Development, Machine Learning, UI/UX Design

## API Endpoints Available

- `GET /` - Health check
- `GET /health` - Detailed system status
- `GET /api/dashboard/stats` - Learning statistics
- `GET /api/dashboard/courses` - Course progress
- `POST /api/chat` - AI chat interface
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note
- `POST /api/notes/{id}/pin` - Toggle pin status

## Troubleshooting

### Backend Issues
- **Database connection errors**: Ensure AWS credentials are configured
- **Port 8000 in use**: Change port in `main.py` or kill existing process
- **Import errors**: Verify all dependencies are installed

### Frontend Issues
- **Port 5173 in use**: Vite will automatically use next available port
- **API connection errors**: Ensure backend is running on port 8000
- **Build errors**: Check that all TypeScript files are valid

### Common Solutions
1. **CORS errors**: Backend already configured for `localhost:5173` and `localhost:3000`
2. **Mock user not found**: Backend automatically creates it on startup
3. **Empty data**: Backend creates sample data if none exists

## Development Notes

- All API calls use the mock user `mock_user_123` automatically
- No authentication required for development
- Database operations use the configured AWS DynamoDB tables
- Frontend uses inline styles with the KYDY design system colors
- Real-time features work through API polling (notes sync, etc.)

## Next Steps

Once everything is running:
1. Test all major features (Dashboard, Lessons, Notes, Visualizer)
2. Create and edit notes to verify database connectivity
3. Use the AI chat to test session management
4. Check browser console for any errors

The platform is now ready for development and testing with the mock user setup!