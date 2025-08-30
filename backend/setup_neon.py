#!/usr/bin/env python3
"""
Setup script to help configure Neon database connection for Mily project.
Run this script with Poetry to test your database connection and create initial migrations.

Usage:
    poetry run python setup_neon.py
"""

import os
import sys
import django
from pathlib import Path
from dotenv import load_dotenv
from django.core.management import execute_from_command_line
from django.db import connection

def check_environment():
    """Check if all required environment variables are set."""
    # Load environment variables from the correct path
    env_path = Path(__file__).parent.parent / '.env' / '.env.development'
    load_dotenv(dotenv_path=env_path)

    required_vars = [
        'DATABASE_NAME',
        'DATABASE_USER',
        'DATABASE_PASSWORD',
        'DATABASE_HOST'
    ]

    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease create a .env file with your Neon database credentials.")
        print("Use .env.example as a template.")
        return False

    print("✅ All required environment variables are set.")
    return True

def test_database_connection():
    """Test the database connection."""
    try:
        # Setup Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        django.setup()

        # Test connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()

        if result and result[0] == 1:
            print("✅ Database connection successful!")
            return True
        else:
            print("❌ Database connection test failed.")
            return False

    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

def run_migrations():
    """Run Django migrations."""
    try:
        print("🔄 Running migrations...")
        execute_from_command_line(['manage.py', 'makemigrations', 'mily'])
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrations completed successfully!")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

def main():
    """Main setup function."""
    print("🚀 Setting up Neon database connection for Mily...")
    print("=" * 50)

    # Check environment variables
    if not check_environment():
        sys.exit(1)

    # Test database connection
    if not test_database_connection():
        sys.exit(1)

    # Run migrations
    if not run_migrations():
        sys.exit(1)

    print("\n🎉 Setup completed successfully!")
    print("Your Mily project is now connected to Neon database.")
    print("\nNext steps:")
    print("1. Create a superuser: poetry run python manage.py createsuperuser")
    print("2. Start the development server: poetry run python manage.py runserver")

if __name__ == '__main__':
    main()
