"""Aplicacion FastAPI del backend."""

from fastapi import FastAPI

from backend.ai_module.interfaces.api import router as ai_router


app = FastAPI(title="Sistema de Sobreendeudamiento API")
app.include_router(ai_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
