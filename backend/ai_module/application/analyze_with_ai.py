"""Caso de uso para ejecutar analisis con IA."""

from typing import Protocol

from backend.ai_module.domain.analysis import AnalysisRequest, AnalysisResult


class AIProvider(Protocol):
    """Contrato que debe implementar el proveedor de IA."""

    def analyze(self, request: AnalysisRequest) -> AnalysisResult:
        """Analiza la solicitud recibida."""


class AnalyzeWithAI:
    """Orquesta el analisis sin acoplarse al SDK de OpenAI."""

    def __init__(self, provider: AIProvider) -> None:
        self._provider = provider

    def execute(self, request: AnalysisRequest) -> AnalysisResult:
        if not request.prompt.strip():
            raise ValueError("El prompt no puede estar vacio.")

        return self._provider.analyze(request)
