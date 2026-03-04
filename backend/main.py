from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime, timedelta
import json
import os

app = FastAPI(title="KYDY EdTech API", version="1.0.0")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Data Models ──────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class SVGVisualization(BaseModel):
    svg_content: str
    title: str
    description: Optional[str] = None

class DashboardStats(BaseModel):
    study_time: str
    study_time_sub: str
    streak: str
    streak_sub: str
    in_progress: str
    in_progress_sub: str
    completed: str
    completed_sub: str

class CourseProgress(BaseModel):
    title: str
    icon: str
    color: str
    progress: int
    lessons: int
    lessons_total: int
    tag: str

# ─── Mock Data Storage ────────────────────────────────────────────────────────

# In-memory storage (in production, use a proper database)
chat_sessions = {}
svg_visualizations = []
user_stats = {
    "study_time": {"value": "24h", "sub": "+3h this week"},
    "streak": {"value": "12", "sub": "Days in a row"},
    "in_progress": {"value": "3", "sub": "Active courses"},
    "completed": {"value": "7", "sub": "Courses finished"}
}

courses_progress = [
    {
        "title": "Web Development",
        "icon": "⚡",
        "color": "#6366f1",
        "progress": 68,
        "lessons": 17,
        "lessons_total": 25,
        "tag": "In Progress"
    },
    {
        "title": "Machine Learning",
        "icon": "🤖",
        "color": "#7c3aed",
        "progress": 35,
        "lessons": 8,
        "lessons_total": 23,
        "tag": "In Progress"
    },
    {
        "title": "UI/UX Design",
        "icon": "🎨",
        "color": "#a855f7",
        "progress": 82,
        "lessons": 21,
        "lessons_total": 26,
        "tag": "Almost Done"
    }
]

# ─── Helper Functions ──────────────────────────────────────────────────────────

def generate_ai_response(message: str) -> str:
    """
    Mock AI response generator. In production, integrate with OpenAI, Claude, or other AI services.
    """
    message_lower = message.lower()
    
    if "react" in message_lower:
        return "React is a powerful JavaScript library for building user interfaces. Here are some key concepts:\n\n1. **Components**: Reusable pieces of UI\n2. **JSX**: JavaScript syntax extension\n3. **Props**: Data passed to components\n4. **State**: Component's internal data\n5. **Hooks**: Functions that let you use state and lifecycle features\n\nWould you like me to explain any of these concepts in more detail?"
    
    elif "javascript" in message_lower or "js" in message_lower:
        return "JavaScript is a versatile programming language! Here are some fundamental concepts:\n\n• **Variables**: let, const, var\n• **Functions**: Regular functions, arrow functions\n• **Objects**: Key-value pairs\n• **Arrays**: Ordered lists of data\n• **Promises**: Handling asynchronous operations\n• **DOM Manipulation**: Interacting with web pages\n\nWhat specific JavaScript topic would you like to explore?"
    
    elif "css" in message_lower:
        return "CSS (Cascading Style Sheets) is used for styling web pages. Key concepts include:\n\n• **Selectors**: Targeting HTML elements\n• **Properties**: Style attributes like color, font-size\n• **Flexbox**: One-dimensional layouts\n• **Grid**: Two-dimensional layouts\n• **Responsive Design**: Media queries and viewport units\n• **Animations**: Transitions and keyframes\n\nWhich CSS topic interests you most?"
    
    elif "python" in message_lower:
        return "Python is an excellent programming language for beginners and experts alike! Key features:\n\n• **Simple Syntax**: Easy to read and write\n• **Data Types**: Strings, lists, dictionaries, sets\n• **Functions**: Reusable code blocks\n• **Classes**: Object-oriented programming\n• **Libraries**: NumPy, Pandas, Django, Flask\n• **Applications**: Web dev, data science, AI, automation\n\nWhat Python concept would you like to learn about?"
    
    elif "machine learning" in message_lower or "ml" in message_lower:
        return "Machine Learning is a fascinating field! Here's an overview:\n\n**Types of ML:**\n• **Supervised Learning**: Learning from labeled data\n• **Unsupervised Learning**: Finding patterns in unlabeled data\n• **Reinforcement Learning**: Learning through rewards/penalties\n\n**Common Algorithms:**\n• Linear Regression\n• Decision Trees\n• Neural Networks\n• K-Means Clustering\n\nWhat aspect of ML would you like to dive deeper into?"
    
    elif "hello" in message_lower or "hi" in message_lower:
        return "Hello! 👋 I'm your AI tutor, ready to help you learn! I can assist you with:\n\n• Programming concepts (JavaScript, Python, React, etc.)\n• Web development (HTML, CSS, JavaScript)\n• Data science and machine learning\n• UI/UX design principles\n• General computer science topics\n\nWhat would you like to learn about today?"
    
    else:
        return f"That's an interesting question about '{message}'! I'd be happy to help you learn more about this topic. Could you provide a bit more context or specify what aspect you'd like to explore? I can help with programming, web development, data science, and many other tech topics!"

