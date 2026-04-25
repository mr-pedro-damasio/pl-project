# Stage 1: Build Next.js frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Run FastAPI backend serving the static frontend
FROM python:3.12-slim AS app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app/backend

# Install Python dependencies (cached layer)
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev

# Copy backend source
COPY backend/ .

# Copy built frontend
COPY --from=frontend-build /app/frontend/out /app/frontend_build

ENV FRONTEND_BUILD_PATH=/app/frontend_build

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
