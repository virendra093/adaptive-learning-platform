# CHAPTER 10: DATABASE CONNECTION

## 10.1 Connection Flow
The backend connects to MySQL not directly, but via a highly efficient Connection Pool managed by the `mysql2` package.

1. **Environment Initialization:** On startup, `dotenv.config()` is called in `server.js`. It loads variables like `DB_HOST`, `DB_USER`, and `DB_PASSWORD` into Node's `process.env`.
2. **Pool Creation:** In `config/db.js`, `mysql.createPool()` is invoked using the env variables. A "Pool" maintains multiple concurrent connections to the database (usually 10-20 by default).
3. **Query Execution:** When an API route calls a service, the service does not open a new connection. It calls `pool.query('SELECT * FROM users')`. The pool lends an available connection, executes the SQL, and immediately returns the connection to the pool.
4. **Promise Wrapper:** The `mysql2/promise` wrapper allows us to use modern `async/await` syntax instead of messy callback functions.

## 10.2 Why a Connection Pool?
Without a pool, every single HTTP request would require a TCP handshake and MySQL authentication handshake, which takes around 50-100ms. A pool keeps connections "warm" and open, dropping latency to ~1ms. This is critical for the Adaptive Engine, which must rapidly fetch questions based on real-time calculations.

---

# CHAPTER 11: FRONTEND TO BACKEND CONNECTION

## 11.1 The API Lifecycle

1. **User Action:** The student clicks "Submit Answer" on the React UI.
2. **Axios Interception:** The `api.js` Axios instance intercepts the request. It grabs the JWT token from `localStorage` and attaches it to the `Authorization` header.
3. **HTTP POST:** Axios serializes the JavaScript object `{ answer_id: 4 }` into JSON and sends an HTTP POST request to `http://localhost:5000/api/tests/submit`.
4. **Express Parsing:** The Express server receives the HTTP request. `express.json()` parses the JSON body back into a JavaScript object (`req.body`).
5. **Middleware Validation:** The request passes through `authMiddleware.js`. The JWT is decrypted. The `req.user.id` is attached.
6. **Controller & Service:** The `testController` calls `adaptiveEngineService.processAnswer()`.
7. **Database Transaction:** The service updates `user_progress` via a SQL UPDATE statement.
8. **JSON Response:** Express executes `res.status(200).json({ success: true, newScore: 45 })`.
9. **React Re-render:** The Axios Promise resolves on the frontend. React state is updated (`setScore(45)`), causing the DOM to visually re-render the new score in real-time.

---

# CHAPTER 12: PROJECT EXECUTION GUIDE

## Step 1: Clone Repository
```bash
git clone https://github.com/your-username/adaptive-learning-platform.git
cd adaptive-learning-platform
```

## Step 2: Install Node.js
Ensure Node.js (v18+ recommended) is installed. Verify by running `node -v` in the terminal.

## Step 3: Install XAMPP
Download and install XAMPP for Windows/Mac to run a local MySQL/MariaDB server easily.

## Step 4: Start Apache & MySQL
Open the XAMPP Control Panel and click "Start" next to Apache and MySQL. The MySQL port should show `3306`.

## Step 5: Import SQL Database
1. Open your browser and navigate to `http://localhost/phpmyadmin`.
2. Click "New" to create a database named `adaptive_learning`.
3. Click on the new database, go to the "Import" tab, and upload `backend/database/schema.sql`.

## Step 6: Configure `.env`
Navigate to the `backend` folder and create a `.env` file:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=adaptive_learning
JWT_SECRET=super_secret_jwt_key_12345
```

## Step 7: Install Backend Packages
```bash
cd backend
npm install
```

## Step 8: Run Backend Server
```bash
npm run dev
```
You should see: `Server running on port 5000`.

## Step 9: Install Frontend Packages
Open a new terminal window:
```bash
cd frontend
npm install
```

## Step 10: Run Frontend Server
```bash
npm run dev
```
You should see a Vite URL like `http://localhost:5173`.

## Step 11: Open Browser
Navigate to `http://localhost:5173` in Chrome. You can now register a new student account!

---

# CHAPTER 13: HOW FRONTEND CONNECTS TO BACKEND

## 13.1 Cross-Origin Resource Sharing (CORS)
Because the Frontend runs on Port `5173` and the Backend on Port `5000`, browsers will block API calls due to security policies. 
We resolve this using the `cors` package in Express:
```javascript
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
```

## 13.2 Axios Base URL Config
Instead of typing `http://localhost:5000/api/...` everywhere in React, we create a centralized API service:
```javascript
// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

export default api;
```
Now, React components simply call `api.get('/questions')`.

---

# CHAPTER 14: HOW DATABASE CONNECTS

## 14.1 Transaction Flow
When complex actions occur (e.g., submitting a test), multiple tables must be updated simultaneously (inserting into `question_history` AND updating `user_progress`). If one succeeds and the other fails, the database becomes corrupted.
To prevent this, the connection pool uses SQL Transactions:
```javascript
const connection = await pool.getConnection();
try {
    await connection.beginTransaction();
    // Execute multiple INSERT/UPDATE queries
    await connection.query(...);
    await connection.query(...);
    await connection.commit(); // Save permanently
} catch (error) {
    await connection.rollback(); // Undo everything if ANY error occurs
} finally {
    connection.release(); // Return to pool
}
```

---

# CHAPTER 15: ENVIRONMENT VARIABLES

## 15.1 Purpose of `.env`
Environment variables keep sensitive configuration data out of the source code. This is a critical security practice; hardcoding passwords in GitHub repositories is a massive security risk.

## 15.2 Variable Breakdown
- **PORT:** The port Express listens on (usually 5000).
- **JWT_SECRET:** A cryptographic key used to digitally sign authentication tokens. If a hacker doesn't have this key, they cannot forge a login token.
- **DB_HOST:** The IP or URL of the database server.
- **DB_PORT:** Usually 3306 (MySQL default).
- **DB_NAME:** The specific schema name inside MySQL.
- **DB_USER / DB_PASSWORD:** Authentication credentials for MySQL.
