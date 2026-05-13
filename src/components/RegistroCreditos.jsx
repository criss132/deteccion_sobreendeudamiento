import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import { listarClientes } from "../api";

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

function calcularCuotaMensual(monto, tasaAnualPorcentaje, plazoMeses) {
  const principal = parseFloat(monto);
  const tasaAnual = parseFloat(tasaAnualPorcentaje) / 100;
  const plazo = parseInt(plazoMeses);

  if (!principal || !plazo) return 0;

  const tasaMensual = tasaAnual / 12;
  if (!tasaMensual) return principal / plazo;

  return principal * tasaMensual / (1 - (1 + tasaMensual) ** -plazo);
}

function normalizarCliente(cliente) {
  return {
    idcliente: cliente.idcliente,
    nombre: cliente.nombre ?? "",
    iddocumento: cliente.iddocumento ?? "",
    ingresosM: cliente.ingresos_m ?? "",
    tipoEmpleado: cliente.tipo_empleado ?? "",
  };
}

function RegistroCreditos({
  datosCliente,
  setDatosCliente,
  listaCreditos,
  setListaCreditos,
}) {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [documentoBusqueda, setDocumentoBusqueda] = useState(
    datosCliente.iddocumento ?? "",
  );

  const [creditoActual, setCreditoActual] = useState({
    monto: "",
    tasainteres: "",
    plazoMeses: "",
    estado: "activo",
  });

  const manejarCambio = (e) => {
    setCreditoActual({ ...creditoActual, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    let activo = true;

    listarClientes()
      .then((data) => {
        if (activo) setClientes(data);
      })
      .catch((e) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargandoClientes(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const clienteSeleccionado = datosCliente.idcliente
    ? clientes.find((cliente) => cliente.idcliente === datosCliente.idcliente)
    : null;

  const sugerenciasClientes = useMemo(() => {
    const termino = documentoBusqueda.trim().toLowerCase();
    if (termino.length < 2) return [];

    return clientes
      .filter((cliente) => {
        const documento = String(cliente.iddocumento ?? "").toLowerCase();
        const nombre = String(cliente.nombre ?? "").toLowerCase();
        return documento.includes(termino) || nombre.includes(termino);
      })
      .slice(0, 5);
  }, [clientes, documentoBusqueda]);

  const seleccionarCliente = (cliente) => {
    setDatosCliente(normalizarCliente(cliente));
    setDocumentoBusqueda(cliente.iddocumento ?? "");
    setListaCreditos([]);
    setError(null);
  };

  const cambiarDocumento = (e) => {
    const valor = e.target.value;
    setDocumentoBusqueda(valor);

    if (datosCliente.idcliente && valor !== datosCliente.iddocumento) {
      setDatosCliente({
        idcliente: null,
        nombre: "",
        iddocumento: valor,
        ingresosM: "",
        tipoEmpleado: "",
      });
      setListaCreditos([]);
    }
  };

  const cuotaMensualEstimada = calcularCuotaMensual(
    creditoActual.monto,
    creditoActual.tasainteres,
    creditoActual.plazoMeses,
  );

  const agregarCredito = async (e) => {
    e.preventDefault();

    // Validar que el cliente ya fue guardado
    if (!datosCliente.idcliente) {
      setError("Selecciona un cliente por numero de documento antes de guardar la obligacion.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const res = await fetch(`${BASE}/creditos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idcliente: datosCliente.idcliente,
          monto: parseFloat(creditoActual.monto),
          tasa_interes: parseFloat(creditoActual.tasainteres) / 100, // 24 → 0.24
          plazo_meses: parseInt(creditoActual.plazoMeses),
          estado: creditoActual.estado,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Error al guardar crédito");
      }

      const creditoGuardado = await res.json();
      setListaCreditos([...listaCreditos, creditoGuardado]);
      setCreditoActual({
        monto: "",
        tasainteres: "",
        plazoMeses: "",
        estado: "activo",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const eliminarCredito = (index) => {
    // Solo elimina de la lista local (no hace DELETE al backend por ahora)
    setListaCreditos(listaCreditos.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Aviso si no hay cliente guardado aún */}
      {!datosCliente.idcliente && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg">
          ⚠️ No hay un cliente guardado en la base de datos. Ve al{" "}
          <a href="/" className="underline font-semibold">
            Registro de Cliente
          </a>{" "}
          primero.
        </div>
      )}

      {/* TARJETA DEL FORMULARIO */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg">
            <Plus className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Agregar Obligación Financiera
            </h2>
            <p className="text-sm text-slate-500">
              {datosCliente.nombre
                ? `Cliente: ${datosCliente.nombre}`
                : "Registre los créditos o deudas vigentes del cliente."}
            </p>
          </div>
        </div>

        <form onSubmit={agregarCredito} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-2 relative">
              <label className="text-sm font-semibold text-slate-700">
                Documento del Cliente
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={documentoBusqueda}
                  onChange={cambiarDocumento}
                  required
                  placeholder="Digite documento o nombre"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {documentoBusqueda.trim().length >= 2 &&
                !datosCliente.idcliente &&
                sugerenciasClientes.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    {sugerenciasClientes.map((cliente) => (
                      <button
                        key={cliente.idcliente}
                        type="button"
                        onClick={() => seleccionarCliente(cliente)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <span className="block text-sm font-semibold text-slate-800">
                          {cliente.nombre}
                        </span>
                        <span className="block text-xs text-slate-500">
                          Documento {cliente.iddocumento} - {cliente.tipo_empleado}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              {documentoBusqueda.trim().length >= 2 &&
                !datosCliente.idcliente &&
                !cargandoClientes &&
                sugerenciasClientes.length === 0 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    No se encontraron clientes con ese dato.
                  </p>
                )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 min-h-[92px]">
              {cargandoClientes ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando clientes...
                </div>
              ) : clienteSeleccionado || datosCliente.idcliente ? (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Cliente seleccionado
                  </p>
                  <p className="font-bold text-slate-800">
                    {datosCliente.nombre}
                  </p>
                  <p className="text-xs text-slate-500">
                    {datosCliente.iddocumento} - {datosCliente.tipoEmpleado}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-slate-500 flex items-start gap-2">
                  <UserCheck className="w-4 h-4 mt-0.5 text-slate-400" />
                  Selecciona una coincidencia para asociar la obligacion.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Monto del Crédito ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  name="monto"
                  value={creditoActual.monto}
                  onChange={manejarCambio}
                  required
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Tasa Interés Anual (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="tasainteres"
                value={creditoActual.tasainteres}
                onChange={manejarCambio}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. 24"
              />
              <p className="text-xs text-slate-400">
                Ingresa 24 para 24% anual
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Plazo (Meses)
              </label>
              <input
                type="number"
                name="plazoMeses"
                value={creditoActual.plazoMeses}
                onChange={manejarCambio}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. 12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Estado
              </label>
              <select
                name="estado"
                value={creditoActual.estado}
                onChange={manejarCambio}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="activo">Al día / Activo</option>
                <option value="en_mora">En Mora</option>
                <option value="pagado">Cerrado / Pagado</option>
                <option value="reestructurado">Reestructurado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Cuota Mensual Calculada
              </label>
              <div className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-semibold">
                ${cuotaMensualEstimada.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando || !datosCliente.idcliente}
            className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            {cargando ? (
              "Guardando..."
            ) : (
              <>
                <Plus className="w-4 h-4" /> Agregar a la Lista
              </>
            )}
          </button>
        </form>
      </div>

      {/* TABLA DE CRÉDITOS */}
      {listaCreditos.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Resumen de Deudas Registradas
            </h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              {listaCreditos.length} Créditos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Monto</th>
                  <th className="px-6 py-4 font-semibold">Cuota Mensual</th>
                  <th className="px-6 py-4 font-semibold">Plazo</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listaCreditos.map((credito, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-700">
                      ${parseFloat(credito.monto).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {/* El backend devuelve cuota_mensual calculada */}$
                      {parseFloat(credito.cuota_mensual ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {credito.plazo_meses} meses
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          credito.estado === "en_mora"
                            ? "bg-red-100 text-red-600"
                            : credito.estado === "pagado"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-green-100 text-green-600"
                        }`}
                      >
                        {credito.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => eliminarCredito(index)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => navigate("/pagos")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-transform hover:scale-105"
            >
              Continuar a Pagos <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroCreditos;
