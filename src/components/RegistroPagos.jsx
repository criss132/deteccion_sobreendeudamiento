import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Calendar, Clock, History, Trash2, LayoutDashboard, Plus } from 'lucide-react';
import { analizarConIA } from '../api';

function RegistroPagos({
  datosCliente,
  listaCreditos,
  historialPagos,
  setHistorialPagos,
  setResultadoIA,
  setErrorIA,
}) {
  const navigate = useNavigate();
  const [cargandoIA, setCargandoIA] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);
  const [pagoActual, setPagoActual] = useState({
    fechaPago: '', montoPagado: '', retrasoDias: '0', estadoPago: 'a_tiempo'
  });

  const manejarCambio = (e) => {
    setPagoActual({
      ...pagoActual,
      [e.target.name]: e.target.value
    });
  };

  const agregarPago = (e) => {
    e.preventDefault();
    setHistorialPagos([...historialPagos, pagoActual]);
    setPagoActual({
      fechaPago: '', montoPagado: '', retrasoDias: '0', estadoPago: 'a_tiempo'
    });
  };

  const eliminarPago = (index) => {
    const nuevaLista = historialPagos.filter((_, i) => i !== index);
    setHistorialPagos(nuevaLista);
  };

  const finalizarYEvaluar = async () => {
    setCargandoIA(true);
    setErrorLocal(null);
    setErrorIA(null);

    try {
      const resultado = await analizarConIA(
        datosCliente,
        listaCreditos,
        historialPagos,
      );
      setResultadoIA(resultado);
      navigate('/dashboard');
    } catch (e) {
      setErrorLocal(e.message);
      setErrorIA(e.message);
    } finally {
      setCargandoIA(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
          <div className="bg-cyan-100 p-3 rounded-lg">
            <Wallet className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Registrar Comportamiento de Pago</h2>
            <p className="text-sm text-slate-500">Ingrese los ultimos pagos realizados por el cliente.</p>
          </div>
        </div>

        <form onSubmit={agregarPago} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Fecha de Pago
              </label>
              <input
                type="date"
                name="fechaPago"
                value={pagoActual.fechaPago}
                onChange={manejarCambio}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Monto Pagado ($)</label>
              <input
                type="number"
                name="montoPagado"
                value={pagoActual.montoPagado}
                onChange={manejarCambio}
                required
                placeholder="0.00"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Dias de Retraso
              </label>
              <input
                type="number"
                name="retrasoDias"
                value={pagoActual.retrasoDias}
                onChange={manejarCambio}
                min="0"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Estado del Pago</label>
              <select
                name="estadoPago"
                value={pagoActual.estadoPago}
                onChange={manejarCambio}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="a_tiempo">A tiempo</option>
                <option value="retraso_leve">Retraso leve</option>
                <option value="retraso_moderado">Retraso moderado</option>
                <option value="retraso_grave">Retraso grave</option>
              </select>
            </div>
          </div>

          <button type="submit" className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-5 h-5" /> Registrar Pago
          </button>
        </form>
      </div>

      {historialPagos.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-500" />
              Historial Reciente
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Monto</th>
                  <th className="px-6 py-4 font-semibold">Retraso</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-center">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historialPagos.map((pago, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-700 font-medium">{pago.fechaPago}</td>
                    <td className="px-6 py-4 text-slate-600">${parseFloat(pago.montoPagado).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${parseInt(pago.retrasoDias) > 0 ? 'text-orange-600' : 'text-slate-500'}`}>
                        {pago.retrasoDias} dias
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${pago.estadoPago === 'a_tiempo' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {pago.estadoPago.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => eliminarPago(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-slate-400 text-sm italic">Verifique que todos los datos sean correctos antes de proceder al analisis de IA.</p>
              {errorLocal && (
                <p className="text-red-300 text-sm mt-2">{errorLocal}</p>
              )}
            </div>
            <button
              onClick={finalizarYEvaluar}
              disabled={cargandoIA}
              className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-10 py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-105"
            >
              <LayoutDashboard className="w-5 h-5" />
              {cargandoIA ? 'Evaluando...' : 'Finalizar y Evaluar Riesgo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroPagos;
