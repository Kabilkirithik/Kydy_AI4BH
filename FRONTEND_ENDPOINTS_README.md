# KYDY Frontend API Endpoints Documentation

## Overview
This document lists all API endpoints used by the KYDY frontend components to communicate with the backend server.

**Base URL**: `http://localhost:8000`  
**Mock User**: `mock_user_123` (automatically used by all endpoints)

---

## 🏠 Dashboard Endpoints

### Get Dashboard Statistics
- **Component**: `Dashboard.tsx`
- **Endpoint**: `GET /api/dashboard/stats`
- **Purpose**: Fetch learning statistics for dashboard overview
- **Response**:
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

### Get Course Progress
- **Component**: `Dashboard.tsx`
- **Endpoint**: `GET /api/dashboard/courses`
- **Purpose**: Fetch course progress data for dashboard cards
- **Response**:
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

### Update Course Progress
- **Component**: `Dashboard.tsx`
- **Endpoint**: `POST /api/dashboard/update-progress`
- **Purpose**: Update lesson completion progress
- **Query Parameters**: 
  - `course_title`: Course name
  - `lessons_completed`: Number of completed lessons

---

## 💬 Chat/Lessons Endpoints

### Send Chat Message
- **Component**: `Lessons.tsx`
- **Endpoint**: `POST /api/chat`
- **Purpose**: Send message to AI tutor and get response
- **Request Body**:
  ```json
  {
    "message": "Can you explain useEffect?",
    "session_id": "session_abc123"
  }
  ```
- **Response**:
  ```json
  {
    "response": "Great question! useEffect runs after every render...",
    "session_id": "session_abc123"
  }
  ```

---

## 📝 Notes Endpoints

### Get All Notes
- **Component**: `Notes.tsx`
- **Endpoint**: `GET /api/notes`
- **Purpose**: Fetch all user notes from database
- **Response**:
  ```json
  [
    {
      "id": 1,
      "title": "React Hooks Overview",
      "content": "useState and useEffect are...",
      "course": "Web Development",
      "color": "#7c3aed",
      "date": "2024-03-06",
      "tags": ["React", "Hooks"],
      "pinned": false
    }
  ]
  ```

### Create New Note
- **Component**: `Notes.tsx`
- **Endpoint**: `POST /api/notes`
- **Purpose**: Create a new study note
- **Request Body**:
  ```json
  {
    "title": "New Note Title",
    "content": "Note content here...",
    "course": "Web Development",
    "color": "#7c3aed",
    "tags": ["React", "Learning"]
  }
  ```
- **Response**: Returns created note object

### Update Existing Note
- **Component**: `Notes.tsx`
- **Endpoint**: `PUT /api/notes/{note_id}`
- **Purpose**: Update an existing note
- **Request Body**: Same as create note
- **Response**: Returns updated note object

### Delete Note
- **Component**: `Notes.tsx`
- **Endpoint**: `DELETE /api/notes/{note_id}`
- **Purpose**: Delete a specific note
- **Response**:
  ```json
  {
    "message": "Note deleted successfully"
  }
  ```

### Toggle Pin Status
- **Component**: `Notes.tsx`
- **Endpoint**: `POST /api/notes/{note_id}/pin`
- **Purpose**: Pin or unpin a note
- **Response**:
  ```json
  {
    "message": "Note pinned",
    "pinned": true
  }
  ```

---

## 🎨 Visualizer Endpoints

### Save SVG Visualization
- **Component**: `Visualizer.tsx`
- **Endpoint**: `POST /api/visualizer/svg`
- **Purpose**: Save SVG visualization content
- **Request Body**:
  ```json
  {
    "svg_content": "<svg>...</svg>",
    "title": "Physics Visualization",
    "description": "Interactive physics concept"
  }
  ```

### Visualizer Chat
- **Component**: `Visualizer.tsx`
- **Endpoint**: `POST /api/visualizer/chat`
- **Purpose**: Chat interface for visualizer-specific AI interactions
- **Request Body**:
  ```json
  {
    "message": "Explain this visualization",
    "history": []
  }
  ```

---

## 🔧 System Endpoints

### Health Check
- **Endpoint**: `GET /`
- **Purpose**: Basic API health check
- **Response**:
  ```json
  {
    "status": "ok",
    "message": "Kydy API is running",
    "components": ["frontend", "database"]
  }
  ```

### Detailed Health Check
- **Endpoint**: `GET /health`
- **Purpose**: Detailed system status and available endpoints
- **Response**:
  ```json
  {
    "status": "ok",
    "components": {
      "api": "running",
      "database": "connected",
      "frontend_cors": "enabled"
    },
    "endpoints": [
      "POST /register",
      "POST /login",
      "GET /api/dashboard/stats",
      "..."
    ]
  }
  ```

---

## 👤 User Authentication Endpoints

### Register User
- **Endpoint**: `POST /register`
- **Purpose**: Register new user account
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

### Login User
- **Endpoint**: `POST /login`
- **Purpose**: Authenticate user login
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

---

## 📊 Frontend Component Mapping

| Component | Primary Endpoints | Purpose |
|-----------|------------------|---------|
| `App.tsx` | `/health` | Landing page health check |
| `Dashboard.tsx` | `/api/dashboard/stats`, `/api/dashboard/courses` | Learning overview |
| `Lessons.tsx` | `/api/chat` | AI tutoring interface |
| `Notes.tsx` | `/api/notes/*` | Note management system |
| `Visualizer.tsx` | `/api/visualizer/*` | Interactive visualizations |

---

## 🔄 Data Flow Architecture

```
Frontend Components → HTTP Requests → Backend API → Database Repositories → DynamoDB
```

### Example: Notes Data Flow
1. **User creates note** in `Notes.tsx`
2. **Frontend sends** `POST /api/notes` with note data
3. **Backend receives** request in `main.py`
4. **Backend calls** `notebook_repository.autosave_notebook()`
5. **Repository saves** to DynamoDB via `get_kydy_table()`
6. **Response sent** back to frontend
7. **Frontend updates** UI with new note

---

## 🛠️ Development Notes

### CORS Configuration
Backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative React dev server)

### Mock User Integration
All endpoints automatically use `mock_user_123`:
- No authentication required in development
- User context handled by backend
- Consistent data across all features

### Error Handling
Frontend components include fallback mechanisms:
- Local storage backup for notes
- Default data when API fails
- User-friendly error messages

### Real-time Features
- Notes sync across components via events
- Dashboard updates on data changes
- Chat sessions persist across page refreshes

---

## 🚀 Getting Started

1. **Start Backend**: `python main.py` (Port 8000)
2. **Start Frontend**: `npm run dev` (Port 5173)
3. **Test Endpoints**: Visit `http://localhost:8000/health`
4. **Use Application**: Open `http://localhost:5173`

All endpoints will automatically work with the mock user setup!