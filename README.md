# UF Scheduler Project

UF Scheduler is a full-stack web application for UF students to upload transcripts and plan their schedules.  

- **Backend:** Flask API (`backend/`)  
- **Frontend:** React + Vite (`frontend/`)  

---

## Table of Contents

- [Prerequisites](#prerequisites)  
- [Fork / Clone](#fork--clone)  
- [Backend Setup](#backend-setup-flask)  
- [Frontend Setup](#frontend-setup-react--vite)  
- [Running the App](#running-the-app-locally)  
- [Project Structure](#project-structure)  
- [Notes](#notes)  

---

## Prerequisites

Make sure you have installed:

- Python 3.10+  
- Node.js 18+ & npm  
- pip & npm globally available  

---

## Fork / Clone

1. Fork the repository on GitHub.  
2. Clone your fork:


git clone https://github.com/mansapatel111/Plan-A-Gator.git
cd plan-a-gator


## Backend Setup (Flask)

Navigate to the backend folder:

cd backend


Create a virtual environment (if not already present):

python3 -m venv venv


Activate the virtual environment:

macOS/Linux:

source venv/bin/activate


Windows:

venv\Scripts\activate


Install Python dependencies:

pip install -r requirements.txt



## Frontend Setup (React + Vite)

Navigate to the frontend folder:

cd ../frontend


Install Node dependencies:

npm install


## Running the App Locally

Step 1: Start Flask Backend 

cd backend
source venv/bin/activate   # Activate venv if not active
flask run
The API will be available at: http://127.0.0.1:5000

In another terminal tab

Step 2: Start React Frontend

Open a new terminal:
cd frontend
npm run dev

The frontend will be available at: http://localhost:5173

React will call the Flask API at http://127.0.0.1:5000/api/...

## Project Structure
uf-scheduler/
├── backend/
│   ├── app.py           # Flask backend entry
│   ├── requirements.txt # Python dependencies
│   ├── venv/            # Python virtual environment (ignored)
│   └── .env             #  backend env
│
├── frontend/
│   ├── src/             # React source files
│   ├── package.json
│   ├── vite.config.js
│   └── .env             #  frontend env
│
├── .gitignore
└── README.md


## Notes

- .env files are currently not in .gitignore, so you can pull them directly for now.

- Make sure to activate the backend virtual environment before running Flask.

- Frontend uses Vite — hot-reloading works automatically.

- Flask serves only API endpoints in development; React handles the frontend routes.