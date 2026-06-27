# CHAPTER 5: DATABASE DOCUMENTATION

## 5.1 Database Overview
The platform utilizes a highly normalized MySQL database to ensure data integrity and support complex analytical querying. Strict Foreign Key constraints with `ON DELETE CASCADE` ensure that deleting a user or a test automatically scrubs all related historical records.

## 5.2 Core Tables Explained

### 5.2.1 `users`
- **Purpose:** Stores authentication credentials and role assignments.
- **Columns:** `id` (PK), `name`, `email` (Unique), `password_hash`, `role` (ENUM: 'student', 'admin', 'superadmin'), `created_at`.
- **Relationships:** Referenced heavily across all progress and history tables.

### 5.2.2 `student_profiles`
- **Purpose:** Extended profile specific to students.
- **Columns:** `user_id` (PK/FK), `university`, `degree`, `graduation_year`, `target_companies`, `general_assessment_completed`.
- **Relationships:** 1-to-1 mapping with `users`.

### 5.2.3 `questions`
- **Purpose:** The central repository for all test items.
- **Columns:** `id` (PK), `text` (The actual question), `category` (e.g., 'Quantitative Aptitude'), `difficulty` (ENUM: 'easy', 'medium', 'hard'), `estimated_solving_time` (seconds), `bloom_taxonomy` (e.g., 'analyze'), `question_source_category`.
- **Relationships:** Source for `question_options` and target of `question_history`.

### 5.2.4 `question_options`
- **Purpose:** Stores the multiple-choice options for a question.
- **Columns:** `id` (PK), `question_id` (FK), `option_text`, `is_correct` (BOOLEAN).
- **Business Logic:** One question can have multiple options, but only one (usually) `is_correct = TRUE`.

### 5.2.5 `tests`
- **Purpose:** Represents a logical test session initiated by a user.
- **Columns:** `id` (PK), `user_id` (FK), `test_type` (ENUM: 'general', 'adaptive'), `start_time`, `end_time`, `score`, `status` (ENUM: 'in_progress', 'completed').
- **Business Logic:** Tracks the lifecycle of an exam instance.

### 5.2.6 `question_history`
- **Purpose:** A massive ledger logging every single question attempted by any student. This powers the Analytics and Learning Personas.
- **Columns:** `id` (PK), `user_id` (FK), `test_id` (FK), `question_id` (FK), `response_time_ms`, `is_correct` (BOOLEAN), `served_at`.

### 5.2.7 `user_progress` (Knowledge State)
- **Purpose:** The real-time cognitive mapping matrix.
- **Columns:** `user_id` (PK/FK), `topic_id` (PK/FK), `proficiency_score` (FLOAT), `questions_attempted`, `questions_correct`.
- **Business Logic:** The `proficiency_score` fluctuates up and down algorithmically after every test based on Item Response Theory concepts.

### 5.2.8 `blueprint_generation_history`
- **Purpose:** Cryptographic hash tracking to prevent algorithmic duplicate questions.
- **Columns:** `question_hash` (PK, SHA-256 string), `blueprint_id` (FK), `question_id` (FK), `variable_set` (JSON).

---

# CHAPTER 6: APPLICATION WORKFLOW

## 6.1 The Student Journey

1. **Registration & Onboarding:**
   - The student registers an account (`users` table).
   - They complete a profile specifying their degree and target companies.
   
2. **General Baseline Assessment:**
   - The system recognizes `general_assessment_completed = FALSE`.
   - The student is forced to take a static, 15-question diagnostic test containing a mix of Easy, Medium, and Hard questions across all domains.
   - **Outcome:** The `user_progress` table is initialized with baseline proficiency scores.

3. **Dashboard & Analytics:**
   - The student is redirected to the main Dashboard.
   - Analytics Engine reads `question_history` and `user_progress` to render graphs showing their strongest and weakest topics.

4. **Recommendation Engine Processing:**
   - The Engine identifies the weakest topic (e.g., "Percentages").
   - It pushes a "Recommended Practice" card to the UI.

5. **Live Adaptive Test Loop:**
   - Student clicks "Start Adaptive Test" for Percentages.
   - Frontend requests `GET /api/tests/adaptive?topic=Percentages`.
   - Backend queries the student's mastery score (e.g., 40%).
   - Backend fetches a 'Medium' difficulty question.
   - Student answers in 15 seconds (correctly).
   - Frontend POSTs the result.
   - Backend increments mastery score to 45%.
   - Backend fetches a slightly harder question for the next round.
   - Loop continues until 10 questions are answered.

