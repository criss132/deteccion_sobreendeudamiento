"""Repositorio de créditos."""

from backend.db.connection import get_connection


def get_creditos_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM credito WHERE idcliente = %s ORDER BY fecha_apertura DESC",
                (idcliente,)
            )
            return cur.fetchall()


def get_credito_by_id(idcredito: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM credito WHERE idcredito = %s", (idcredito,))
            return cur.fetchone()


def create_credito(idcliente: int, monto: float, tasa_interes: float,
                   plazo_meses: int, estado: str = "activo"):
    sql = """
        INSERT INTO credito (idcliente, monto, tasa_interes, plazo_meses, cuota_mensual, estado)
        VALUES (
            %s, %s, %s, %s,
            calcular_cuota_mensual(%s, %s, %s),
            %s
        )
        RETURNING *
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (
                idcliente, monto, tasa_interes, plazo_meses,
                monto, tasa_interes, plazo_meses,
                estado
            ))
            conn.commit()
            return cur.fetchone()


def update_estado_credito(idcredito: int, estado: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE credito SET estado = %s WHERE idcredito = %s RETURNING *",
                (estado, idcredito)
            )
            conn.commit()
            return cur.fetchone()