# Mily Backend

Backend built with Django REST Framework and Poetry.

## Prerequisites

- Python 3.12+
- Poetry (for dependency management)
- Neon PostgreSQL database

## Setup

### 1. Install Poetry

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

### 2. Install Dependencies

```bash
cd backend
poetry install
```

### 3. Configure Environment Variables

Copy the environment template and update database credentials:
```bash
cp ../.env/.envtemplate ../.env/.env.local
```

### 4. Setup Database

Run the automated setup script:
```bash
poetry run python setup_neon.py
```

This will:
- Test your database connection
- Run initial migrations
- Set up your database tables

### 5. Create Superuser (Optional)

```bash
poetry run python manage.py createsuperuser
```

### 6. Start Development Server

```bash
poetry run python manage.py runserver localhost:8000
```
The development server will run at http://localhost:8000 so that it is run on the same root port as the front-end (so that cookies are shared for authentication).

## Development

### Running Commands

All Django commands should be prefixed with `poetry run`:

```bash
# Run migrations
poetry run python manage.py migrate

# Create new migrations
poetry run python manage.py makemigrations

# Start shell
poetry run python manage.py shell

# Run tests (using local SQLite DB)
poetry run python manage.py test
```

## Project Structure

```
backend/
├── config/         # Django project configuration
├── mily/           # Main application logic
├── pyproject.toml  # Poetry dependencies and configuration
└── manage.py       # Django management script
```

## Authentication

This project uses JWT-based authentication with httpOnly cookies for API requests and session-based authentication for the Django admin interface. JWTs are used for API requests because they are mobile-ready and stateless (don't require a server-side session); additionally, the web client uses httpOnly cookies for authentication for extra security.

### Authentication Flow

**Initial Setup (App Load):**
1. Frontend calls `/auth/csrf-token/` to initialize CSRF protection
2. Backend sets `csrftoken` cookie (httpOnly=False, so JavaScript can read it)

**Login:**
1. User submits credentials to `/auth/login/`
2. Backend validates credentials and generates JWT tokens
3. Backend sets httpOnly cookies: `access_token` and `refresh_token`
4. Frontend stores user data in React context

**Authenticated Requests:**
1. Browser automatically includes `access_token` cookie with every request
2. Frontend manually adds `X-CSRFToken` header for POST/PUT/PATCH/DELETE requests
3. Backend's custom `CookieJWTAuthentication` class in `mily/authentication.py` reads JWT from cookie (for web clients) or Authorization header (for mobile clients)
4. Backend's `CsrfViewMiddleware` validates CSRF token

**Token Refresh:**
1. When `access_token` expires (401 response), frontend automatically calls `/auth/token/refresh/`
2. Backend validates `refresh_token` cookie and issues new `access_token`
3. Request is retried with new token

**Logout:**
1. Frontend calls `/auth/logout/`
2. Backend clears authentication cookies
3. Frontend redirects to login

### Security Features
- **httpOnly cookies**: JWT tokens inaccessible to JavaScript (XSS protection)
- **CSRF protection**: All state-changing requests require valid CSRF token
- **Secure cookies**: In production, cookies only sent over HTTPS
- **SameSite=Lax**: Additional CSRF protection
- **Dual authentication support**: Cookie-based (web) or Authorization header (mobile)

## Database
See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for detailed model specifications and relationships.

## Deployment
The backend is automatically deployed to Railway when you push to the `main` branch. Railway files required for deployment are:
- `railway.json`
- `requirements.txt`

> Ideally, the requirements would be determined automatically from the `pyproject.toml` file, but I'm not sure how to do that, so for now, run the commands:
```
poetry export -f requirements.txt --output requirements.txt --without-hashes --without dev
sed -i '' 's/ ;.*$//' requirements.txt # remove python version constraints
```

The deployment script includes `python manage.py collectstatic --noinput` and `python manage.py migrate` to ensure that the database is up to date and static files are collected (which are required for the admin interface).

Once deployed, you will need to:
1. ensure to set the `Root Directory` in the deployment's settings to `backend`
2. upload the `.env.production` file to the deployment's environment variables
