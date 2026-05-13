import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ChevronRight } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function FormularioCliente({ datosCliente, setDatosCliente }) {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const manejarCambio = (e) => {
    setDatosCliente({ ...datosCliente, [e.target.name]: e.target.value });
  };

  const enviarDatos = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/clientes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datosCliente.nombre,
          iddocumento: datosCliente.iddocumento,
          ingresos_m: parseFloat(datosCliente.ingresosM),
          tipo_empleado: datosCliente.tipoEmpleado,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Error al guardar cliente");
      }

      const clienteGuardado = await res.json();
      // Guardamos el idcliente que devuelve el backend
      setDatosCliente({
        ...datosCliente,
        idcliente: clienteGuardado.idcliente,
      });
      navigate("/creditos");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Registro de Cliente
            </h2>
            <p className="text-sm text-slate-500">
              Ingrese los datos básicos para iniciar la evaluación.
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={enviarDatos} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={datosCliente.nombre}
                  onChange={manejarCambio}
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Documento de Identidad
                </label>
                <input
                  type="text"
                  name="iddocumento"
                  value={datosCliente.iddocumento}
                  onChange={manejarCambio}
                  required
                  placeholder="Ej. 1002345678"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Ingresos Mensuales ($)
                </label>
                <input
                  type="number"
                  name="ingresosM"
                  value={datosCliente.ingresosM}
                  onChange={manejarCambio}
                  required
                  placeholder="Ej. 3500000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Tipo de Empleado
                </label>
                <select
                  name="tipoEmpleado"
                  value={datosCliente.tipoEmpleado}
                  onChange={manejarCambio}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
                >
                  <option value="">Seleccione una opción...</option>
                  <option value="dependiente">Asalariado (Dependiente)</option>
                  <option value="independiente">Independiente</option>
                  <option value="pensionado">Pensionado</option>
                </select>
              </div>
            </div>

            {/* Error del backend */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={cargando}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                {cargando ? "Guardando..." : "Guardar y Continuar"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormularioCliente;
