"""Repositorio de acceso a datos para la tabla pago."""

from mysql.connector import errors

from backend.db.connection import get_connection


def get_pagos_by_credito(idcredito: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT p.idpago, p.idcredito, c.idcliente, p.fecha_pago,
                       p.monto_pagado, p.retraso_dias, p.estado_pago, p.fecha_registro
                FROM pago p
                INNER JOIN credito c ON c.idcredito = p.idcredito
                WHERE p.idcredito = %s
                ORDER BY p.fecha_pago DESC
            """, (idcredito,))
            return cur.fetchall()


def get_pagos_by_cliente(idcliente: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT p.idpago, p.idcredito, c.idcliente, p.fecha_pago,
                       p.monto_pagado, p.retraso_dias, p.estado_pago, p.fecha_registro
                FROM pago p
                INNER JOIN credito c ON c.idcredito = p.idcredito
                WHERE c.idcliente = %s
                ORDER BY p.fecha_pago DESC
            """, (idcliente,))
            return cur.fetchall()


def create_pago(idcredito, idcliente, fecha_pago, monto_pagado, retraso_dias=0, estado_pago="a_tiempo"):
    with get_connection() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute("""
                    INSERT INTO pago (idcredito, idcliente, fecha_pago, monto_pagado, retraso_dias, estado_pago)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (idcredito, idcliente, fecha_pago, monto_pagado, retraso_dias, estado_pago))
            except errors.ProgrammingError as exc:
                if exc.errno != 1054:
                    raise

                cur.execute("""
                    INSERT INTO pago (idcredito, fecha_pago, monto_pagado, retraso_dias, estado_pago)
                    VALUES (%s, %s, %s, %s, %s)
                """, (idcredito, fecha_pago, monto_pagado, retraso_dias, estado_pago))

            idpago = cur.lastrowid
            conn.commit()
            cur.execute("""
                SELECT p.idpago, p.idcredito, c.idcliente, p.fecha_pago,
                       p.monto_pagado, p.retraso_dias, p.estado_pago, p.fecha_registro
                FROM pago p
                INNER JOIN credito c ON c.idcredito = p.idcredito
                WHERE p.idpago = %s
            """, (idpago,))
            return cur.fetchone()
