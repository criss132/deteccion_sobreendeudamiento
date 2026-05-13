"""Repositorio para detector, alertas y recomendaciones."""

import json

from backend.db.connection import get_connection


def _parse_json_field(row, field_name):
    if row and isinstance(row.get(field_name), str):
        row[field_name] = json.loads(row[field_name])
    return row


def _get_evaluacion_by_id(iddetector: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT iddetector, idcliente, idmodelo, nivel_riesgo,
                       probabilidad, estado_evaluacion, fecha_evaluacion,
                       variables_entrada, resultado_detalle
                FROM detector_sobreendeudamiento
                WHERE iddetector = %s
            """, (iddetector,))
            return _parse_json_field(cur.fetchone(), "variables_entrada")


def _get_alerta_by_id(idalerta: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idalerta, iddetector, idcliente, nivel_riesgo,
                       mensaje_alerta, fecha_generacion, enviada, leida
                FROM alerta_riesgo
                WHERE idalerta = %s
            """, (idalerta,))
            return cur.fetchone()


def _get_recomendacion_by_id(idrecomendacion: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idrecomendacion, iddetector, idcliente, tipo_accion,
                       mensaje, fecha_generacion, enviada, aplicada
                FROM recomendacion_financiera
                WHERE idrecomendacion = %s
            """, (idrecomendacion,))
            return cur.fetchone()


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
            return [
                _parse_json_field(row, "variables_entrada")
                for row in cur.fetchall()
            ]


def create_evaluacion(idcliente, idmodelo, nivel_riesgo, probabilidad, variables_entrada: dict):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO detector_sobreendeudamiento
                    (idcliente, idmodelo, nivel_riesgo, probabilidad, variables_entrada)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                idcliente,
                idmodelo,
                nivel_riesgo,
                probabilidad,
                json.dumps(variables_entrada),
            ))
            iddetector = cur.lastrowid
            conn.commit()
            return _get_evaluacion_by_id(iddetector)


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
            """, (iddetector, idcliente, nivel_riesgo, mensaje))
            idalerta = cur.lastrowid
            conn.commit()
            return _get_alerta_by_id(idalerta)


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
            """, (iddetector, idcliente, tipo_accion, mensaje))
            idrecomendacion = cur.lastrowid
            conn.commit()
            return _get_recomendacion_by_id(idrecomendacion)
