# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- npm

## Running the app

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

## Project structure

```
pl-project/
├── docs/               # Project documentation
│   ├── getting-started.md
│   └── testing.md
├── frontend/           # Next.js 16 application
│   ├── __tests__/      # Unit and integration tests (Jest)
│   ├── tests/          # End-to-end tests (Playwright)
│   ├── app/            # Next.js App Router source
│   ├── jest.config.ts
│   ├── playwright.config.ts
│   └── eslint.config.mjs
├── scripts/            # Start / stop helper scripts
├── templates/          # Legal document templates (Markdown)
└── catalog.json        # Index of available templates
```
