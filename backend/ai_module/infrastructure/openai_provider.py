"""Proveedor IA implementado con la libreria oficial de OpenAI."""

import os
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

from backend.ai_module.domain.analysis import AnalysisRequest, AnalysisResult


DEFAULT_MODEL = "gpt-5.4-mini"

SYSTEM_PROMPT = (
    "Eres un asistente especializado en analisis financiero para detectar "
    "posibles senales de sobreendeudamiento. Responde en espanol, con criterio "
    "prudente, explicando riesgos, supuestos y limitaciones. No des asesoria "
    "financiera definitiva; entrega una evaluacion orientativa para apoyar el "
    "analisis del sistema."
)


class OpenAIProvider:
    """Adaptador que encapsula la libreria oficial de OpenAI."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        client: OpenAI | None = None,
    ) -> None:
        load_dotenv(override=True)

        resolved_api_key = api_key or os.getenv("OPENAI_API_KEY")
        if client is None and not resolved_api_key:
            raise ValueError("Falta configurar OPENAI_API_KEY.")

        self._model = model or os.getenv("OPENAI_MODEL", DEFAULT_MODEL)
        self._client = client or OpenAI(api_key=resolved_api_key)

    def analyze(self, request: AnalysisRequest) -> AnalysisResult:
        completion = self._client.chat.completions.create(
            model=self._model,
            messages=self._build_messages(request),
        )

        choice = completion.choices[0]
        content = choice.message.content or ""

        return AnalysisResult(
            content=content,
            model=completion.model or self._model,
            response_id=completion.id,
        )

    @staticmethod
    def _build_messages(request: AnalysisRequest) -> list[dict[str, Any]]:
        user_content = request.prompt
        if request.context:
            user_content = f"Contexto:\n{request.context}\n\nSolicitud:\n{request.prompt}"

        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ]
