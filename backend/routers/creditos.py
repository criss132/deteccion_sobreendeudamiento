"""Endpoints REST para créditos."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.db.repositories import credito as repo

router = APIRouter(prefix="/creditos", tags=["creditos"])


class CreditoCreate(BaseModel):
    idcliente: int
    monto: float
    tasa_interes: float   # tasa anual, ej: 0.24 para 24%
    plazo_meses: int
    estado: Optional[str] = "activo"


@router.get("/cliente/{idcliente}")
def listar_creditos_cliente(idcliente: int):
    return repo.get_creditos_by_cliente(idcliente)


@router.get("/{idcredito}")
def obtener_credito(idcredito: int):
    result = repo.get_credito_by_id(idcredito)
    if not result:
        raise HTTPException(status_code=404, detail="Crédito no encontrado")
    return result


@router.post("/", status_code=201)
def crear_credito(body: CreditoCreate):
    return repo.create_credito(
        body.idcliente, body.monto,
        body.tasa_interes, body.plazo_meses, body.estado
    )


@router.patch("/{idcredito}/estado")
def cambiar_estado(idcredito: int, estado: str):
    estados_validos = {"activo", "pagado", "en_mora", "reestructurado", "castigado"}
    if estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Usa: {estados_validos}")
    result = repo.update_estado_credito(idcredito, estado)
    if not result:
        raise HTTPException(status_code=404, detail="Crédito no encontrado")
    return result


@router.delete("/{idcredito}")
def eliminar_credito(idcredito: int):
    result = repo.delete_credito(idcredito)
    if not result:
        raise HTTPException(status_code=404, detail="Credito no encontrado")
    if result.get("bloqueado"):
        raise HTTPException(
            status_code=409,
            detail="No se puede borrar este credito porque tiene pagos asociados.",
        )
    return {"mensaje": "Credito eliminado correctamente", **result}
