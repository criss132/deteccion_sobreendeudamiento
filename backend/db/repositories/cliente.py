"""Repositorio de clientes."""

from backend.db.connection import get_connection


def get_all_clientes():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM cliente WHERE activo = TRUE ORDER BY idcliente")
            return cur.fetchall()


def get_cliente_by_id(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM cliente WHERE idcliente = %s", (idcliente,))
            return cur.fetchone()


def create_cliente(nombre: str, iddocumento: str, ingresos_m: float,
                   tipo_empleado: str, score_credito: int):
    sql = """
        INSERT INTO cliente (nombre, iddocumento, ingresos_m, tipo_empleado, score_credito)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING *
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (nombre, iddocumento, ingresos_m, tipo_empleado, score_credito))
            conn.commit()
            return cur.fetchone()


def update_cliente(idcliente: int, nombre: str, ingresos_m: float, score_credito: int):
    sql = """
        UPDATE cliente
        SET nombre = %s, ingresos_m = %s, score_credito = %s
        WHERE idcliente = %s
        RETURNING *
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (nombre, ingresos_m, score_credito, idcliente))
            conn.commit()
            return cur.fetchone()


def delete_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE cliente SET activo = FALSE WHERE idcliente = %s RETURNING idcliente",
                (idcliente,)
            )
            conn.commit()
            return cur.fetchone()