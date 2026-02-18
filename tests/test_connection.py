"""Tests for WebSocket connection management via the CLI tool."""

import asyncio
import json
import subprocess
import time

import pytest
import websockets


# ===== Unit Tests: Basic Connection =====

@pytest.mark.asyncio
async def test_connect_to_echo_server(echo_server):
    """Test that a WS client can connect, send, and receive from the echo server."""
    async with websockets.connect(echo_server.url) as ws:
        await ws.send("hello")
        response = await ws.recv()
        assert response == "echo:hello"


@pytest.mark.asyncio
async def test_connect_multiple_messages(echo_server):
    """Test sending multiple messages in sequence."""
    async with websockets.connect(echo_server.url) as ws:
        messages = ["msg1", "msg2", "msg3", '{"key": "value"}']
        for msg in messages:
            await ws.send(msg)
            response = await ws.recv()
            assert response == f"echo:{msg}"


@pytest.mark.asyncio
async def test_connect_to_invalid_url():
    """Test that connecting to an invalid URL raises an error."""
    with pytest.raises(Exception):
        async with websockets.connect("ws://127.0.0.1:1"):
            pass


@pytest.mark.asyncio
async def test_connect_disconnect(echo_server):
    """Test clean connect/disconnect cycle."""
    ws = await websockets.connect(echo_server.url)
    # websockets v15: use state instead of .open/.closed
    from websockets.protocol import State
    assert ws.state is State.OPEN
    await ws.close()
    assert ws.state is State.CLOSED


@pytest.mark.asyncio
async def test_multiple_concurrent_connections(echo_server):
    """Test multiple simultaneous connections to the server."""
    connections = []
    for _ in range(5):
        ws = await websockets.connect(echo_server.url)
        connections.append(ws)

    from websockets.protocol import State
    assert all(ws.state is State.OPEN for ws in connections)

    # Each connection should work independently
    for i, ws in enumerate(connections):
        await ws.send(f"conn-{i}")
        resp = await ws.recv()
        assert resp == f"echo:conn-{i}"

    for ws in connections:
        await ws.close()


@pytest.mark.asyncio
async def test_large_message(echo_server):
    """Test sending a large message."""
    large_msg = "x" * 100_000
    async with websockets.connect(echo_server.url) as ws:
        await ws.send(large_msg)
        response = await ws.recv()
        assert response == f"echo:{large_msg}"


@pytest.mark.asyncio
async def test_json_message(echo_server):
    """Test sending and receiving JSON messages."""
    payload = {"type": "test", "data": {"nested": True, "count": 42}}
    async with websockets.connect(echo_server.url) as ws:
        await ws.send(json.dumps(payload))
        response = await ws.recv()
        assert response.startswith("echo:")
        echoed = json.loads(response[5:])
        assert echoed == payload


# ===== Integration Tests: CLI Commands =====

def test_cli_help(ws_tester_bin):
    """Test that the CLI shows help text."""
    result = subprocess.run(
        ["node", ws_tester_bin, "--help"],
        capture_output=True, text=True, timeout=10
    )
    assert result.returncode == 0
    assert "ws-tester" in result.stdout
    assert "connect" in result.stdout
    assert "send" in result.stdout
    assert "record" in result.stdout
    assert "replay" in result.stdout
    assert "loadtest" in result.stdout
    assert "validate" in result.stdout


def test_cli_version(ws_tester_bin):
    """Test that the CLI shows version."""
    result = subprocess.run(
        ["node", ws_tester_bin, "--version"],
        capture_output=True, text=True, timeout=10
    )
    assert result.returncode == 0
    assert "1.0.0" in result.stdout


def test_cli_connect_help(ws_tester_bin):
    """Test that connect subcommand shows help."""
    result = subprocess.run(
        ["node", ws_tester_bin, "connect", "--help"],
        capture_output=True, text=True, timeout=10
    )
    assert result.returncode == 0
    assert "url" in result.stdout.lower()


def test_cli_send_help(ws_tester_bin):
    """Test that send subcommand shows help."""
    result = subprocess.run(
        ["node", ws_tester_bin, "send", "--help"],
        capture_output=True, text=True, timeout=10
    )
    assert result.returncode == 0
    assert "--message" in result.stdout


def test_cli_loadtest_help(ws_tester_bin):
    """Test that loadtest subcommand shows help."""
    result = subprocess.run(
        ["node", ws_tester_bin, "loadtest", "--help"],
        capture_output=True, text=True, timeout=10
    )
    assert result.returncode == 0
    assert "--connections" in result.stdout
    assert "--duration" in result.stdout


def test_cli_validate_help(ws_tester_bin):
    """Test that validate subcommand shows help."""
    result = subprocess.run(
        ["node", ws_tester_bin, "validate", "--help"],
        capture_output=True, text=True, timeout=10
    )
    assert result.returncode == 0
    assert "--schema" in result.stdout
