import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Plus, Trash2, ChevronRight } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function RegistroCreditos({ datosCliente, listaCreditos, setListaCreditos }) {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [creditoActual, setCreditoActual] = useState({
    monto: "",
    tasainteres: "",
    plazoMeses: "",
    estado: "activo",
  });

  const manejarCambio = (e) => {
    setCreditoActual({ ...creditoActual, [e.target.name]: e.target.value });
  };

  const agregarCredito = async (e) => {
    e.preventDefault();

    // Validar que el cliente ya fue guardado
    if (!datosCliente.idcliente) {
      setError("Primero debes registrar y guardar el cliente.");
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
