"""Repositorio del detector de sobreendeudamiento, alertas y recomendaciones."""

from backend.db.connection import get_connection


# ── Dashboard ────────────────────────────────────────────────────────────────

def get_dashboard():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM v_dashboard_riesgo ORDER BY idcliente")
            return cur.fetchall()


def get_dashboard_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM v_dashboard_riesgo WHERE idcliente = %s",
                (idcliente,)
            )
            return cur.fetchone()


# ── Evaluaciones ─────────────────────────────────────────────────────────────

def get_evaluaciones_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM detector_sobreendeudamiento
                WHERE idcliente = %s
                ORDER BY fecha_evaluacion DESC
            """, (idcliente,))
            return cur.fetchall()


def create_evaluacion(idcliente: int, idmodelo: int, nivel_riesgo: str,
                      probabilidad: float, variables_entrada: dict):
    import json
    sql = """
        INSERT INTO detector_sobreendeudamiento
            (idcliente, idmodelo, nivel_riesgo, probabilidad, estado_evaluacion, variables_entrada)
        VALUES (%s, %s, %s, %s, 'completada', %s)
        RETURNING *
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (
                idcliente, idmodelo, nivel_riesgo,
                probabilidad, json.dumps(variables_entrada)
            ))
            conn.commit()
            return cur.fetchone()


# ── Alertas ───────────────────────────────────────────────────────────────────

def get_alertas_pendientes():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT a.*, c.nombre
                FROM alerta_riesgo a
                JOIN cliente c ON c.idcliente = a.idcliente
                WHERE a.enviada = FALSE
                ORDER BY a.fecha_generacion DESC
            """)
            return cur.fetchall()


def get_alertas_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM alerta_riesgo
                WHERE idcliente = %s
                ORDER BY fecha_generacion DESC
            """, (idcliente,))
            return cur.fetchall()


def create_alerta(iddetector: int, idcliente: int, nivel_riesgo: str, mensaje: str):
    sql = """
        INSERT INTO alerta_riesgo (iddetector, idcliente, nivel_riesgo, mensaje_alerta)
        VALUES (%s, %s, %s, %s)
        RETURNING *
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (iddetector, idcliente, nivel_riesgo, mensaje))
            conn.commit()
            return cur.fetchone()


# ── Recomendaciones ───────────────────────────────────────────────────────────

def get_recomendaciones_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM recomendacion_financiera
                WHERE idcliente = %s
                ORDER BY fecha_generacion DESC
            """, (idcliente,))
            return cur.fetchall()


def create_recomendacion(iddetector: int, idcliente: int,
                         tipo_accion: str, mensaje: str):
    sql = """
        INSERT INTO recomendacion_financiera (iddetector, idcliente, tipo_accion, mensaje)
        VALUES (%s, %s, %s, %s)
        RETURNING *
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (iddetector, idcliente, tipo_accion, mensaje))
            conn.commit()
            return cur.fetchone()