# ─── API Endpoints ─────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "KYDY EdTech API is running!"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(chat_message: ChatMessage):
    """
    Chat endpoint for the AI tutor
    """
    try:
        # Generate session ID if not provided
        session_id = chat_message.session_id or f"session_{datetime.now().timestamp()}"
        
        # Initialize session if new
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
        
        # Add user message to session
        chat_sessions[session_id].append({
            "role": "user",
            "message": chat_message.message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Generate AI response
        ai_response = generate_ai_response(chat_message.message)
        
        # Add AI response to session
        chat_sessions[session_id].append({
            "role": "ai",
            "message": ai_response,
            "timestamp": datetime.now().isoformat()
        })
        
        return ChatResponse(response=ai_response, session_id=session_id)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.get("/api/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """
    Get chat history for a specific session
    """
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"session_id": session_id, "messages": chat_sessions[session_id]}

@app.post("/api/visualizer/svg")
async def save_svg_visualization(svg_data: SVGVisualization):
    """
    Save SVG visualization from the visualizer
    """
    try:
        visualization = {
            "id": len(svg_visualizations) + 1,
            "svg_content": svg_data.svg_content,
            "title": svg_data.title,
            "description": svg_data.description,
            "created_at": datetime.now().isoformat()
        }
        
        svg_visualizations.append(visualization)
        
        return {"message": "SVG visualization saved successfully", "id": visualization["id"]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving SVG: {str(e)}")

@app.get("/api/visualizer/svg")
async def get_svg_visualizations():
    """
    Get all saved SVG visualizations
    """
    return {"visualizations": svg_visualizations}

@app.get("/api/visualizer/svg/{visualization_id}")
async def get_svg_visualization(visualization_id: int):
    """
    Get a specific SVG visualization by ID
    """
    for viz in svg_visualizations:
        if viz["id"] == visualization_id:
            return viz
    
    raise HTTPException(status_code=404, detail="Visualization not found")

@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """
    Get real dashboard statistics
    """
    try:
        return DashboardStats(
            study_time=user_stats["study_time"]["value"],
            study_time_sub=user_stats["study_time"]["sub"],
            streak=user_stats["streak"]["value"],
            streak_sub=user_stats["streak"]["sub"],
            in_progress=user_stats["in_progress"]["value"],
            in_progress_sub=user_stats["in_progress"]["sub"],
            completed=user_stats["completed"]["value"],
            completed_sub=user_stats["completed"]["sub"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@app.get("/api/dashboard/courses", response_model=List[CourseProgress])
async def get_course_progress():
    """
    Get course progress data for dashboard
    """
    try:
        return [CourseProgress(**course) for course in courses_progress]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")

@app.post("/api/dashboard/update-progress")
async def update_course_progress(course_title: str, lessons_completed: int):
    """
    Update course progress (simulate learning activity)
    """
    try:
        for course in courses_progress:
            if course["title"] == course_title:
                course["lessons"] = min(lessons_completed, course["lessons_total"])
                course["progress"] = int((course["lessons"] / course["lessons_total"]) * 100)
                
                # Update tag based on progress
                if course["progress"] >= 90:
                    course["tag"] = "Almost Done"
                elif course["progress"] >= 50:
                    course["tag"] = "In Progress"
                else:
                    course["tag"] = "Getting Started"
                
                # Update user stats
                total_completed = sum(1 for c in courses_progress if c["progress"] == 100)
                user_stats["completed"]["value"] = str(total_completed)
                
                # Update study time (mock increment)
                current_hours = int(user_stats["study_time"]["value"].replace("h", ""))
                user_stats["study_time"]["value"] = f"{current_hours + 1}h"
                user_stats["study_time"]["sub"] = f"+{current_hours + 1 - 24 + 3}h this week"
                
                return {"message": f"Progress updated for {course_title}"}
        
        raise HTTPException(status_code=404, detail="Course not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating progress: {str(e)}")

@app.post("/api/dashboard/update-streak")
async def update_streak():
    """
    Update daily streak (call this when user completes daily activity)
    """
    try:
        current_streak = int(user_stats["streak"]["value"])
        user_stats["streak"]["value"] = str(current_streak + 1)
        user_stats["streak"]["sub"] = "Days in a row"
        
        return {"message": "Streak updated!", "new_streak": current_streak + 1}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating streak: {str(e)}")

# ─── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)