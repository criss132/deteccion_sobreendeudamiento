"""Modelos del dominio para solicitudes y resultados de IA."""

from dataclasses import dataclass


@dataclass(frozen=True)
class AnalysisRequest:
    """Entrada del caso de uso de analisis con IA."""

    prompt: str
    context: str | None = None


@dataclass(frozen=True)
class AnalysisResult:
    """Salida normalizada del analisis con IA."""

    content: str
    model: str
    response_id: str | None = None
