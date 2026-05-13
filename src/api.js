// src/api.js
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function crearCliente(datos) {
  const res = await fetch(`${BASE}/clientes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: datos.nombre,
      iddocumento: datos.iddocumento,
      ingresos_m: parseFloat(datos.ingresosM),
      tipo_empleado: datos.tipoEmpleado,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function crearCredito(datos) {
  const res = await fetch(`${BASE}/creditos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function analizarConIA(
  datosCliente,
  listaCreditos,
  historialPagos,
) {
  const ingresos = parseFloat(datosCliente.ingresosM) || 0;
  const cuotaTotal = listaCreditos.reduce(
    (t, c) => t + parseFloat(c.cuotaMensual || 0),
    0,
  );
  const pct = ingresos > 0 ? ((cuotaTotal / ingresos) * 100).toFixed(1) : 0;

  const prompt = `
Analiza el riesgo de sobreendeudamiento del siguiente cliente:
- Nombre: ${datosCliente.nombre}
- Tipo empleado: ${datosCliente.tipoEmpleado}
- Ingresos mensuales: $${ingresos.toLocaleString()}
- Número de créditos activos: ${listaCreditos.length}
- Cuota total mensual: $${cuotaTotal.toLocaleString()}
- Porcentaje de endeudamiento: ${pct}%
- Pagos registrados: ${historialPagos.length}

Responde en español con:
1. Nivel de riesgo (Bajo / Medio / Alto / Crítico)
2. Justificación breve (2-3 oraciones)
3. Una recomendación concreta
`.trim();

  const res = await fetch(`${BASE}/ai/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { content, model, response_id }
}
