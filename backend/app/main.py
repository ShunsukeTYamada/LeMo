from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import api_router

app = FastAPI(
    title="YouTube Curation App API",
    description="Safe curated YouTube content API for kids",
    version="1.0.0"
)

# CORS Middleware for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok"}
