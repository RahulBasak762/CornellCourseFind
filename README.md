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

Overall, the University Course Finder leverages various technologies - Django, Hugging Face, web scraping, React, JWT, Docker - to create an intuitive course discovery experience for students. The semantic search functionality powered by text vectorization allows for accurate recommendations based on course content relevance.
