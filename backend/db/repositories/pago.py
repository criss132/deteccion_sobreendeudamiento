"""Repositorio de acceso a datos para la tabla pago."""

from backend.db.connection import get_connection


def get_pagos_by_credito(idcredito: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idpago, idcredito, idcliente, fecha_pago,
                       monto_pagado, retraso_dias, estado_pago, fecha_registro
                FROM pago
                WHERE idcredito = %s
                ORDER BY fecha_pago DESC
            """, (idcredito,))
            return cur.fetchall()


def get_pagos_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT idpago, idcredito, idcliente, fecha_pago,
                       monto_pagado, retraso_dias, estado_pago, fecha_registro
                FROM pago
                WHERE idcliente = %s
                ORDER BY fecha_pago DESC
            """, (idcliente,))
            return cur.fetchall()


def create_pago(idcredito, idcliente, fecha_pago, monto_pagado, retraso_dias=0, estado_pago="completado"):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO pago (idcredito, idcliente, fecha_pago, monto_pagado, retraso_dias, estado_pago)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING idpago, idcredito, idcliente, fecha_pago,
                          monto_pagado, retraso_dias, estado_pago, fecha_registro
            """, (idcredito, idcliente, fecha_pago, monto_pagado, retraso_dias, estado_pago))
            conn.commit()
            return cur.fetchone()