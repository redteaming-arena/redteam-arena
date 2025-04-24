import redis.asyncio as redis
from app.core.config import settings

redis_client = redis.Redis(
    host=settings.redis_host,
    port=int(settings.redis_port),
    password=settings.redis_password,
    decode_responses=True
)