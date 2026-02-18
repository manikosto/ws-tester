"""Shared fixtures for WebSocket Connection Tester tests."""

import asyncio
import json
import os
import subprocess
import tempfile
import time

import pytest
import websockets
from websockets.asyncio.server import serve


# ---------- Echo WS Server Fixture ----------

class EchoServer:
    """A simple WebSocket echo server for testing."""

    def __init__(self, host: str = "127.0.0.1", port: int = 0):
        self.host = host
        self.port = port
        self._server = None
        self._task = None
        self._messages_received: list[str] = []

    async def _handler(self, websocket):
        """Echo every message back, prefixed with 'echo:'."""
        async for message in websocket:
            self._messages_received.append(message)
            await websocket.send(f"echo:{message}")

    async def start(self):
        self._server = await serve(self._handler, self.host, self.port)
        # Get the actual port assigned
        self.port = self._server.sockets[0].getsockname()[1]

    async def stop(self):
        if self._server:
            self._server.close()
            await self._server.wait_closed()

    @property
    def url(self) -> str:
        return f"ws://{self.host}:{self.port}"

    @property
    def messages_received(self) -> list[str]:
        return self._messages_received


class DelayServer:
    """WS server that delays responses for latency testing."""

    def __init__(self, delay_ms: int = 100, host: str = "127.0.0.1", port: int = 0):
        self.host = host
        self.port = port
        self.delay_ms = delay_ms
        self._server = None

    async def _handler(self, websocket):
        async for message in websocket:
            await asyncio.sleep(self.delay_ms / 1000)
            await websocket.send(f"delayed:{message}")

    async def start(self):
        self._server = await serve(self._handler, self.host, self.port)
        self.port = self._server.sockets[0].getsockname()[1]

    async def stop(self):
        if self._server:
            self._server.close()
            await self._server.wait_closed()

    @property
    def url(self) -> str:
        return f"ws://{self.host}:{self.port}"


class SchemaValidatingServer:
    """WS server that validates messages against a JSON schema and responds with validation result."""

    def __init__(self, schema: dict, host: str = "127.0.0.1", port: int = 0):
        self.host = host
        self.port = port
        self.schema = schema
        self._server = None

    async def _handler(self, websocket):
        import jsonschema

        async for message in websocket:
            try:
                data = json.loads(message)
                jsonschema.validate(instance=data, schema=self.schema)
                await websocket.send(json.dumps({"valid": True}))
            except jsonschema.ValidationError as e:
                await websocket.send(json.dumps({"valid": False, "error": str(e.message)}))
            except json.JSONDecodeError:
                await websocket.send(json.dumps({"valid": False, "error": "Invalid JSON"}))

    async def start(self):
        self._server = await serve(self._handler, self.host, self.port)
        self.port = self._server.sockets[0].getsockname()[1]

    async def stop(self):
        if self._server:
            self._server.close()
            await self._server.wait_closed()

    @property
    def url(self) -> str:
        return f"ws://{self.host}:{self.port}"


# ---------- Pytest Fixtures ----------

@pytest.fixture
async def echo_server():
    """Start an echo WS server, yield it, then clean up."""
    server = EchoServer()
    await server.start()
    yield server
    await server.stop()


@pytest.fixture
async def delay_server():
    """Start a delayed-response WS server."""
    server = DelayServer(delay_ms=50)
    await server.start()
    yield server
    await server.stop()


@pytest.fixture
async def schema_server():
    """Start a schema-validating WS server."""
    schema = {
        "type": "object",
        "properties": {
            "type": {"type": "string"},
            "payload": {"type": "object"},
        },
        "required": ["type", "payload"],
    }
    server = SchemaValidatingServer(schema)
    await server.start()
    yield server
    await server.stop()


@pytest.fixture
def project_root() -> str:
    """Return the project root directory."""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@pytest.fixture
def ws_tester_bin(project_root) -> str:
    """Return the path to the ws-tester CLI binary."""
    return os.path.join(project_root, "dist", "index.js")


@pytest.fixture
def tmp_dir():
    """Create a temporary directory for test files."""
    with tempfile.TemporaryDirectory() as d:
        yield d
