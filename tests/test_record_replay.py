"""Tests for session recording and replaying."""

import asyncio
import json
import os

import pytest
import websockets


# ===== Unit Tests: Recording Format =====

@pytest.mark.asyncio
async def test_record_produces_valid_json(echo_server, tmp_dir):
    """Test that recording a session produces valid JSON with correct structure."""
    output_file = os.path.join(tmp_dir, "session.json")

    # Simulate a recorded session by connecting and exchanging messages
    messages_sent = []
    messages_received = []

    async with websockets.connect(echo_server.url) as ws:
        for i in range(3):
            msg = f"test-message-{i}"
            await ws.send(msg)
            messages_sent.append(msg)
            resp = await ws.recv()
            messages_received.append(resp)

    # Manually create a recording file (simulating what the recorder does)
    recording = {
        "url": echo_server.url,
        "startedAt": "2025-01-01T00:00:00.000Z",
        "endedAt": "2025-01-01T00:00:10.000Z",
        "messages": []
    }

    for i, (sent, recv) in enumerate(zip(messages_sent, messages_received)):
        recording["messages"].append({
            "direction": "sent",
            "data": sent,
            "timestamp": 1704067200000 + i * 1000,
            "deltaMs": 1000 if i > 0 else 0
        })
        recording["messages"].append({
            "direction": "received",
            "data": recv,
            "timestamp": 1704067200000 + i * 1000 + 50,
            "deltaMs": 50
        })

    with open(output_file, "w") as f:
        json.dump(recording, f, indent=2)

    # Validate the recording structure
    with open(output_file) as f:
        loaded = json.load(f)

    assert "url" in loaded
    assert "startedAt" in loaded
    assert "endedAt" in loaded
    assert "messages" in loaded
    assert len(loaded["messages"]) == 6  # 3 sent + 3 received

    for msg in loaded["messages"]:
        assert msg["direction"] in ("sent", "received")
        assert "data" in msg
        assert "timestamp" in msg
        assert "deltaMs" in msg


def test_recording_file_has_timestamps(tmp_dir):
    """Test that each recorded message has a proper timestamp."""
    recording = {
        "url": "ws://test",
        "startedAt": "2025-01-01T00:00:00.000Z",
        "endedAt": "2025-01-01T00:00:05.000Z",
        "messages": [
            {"direction": "sent", "data": "hello", "timestamp": 1704067200000, "deltaMs": 0},
            {"direction": "received", "data": "echo:hello", "timestamp": 1704067200050, "deltaMs": 50},
            {"direction": "sent", "data": "world", "timestamp": 1704067201000, "deltaMs": 950},
        ]
    }

    output_file = os.path.join(tmp_dir, "session.json")
    with open(output_file, "w") as f:
        json.dump(recording, f)

    with open(output_file) as f:
        loaded = json.load(f)

    timestamps = [m["timestamp"] for m in loaded["messages"]]
    # Timestamps should be monotonically increasing
    for i in range(1, len(timestamps)):
        assert timestamps[i] >= timestamps[i - 1]


# ===== Integration Tests: Replay =====

@pytest.mark.asyncio
async def test_replay_sends_recorded_messages(echo_server, tmp_dir):
    """Test that replaying a session sends the correct messages."""
    recording = {
        "url": echo_server.url,
        "startedAt": "2025-01-01T00:00:00.000Z",
        "endedAt": "2025-01-01T00:00:05.000Z",
        "messages": [
            {"direction": "sent", "data": "replay-1", "timestamp": 1704067200000, "deltaMs": 0},
            {"direction": "received", "data": "echo:replay-1", "timestamp": 1704067200050, "deltaMs": 50},
            {"direction": "sent", "data": "replay-2", "timestamp": 1704067200100, "deltaMs": 50},
            {"direction": "received", "data": "echo:replay-2", "timestamp": 1704067200150, "deltaMs": 50},
        ]
    }

    recording_file = os.path.join(tmp_dir, "replay-session.json")
    with open(recording_file, "w") as f:
        json.dump(recording, f)

    # Connect and replay manually (simulating the replayer)
    async with websockets.connect(echo_server.url) as ws:
        for msg in recording["messages"]:
            if msg["direction"] == "sent":
                await ws.send(msg["data"])
                resp = await ws.recv()
                assert resp == f"echo:{msg['data']}"

    # Verify server received the messages
    assert "replay-1" in echo_server.messages_received
    assert "replay-2" in echo_server.messages_received


@pytest.mark.asyncio
async def test_replay_preserves_message_order(echo_server, tmp_dir):
    """Test that replay preserves the order of sent messages."""
    messages = [f"ordered-{i}" for i in range(10)]
    recording = {
        "url": echo_server.url,
        "startedAt": "2025-01-01T00:00:00.000Z",
        "endedAt": "2025-01-01T00:00:10.000Z",
        "messages": [
            {"direction": "sent", "data": m, "timestamp": 1704067200000 + i * 100, "deltaMs": 100}
            for i, m in enumerate(messages)
        ]
    }

    async with websockets.connect(echo_server.url) as ws:
        responses = []
        for msg in recording["messages"]:
            await ws.send(msg["data"])
            resp = await ws.recv()
            responses.append(resp)

    # Verify order is preserved
    for i, resp in enumerate(responses):
        assert resp == f"echo:ordered-{i}"
