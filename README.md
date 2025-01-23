# University Course Finder

## Purpose
The University Course Finder is a web application that enables students to discover relevant university courses through natural language queries. It aims to simplify the course selection process by providing personalized recommendations based on course content.

## Implementation

### Backend
- Django web framework for the backend API
- Uses Hugging Face transformers to vectorize course descriptions and user queries for semantic search
- Automated web scraping to collect course data (descriptions, credits, prerequisites) into an SQLite3 database

### Frontend  
- React/Vite for the user interface
- Implements JWT authentication for secure access

### Deployment
- Containerized the entire application using Docker for consistent deployment across environments

### Local Setup
To run the University Course Finder locally:

Clone the repository:
```
Copygit clone https://github.com/RahulBasak762/CornellCourseFind.git
```

Install backend dependencies:
```
cd CornellCourseFind
pip install -r requirements.txt
cd ..
```

Build and run the Docker containers:
```
docker compose up --build
```

Access the app at http://localhost:4173/

<img width="1512" alt="image" src="https://github.com/user-attachments/assets/54a43d90-3955-4967-ac1c-8c45f56575be" />



