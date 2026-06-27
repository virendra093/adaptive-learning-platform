# CHAPTER 16: HOW TO IMPORT DATABASE

## 16.1 Manual Import via phpMyAdmin
For local development, the easiest way to initialize the database is using XAMPP's graphical interface.

1. **Open XAMPP Control Panel:** Click 'Start' on Apache and MySQL.
2. **Access phpMyAdmin:** Open a browser and go to `http://localhost/phpmyadmin`.
3. **Create Database:** 
   - Click "New" in the left sidebar.
   - Enter `adaptive_learning` as the database name.
   - Set the collation to `utf8mb4_unicode_ci` (for emoji/special character support).
   - Click "Create".
4. **Import SQL File:**
   - Click on the newly created `adaptive_learning` database.
   - Click the "Import" tab at the top.
   - Click "Choose File" and select `backend/database/schema.sql` from your project folder.
   - Scroll down and click "Import".
5. **Verify:** Check the left sidebar to ensure tables like `users`, `questions`, and `test_history` have appeared.

---

# CHAPTER 17: HOW TO DEPLOY

## 17.1 Cloud Architecture Overview
Deploying the platform moves it from `localhost` to the public internet. This requires three distinct cloud services:

1. **Frontend Hosting (Vercel):** Excellent for static Vite/React apps. Provides a CDN edge network.
2. **Backend Hosting (Render/Heroku):** Provides Node.js runtime environments to execute `server.js`.
3. **Database Hosting (Aiven/Railway):** A managed MySQL cluster hosted in the cloud.

## 17.2 Deployment Steps

### Database Deployment (Aiven)
1. Create an account on Aiven.io.
2. Spin up a Free Tier MySQL service.
3. Retrieve the Connection URI (Host, Port, User, Password).
4. Connect to this remote DB using MySQL Workbench or TablePlus and run your `schema.sql` script to build the tables in the cloud.

### Backend Deployment (Render)
1. Push your code to a GitHub repository.
2. Create a "Web Service" on Render.com and link your GitHub repo.
3. Set the Root Directory to `backend/`.
4. Set the Build Command to `npm install`.
5. Set the Start Command to `npm run start` (which maps to `node server.js`).
6. **CRITICAL:** Add all your `.env` variables into Render's "Environment Variables" dashboard. Use the remote Aiven Database credentials here!

### Frontend Deployment (Vercel)
1. Link your GitHub repo to Vercel.
2. Set the Root Directory to `frontend/`.
3. Vercel automatically detects Vite and runs `npm run build`.
4. Add an environment variable (e.g., `VITE_API_BASE_URL`) pointing to your live Render Backend URL (e.g., `https://my-backend.onrender.com/api`).
5. Click Deploy.

---

# CHAPTER 18: ERROR TROUBLESHOOTING

## 18.1 Common Backend Errors

**Error:** `MySQL ETIMEDOUT` or `ECONNREFUSED`
- **Cause:** The Node server cannot reach the MySQL database.
- **Solution:** If local, ensure XAMPP MySQL is running. If cloud, check if the Aiven/Railway database is paused or if the IP is whitelisted.

**Error:** `JWT Error: jwt expired` or `invalid signature`
- **Cause:** The user's login session timed out, or the `JWT_SECRET` in the `.env` file was changed.
- **Solution:** Force the user to log out and log back in to generate a fresh token.

**Error:** `CORS Error: Blocked by CORS policy`
- **Cause:** The frontend is trying to call the backend from an unauthorized domain.
- **Solution:** Check `server.js` and ensure `cors({ origin: 'YOUR_FRONTEND_URL' })` matches exactly, including `http` vs `https`.

**Error:** `Error: Cannot find module 'express'`
- **Cause:** `node_modules` is missing.
- **Solution:** Run `npm install` inside the `backend` folder.

**Error:** `EADDRINUSE: address already in use :::5000`
- **Cause:** Another terminal window or hidden Node process is already running the backend.
- **Solution:** Kill the terminal, or open Task Manager / Activity Monitor and force quit all `node.js` processes.

---

# CHAPTER 19: TESTING

## 19.1 Testing Strategies

- **Unit Testing:** Testing isolated functions (e.g., ensuring `calculateDifficulty(20, 5)` returns the exact mathematical float expected). Tools: Jest, Mocha.
- **Integration Testing:** Testing if the `adaptiveEngineService` successfully talks to the `mysql2` database and returns an array. Tools: Supertest.
- **System Testing:** Testing the entire flow from clicking "Login" in React to receiving the JWT from Node.
- **Security Testing:** Attempting SQL Injection (e.g., inputting `' OR 1=1 --`) in login fields to ensure the backend uses parameterized queries.
- **Performance Testing:** Using Apache JMeter to simulate 100 students taking a test simultaneously to check connection pool latency.

## 19.2 Sample Test Case
**Test ID:** TC_01
**Module:** Authentication
**Description:** Verify Student Login with Valid Credentials.
**Steps:**
1. Navigate to `/login`.
2. Enter valid email and password.
3. Click "Submit".
**Expected Result:** System generates JWT, stores it in Context, and redirects to `/dashboard`. HTTP 200 OK received.

---

# CHAPTER 20: PROJECT FLOW

## 20.1 End-to-End Functional Flow

1. **User Registration:** Student enters details. Backend hashes password via `bcrypt` and inserts into `users`.
2. **Authentication:** Student logs in. Backend verifies hash, signs a `JWT`, and sends it to the Frontend.
3. **General Assessment:** The gateway exam. The UI forces a 15-question static quiz. The backend scores it and initializes the `user_progress` knowledge matrix.
4. **Dashboard:** Reads from `user_progress` to populate charts.
5. **Recommendation Engine:** Scans `user_progress` for scores < 50% and suggests targeted practice tests.
6. **Adaptive Test Loop:**
   - Fetches a question matching the current proficiency.
   - Student answers.
   - `adaptiveEngineService` updates proficiency dynamically.
7. **Question Intelligence:** If questions run low, the Blueprint Engine generates mathematically unique JSON permutations and inserts them into the DB invisibly.
8. **Performance Analysis:** The `AnalyticsEngine` categorizes the student (e.g., "Speed Demon") based on reaction times and feeds this to the UI.

---

# CHAPTER 21: CODE EXPLANATION

## 21.1 Execution Flow Conceptually

**How Express Starts:**
When you run `node server.js`, Node executes the script top-to-bottom. It imports Express, parses `.env` variables, and sets up middleware. Finally, it hits `app.listen(PORT)`, which tells the operating system to open a network socket on Port 5000 and wait for incoming TCP HTTP packets.

**How React Loads:**
When you navigate to `localhost:5173`, the Vite server sends a generic `index.html` file to your browser, containing an empty `<div id="root"></div>` and a `<script>` tag referencing `main.jsx`. The browser executes the JavaScript, which renders the entire UI inside that empty div.

**How Authentication Works (JWT):**
When a user logs in successfully, the server creates a JSON string containing `{"id": 12, "role": "student"}`. It encrypts this using the secret key into a hash (the JWT). The frontend saves this hash. On every subsequent API call, the frontend attaches this hash in the Header. The server decrypts it, verifies the secret key matches, and immediately knows "User 12 is making this request" without needing to query the database for a session ID.

**How SQL Queries Execute:**
Instead of `SELECT * FROM users WHERE email = 'test@test.com'`, the code uses parameterized queries: `SELECT * FROM users WHERE email = ?`. The `mysql2` driver sends the query and the string separately to the MySQL server. This completely prevents SQL Injection, because the database treats the input strictly as a string literal, not as executable code.
