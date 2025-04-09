from fastapi import FastAPI
from app.routers import plants

app = FastAPI(
    title="Garden API",
    description="A REST API for garden plants",
    version="0.1.0"
)

# Add API prefix to all routers
app.include_router(plants.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to the Garden API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)