// src/api.js
const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function parseApiError(res) {
  const raw = await res.text();
  let detail;

  try {
    const parsed = JSON.parse(raw);
    detail = parsed.detail ?? raw;
  } catch {
    detail = raw;
  }

  if (res.status === 429 && String(detail).includes("insufficient_quota")) {
    return "La cuenta de OpenAI no tiene cuota disponible. Revisa el plan, billing o cambia la API key.";
  }

  return typeof detail === "string" ? detail : JSON.stringify(detail);
}

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
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function listarClientes() {
  const res = await fetch(`${BASE}/clientes/`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function listarCreditosCliente(idcliente) {
  const res = await fetch(`${BASE}/creditos/cliente/${idcliente}`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function listarPagosCliente(idcliente) {
  const res = await fetch(`${BASE}/pagos/cliente/${idcliente}`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function crearCredito(datos) {
  const res = await fetch(`${BASE}/creditos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function analizarConIA(
  datosCliente,
  listaCreditos,
  historialPagos,
) {
  const ingresos = parseFloat(datosCliente.ingresosM) || 0;
  const cuotaTotal = listaCreditos.reduce(
    (total, credito) => total + parseFloat(credito.cuota_mensual || 0),
    0,
  );
  const pct = ingresos > 0 ? ((cuotaTotal / ingresos) * 100).toFixed(1) : 0;

  const creditosDetalle = listaCreditos.map((credito, index) => ({
    numero: index + 1,
    monto: parseFloat(credito.monto || 0),
    tasa_interes: parseFloat(credito.tasa_interes || 0),
    plazo_meses: parseInt(credito.plazo_meses || 0),
    cuota_mensual: parseFloat(credito.cuota_mensual || 0),
    estado: credito.estado,
  }));

  const pagosDetalle = historialPagos.map((pago, index) => ({
    numero: index + 1,
    fecha_pago: pago.fechaPago,
    monto_pagado: parseFloat(pago.montoPagado || 0),
    retraso_dias: parseInt(pago.retrasoDias || 0),
    estado_pago: pago.estadoPago,
  }));

  const prompt = `
Analiza el riesgo de sobreendeudamiento del siguiente cliente:
- Nombre: ${datosCliente.nombre}
- Tipo empleado: ${datosCliente.tipoEmpleado}
- Ingresos mensuales: $${ingresos.toLocaleString()}
- Numero de creditos activos: ${listaCreditos.length}
- Cuota total mensual: $${cuotaTotal.toLocaleString()}
- Porcentaje de endeudamiento: ${pct}%
- Pagos registrados: ${historialPagos.length}
- Creditos: ${JSON.stringify(creditosDetalle)}
- Pagos: ${JSON.stringify(pagosDetalle)}

Responde exclusivamente con JSON valido, sin markdown, con esta forma:
{
  "nivel_riesgo": "Bajo | Medio | Alto | Critico",
  "justificacion": "2 o 3 oraciones",
  "recomendacion": "una recomendacion concreta",
  "factores_clave": ["factor 1", "factor 2", "factor 3"]
}
`.trim();

  const res = await fetch(`${BASE}/ai/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}