6. **Blueprint Generation (Background):**
   - If the Adaptive Engine realizes the `questions` table is running low on unused "Percentages" questions for this student, it triggers the Blueprint Engine.
   - The Engine compiles 25 brand-new, unique Percentage questions and injects them into the database silently.

7. **Learning Persona Evolution:**
   - After several tests, the Behavioral Service analyzes `response_time_ms`.
   - The student is classified (e.g., "Fast but Careless").
   - UI updates to display targeted advice.

---

# CHAPTER 7: FRONTEND DOCUMENTATION

## 7.1 Architecture & State Management
The React frontend avoids overly complex state managers like Redux in favor of React's native `Context API` and custom Hooks.
- **AuthContext:** Wraps the entire application. It verifies the JWT token stored in `localStorage` on initial mount. If valid, it fetches the user profile and exposes `user`, `login()`, and `logout()` to all child components.
- **Routing:** Handled by `react-router-dom`. Routes are protected by a `<RoleRoute>` wrapper component. If a student tries to access `/admin`, the wrapper intercepts the render and redirects them to `/unauthorized`.

## 7.2 UI/UX Design System
The platform utilizes **Tailwind CSS** alongside a "Glassmorphism" aesthetic.
- **GlassCard.jsx:** A reusable component applying `backdrop-blur`, semi-transparent backgrounds, and subtle borders.
- **Micro-interactions:** Hover states (`hover:scale-105`), smooth transitions (`transition-all duration-300`), and loading spinners ensure the app feels dynamic and "alive", crucial for keeping students engaged during stressful tests.

## 7.3 Critical Components

### `TestArena.jsx`
- Manages the active test state.
- Utilizes `useEffect` to trigger a countdown timer.
- Prevents page reloads and tab-switching (anti-cheat UI).

### `Charts.jsx` (Recharts Integration)
- Maps backend time-series JSON arrays into `<LineChart>` and `<RadarChart>` components.
- Dynamically colors radar domains based on the user's proficiency metric.

---

# CHAPTER 8: BACKEND DOCUMENTATION

## 8.1 Express Application Structure
The backend is fundamentally an Express HTTP server. It follows the **Controller-Service-Repository** pattern.

- **`server.js`:** The entry point. It requires `dotenv`, configures `express.json()` payload parsing, configures `cors` for cross-origin requests from the React frontend, and maps high-level URL paths (e.g., `app.use('/api/auth', authRoutes)`).

## 8.2 The Middleware Layer
Middleware functions intercept HTTP requests before they reach the controller.
- **`authMiddleware.js`:** Extracts the `Authorization: Bearer <token>` header. It uses `jwt.verify()` to decode the token. If valid, it attaches the decoded `req.user` object to the request.
- **`roleMiddleware.js`:** Checks if `req.user.role === 'admin'`. If not, returns a 403 Forbidden HTTP status.

## 8.3 The Service Layer (The Brains)
Business logic is strictly decoupled from HTTP request handling.
- **`adaptiveEngineService.js`:** Contains functions like `calculateNextDifficulty(currentScore, timeTaken)`.
- **`blueprintEngine/GeneratorEngine.js`:** Reads a `.json` rule file, parses strings like `{X} + {Y}`, executes `Math.random()`, and spits out a compiled object containing the question string and 4 mathematical options.

---

# CHAPTER 9: API DOCUMENTATION

## 9.1 Authentication API

### POST `/api/auth/login`
- **Purpose:** Authenticate a user and issue a JWT.
- **Request Body:** `{ "email": "student@test.com", "password": "password123" }`
- **Logic:** Queries `users` table -> bcrypt.compare() -> jwt.sign().
- **Response (200 OK):** `{ "token": "eyJhb...", "user": { "id": 1, "role": "student" } }`
- **Error (401):** `{ "error": "Invalid credentials" }`

## 9.2 Test Generation API

### GET `/api/tests/generate/adaptive`
- **Purpose:** Fetches a dynamic set of questions tailored to the user.
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?topic=Percentages`
- **Logic:** Service layer reads `user_progress`, calculates target difficulty, selects 10 unattempted questions from DB.
- **Response (200 OK):** `{ "test_id": 45, "questions": [ { "id": 12, "text": "What is 20% of 80?", "options": [...] } ] }`

## 9.3 Analytics API

### GET `/api/analytics/persona`
- **Purpose:** Fetches the behavioral classification for the dashboard.
- **Logic:** Aggregates `response_time_ms` across all rows in `question_history` for `req.user.id`. Applies standard deviation mapping to classify into Enum personas.
- **Response (200 OK):** `{ "persona": "Methodical Analyst", "avgTime": 45000, "accuracy": 82.5 }`
