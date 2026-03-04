# KYDY EdTech Platform - Complete API Endpoints

**Base URL:** `http://localhost:8000`  
**API Version:** 1.0.0  
**Documentation:** `http://localhost:8000/docs`

---

## 📊 Dashboard Endpoints

### Get Dashboard Statistics
- **Method:** `GET`
- **Endpoint:** `/api/dashboard/stats`
- **Description:** Retrieve real-time learning statistics
- **Response Model:** `DashboardStats`
- **Status:** ✅ Implemented
- **Frontend Integration:** ✅ Connected (Dashboard.tsx)

### Get Course Progress
- **Method:** `GET`
- **Endpoint:** `/api/dashboard/courses`
- **Description:** Retrieve all course progress data
- **Response Model:** `List[CourseProgress]`
- **Status:** ✅ Implemented
- **Frontend Integration:** ✅ Connected (Dashboard.tsx)

### Update Course Progress
- **Method:** `POST`
- **Endpoint:** `/api/dashboard/update-progress`
- **Description:** Update course completion progress
- **Query Parameters:** `course_title`, `lessons_completed`
- **Status:** ✅ Implemented
- **Frontend Integration:** ✅ Connected (Dashboard.tsx)

### Update Daily Streak
- **Method:** `POST`
- **Endpoint:** `/api/dashboard/update-streak`
- **Description:** Increment daily learning streak
- **Status:** ✅ Implemented
- **Frontend Integration:** ⚠️ Available but not used

---

## 💬 Chat Endpoints

### Send Chat Message
- **Method:** `POST`
- **Endpoint:** `/api/chat`
- **Description:** Send message to AI tutor and get response
- **Request Model:** `ChatMessage`
- **Response Model:** `ChatResponse`
- **Status:** ✅ Implemented
- **Frontend Integration:** ✅ Connected (Lessons.tsx)

### Get Chat History
- **Method:** `GET`
- **Endpoint:** `/api/chat/history/{session_id}`
- **Description:** Retrieve chat history for a specific session
- **Path Parameters:** `session_id`
- **Status:** ✅ Implemented
- **Frontend Integration:** ⚠️ Available but not used

---

## 🎨 Visualizer Endpoints

### Save SVG Visualization
- **Method:** `POST`
- **Endpoint:** `/api/visualizer/svg`
- **Description:** Save SVG visualization content
- **Request Model:** `SVGVisualization`
- **Status:** ✅ Implemented
- **Frontend Integration:** ✅ Connected (Visualizer.tsx)

### Get All SVG Visualizations
- **Method:** `GET`
- **Endpoint:** `/api/visualizer/svg`
- **Description:** Retrieve all saved SVG visualizations
- **Status:** ✅ Implemented
- **Frontend Integration:** ⚠️ Available but not used

### Get Specific SVG Visualization
- **Method:** `GET`
- **Endpoint:** `/api/visualizer/svg/{visualization_id}`
- **Description:** Retrieve a specific SVG visualization by ID
- **Path Parameters:** `visualization_id`
- **Status:** ✅ Implemented
- **Frontend Integration:** ⚠️ Available but not used

---

## 📝 Notes Endpoints

### Get All Notes
- **Method:** `GET`
- **Endpoint:** `/api/notes`
- **Description:** Retrieve all notes for a user
- **Status:** ❌ Not Implemented
- **Frontend Integration:** ❌ Uses localStorage (Notes.tsx)

### Create New Note
- **Method:** `POST`
- **Endpoint:** `/api/notes`
- **Description:** Create a new note
- **Status:** ❌ Not Implemented
- **Frontend Integration:** ❌ Uses localStorage (Notes.tsx)

### Get Specific Note
- **Method:** `GET`
- **Endpoint:** `/api/notes/{note_id}`
- **Description:** Get a specific note by ID
- **Status:** ❌ Not Implemented
- **Frontend Integration:** ❌ Uses localStorage (Notes.tsx)

### Update Note
- **Method:** `PUT`
- **Endpoint:** `/api/notes/{note_id}`
- **Description:** Update an existing note
- **Status:** ❌ Not Implemented
- **Frontend Integration:** ❌ Uses localStorage (Notes.tsx)

### Delete Note
- **Method:** `DELETE`
- **Endpoint:** `/api/notes/{note_id}`
- **Description:** Delete a note
- **Status:** ❌ Not Implemented
- **Frontend Integration:** ❌ Uses localStorage (Notes.tsx)

