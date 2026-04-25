import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers.auth import router as auth_router
from database import init_db

FRONTEND_BUILD = os.getenv("FRONTEND_BUILD_PATH", "../frontend/out")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

if os.path.isdir(FRONTEND_BUILD):
    app.mount("/", StaticFiles(directory=FRONTEND_BUILD, html=True), name="static")
