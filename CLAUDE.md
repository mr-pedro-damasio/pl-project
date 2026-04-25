# prelegal

A platform for drafting common legal documents.

## Project structure

```
pl-project/
├── docs/           # Project documentation (testing, architecture, API)
├── frontend/       # Next.js 16 application (React 19, TypeScript, Tailwind)
├── scripts/        # Start / stop helper scripts
├── templates/      # Legal document templates (Markdown, Common Paper standards)
├── catalog.json    # Index of all available document templates
└── README.md
```

## Services

- **frontend** — The only service currently. Next.js 16 App Router, single-page NDA creator with live preview and browser PDF export. See `frontend/CLAUDE.md` for agent-specific guidance before writing any frontend code.

## Key conventions

- Templates in `templates/` use `<span class="coverpage_link">FieldName</span>` as variable placeholders.
- `catalog.json` is a flat JSON array of `{ name, description, filename }` entries pointing into `templates/`.
- The frontend embeds the Mutual NDA template as a TypeScript string constant (`frontend/app/lib/nda-template.ts`) — it is not read from disk at runtime.

## Documentation

See `docs/` for:
- `docs/testing.md` — Manual test plan + how to run automated tests
