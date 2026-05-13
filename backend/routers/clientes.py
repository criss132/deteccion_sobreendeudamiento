"""Endpoints REST para clientes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.db.repositories import cliente as repo

router = APIRouter(prefix="/clientes", tags=["clientes"])


class ClienteCreate(BaseModel):
    nombre: str
    iddocumento: str
    ingresos_m: float
    tipo_empleado: str  # dependiente | independiente | pensionado | desempleado
    score_credito: Optional[int] = None


class ClienteUpdate(BaseModel):
    nombre: str
    ingresos_m: float
    score_credito: Optional[int] = None


@router.get("/")
def listar_clientes():
    return repo.get_all_clientes()


@router.get("/{idcliente}")
def obtener_cliente(idcliente: int):
    result = repo.get_cliente_by_id(idcliente)
    if not result:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return result


@router.post("/", status_code=201)
def crear_cliente(body: ClienteCreate):
    return repo.create_cliente(
        body.nombre, body.iddocumento, body.ingresos_m,
        body.tipo_empleado, body.score_credito
    )


@router.put("/{idcliente}")
def actualizar_cliente(idcliente: int, body: ClienteUpdate):
    result = repo.update_cliente(idcliente, body.nombre, body.ingresos_m, body.score_credito)
    if not result:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return result


@router.delete("/{idcliente}")
def eliminar_cliente(idcliente: int):
    result = repo.delete_cliente(idcliente)
    if not result:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"mensaje": "Cliente desactivado correctamente"}