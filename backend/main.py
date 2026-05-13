"""Aplicacion FastAPI del backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.ai_module.interfaces.api import router as ai_router
from backend.routers.clientes import router as clientes_router
from backend.routers.creditos import router as creditos_router
from backend.routers.detector import router as detector_router


app = FastAPI(title="Sistema de Sobreendeudamiento API")

# CORS para que React pueda consumir la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # puerto por defecto de Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers existentes
app.include_router(ai_router)

# Routers de base de datos
app.include_router(clientes_router)
app.include_router(creditos_router)
app.include_router(detector_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}