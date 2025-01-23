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
'''Copygit clone https://github.com/your-username/university-course-finder.git'''

Build the Docker container:
'''Copydocker build -t course-finder .'''

Run the Docker container:
'''Copydocker run -p 8000:8000 course-finder'''

Access the app at http://localhost:8000.

The Docker build command packages the entire application, including the backend and frontend, into a consistent runtime environment for easy local testing and deployment.
