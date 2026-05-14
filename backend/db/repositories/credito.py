"""Repositorio de acceso a datos para la tabla credito."""

from mysql.connector import errors

from backend.db.connection import get_connection


def get_creditos_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idcredito, idcliente, monto, tasa_interes, plazo_meses,
                       cuota_mensual, estado, fecha_apertura, fecha_cierre
                FROM credito
                WHERE idcliente = %s
                ORDER BY fecha_apertura DESC
            """, (idcliente,))
            return cur.fetchall()


def get_credito_by_id(idcredito: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idcredito, idcliente, monto, tasa_interes, plazo_meses,
                       cuota_mensual, estado, fecha_apertura, fecha_cierre
                FROM credito
                WHERE idcredito = %s
            """, (idcredito,))
            return cur.fetchone()


def create_credito(idcliente, monto, tasa_interes, plazo_meses, estado="activo"):
    """
    Calcula cuota_mensual con la fórmula estándar de amortización:
    C = P * r / (1 - (1+r)^-n)
    donde r = tasa_interes / 12
    """
    r = tasa_interes / 12
    if r == 0:
        cuota_mensual = monto / plazo_meses
    else:
        cuota_mensual = monto * r / (1 - (1 + r) ** -plazo_meses)

    cuota_mensual = round(cuota_mensual, 2)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO credito (idcliente, monto, tasa_interes, plazo_meses, cuota_mensual, estado)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (idcliente, monto, tasa_interes, plazo_meses, cuota_mensual, estado))
            idcredito = cur.lastrowid
            conn.commit()
            return get_credito_by_id(idcredito)


def update_estado_credito(idcredito: int, estado: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE credito SET estado = %s
                WHERE idcredito = %s
            """, (estado, idcredito))
            updated = cur.rowcount > 0
            conn.commit()
            return get_credito_by_id(idcredito) if updated else None


def delete_credito(idcredito: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute("""
                    DELETE FROM credito
                    WHERE idcredito = %s
                """, (idcredito,))
            except errors.IntegrityError:
                conn.rollback()
                return {"bloqueado": True, "idcredito": idcredito}

            deleted = cur.rowcount > 0
            conn.commit()
            return {"idcredito": idcredito} if deleted else None
