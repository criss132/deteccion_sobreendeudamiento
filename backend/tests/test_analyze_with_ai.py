import pytest

from backend.ai_module.application.analyze_with_ai import AnalyzeWithAI
from backend.ai_module.domain.analysis import AnalysisRequest, AnalysisResult


class FakeProvider:
    def analyze(self, request: AnalysisRequest) -> AnalysisResult:
        return AnalysisResult(
            content=f"Analisis: {request.prompt}",
            model="fake-model",
            response_id="resp_test",
        )


def test_execute_returns_provider_result() -> None:
    result = AnalyzeWithAI(FakeProvider()).execute(
        AnalysisRequest(prompt="Evalua este caso")
    )

    assert result.content == "Analisis: Evalua este caso"
    assert result.model == "fake-model"
    assert result.response_id == "resp_test"


def test_execute_rejects_empty_prompt() -> None:
    with pytest.raises(ValueError, match="prompt no puede estar vacio"):
        AnalyzeWithAI(FakeProvider()).execute(AnalysisRequest(prompt=" "))
