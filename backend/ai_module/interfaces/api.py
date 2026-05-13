"""Rutas HTTP para consumir el modulo IA."""

from fastapi import APIRouter, HTTPException
from openai import APIConnectionError, APIStatusError, OpenAIError
from pydantic import BaseModel, Field

from backend.ai_module.application.analyze_with_ai import AnalyzeWithAI
from backend.ai_module.domain.analysis import AnalysisRequest
from backend.ai_module.infrastructure.openai_provider import OpenAIProvider


router = APIRouter(prefix="/ai", tags=["ai"])


class AnalyzePayload(BaseModel):
    prompt: str = Field(..., min_length=1)
    context: str | None = None


class AnalyzeResponse(BaseModel):
    content: str
    model: str
    response_id: str | None = None


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzePayload) -> AnalyzeResponse:
    try:
        use_case = AnalyzeWithAI(OpenAIProvider())
        result = use_case.execute(
            AnalysisRequest(prompt=payload.prompt, context=payload.context)
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except APIStatusError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    except APIConnectionError as exc:
        raise HTTPException(
            status_code=502,
            detail="No fue posible conectar con OpenAI.",
        ) from exc
    except OpenAIError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar OpenAI: {exc}",
        ) from exc

    return AnalyzeResponse(
        content=result.content,
        model=result.model,
        response_id=result.response_id,
    )
