# Mily Backend

Personal timeline app backend built with Django REST Framework and Poetry.

## Prerequisites

- Python 3.12+
- Poetry (for dependency management)
- Neon PostgreSQL database

## Setup

### 1. Install Poetry

```bash
# macOS/Linux
curl -sSL https://install.python-poetry.org | python3 -

# Or via pip
pip install poetry
```

### 2. Install Dependencies

```bash
cd backend
poetry install
```

### 3. Configure Environment

1. Copy the environment template:
   ```bash
   cp ../.env/.envtemplate ../.env/.env.development
   ```

2. Edit `../.env/.env.development` with your Neon database credentials:
   ```
   DATABASE_NAME=your_database_name
   DATABASE_USER=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_HOST=your-host.neon.tech
   DATABASE_PORT=5432
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
poetry run python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

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

# Run tests
poetry run pytest
```

## Project Structure

```
backend/
├── config/          # Django project configuration
├── mily/           # Main application logic
├── pyproject.toml  # Poetry dependencies and configuration
└── manage.py       # Django management script
```
