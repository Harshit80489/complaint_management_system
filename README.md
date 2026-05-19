# AI-Based Smart Complaint Management System

MERN Stack case study project for B.Tech 4th Semester, AI Driven Full Stack Development (AI308B).

## Folder Structure

```text
smart-complaint-management/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      validators/
  frontend/
    src/
```

## Features

- Complaint registration form with name, email, title, description, category, location, and status.
- Complaint list page with category filter and location search.
- Complaint status update page behavior through inline status controls.
- AI analysis result display for priority, department, summary, and auto-response.
- RESTful Express APIs with controllers, routes, middleware, validation, and error handling.
- MongoDB schema with CRUD, filtering, validation, and timestamps.
- JWT authentication, bcrypt password hashing, login, signup, and protected routes.
- Render-ready backend configuration.

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Update `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_secret_key
CLIENT_URL=http://localhost:5173
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=Smart Complaint Management System
```

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Required API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Complaint APIs

- `POST /api/complaints` - Add complaint
- `GET /api/complaints` - Get all complaints
- `PUT /api/complaints/:id` - Update complaint status
- `DELETE /api/complaints/:id` - Delete complaint
- `GET /api/complaints/search?location=Ghaziabad` - Search by location

### AI API

- `POST /api/ai/analyze` - Analyze urgency, department, summary, and response

Protected endpoints require:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Sample Complaint Request

```json
{
  "name": "Rahul Kumar",
  "email": "rahul@gmail.com",
  "title": "Water Leakage Issue",
  "description": "Water pipeline damaged near market area.",
  "category": "Water Supply",
  "location": "Ghaziabad"
}
```

## Test Cases

| Test Case | Expected Output |
| --- | --- |
| Add valid complaint | Complaint stored successfully |
| Missing title field | Validation error |
| Invalid email | Error message |
| Filter by location | Matching complaints displayed |
| Submit complaint from frontend | Data saved successfully |
| Fetch complaints | Complaints displayed |
| Update complaint status | Updated status shown |
| Delete complaint | Complaint removed |
| Water leakage complaint | Water Supply Department suggestion |
| Electricity issue | High priority alert when urgent words are present |
| Garbage complaint | Sanitation Department suggestion |
| Long complaint text | AI-generated summary |
| Valid login | Token generated |
| Invalid password | Unauthorized error |
| Access without token | Access denied |
| Stored password | Encrypted format |

## Render Deployment

1. Push the project to GitHub.
2. Create a new Render Web Service for `backend`.
3. Set root directory to `backend`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.
7. Deploy frontend separately as a static site:
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Add `VITE_API_URL=https://your-backend-url.onrender.com/api`.

## OpenRouter AI Setup

Put the OpenRouter API key only in `backend/.env`, never in the frontend. The backend sends requests to OpenRouter using the `Authorization: Bearer <OPENROUTER_API_KEY>` header through `backend/src/utils/aiAnalyzer.js`.

If `OPENROUTER_API_KEY` is present, the project uses real OpenRouter AI classification. If the key is missing or the API call fails, the project automatically falls back to the built-in rule-based analyzer so the demo still works.

## Notes

The AI analyzer is isolated in `backend/src/utils/aiAnalyzer.js`. It supports OpenRouter plus a deterministic fallback for exam/demo reliability.
