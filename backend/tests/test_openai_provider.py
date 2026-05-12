from types import SimpleNamespace

from backend.ai_module.domain.analysis import AnalysisRequest
from backend.ai_module.infrastructure.openai_provider import OpenAIProvider


class FakeChatCompletions:
    def __init__(self) -> None:
        self.last_request = None

    def create(self, **kwargs):
        self.last_request = kwargs
        return SimpleNamespace(
            id="chatcmpl_test",
            model=kwargs["model"],
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content="Resultado generado")
                )
            ],
        )


class FakeOpenAIClient:
    def __init__(self) -> None:
        self.completions = FakeChatCompletions()
        self.chat = SimpleNamespace(completions=self.completions)


def test_provider_uses_openai_chat_completions() -> None:
    client = FakeOpenAIClient()
    provider = OpenAIProvider(api_key="test", model="gpt-test", client=client)

    result = provider.analyze(AnalysisRequest(prompt="Evalua este caso"))

    assert result.content == "Resultado generado"
    assert result.model == "gpt-test"
    assert result.response_id == "chatcmpl_test"
    assert client.completions.last_request["model"] == "gpt-test"
    assert client.completions.last_request["messages"][1] == {
        "role": "user",
        "content": "Evalua este caso",
    }


def test_provider_adds_context_to_user_message() -> None:
    client = FakeOpenAIClient()
    provider = OpenAIProvider(api_key="test", model="gpt-test", client=client)

    provider.analyze(
        AnalysisRequest(prompt="Analiza riesgo", context="Ingreso: 1000")
    )

    user_message = client.completions.last_request["messages"][1]
    assert user_message["content"] == (
        "Contexto:\nIngreso: 1000\n\nSolicitud:\nAnaliza riesgo"
    )
