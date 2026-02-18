"""Tests for load testing functionality."""

import asyncio
import time

import pytest
import websockets


# ===== Unit Tests: Concurrent Connections =====

@pytest.mark.asyncio
async def test_many_concurrent_connections(echo_server):
    """Test opening many concurrent connections (simulates load tester behavior)."""
    num_connections = 50
    connections = []

    for _ in range(num_connections):
        ws = await websockets.connect(echo_server.url)
        connections.append(ws)

    assert len(connections) == num_connections
    from websockets.protocol import State
    assert all(ws.state is State.OPEN for ws in connections)

    for ws in connections:
        await ws.close()


@pytest.mark.asyncio
async def test_concurrent_send_receive(echo_server):
    """Test sending messages from multiple connections concurrently."""
    num_connections = 20
    connections = []

    for _ in range(num_connections):
        ws = await websockets.connect(echo_server.url)
        connections.append(ws)

    # Send from all connections concurrently
    async def send_and_receive(ws, index):
        msg = f"load-{index}"
        await ws.send(msg)
        resp = await ws.recv()
        return resp

    tasks = [send_and_receive(ws, i) for i, ws in enumerate(connections)]
    results = await asyncio.gather(*tasks)

    assert len(results) == num_connections
    for i, resp in enumerate(results):
        assert resp == f"echo:load-{i}"

    for ws in connections:
        await ws.close()


@pytest.mark.asyncio
async def test_connection_timing(echo_server):
    """Test that connection times are measurable."""
    times = []
    for _ in range(10):
        start = time.monotonic()
        ws = await websockets.connect(echo_server.url)
        elapsed = (time.monotonic() - start) * 1000  # ms
        times.append(elapsed)
        await ws.close()

    assert len(times) == 10
    assert all(t >= 0 for t in times)
    avg_time = sum(times) / len(times)
    assert avg_time < 5000  # Should connect in under 5 seconds locally


@pytest.mark.asyncio
async def test_message_throughput(echo_server):
    """Test message throughput measurement."""
    num_messages = 100

    async with websockets.connect(echo_server.url) as ws:
        start = time.monotonic()

        for i in range(num_messages):
            await ws.send(f"throughput-{i}")
            await ws.recv()

        elapsed = time.monotonic() - start

    messages_per_sec = num_messages / elapsed
    assert messages_per_sec > 0
    assert elapsed > 0


@pytest.mark.asyncio
async def test_latency_measurement(delay_server):
    """Test that latency can be measured with a delayed server."""
    latencies = []

    async with websockets.connect(delay_server.url) as ws:
        for i in range(5):
            start = time.monotonic()
            await ws.send(f"latency-{i}")
            await ws.recv()
            latency = (time.monotonic() - start) * 1000  # ms
            latencies.append(latency)

    # Server has 50ms delay, so latency should be >= 50ms (approximately)
    avg_latency = sum(latencies) / len(latencies)
    assert avg_latency >= 40  # Allow some tolerance


@pytest.mark.asyncio
async def test_connection_failure_counting():
    """Test that failed connections are properly counted."""
    failures = 0
    attempts = 5

    for _ in range(attempts):
        try:
            async with websockets.connect("ws://127.0.0.1:1", open_timeout=1):
                pass
        except Exception:
            failures += 1

    assert failures == attempts


@pytest.mark.asyncio
async def test_rapid_connect_disconnect(echo_server):
    """Test rapid connect/disconnect cycles (stress test)."""
    for _ in range(20):
        ws = await websockets.connect(echo_server.url)
        await ws.send("rapid")
        await ws.recv()
        await ws.close()
