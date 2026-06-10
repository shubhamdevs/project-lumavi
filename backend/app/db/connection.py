from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from google.cloud.sql.connector import create_async_connector, IPTypes
from app.config import get_settings

_connector = None
engine = None
AsyncSessionLocal: async_sessionmaker | None = None


class Base(DeclarativeBase):
    pass


async def init_db():
    global _connector, engine, AsyncSessionLocal
    settings = get_settings()
    _connector = await create_async_connector()

    async def get_conn():
        return await _connector.connect_async(
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
        pool_size=5,
        max_overflow=2,
        pool_timeout=30,
        pool_recycle=1800,
    )
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def close_db():
    global _connector, engine
    if engine:
        await engine.dispose()
    if _connector:
        await _connector.close_async()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
