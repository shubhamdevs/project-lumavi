import asyncio
import os
import sys
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from google.cloud.sql.connector import create_async_connector, IPTypes

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.models import Base
from app.config import get_settings

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


async def run_migrations_online():
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

    engine = create_async_engine("postgresql+asyncpg://", async_creator=get_conn)

    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await engine.dispose()
    await connector.close_async()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    raise NotImplementedError("Offline migrations not supported")
else:
    asyncio.run(run_migrations_online())
