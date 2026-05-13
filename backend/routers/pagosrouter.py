"""Endpoints REST para pagos."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.db.repositories import pago as repo

router = APIRouter(prefix="/pagos", tags=["pagos"])


class PagoCreate(BaseModel):
    idcredito: int
    idcliente: int
    fecha_pago: str          # formato YYYY-MM-DD
    monto_pagado: float
    retraso_dias: Optional[int] = 0
    estado_pago: Optional[str] = "completado"  # completado | parcial | rechazado


@router.get("/credito/{idcredito}")
def pagos_por_credito(idcredito: int):
    return repo.get_pagos_by_credito(idcredito)


@router.get("/cliente/{idcliente}")
def pagos_por_cliente(idcliente: int):
    return repo.get_pagos_by_cliente(idcliente)


@router.post("/", status_code=201)
def crear_pago(body: PagoCreate):
    return repo.create_pago(
        body.idcredito, body.idcliente, body.fecha_pago,
        body.monto_pagado, body.retraso_dias, body.estado_pago
    )