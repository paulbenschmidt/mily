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
