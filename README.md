# ws-tester

A complete WebSocket testing toolkit — CLI + Web Dashboard. Connect, send messages, record & replay sessions, run load tests, and validate schemas.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

## Features

| Feature | Description |
|---------|-------------|
| **Connect & Send** | Connect to any `ws://` or `wss://` endpoint, send and receive messages in real-time |
| **Record & Replay** | Capture entire sessions with timestamps, replay them for regression testing |
| **Load Testing** | Spawn 100+ concurrent connections, measure latency, throughput, and failure rates |
| **Schema Validation** | Validate messages against JSON Schema |
| **Web Dashboard** | Beautiful real-time UI with message log, dark/light themes, EN/RU localization |
| **CLI Interface** | Full-featured command-line tool for automation and CI/CD pipelines |

## Quick Start

### Web Dashboard

```bash
# Install and run
npx ws-tester web --port 3456

# Open http://localhost:3456
```

### Docker

```bash
docker build -t ws-tester .
docker run -p 3456:3456 ws-tester
```

### CLI

```bash
# Install globally
npm install -g ws-tester

# Connect to a WebSocket server
ws-tester connect ws://localhost:8085

# Send a message
ws-tester send ws://localhost:8085 -m '{"type":"ping"}'

# Record a session
ws-tester record ws://localhost:8085 -o session.json

# Replay a recorded session
ws-tester replay ws://localhost:8085 -i session.json

# Load test: 100 connections for 30 seconds
ws-tester loadtest ws://localhost:8085 -c 100 -d 30

# Validate message against schema
ws-tester validate -s schema.json -d data.json

# Start the web dashboard
ws-tester web --port 3456
```

## Deploy on Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template)

1. Fork this repository
2. Connect your Railway account to GitHub
3. Create a new project → Deploy from GitHub repo
4. Railway will auto-detect the Dockerfile and deploy
5. Set the port variable: `PORT=3456`

## Tech Stack

- **Runtime**: Node.js 18+ with TypeScript (ESM)
- **WebSocket**: `ws` library
- **CLI**: `commander` + `chalk` + `ora` + `cli-table3`
- **Validation**: `ajv` (JSON Schema)
- **Web Backend**: Express + WebSocket relay
- **Web Frontend**: React 19 + Vite 6
- **Styling**: Custom CSS with dark/light theme support

## Project Structure

```
src/
  index.ts              — CLI entry point
  core/                 — WebSocketManager, Recorder, Replayer, LoadTester, SchemaValidator
  commands/             — CLI commands (connect, send, record, replay, loadtest, validate, web)
  web/                  — Express API server + WebSocket relay
  utils/                — Logger, Formatter
web/
  src/
    components/         — React components (Landing, Dashboard, Docs)
    context/            — AppContext, LangContext, ThemeContext
    hooks/              — useApi, useWebSocket
    i18n.ts             — EN/RU translations
```

## Development

```bash
# Clone
git clone https://github.com/manikosto/ws-tester.git
cd ws-tester

# Install dependencies
npm install
cd web && npm install && cd ..

# Build
npm run build
cd web && npx vite build && cd ..

# Run
node dist/index.js web --port 3456
```

## License

MIT
