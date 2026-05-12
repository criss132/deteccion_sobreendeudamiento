# Backend IA

Modulo Python para integrar el analisis de IA con OpenAI.

## Activar entorno

```powershell
.\.venv\bin\Activate.ps1
```

## Instalar dependencias

```powershell
python -m pip install -r requirements.txt
```

## Configurar variables reales

El backend carga las variables desde `.env` en la raiz del proyecto.

```env
OPENAI_API_KEY=tu_api_key_real
OPENAI_MODEL=gpt-5-mini
```

`.env` esta ignorado por Git para evitar subir claves. `.env.example` queda solo como referencia publica.

## Ejecutar API

```powershell
python -m uvicorn backend.main:app --reload
```

Endpoints iniciales:

- `GET /health`
- `POST /ai/analyze`
