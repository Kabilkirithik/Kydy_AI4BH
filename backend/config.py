"""
Configuration settings for KYDY Backend
"""

import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Server Configuration
    app_name: str = "KYDY EdTech API"
    version: str = "1.0.0"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # Database Configuration
    database_url: str = "sqlite:///./kydy.db"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS Configuration
    allowed_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # AI Service Configuration
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create settings instance
settings = Settings()

# AI Response Templates
AI_RESPONSES = {
    "greeting": [
        "Hello! 👋 I'm your AI tutor, ready to help you learn!",
        "Hi there! What would you like to learn about today?",
        "Welcome! I'm here to help you with your learning journey."
    ],
    "programming": {
        "react": """React is a powerful JavaScript library for building user interfaces. Here are key concepts:

🔹 **Components**: Reusable pieces of UI
🔹 **JSX**: JavaScript syntax extension  
🔹 **Props**: Data passed to components
🔹 **State**: Component's internal data
🔹 **Hooks**: Functions for state and lifecycle features

Would you like me to explain any of these in detail?""",
        
        "javascript": """JavaScript is a versatile programming language! Fundamentals include:

• **Variables**: let, const, var
• **Functions**: Regular and arrow functions
• **Objects**: Key-value pairs
• **Arrays**: Ordered data collections
• **Promises**: Async operation handling
• **DOM**: Web page interaction

What JavaScript topic interests you most?""",
        
        "python": """Python is excellent for beginners and experts! Key features:

• **Simple Syntax**: Easy to read and write
• **Data Types**: Strings, lists, dictionaries, sets
• **Functions**: Reusable code blocks
• **Classes**: Object-oriented programming
• **Libraries**: NumPy, Pandas, Django, Flask
• **Applications**: Web dev, data science, AI

What Python concept would you like to explore?"""
    },
    "web_development": {
        "css": """CSS (Cascading Style Sheets) styles web pages. Key concepts:

• **Selectors**: Targeting HTML elements
• **Properties**: Style attributes (color, font-size)
• **Flexbox**: One-dimensional layouts
• **Grid**: Two-dimensional layouts
• **Responsive**: Media queries and viewport units
• **Animations**: Transitions and keyframes

Which CSS topic would you like to dive into?""",
        
        "html": """HTML (HyperText Markup Language) structures web content:

• **Elements**: Building blocks like <div>, <p>, <h1>
• **Attributes**: Element properties (id, class, src)
• **Semantic HTML**: Meaningful tags (<header>, <nav>, <main>)
• **Forms**: User input collection
• **Accessibility**: Screen reader friendly markup

What HTML concept can I help explain?"""
    },
    "data_science": {
        "machine_learning": """Machine Learning is fascinating! Here's an overview:

**Types of ML:**
• **Supervised**: Learning from labeled data
• **Unsupervised**: Finding patterns in unlabeled data  
• **Reinforcement**: Learning through rewards/penalties

**Common Algorithms:**
• Linear Regression
• Decision Trees
• Neural Networks
• K-Means Clustering

What ML aspect would you like to explore deeper?"""
    },
    "fallback": "That's an interesting question! Could you provide more context? I can help with programming, web development, data science, and many other tech topics!"
}

# Mock course data
MOCK_COURSES = [
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

# Mock user statistics
MOCK_USER_STATS = {
    "study_time": {"value": "24h", "sub": "+3h this week"},
    "streak": {"value": "12", "sub": "Days in a row"},
    "in_progress": {"value": "3", "sub": "Active courses"},
    "completed": {"value": "7", "sub": "Courses finished"}
}