"""Endpoints REST para detector de riesgo, alertas y recomendaciones."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.db.repositories import detector as repo

router = APIRouter(prefix="/detector", tags=["detector"])


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/dashboard")
def dashboard_riesgo():
    """Retorna todos los clientes con su último nivel de riesgo."""
    return repo.get_dashboard()


@router.get("/dashboard/{idcliente}")
def dashboard_cliente(idcliente: int):
    result = repo.get_dashboard_by_cliente(idcliente)
    if not result:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return result


# ── Evaluaciones ──────────────────────────────────────────────────────────────

@router.get("/evaluaciones/{idcliente}")
def evaluaciones_cliente(idcliente: int):
    return repo.get_evaluaciones_by_cliente(idcliente)


class EvaluacionCreate(BaseModel):
    idcliente: int
    idmodelo: int
    nivel_riesgo: str       # bajo | medio | alto | critico
    probabilidad: float
    variables_entrada: dict


@router.post("/evaluaciones", status_code=201)
def crear_evaluacion(body: EvaluacionCreate):
    return repo.create_evaluacion(
        body.idcliente, body.idmodelo, body.nivel_riesgo,
        body.probabilidad, body.variables_entrada
    )


# ── Alertas ───────────────────────────────────────────────────────────────────

@router.get("/alertas/pendientes")
def alertas_pendientes():
    return repo.get_alertas_pendientes()


@router.get("/alertas/cliente/{idcliente}")
def alertas_cliente(idcliente: int):
    return repo.get_alertas_by_cliente(idcliente)


class AlertaCreate(BaseModel):
    iddetector: int
    idcliente: int
    nivel_riesgo: str
    mensaje: str


@router.post("/alertas", status_code=201)
def crear_alerta(body: AlertaCreate):
    return repo.create_alerta(
        body.iddetector, body.idcliente,
        body.nivel_riesgo, body.mensaje
    )


# ── Recomendaciones ───────────────────────────────────────────────────────────

@router.get("/recomendaciones/{idcliente}")
def recomendaciones_cliente(idcliente: int):
    return repo.get_recomendaciones_by_cliente(idcliente)


class RecomendacionCreate(BaseModel):
    iddetector: int
    idcliente: int
    tipo_accion: str   # reduccion_cupo | asesoria_financiera | etc.
    mensaje: str


@router.post("/recomendaciones", status_code=201)
def crear_recomendacion(body: RecomendacionCreate):
    return repo.create_recomendacion(
        body.iddetector, body.idcliente,
        body.tipo_accion, body.mensaje
    )