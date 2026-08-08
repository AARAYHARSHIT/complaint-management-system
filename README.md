# AIVOA Complaint Management System

AI-powered complaint management platform that automates complaint extraction, risk assessment, complaint tracking, and corrective action recommendations.

## Features

- AI Complaint Extraction
- PDF Upload Processing
- Auto Form Population
- AI Risk Classification
- Root Cause Analysis
- Corrective Action Recommendations
- Complaint Tracking Dashboard
- PostgreSQL Database Integration
- FastAPI Backend
- React Frontend

## Tech Stack

Frontend:
- React
- Redux Toolkit
- TailwindCSS

Backend:
- FastAPI
- Python

Database:
- PostgreSQL

AI:
- Groq LLM

## Setup

### Backend

cd backend

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload

Backend:
http://127.0.0.1:8000

Swagger:
http://127.0.0.1:8000/docs

### Frontend

cd frontend

npm install

npm run dev

Frontend:
http://localhost:3000

## Database

Database Name:
complaint_db

Configure PostgreSQL credentials in .env

## Workflow

1. Upload Complaint PDF
2. AI extracts complaint details
3. Form auto-populates
4. AI performs risk assessment
5. User reviews complaint
6. Complaint stored in PostgreSQL
7. View and track complaints
