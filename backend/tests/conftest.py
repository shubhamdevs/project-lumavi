import pytest
import pytest_asyncio
import httpx
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from google.cloud.sql.connector import create_async_connector, IPTypes
from app.main import app
from app.db.connection import get_db, Base
from app.config import get_settings

@pytest_asyncio.fixture(scope="session")
async def test_engine():
    settings = get_settings()
    connector = await create_async_connector()

    async def get_conn():
        return await connector.connect_async(
            settings.db_instance_connection_name,
            "asyncpg",
            user=settings.db_user,
            password=settings.db_password,
            db=settings.db_name,
            ip_type=IPTypes.PUBLIC,
        )

    engine = create_async_engine(
        "postgresql+asyncpg://",
        async_creator=get_conn,
    )
    yield engine
    await engine.dispose()
    await connector.close_async()

@pytest_asyncio.fixture()
async def db_session(test_engine):
    """
    Creates an isolated database session that rolls back after each test.
    This prevents test data from polluting the real database.
    """
    async with test_engine.begin() as conn:
        # Start a nested transaction
        await conn.begin_nested()
        
        async_session = async_sessionmaker(
            bind=conn, 
            expire_on_commit=False, 
            class_=AsyncSession
        )
        
        async with async_session() as session:
            from app.db.models import User
            from sqlalchemy import select
            user_id = "user_test_mock_123"
            existing = await session.get(User, user_id)
            if not existing:
                import uuid
                user = User(id=user_id, email=f"test_{uuid.uuid4()}@example.com", full_name="Test User")
                session.add(user)
                await session.commit()
            
            yield session
            # Rollback to the savepoint
            await session.rollback()

@pytest_asyncio.fixture
async def client(db_session, monkeypatch):
    async def override_get_db():
        yield db_session

    # Safely mock connection.AsyncSessionLocal used directly in webhooks and background tasks
    from app.db import connection
    class MockSessionMaker:
        def __call__(self, *args, **kwargs):
            return self
        async def __aenter__(self):
            return db_session
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass

    monkeypatch.setattr(connection, "AsyncSessionLocal", MockSessionMaker())

    app.dependency_overrides[get_db] = override_get_db
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def mock_user_id():
    return "user_test_mock_123"

@pytest_asyncio.fixture
async def auth_client(client, mock_user_id):
    from app.auth import get_current_user_id
    
    def override_get_user():
        return mock_user_id
        
    app.dependency_overrides[get_current_user_id] = override_get_user
    yield client
    app.dependency_overrides.pop(get_current_user_id, None)
