"""Repositorio de acceso a datos para detector, alertas y recomendaciones."""

import json
from backend.db.connection import get_connection


# ── Dashboard ─────────────────────────────────────────────────────────────────

def get_dashboard():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM v_dashboard_riesgo ORDER BY idcliente DESC")
            return cur.fetchall()


def get_dashboard_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM v_dashboard_riesgo WHERE idcliente = %s",
                (idcliente,)
            )
            return cur.fetchone()


# ── Evaluaciones ──────────────────────────────────────────────────────────────

def get_evaluaciones_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT iddetector, idcliente, idmodelo, nivel_riesgo,
                       probabilidad, estado_evaluacion, fecha_evaluacion,
                       variables_entrada, resultado_detalle
                FROM detector_sobreendeudamiento
                WHERE idcliente = %s
                ORDER BY fecha_evaluacion DESC
            """, (idcliente,))
            return cur.fetchall()


def create_evaluacion(idcliente, idmodelo, nivel_riesgo, probabilidad, variables_entrada: dict):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO detector_sobreendeudamiento
                    (idcliente, idmodelo, nivel_riesgo, probabilidad, variables_entrada)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING iddetector, idcliente, idmodelo, nivel_riesgo,
                          probabilidad, estado_evaluacion, fecha_evaluacion
            """, (idcliente, idmodelo, nivel_riesgo, probabilidad,
                  json.dumps(variables_entrada)))
            conn.commit()
            return cur.fetchone()


# ── Alertas ───────────────────────────────────────────────────────────────────

def get_alertas_pendientes():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idalerta, iddetector, idcliente, nivel_riesgo,
                       mensaje_alerta, fecha_generacion, enviada, leida
                FROM alerta_riesgo
                WHERE enviada = FALSE
                ORDER BY fecha_generacion DESC
            """)
            return cur.fetchall()


def get_alertas_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idalerta, iddetector, idcliente, nivel_riesgo,
                       mensaje_alerta, fecha_generacion, enviada, leida
                FROM alerta_riesgo
                WHERE idcliente = %s
                ORDER BY fecha_generacion DESC
            """, (idcliente,))
            return cur.fetchall()


def create_alerta(iddetector, idcliente, nivel_riesgo, mensaje):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO alerta_riesgo (iddetector, idcliente, nivel_riesgo, mensaje_alerta)
                VALUES (%s, %s, %s, %s)
                RETURNING idalerta, iddetector, idcliente, nivel_riesgo,
                          mensaje_alerta, fecha_generacion, enviada, leida
            """, (iddetector, idcliente, nivel_riesgo, mensaje))
            conn.commit()
            return cur.fetchone()


# ── Recomendaciones ───────────────────────────────────────────────────────────

def get_recomendaciones_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idrecomendacion, iddetector, idcliente, tipo_accion,
                       mensaje, fecha_generacion, enviada, aplicada
                FROM recomendacion_financiera
                WHERE idcliente = %s
                ORDER BY fecha_generacion DESC
            """, (idcliente,))
            return cur.fetchall()


def create_recomendacion(iddetector, idcliente, tipo_accion, mensaje):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO recomendacion_financiera (iddetector, idcliente, tipo_accion, mensaje)
                VALUES (%s, %s, %s, %s)
                RETURNING idrecomendacion, iddetector, idcliente, tipo_accion,
                          mensaje, fecha_generacion, enviada, aplicada
            """, (iddetector, idcliente, tipo_accion, mensaje))
            conn.commit()
            return cur.fetchone()