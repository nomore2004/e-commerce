# ProcureX - B2B Procurement & Verification Platform

ProcureX is an enterprise B2B procurement platform designed for business verification, catalog sourcing, supplier auditing, and dispute management.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, Pydantic v2
- **Auth**: JWT (`python-jose`), `passlib[bcrypt]`
- **Frontend** (Upcoming): React + Vite + TypeScript, Ant Design, TanStack Query

---

## Getting Started (Backend)

### 1. Start PostgreSQL with Docker Compose
```bash
docker compose up -d
```

### 2. Configure Environment
A default `.env` is provided for local development. Copy `.env.example` if needed:
```bash
cd backend
cp .env.example .env
```

### 3. Virtual Environment & Dependencies
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Database Migrations
```bash
alembic upgrade head
```

### 5. Seed Database (Admin, Businesses, Complaints)
```bash
python -m scripts.seed
```
This seeds:
- **1 Admin User**: `admin@procurex.com` / `Admin@123456`
- **1 Demo Buyer**: `buyer@procurex.com` / `Buyer@123456`
- **20 Fake Businesses**: 8 pending, 8 verified, 4 rejected
- **10 Complaints**: Linked to businesses across various statuses
- **Initial Audit Log**: Tracking the seed operation

### 6. Run FastAPI Server
```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs (Swagger): `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

### 7. Run Test Suite
```bash
pytest
```
