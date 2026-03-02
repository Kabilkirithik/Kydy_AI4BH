# KYDY EdTech Platform

## Project Overview

KYDY is an educational technology platform built with React, TypeScript, and Vite. It provides an interactive learning experience with AI-powered tutoring capabilities.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Inline styles with CSS-in-JS approach
- **Fonts**: 
  - Orbitron (headings and UI elements)
  - Exo 2 (body text)
  - DM Sans (Lessons page)
  - JetBrains Mono (code snippets)

## Project Structure

```
kydy/
├── src/
│   ├── App.tsx           # Main app with routing logic
│   ├── Dashboard.tsx     # Dashboard with stats and progress
│   ├── Courses.tsx       # Course catalog and details
│   ├── Lessons.tsx       # AI tutor chat interface
│   ├── Notes.tsx         # Note-taking with CRUD operations
│   ├── main.tsx          # App entry point
│   └── style.css         # Global styles
├── public/               # Static assets
└── index.html           # HTML template

```

## Key Features

1. **Dashboard**: Overview of learning progress, stats, and active courses
2. **Courses**: Browse and enroll in courses with detailed information
3. **Lessons**: Interactive AI tutor with chat interface and SVG visualizations
4. **Notes**: Create, edit, and organize study notes with tags and categories

## Design System

### Colors
- Primary Purple: `#7c3aed`
- Secondary Purple: `#a855f7`
- Accent Blue: `#6366f1`
- Light Background: `#f3f4f6`
- White: `#ffffff`

### Theme
The application uses a light theme with:
- White/light gray backgrounds
- Purple accent colors
- Subtle shadows and borders
- Smooth transitions and hover effects

## Development Guidelines

- Use functional components with hooks
- Inline styles for component-specific styling
- TypeScript for type safety
- Minimal external dependencies
- Responsive design considerations