### Search Notes
- **Method:** `GET`
- **Endpoint:** `/api/notes/search`
- **Description:** Search notes by content/title
- **Query Parameters:** `q` (search query)
- **Status:** ❌ Not Implemented
- **Frontend Integration:** ❌ Uses localStorage (Notes.tsx)

### Filter Notes
- **Method:** `GET`
- **Endpoint:** `/api/notes/filter`
- **Description:** Filter notes by course, tags, etc.
- **Query Parameters:** `course`, `tags`, `pinned`
- **Status:** ❌ Not Implemented
- **Frontend Integration:** ❌ Uses localStorage (Notes.tsx)

### Pin/Unpin Note
- **Method:** `POST`
- **Endpoint:** `/api/notes/{note_id}/pin`
- **Description:** Toggle pin status of a note
- **Status:** ❌ Not Implemented
- **Frontend Integration:** ❌ Uses localStorage (Notes.tsx)

### Get Notes Statistics
- **Method:** `GET`
- **Endpoint:** `/api/notes/stats`
- **Description:** Get notes statistics (count by course, tags, etc.)
- **Status:** ❌ Not Implemented
- **Frontend Integration:** ❌ Not needed currently

---

## 🏥 System Endpoints

### Root Endpoint
- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** Basic API status check
- **Status:** ✅ Implemented
- **Frontend Integration:** ⚠️ Not used

### Health Check
- **Method:** `GET`
- **Endpoint:** `/health`
- **Description:** Detailed server health status
- **Status:** ✅ Implemented
- **Frontend Integration:** ⚠️ Used for testing only

---

## 📚 Documentation Endpoints

### Interactive API Documentation
- **Method:** `GET`
- **Endpoint:** `/docs`
- **Description:** Swagger UI with interactive API documentation
- **Status:** ✅ Auto-generated by FastAPI
- **Frontend Integration:** ❌ Developer tool only

### OpenAPI Schema
- **Method:** `GET`
- **Endpoint:** `/openapi.json`
- **Description:** OpenAPI 3.0 schema in JSON format
- **Status:** ✅ Auto-generated by FastAPI
- **Frontend Integration:** ❌ Developer tool only

---

## 📈 Summary

### Implemented Endpoints: 12
- ✅ Dashboard: 4 endpoints
- ✅ Chat: 2 endpoints  
- ✅ Visualizer: 3 endpoints
- ✅ System: 2 endpoints
- ✅ Documentation: 1 endpoint (auto-generated)

### Missing Endpoints: 9
- ❌ Notes: 9 endpoints (complete CRUD + search/filter)

### Frontend Integration Status
- **Fully Connected:** 5 endpoints
- **Available but Unused:** 5 endpoints  
- **Missing Backend:** 9 endpoints (Notes functionality)

---

## 🔧 Technical Details

### CORS Configuration
- **Allowed Origins:** `http://localhost:5173`, `http://localhost:3000`
- **Methods:** All HTTP methods
- **Headers:** All headers
- **Credentials:** Enabled

### Data Models
- `ChatMessage`: `{ message: str, session_id?: str }`
- `ChatResponse`: `{ response: str, session_id: str }`
- `SVGVisualization`: `{ svg_content: str, title: str, description?: str }`
- `DashboardStats`: `{ study_time: str, study_time_sub: str, streak: str, streak_sub: str, in_progress: str, in_progress_sub: str, completed: str, completed_sub: str }`
- `CourseProgress`: `{ title: str, icon: str, color: str, progress: int, lessons: int, lessons_total: int, tag: str }`

### Missing Data Models (for Notes)
- `Note`: `{ id: int, title: str, content: str, course: str, color: str, date: str, tags: List[str], pinned: bool }`
- `NoteCreate`: `{ title: str, content: str, course: str, tags: List[str] }`
- `NoteUpdate`: `{ title?: str, content?: str, course?: str, tags?: List[str], pinned?: bool }`

---

## 🚀 Next Steps

1. **Implement Notes API endpoints** in `backend/main.py`
2. **Add Notes data models** in `backend/models.py`
3. **Integrate Notes.tsx** with backend APIs
4. **Add user authentication** for personalized notes
5. **Implement real database** (PostgreSQL/MongoDB) instead of in-memory storage
6. **Add API rate limiting** and security features
7. **Implement real AI service** integration (OpenAI/Claude)

---

**Last Updated:** March 4, 2026  
**Backend Status:** Running on `http://localhost:8000`  
**Frontend Status:** Running on `http://localhost:5174`