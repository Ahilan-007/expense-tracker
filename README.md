# Expense Tracker

A simple web-based **Expense Tracker** application built with **React** (frontend) and **Node.js + Express + MongoDB** (backend).  
Track, manage, and visualize your expenses with charts and filters.

---

## Features

- User Authentication (Login/Register)
- Add, Edit, and Delete Expenses
- Filter expenses by Week, Month, or All
- Dashboard with:
  - Total Expenses
  - Monthly Expenses
  - Line Chart (Cash Flow)
  - Pie Chart (Expense Breakdown)
- Undo deleted expense feature
- Clean, responsive UI with blue & white theme
- Protected routes (only logged-in users can access the dashboard)

---

## Tech Stack

**Frontend:**
- React
- React Router
- Tailwind CSS
- Chart.js

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication

---

## Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Ahilan-007/expense-tracker.git
cd expense-tracker
Install dependencies:

Backend:

cd backend
npm install


Frontend:

cd ../frontend
npm install


Environment Variables:

Create a .env file in backend/ and add:

MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key


Run the project:

Backend:

cd backend
npm start


Frontend:

cd frontend
npm run dev


The app should now be running at http://localhost:5173 (or your terminal’s dev server URL).

License

This project is open source and free to use.

Author

Ahilan
