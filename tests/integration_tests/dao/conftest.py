"""
Fixtures for DAO integration tests.

This module provides fixtures that replicate the unit test behavior by using
an in-memory SQLite database for each test to ensure data isolation and avoid
conflicts between test runs.

Key features:
- In-memory SQLite database created per test
- Proper Flask-SQLAlchemy session patching
- Security manager session handling
- Automatic cleanup after each test
"""

from typing import Generator
from unittest.mock import patch

import pytest
from flask import Flask
from flask_appbuilder.security.sqla.models import User
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from tests.integration_tests.test_app import app as zobi_app
from zobi.extensions import db


@pytest.fixture(scope="module", autouse=True)
def setup_sample_data() -> None:
    """
    Override parent conftest setup_sample_data to prevent loading sample data.

    This prevents the parent conftest from loading CSS templates and other
    sample data that could interfere with DAO integration tests.
    """
    pass


@pytest.fixture
def app() -> Flask:
    """Get the Zobi Flask application instance."""
    return zobi_app


@pytest.fixture
def app_context(app: Flask) -> Generator[Session, None, None]:
    """
    Create an in-memory SQLite database for each test.

    This fixture replicates the unit test behavior by providing a fresh
    in-memory database for each test, ensuring complete data isolation
    and avoiding conflicts between test runs.

    Args:
        app: Flask application instance

    Yields:
        Session: SQLAlchemy session connected to in-memory database
    """
    # Create in-memory SQLite engine with StaticPool to avoid connection issues
    engine = create_engine(
        "sqlite:///:memory:",
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )

    # Create session bound to in-memory database
    session_factory = sessionmaker(bind=engine)
    session = session_factory()

    # Make session compatible with Flask-SQLAlchemy expectations
    session.remove = lambda: None
    session.get_bind = lambda *args, **kwargs: engine

    with app.app_context():
        # Patch db.session to use our in-memory session
        with patch.object(db, "session", session):
            # Import models to ensure they're registered
            from flask_appbuilder.security.sqla.models import User as FABUser

            # Create all tables in the in-memory database
            # Flask-AppBuilder models use a different metadata object
            # We need to create tables from both metadata objects

            # First create Flask-AppBuilder tables (User, Role, etc.)
            FABUser.metadata.create_all(engine)

            # Then create Zobi-specific tables
            db.metadata.create_all(engine)

            try:
                yield session
            finally:
                # Clean up: rollback any pending transactions
                session.rollback()
                session.close()
                engine.dispose()


@pytest.fixture
def user_with_data(app_context: Session) -> Session:
    """
    Create a test user in the database.

    Some DAO tests expect a user with specific attributes to exist.
    This fixture creates that user and returns the database session.

    Args:
        app_context: Database session from app_context fixture

    Returns:
        Session: The same database session with test user created
    """
    # Create test user with expected attributes
    user = User(
        username="testuser",
        first_name="Test",
        last_name="User",
        email="testuser@example.com",
        active=True,
    )
    db.session.add(user)
    db.session.commit()

    return app_context
