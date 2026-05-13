"""Repositorio de acceso a datos para la tabla cliente."""

from backend.db.connection import get_connection


def get_all_clientes():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idcliente, nombre, iddocumento, ingresos_m,
                       tipo_empleado, score_credito, fecha_registro, activo
                FROM cliente
                ORDER BY idcliente DESC
            """)
            return cur.fetchall()


def get_cliente_by_id(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idcliente, nombre, iddocumento, ingresos_m,
                       tipo_empleado, score_credito, fecha_registro, activo
                FROM cliente
                WHERE idcliente = %s AND activo = TRUE
            """, (idcliente,))
            return cur.fetchone()


def create_cliente(nombre, iddocumento, ingresos_m, tipo_empleado, score_credito=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO cliente (nombre, iddocumento, ingresos_m, tipo_empleado, score_credito)
                VALUES (%s, %s, %s, %s, %s)
            """, (nombre, iddocumento, ingresos_m, tipo_empleado, score_credito))
            idcliente = cur.lastrowid
            conn.commit()
            return get_cliente_by_id(idcliente)


def update_cliente(idcliente, nombre, ingresos_m, score_credito=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE cliente
                SET nombre = %s, ingresos_m = %s, score_credito = %s
                WHERE idcliente = %s AND activo = TRUE
            """, (nombre, ingresos_m, score_credito, idcliente))
            updated = cur.rowcount > 0
            conn.commit()
            return get_cliente_by_id(idcliente) if updated else None


def delete_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE cliente SET activo = FALSE
                WHERE idcliente = %s AND activo = TRUE
            """, (idcliente,))
            deleted = cur.rowcount > 0
            conn.commit()
            return {"idcliente": idcliente} if deleted else None
