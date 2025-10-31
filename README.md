# Plan-A-Gator - UF Course Scheduler

Plan-A-Gator is a full-stack web application for UF students to upload transcripts, get course recommendations, and plan their schedules.

- **Backend:** Flask API + PostgreSQL (`backend/`)
- **Frontend:** React + Vite (`frontend/`)

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Clone the Repository](#clone-the-repository)
- [Database Setup](#database-setup-postgresql)
- [Backend Setup](#backend-setup-flask)
- [Frontend Setup](#frontend-setup-react--vite)
- [Running the App](#running-the-app-locally)
- [Testing the Application](#testing-the-application)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Make sure you have installed:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** & **npm** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

Verify installations:
```bash
python3 --version
node --version
npm --version
psql --version
git --version
```

---

## Clone the Repository

```bash
git clone https://github.com/yourusername/Plan-A-Gator.git
cd Plan-A-Gator
```

---

## Database Setup (PostgreSQL)

### 1. Create PostgreSQL Database

```bash
# Start PostgreSQL service
# macOS (if using Homebrew):
brew services start postgresql

# Linux:
sudo service postgresql start

# Windows: PostgreSQL should auto-start after installation
```

### 2. Create Database and User

```bash
# Open PostgreSQL shell
psql postgres

# Create database
CREATE DATABASE plan_a_gator_db;

# Create user with password
CREATE USER your_username WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE plan_a_gator_db TO your_username;

# Exit psql
\q
```

### 3. Initialize Database Schema

```bash
# Navigate to backend folder
cd backend

# Run schema file to create tables
psql -U your_username -d plan_a_gator_db -f schema.sql

# Verify tables were created
psql -U your_username -d plan_a_gator_db -c "\dt"

# Should show: users, courses, user_completed_courses, user_schedules, schedule_courses
```

---

## Backend Setup (Flask)

### 1. Navigate to Backend Folder

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### 4. Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file in the `backend/` folder (or update existing one):

```bash
# filepath: backend/.env
DATABASE_URL=postgresql://your_username:your_password@localhost/plan_a_gator_db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
```

**Replace:**
- `your_username` with your PostgreSQL username
- `your_password` with your PostgreSQL password

### 6. Update app.py Database Configuration

Open `backend/app.py` and verify the database URI matches your setup:

```python
# Around line 12-15
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://your_username:your_password@localhost/plan_a_gator_db'
```

### 7. Test Backend

```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Restarting with stat
 * Debugger is active!
```

Test the API:
```bash
# In a new terminal
curl http://127.0.0.1:5000/
```

Should return: `{"message": "Welcome to Plan-A-Gator API"}`

**Keep the backend running!**

---

## Frontend Setup (React + Vite)

### 1. Open New Terminal

Keep the backend terminal running. Open a **new terminal window**.

### 2. Navigate to Frontend Folder

```bash
cd Plan-A-Gator/frontend
```

### 3. Install Node Dependencies

```bash
npm install
```

This will install all dependencies from `package.json` including:
- React
- React Router DOM
- Vite
- PDF.js

### 4. Configure Environment Variables (Optional)

If needed, create `.env` file in `frontend/` folder:

```bash
# filepath: frontend/.env
VITE_API_URL=http://127.0.0.1:5000
```

### 5. Test Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Running the App Locally

### Step 1: Start PostgreSQL

Make sure PostgreSQL is running:

```bash
# macOS:
brew services start postgresql

# Linux:
sudo service postgresql start

# Windows: Check Services app
```

### Step 2: Start Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

python app.py
```

Backend runs at: **http://127.0.0.1:5000**

### Step 3: Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:5173**

### Step 4: Open Browser

Navigate to: **http://localhost:5173**

---

## Testing the Application

### 1. Sign Up

- Go to http://localhost:5173/signup
- Create an account with:
  - Username
  - Email
  - Password
- Click "Sign Up"

### 2. Sign In

- Go to http://localhost:5173/signin
- Enter your credentials
- Click "Sign In"

### 3. Upload Transcript

- Go to "Transcript" page
- Select your college (e.g., "Engineering")
- Select your grade level (e.g., "Sophomore")
- Upload a PDF transcript or manually enter course codes
- Click "Parse and Save"

### 4. View Scheduler

- Navigate to "Scheduler" page
- See recommended courses based on your transcript
- Drag courses to create your schedule
- Save your schedule with a name

### 5. View Saved Schedules

- Your saved schedules appear on the right side
- Click a schedule to load it
- Download as PDF
- Delete old schedules

---

## Project Structure

```
Plan-A-Gator/
├── backend/
│   ├── app.py                 # Flask API entry point
│   ├── models.py              # SQLAlchemy database models
│   ├── schema.sql             # Database schema
│   ├── recommendation_services.py  # Course recommendation logic
│   ├── requirements.txt       # Python dependencies
│   ├── venv/                  # Python virtual environment (not in git)
│   └── .env                   # Backend environment variables (not in git)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Landing page
│   │   │   ├── SignIn.jsx     # Login page
│   │   │   ├── SignUp.jsx     # Registration page
│   │   │   ├── Transcript.jsx # Transcript upload page
│   │   │   └── Scheduler.jsx  # Schedule builder page
│   │   ├── App.jsx            # Main React component
│   │   └── main.jsx           # React entry point
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   └── .env                   # Frontend environment variables (not in git)
│
├── .gitignore
└── README.md
```

---

## Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError: No module named 'flask'`**

Solution:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Problem: `psycopg2` installation fails**

Solution (macOS):
```bash
brew install postgresql
pip install psycopg2-binary
```

Solution (Linux):
```bash
sudo apt-get install libpq-dev
pip install psycopg2-binary
```

**Problem: Database connection error**

Solution:
- Check PostgreSQL is running: `psql -U your_username -d plan_a_gator_db`
- Verify database credentials in `app.py`
- Make sure database exists: `psql -l`

**Problem: "Table does not exist" error**

Solution:
```bash
psql -U your_username -d plan_a_gator_db -f backend/schema.sql
```

### Frontend Issues

**Problem: `npm install` fails**

Solution:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Problem: "Cannot find module 'react-router-dom'"**

Solution:
```bash
npm install react-router-dom
```

**Problem: API calls failing (CORS errors)**

Solution:
- Make sure backend is running on http://127.0.0.1:5000
- Check `flask-cors` is installed: `pip install flask-cors`
- Verify `CORS(app)` in `app.py`

### Database Issues

**Problem: "password authentication failed"**

Solution:
```bash
# Reset PostgreSQL password
psql postgres
ALTER USER your_username WITH PASSWORD 'new_password';
\q

# Update app.py with new password
```

**Problem: Cannot connect to PostgreSQL**

Solution:
```bash
# macOS:
brew services restart postgresql

# Linux:
sudo service postgresql restart

# Check if PostgreSQL is running:
ps aux | grep postgres
```

### General Issues

**Problem: Port 5000 or 5173 already in use**

Solution:
```bash
# Find process using port
lsof -i :5000  # or :5173

# Kill the process
kill -9 <PID>
```

**Problem: Changes not reflecting**

Solution:
- Frontend: Vite hot-reloads automatically. If not, restart with `npm run dev`
- Backend: Restart Flask with `python app.py`
- Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## Additional Notes

- **Environment Files:** `.env` files contain sensitive information. Never commit them to Git.
- **Virtual Environment:** Always activate `venv` before running Flask commands.
- **Hot Reloading:** Vite provides instant hot module replacement for React.
- **API Endpoints:** All backend routes are prefixed with `/` (e.g., `/signup`, `/signin`).
- **Database Migrations:** If you change models, drop and recreate tables or use migrations.

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review backend terminal for Flask errors
3. Check browser console (F12) for frontend errors
4. Verify database connection: `psql -U your_username -d plan_a_gator_db`

---

## Contributors

- Your Team Members Here

---

## License

This project is licensed under the MIT License.
```

---

## Key improvements:

1. ✅ **Step-by-step PostgreSQL setup** - including database creation, user setup, and schema initialization
2. ✅ **Detailed backend setup** - virtual environment, dependencies, environment variables
3. ✅ **Frontend setup** - all npm installations explicitly listed
4. ✅ **Running instructions** - clear 3-step process with expected outputs
5. ✅ **Testing section** - walk through the entire user flow
6. ✅ **Comprehensive troubleshooting** - common errors with solutions
7. ✅ **Project structure** - visual directory tree
8. ✅ **Verification steps** - how to check if each step worked

Anyone should be able to clone and run the app by following these instructions!<!-- filepath: /Users/elinakocarslan/Documents/GitHub/ProductivityApp/Plan-A-Gator/README.md -->
# Plan-A-Gator - UF Course Scheduler

Plan-A-Gator is a full-stack web application for UF students to upload transcripts, get course recommendations, and plan their schedules.

- **Backend:** Flask API + PostgreSQL (`backend/`)
- **Frontend:** React + Vite (`frontend/`)

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Clone the Repository](#clone-the-repository)
- [Database Setup](#database-setup-postgresql)
- [Backend Setup](#backend-setup-flask)
- [Frontend Setup](#frontend-setup-react--vite)
- [Running the App](#running-the-app-locally)
- [Testing the Application](#testing-the-application)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Make sure you have installed:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** & **npm** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

Verify installations:
```bash
python3 --version
node --version
npm --version
psql --version
git --version
```

---

## Clone the Repository

```bash
git clone https://github.com/yourusername/Plan-A-Gator.git
cd Plan-A-Gator
```

---

## Database Setup (PostgreSQL)

### 1. Create PostgreSQL Database

```bash
# Start PostgreSQL service
# macOS (if using Homebrew):
brew services start postgresql

# Linux:
sudo service postgresql start

# Windows: PostgreSQL should auto-start after installation
```

### 2. Create Database and User

```bash
# Open PostgreSQL shell
psql postgres

# Create database
CREATE DATABASE plan_a_gator_db;

# Create user with password
CREATE USER your_username WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE plan_a_gator_db TO your_username;

# Exit psql
\q
```

### 3. Initialize Database Schema

```bash
# Navigate to backend folder
cd backend

# Run schema file to create tables
psql -U your_username -d plan_a_gator_db -f schema.sql

# Verify tables were created
psql -U your_username -d plan_a_gator_db -c "\dt"

# Should show: users, courses, user_completed_courses, user_schedules, schedule_courses
```

---

## Backend Setup (Flask)

### 1. Navigate to Backend Folder

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### 4. Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file in the `backend/` folder (or update existing one):

```bash
# filepath: backend/.env
DATABASE_URL=postgresql://your_username:your_password@localhost/plan_a_gator_db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
```

**Replace:**
- `your_username` with your PostgreSQL username
- `your_password` with your PostgreSQL password

### 6. Update app.py Database Configuration

Open `backend/app.py` and verify the database URI matches your setup:

```python
# Around line 12-15
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://your_username:your_password@localhost/plan_a_gator_db'
```

### 7. Test Backend

```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Restarting with stat
 * Debugger is active!
```

Test the API:
```bash
# In a new terminal
curl http://127.0.0.1:5000/
```

Should return: `{"message": "Welcome to Plan-A-Gator API"}`

**Keep the backend running!**

---

## Frontend Setup (React + Vite)

### 1. Open New Terminal

Keep the backend terminal running. Open a **new terminal window**.

### 2. Navigate to Frontend Folder

```bash
cd Plan-A-Gator/frontend
```

### 3. Install Node Dependencies

```bash
npm install
```

This will install all dependencies from `package.json` including:
- React
- React Router DOM
- Vite
- PDF.js

### 4. Configure Environment Variables (Optional)

If needed, create `.env` file in `frontend/` folder:

```bash
# filepath: frontend/.env
VITE_API_URL=http://127.0.0.1:5000
```

### 5. Test Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Running the App Locally

### Step 1: Start PostgreSQL

Make sure PostgreSQL is running:

```bash
# macOS:
brew services start postgresql

# Linux:
sudo service postgresql start

# Windows: Check Services app
```

### Step 2: Start Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

python app.py
```

Backend runs at: **http://127.0.0.1:5000**

### Step 3: Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:5173**

### Step 4: Open Browser

Navigate to: **http://localhost:5173**

---

## Testing the Application

### 1. Sign Up

- Go to http://localhost:5173/signup
- Create an account with:
  - Username
  - Email
  - Password
- Click "Sign Up"

### 2. Sign In

- Go to http://localhost:5173/signin
- Enter your credentials
- Click "Sign In"

### 3. Upload Transcript

- Go to "Transcript" page
- Select your college (e.g., "Engineering")
- Select your grade level (e.g., "Sophomore")
- Upload a PDF transcript or manually enter course codes
- Click "Parse and Save"

### 4. View Scheduler

- Navigate to "Scheduler" page
- See recommended courses based on your transcript
- Drag courses to create your schedule
- Save your schedule with a name

### 5. View Saved Schedules

- Your saved schedules appear on the right side
- Click a schedule to load it
- Download as PDF
- Delete old schedules

---

## Project Structure

```
Plan-A-Gator/
├── backend/
│   ├── app.py                 # Flask API entry point
│   ├── models.py              # SQLAlchemy database models
│   ├── schema.sql             # Database schema
│   ├── recommendation_services.py  # Course recommendation logic
│   ├── requirements.txt       # Python dependencies
│   ├── venv/                  # Python virtual environment (not in git)
│   └── .env                   # Backend environment variables (not in git)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Landing page
│   │   │   ├── SignIn.jsx     # Login page
│   │   │   ├── SignUp.jsx     # Registration page
│   │   │   ├── Transcript.jsx # Transcript upload page
│   │   │   └── Scheduler.jsx  # Schedule builder page
│   │   ├── App.jsx            # Main React component
│   │   └── main.jsx           # React entry point
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   └── .env                   # Frontend environment variables (not in git)
│
├── .gitignore
└── README.md
```

---

## Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError: No module named 'flask'`**

Solution:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Problem: `psycopg2` installation fails**

Solution (macOS):
```bash
brew install postgresql
pip install psycopg2-binary
```

Solution (Linux):
```bash
sudo apt-get install libpq-dev
pip install psycopg2-binary
```

**Problem: Database connection error**

Solution:
- Check PostgreSQL is running: `psql -U your_username -d plan_a_gator_db`
- Verify database credentials in `app.py`
- Make sure database exists: `psql -l`

**Problem: "Table does not exist" error**

Solution:
```bash
psql -U your_username -d plan_a_gator_db -f backend/schema.sql
```

### Frontend Issues

**Problem: `npm install` fails**

Solution:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Problem: "Cannot find module 'react-router-dom'"**

Solution:
```bash
npm install react-router-dom
```

**Problem: API calls failing (CORS errors)**

Solution:
- Make sure backend is running on http://127.0.0.1:5000
- Check `flask-cors` is installed: `pip install flask-cors`
- Verify `CORS(app)` in `app.py`

### Database Issues

**Problem: "password authentication failed"**

Solution:
```bash
# Reset PostgreSQL password
psql postgres
ALTER USER your_username WITH PASSWORD 'new_password';
\q

# Update app.py with new password
```

**Problem: Cannot connect to PostgreSQL**

Solution:
```bash
# macOS:
brew services restart postgresql

# Linux:
sudo service postgresql restart

# Check if PostgreSQL is running:
ps aux | grep postgres
```

### General Issues

**Problem: Port 5000 or 5173 already in use**

Solution:
```bash
# Find process using port
lsof -i :5000  # or :5173

# Kill the process
kill -9 <PID>
```

**Problem: Changes not reflecting**

Solution:
- Frontend: Vite hot-reloads automatically. If not, restart with `npm run dev`
- Backend: Restart Flask with `python app.py`
- Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## Additional Notes

- **Environment Files:** `.env` files contain sensitive information. Never commit them to Git.
- **Virtual Environment:** Always activate `venv` before running Flask commands.
- **Hot Reloading:** Vite provides instant hot module replacement for React.
- **API Endpoints:** All backend routes are prefixed with `/` (e.g., `/signup`, `/signin`).
- **Database Migrations:** If you change models, drop and recreate tables or use migrations.

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review backend terminal for Flask errors
3. Check browser console (F12) for frontend errors
4. Verify database connection: `psql -U your_username -d plan_a_gator_db`

---

## License

This project is licensed under the MIT License.
```

---