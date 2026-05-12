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

## Configurar variables

```powershell
Copy-Item .env.example .env
```

Luego define `OPENAI_API_KEY` en `.env`.

## Ejecutar API

```powershell
python -m uvicorn backend.main:app --reload
```

Endpoints iniciales:

- `GET /health`
- `POST /ai/analyze`
