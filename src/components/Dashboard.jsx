import {
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  Activity,
  Database,
  TrendingUp,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { analizarConIA } from "../api";

function parseResultadoIA(resultadoIA) {
  if (!resultadoIA?.content) return null;

  try {
    return JSON.parse(resultadoIA.content);
  } catch {
    return null;
  }
}

function getRiskTheme(nivelRiesgo) {
  const normalizado = String(nivelRiesgo || "").toLowerCase();

  if (normalizado.includes("critico") || normalizado.includes("crítico") || normalizado.includes("alto")) {
    return {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: "text-red-500",
      IconoRiesgo: AlertTriangle,
    };
  }

  if (normalizado.includes("medio")) {
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: "text-amber-500",
      IconoRiesgo: Info,
    };
  }

  return {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: "text-green-500",
    IconoRiesgo: CheckCircle,
  };
}

function Dashboard({
  datosCliente,
  listaCreditos,
  historialPagos,
  resultadoIA,
  errorIA,
  setResultadoIA,
  setErrorIA,
}) {
  const [cargandoIA, setCargandoIA] = useState(false);
  const analisisIA = parseResultadoIA(resultadoIA);

  const ejecutarAnalisisIA = async () => {
    setCargandoIA(true);
    setErrorIA(null);
    try {
      const resultado = await analizarConIA(
        datosCliente,
        listaCreditos,
        historialPagos,
      );
      setResultadoIA(resultado);
    } catch (e) {
      setErrorIA(e.message);
    } finally {
      setCargandoIA(false);
    }
  };

  if (!datosCliente || !datosCliente.nombre) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <div className="bg-slate-100 p-6 rounded-full">
          <Activity className="w-16 h-16 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700">
          Aun no hay datos para evaluar
        </h2>
        <p className="text-slate-500 max-w-md">
          Por favor, inicie el proceso registrando la informacion basica del
          cliente para que el motor pueda realizar el analisis.
        </p>
        <Link
          to="/"
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Ir al Registro de Cliente
        </Link>
      </div>
    );
  }

  const ingresos = parseFloat(datosCliente.ingresosM) || 0;
  const deudaTotal = listaCreditos.reduce(
    (total, credito) => total + parseFloat(credito.monto || 0),
    0,
  );
  const cuotaTotalMensual = listaCreditos.reduce(
    (total, credito) => total + parseFloat(credito.cuota_mensual || 0),
    0,
  );
  const porcentajeEndeudamiento = ingresos > 0
    ? ((cuotaTotalMensual / ingresos) * 100).toFixed(1)
    : "0.0";

  const nivelRiesgo = analisisIA?.nivel_riesgo || "Pendiente";
  const alerta = analisisIA?.justificacion || "Ejecuta la evaluacion de IA desde el registro de pagos para determinar el nivel de riesgo.";
  const recomendacion = analisisIA?.recomendacion;
  const factoresClave = Array.isArray(analisisIA?.factores_clave)
    ? analisisIA.factores_clave
    : [];
  const colorTheme = getRiskTheme(nivelRiesgo);
  const IconoRiesgo = colorTheme.IconoRiesgo;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Resultados de Evaluacion
          </h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <User className="w-4 h-4" />
            Cliente evaluado:{" "}
            <strong className="text-slate-700">
              {datosCliente.nombre}
            </strong>{" "}
            (CC: {datosCliente.iddocumento})
          </p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          Fecha: {new Date().toLocaleDateString("es-CO")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Ingresos Declarados
            </p>
            <h3 className="text-xl font-bold text-slate-800">
              ${ingresos.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-lg">
            <Database className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Deuda Total</p>
            <h3 className="text-xl font-bold text-slate-800">
              ${deudaTotal.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <Activity className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Cuota Total Mensual
            </p>
            <h3 className="text-xl font-bold text-slate-800">
              ${cuotaTotalMensual.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colorTheme.bg}`}>
            <TrendingUp className={`w-6 h-6 ${colorTheme.icon}`} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              % Endeudamiento
            </p>
            <h3 className={`text-xl font-bold ${colorTheme.text}`}>
              {porcentajeEndeudamiento}%
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`col-span-1 rounded-xl border ${colorTheme.border} ${colorTheme.bg} p-8 flex flex-col items-center justify-center text-center shadow-sm`}
        >
          <IconoRiesgo className={`w-20 h-20 ${colorTheme.icon} mb-4`} />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            Nivel de Riesgo
          </h3>
          <h1
            className={`text-5xl font-black ${colorTheme.text} mb-4 uppercase tracking-wider`}
          >
            {nivelRiesgo}
          </h1>
          <p className="text-sm font-medium text-slate-600 px-4">{alerta}</p>
          <div className="mt-6 text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Analisis determinado por IA
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col">
          <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Analisis de IA
            </h3>
            <button
              onClick={ejecutarAnalisisIA}
              disabled={cargandoIA}
              className="text-xs font-mono bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded transition-colors"
            >
              {cargandoIA ? "Analizando..." : resultadoIA ? "Reintentar analisis" : "Ejecutar analisis"}
            </button>
          </div>

          <div className="p-6 flex-1 bg-[#0d1117] overflow-auto">
            {errorIA && (
              <p className="text-red-400 text-sm font-mono">Error: {errorIA}</p>
            )}
            {!resultadoIA && !cargandoIA && !errorIA && (
              <p className="text-slate-500 text-sm">
                El analisis se ejecuta al finalizar el registro de pagos.
              </p>
            )}
            {cargandoIA && (
              <p className="text-blue-400 text-sm animate-pulse">
                Consultando modelo de IA...
              </p>
            )}
            {resultadoIA && (
              <div className="space-y-4">
                <p className="text-slate-400 text-xs font-mono">
                  Modelo: {resultadoIA.model}
                </p>
                {recomendacion && (
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                      Recomendacion
                    </p>
                    <p className="text-green-300 text-sm leading-relaxed">
                      {recomendacion}
                    </p>
                  </div>
                )}
                {factoresClave.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-2">
                      Factores clave
                    </p>
                    <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
                      {factoresClave.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!analisisIA && (
                  <p className="text-green-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {resultadoIA.content}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
