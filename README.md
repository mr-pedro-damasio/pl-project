# prelegal
A platform for drafting common legal documents

> **Status: Work in Progress** — This project is currently under active development and is expected to be completed by 2026-04-29.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### Running the app

**macOS / Linux**

```bash
# Start the frontend dev server
./scripts/start.sh

# Stop the frontend dev server
./scripts/stop.sh
```

**Windows**

```bat
:: Start the frontend dev server
scripts\start.bat

:: Stop the frontend dev server
scripts\stop.bat
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
prelegal/
├── frontend/       # Next.js application
├── scripts/        # Start / stop helper scripts
│   ├── start.sh    # macOS/Linux start
│   ├── stop.sh     # macOS/Linux stop
│   ├── start.bat   # Windows start
│   └── stop.bat    # Windows stop
└── templates/      # Legal document templates (Markdown)
```
