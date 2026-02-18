"""Tests for error handling and edge cases."""

import asyncio
import subprocess
import time

import pytest
import websockets
from websockets.asyncio.server import serve


# ===== Server Drop Tests =====

@pytest.mark.asyncio
async def test_server_closes_connection():
    """Test behavior when server forcefully closes the connection."""
    close_after = 2  # close after 2 messages

    async def handler(websocket):
        count = 0
        async for message in websocket:
            count += 1
            await websocket.send(f"msg-{count}")
            if count >= close_after:
                await websocket.close(1000, "Done")
                return

    server = await serve(handler, "127.0.0.1", 0)
    port = server.sockets[0].getsockname()[1]

    async with websockets.connect(f"ws://127.0.0.1:{port}") as ws:
        await ws.send("first")
        resp1 = await ws.recv()
        assert resp1 == "msg-1"

        await ws.send("second")
        resp2 = await ws.recv()
        assert resp2 == "msg-2"

        # Server should close now
        with pytest.raises(websockets.exceptions.ConnectionClosed):
            await ws.send("third")
            await ws.recv()

    server.close()
    await server.wait_closed()


@pytest.mark.asyncio
async def test_connection_timeout():
    """Test that connection to a non-responding port times out."""
    start = time.monotonic()
    with pytest.raises(Exception):
        # Port 9 is discard protocol, should not respond to WS
        async with websockets.connect("ws://192.0.2.1:9", open_timeout=2):
            pass
    elapsed = time.monotonic() - start
    assert elapsed >= 1.5  # Should have waited near the timeout


@pytest.mark.asyncio
async def test_invalid_url_format():
    """Test that an invalid URL raises an error."""
    with pytest.raises(Exception):
        async with websockets.connect("not-a-url"):
            pass


@pytest.mark.asyncio
async def test_connection_refused():
    """Test connection to a port with no server."""
    with pytest.raises(Exception):
        async with websockets.connect("ws://127.0.0.1:1", open_timeout=2):
            pass


@pytest.mark.asyncio
async def test_send_after_disconnect(echo_server):
    """Test that sending after disconnect raises an error."""
    ws = await websockets.connect(echo_server.url)
    await ws.close()

    with pytest.raises(Exception):
        await ws.send("should fail")


@pytest.mark.asyncio
async def test_server_sends_then_drops():
    """Test handling when server sends a message and then drops."""
    async def handler(websocket):
        await websocket.send("surprise!")
        await websocket.close(1001, "Going away")

    server = await serve(handler, "127.0.0.1", 0)
    port = server.sockets[0].getsockname()[1]

    async with websockets.connect(f"ws://127.0.0.1:{port}") as ws:
        msg = await ws.recv()
        assert msg == "surprise!"

    server.close()
    await server.wait_closed()


# ===== CLI Error Handling =====

def test_cli_send_missing_url(ws_tester_bin):
    """Test that send without URL shows error."""
    result = subprocess.run(
        ["node", ws_tester_bin, "send"],
        capture_output=True, text=True, timeout=10
    )
    assert result.returncode != 0


def test_cli_validate_missing_schema(ws_tester_bin):
    """Test that validate without schema shows error."""
    result = subprocess.run(
        ["node", ws_tester_bin, "validate"],
        capture_output=True, text=True, timeout=10
    )
    assert result.returncode != 0


def test_cli_unknown_command(ws_tester_bin):
    """Test that an unknown command shows error."""
    result = subprocess.run(
        ["node", ws_tester_bin, "nonexistent"],
        capture_output=True, text=True, timeout=10
    )
    # Commander shows help for unknown commands
    assert result.returncode != 0 or "unknown" in result.stderr.lower() or "help" in result.stdout.lower()


def test_cli_validate_nonexistent_schema(ws_tester_bin):
    """Test that validate with non-existent schema file fails."""
    result = subprocess.run(
        ["node", ws_tester_bin, "validate", "-s", "/nonexistent/schema.json", "-d", "/nonexistent/data.json"],
        capture_output=True, text=True, timeout=10
    )
    assert result.returncode != 0
