# KYDY EdTech Backend API

FastAPI backend for the KYDY educational platform providing AI chatbot, visualizer, and dashboard functionality.

## Features

- 🤖 **AI Chatbot API** - Interactive learning assistant
- 🎨 **SVG Visualizer API** - Save and retrieve visualizations
- 📊 **Dashboard API** - Real-time learning statistics
- 🔄 **Progress Tracking** - Course completion and streak management

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Access the API

- **API Base URL**: `http://localhost:8000`
- **Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### 🤖 Chatbot Endpoints

#### POST `/api/chat`
Send a message to the AI tutor and get a response.

**Request Body:**
```json
{
  "message": "Explain React hooks",
  "session_id": "optional_session_id"
}
```

**Response:**
```json
{
  "response": "React hooks are functions that let you use state and lifecycle features...",
  "session_id": "session_12345"
}
```

#### GET `/api/chat/history/{session_id}`
Get chat history for a specific session.

**Response:**
```json
{
  "session_id": "session_12345",
  "messages": [
    {
      "role": "user",
      "message": "Explain React hooks",
      "timestamp": "2024-01-01T12:00:00"
    },
    {
      "role": "ai", 
      "message": "React hooks are...",
      "timestamp": "2024-01-01T12:00:01"
    }
  ]
}
```

### 🎨 Visualizer Endpoints

#### POST `/api/visualizer/svg`
Save an SVG visualization.

**Request Body:**
```json
{
  "svg_content": "<svg>...</svg>",
  "title": "Neural Network Diagram",
  "description": "Basic neural network architecture"
}
```

**Response:**
```json
{
  "message": "SVG visualization saved successfully",
  "id": 1
}
```

#### GET `/api/visualizer/svg`
Get all saved SVG visualizations.

#### GET `/api/visualizer/svg/{id}`
Get a specific SVG visualization by ID.

### 📊 Dashboard Endpoints

#### GET `/api/dashboard/stats`
Get current user statistics.

**Response:**
```json
{
  "study_time": "24h",
  "study_time_sub": "+3h this week",
  "streak": "12",
  "streak_sub": "Days in a row",
  "in_progress": "3",
  "in_progress_sub": "Active courses",
  "completed": "7",
  "completed_sub": "Courses finished"
}
```

#### GET `/api/dashboard/courses`
Get course progress data.

**Response:**
```json
[
  {
    "title": "Web Development",
    "icon": "⚡",
    "color": "#6366f1",
    "progress": 68,
    "lessons": 17,
    "lessons_total": 25,
    "tag": "In Progress"
  }
]
```

#### POST `/api/dashboard/update-progress`
Update course progress.

**Query Parameters:**
- `course_title`: Name of the course
- `lessons_completed`: Number of lessons completed

#### POST `/api/dashboard/update-streak`
Increment the daily learning streak.

### 🔍 Utility Endpoints

#### GET `/health`
Health check endpoint.

#### GET `/`
API root with welcome message.

## Development

### Project Structure

```
backend/
├── main.py              # Main FastAPI application
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

### Adding New Features

1. **Add new models** in the Data Models section
2. **Create endpoints** following the existing pattern
3. **Update mock data** or integrate with a real database
4. **Test endpoints** using the interactive docs at `/docs`

### Database Integration

Currently uses in-memory storage. For production:

1. Add database models (SQLAlchemy recommended)
2. Set up database connection
3. Replace mock data with database queries
4. Add proper error handling and validation

### AI Integration

The chatbot currently uses mock responses. To integrate with real AI:

1. Add OpenAI, Anthropic, or other AI service credentials
2. Replace `generate_ai_response()` function
3. Add proper prompt engineering
4. Implement conversation context management

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev server)

Update the `allow_origins` list in `main.py` for production deployment.

## Production Deployment

1. Set up environment variables
2. Configure proper database
3. Add authentication/authorization
4. Set up logging and monitoring
5. Deploy using Docker, AWS, or other cloud services

## Testing

Use the interactive API documentation at `http://localhost:8000/docs` to test all endpoints.

Example curl commands:

```bash
# Test chatbot
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, explain React"}'

# Get dashboard stats
curl "http://localhost:8000/api/dashboard/stats"

# Save SVG visualization
curl -X POST "http://localhost:8000/api/visualizer/svg" \
  -H "Content-Type: application/json" \
  -d '{"svg_content": "<svg>test</svg>", "title": "Test SVG"}'
```