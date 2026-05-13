"""Conexion a la base de datos MySQL."""

import os

import mysql.connector
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "database": os.getenv("DB_NAME", "creditoseguro"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
}


class MySQLDictConnection:
    """Wrapper para que todos los cursores devuelvan diccionarios."""

    def __init__(self):
        self._conn = mysql.connector.connect(**DB_CONFIG)

    def cursor(self, *args, **kwargs):
        kwargs.setdefault("dictionary", True)
        return self._conn.cursor(*args, **kwargs)

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type:
            self.rollback()
        self.close()


def get_connection():
    """Retorna una conexion activa a MySQL."""
    return MySQLDictConnection()
