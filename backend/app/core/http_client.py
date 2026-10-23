import httpx
from typing import Optional

_client: Optional[httpx.AsyncClient] = None

def get_shared_client() -> httpx.AsyncClient:
    """
    Returns the application-wide shared httpx.AsyncClient instance.
    Uses connection pooling, keep-alive, and strict timeouts (5-8s).
    """
    global _client
    if _client is None or _client.is_closed:
        limits = httpx.Limits(max_keepalive_connections=50, max_connections=100, keepalive_expiry=30.0)
        timeout = httpx.Timeout(timeout=7.0, connect=5.0, read=7.0, write=5.0)
        _client = httpx.AsyncClient(limits=limits, timeout=timeout)
    return _client

async def close_shared_client():
    """Closes the shared HTTP client gracefully during application shutdown."""
    global _client
    if _client is not None and not _client.is_closed:
        await _client.aclose()
        _client = None
