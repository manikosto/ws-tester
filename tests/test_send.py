"""Tests for the send command and message functionality."""

import asyncio
import json
import os
import subprocess

import pytest
import websockets


async def run_cli(ws_tester_bin: str, *args: str, timeout: int = 15) -> asyncio.subprocess.Process:
    """Run the CLI as an async subprocess so it doesn't block the event loop."""
    proc = await asyncio.create_subprocess_exec(
        "node", ws_tester_bin, *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        await asyncio.wait_for(proc.communicate(), timeout=timeout)
    except asyncio.TimeoutError:
        proc.kill()
        await proc.communicate()
    return proc


@pytest.mark.asyncio
async def test_send_single_message(echo_server, ws_tester_bin):
    """Test sending a single message via CLI."""
    proc = await run_cli(ws_tester_bin, "send", echo_server.url, "-m", "hello world", "-w", "1000")
    stdout = (await proc.stdout.read()).decode() if proc.stdout else ""
    assert proc.returncode == 0, f"stderr: {(await proc.stderr.read()).decode() if proc.stderr else ''}"


@pytest.mark.asyncio
async def test_send_json_message(echo_server, ws_tester_bin):
    """Test sending a JSON message via CLI."""
    msg = json.dumps({"type": "ping", "ts": 123})
    proc = await run_cli(ws_tester_bin, "send", echo_server.url, "-m", msg, "-w", "1000")
    assert proc.returncode == 0


@pytest.mark.asyncio
async def test_send_from_file(echo_server, ws_tester_bin, tmp_dir):
    """Test sending messages from a text file (one per line)."""
    msg_file = os.path.join(tmp_dir, "messages.txt")
    with open(msg_file, "w") as f:
        f.write("line1\nline2\nline3\n")

    proc = await run_cli(ws_tester_bin, "send", echo_server.url, "-f", msg_file, "-w", "2000")
    assert proc.returncode == 0


@pytest.mark.asyncio
async def test_send_from_json_file(echo_server, ws_tester_bin, tmp_dir):
    """Test sending messages from a JSON array file."""
    json_file = os.path.join(tmp_dir, "messages.json")
    messages = [
        {"type": "subscribe", "channel": "updates"},
        {"type": "ping"},
        "raw string message"
    ]
    with open(json_file, "w") as f:
        json.dump(messages, f)

    proc = await run_cli(ws_tester_bin, "send", echo_server.url, "-j", json_file, "-w", "2000")
    assert proc.returncode == 0


@pytest.mark.asyncio
async def test_send_with_interval(echo_server, ws_tester_bin, tmp_dir):
    """Test sending messages with a delay interval."""
    msg_file = os.path.join(tmp_dir, "messages.txt")
    with open(msg_file, "w") as f:
        f.write("msg1\nmsg2\n")

    proc = await run_cli(ws_tester_bin, "send", echo_server.url, "-f", msg_file, "-i", "100", "-w", "1000")
    assert proc.returncode == 0


@pytest.mark.asyncio
async def test_send_no_message_fails(ws_tester_bin, echo_server):
    """Test that sending with no message exits with error."""
    proc = await run_cli(ws_tester_bin, "send", echo_server.url)
    assert proc.returncode != 0


@pytest.mark.asyncio
async def test_send_to_invalid_url(ws_tester_bin):
    """Test that sending to an invalid URL fails gracefully."""
    proc = await run_cli(ws_tester_bin, "send", "ws://127.0.0.1:1", "-m", "test", "-w", "1000")
    assert proc.returncode != 0
