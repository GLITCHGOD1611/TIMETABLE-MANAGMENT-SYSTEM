# Timetable Management System

College administration system for generating weekly class timetables.

The administrator enters teachers, subjects, divisions, classrooms, time slots, and teacher availability. The Node.js backend then generates a conflict-free timetable using a constraint-based backtracking algorithm.

## Tech stack

- Angular 18
- Bootstrap 5
- Node.js + Express.js
- MongoDB + Mongoose
- REST API

## Requirements

- Node.js 18 or later
- MongoDB Community Server running locally
- npm

## MongoDB setup

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service.
3. The default database used by this project is `timetable_management`.

Default connection string:

```
mongodb://127.0.0.1:27017/timetable_management
```

## Backend setup

```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm start
```

Backend runs at `http://localhost:5000`.

Environment variables in `backend/.env`:

- `PORT` - API port, default `5000`
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - secret used to sign login tokens
- `FRONTEND_ORIGIN` - Angular origin, default `http://localhost:4200`

## How to seed data

```bash
cd backend
npm run seed
```

Seed data includes:

- Admin user
- 5 Computer Engineering teachers
- 2 divisions (`SE-A`, `SE-B`)
- 7 subjects per division
- 3 theory rooms and 2 labs
- Monday-Friday, 7 periods per day

Demo login:

- Email: `admin@college.edu`
- Password: `admin123`

## Frontend setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:4200`.

## How to run the project

Open two terminals.

Terminal 1:

```bash
cd backend
npm start
```

Terminal 2:

```bash
cd frontend
npm start
```

Then open `http://localhost:4200`, sign in, and click **Generate Timetable**.

## REST APIs

- `POST /api/auth/login`
- `GET /api/dashboard`
- `/api/teachers`
- `/api/subjects`
- `/api/divisions`
- `/api/classrooms`
- `/api/timeslots`
- `GET /api/timetable`
- `POST /api/timetable/generate`
- `PUT /api/timetable/:id` (manual cell edit with conflict checks)

## Timetable generation

The generator lives in `backend/src/services/timetableGenerator.js`.

It expands each subject into the required weekly lectures, orders the most constrained lectures first, then uses backtracking to assign a day, period, and classroom while enforcing:

- one teacher cannot teach two divisions at the same time
- one classroom cannot be used by two divisions at the same time
- one division cannot have two lectures at the same time
- teacher unavailability
- classroom unavailability / type / capacity
- exact lecture counts

If no valid timetable exists, the API returns an error instead of saving an invalid schedule.

## Manual editing

On the Timetable page, click a cell to change subject, teacher, or classroom. The backend rejects the save if a conflict is found.

## Print

Use the **Print** button on the Timetable page. It opens the browser print dialog with a print-friendly grid.
