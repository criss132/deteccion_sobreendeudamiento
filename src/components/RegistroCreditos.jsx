import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Trash2, ChevronRight, DollarSign } from 'lucide-react';

function RegistroCreditos({ listaCreditos, setListaCreditos }) {
  const navigate = useNavigate();

  const [creditoActual, setCreditoActual] = useState({
    monto: '', tasainteres: '', plazoMeses: '', cuotaMensual: '', estado: 'activo'
  });

  const manejarCambio = (e) => {
    setCreditoActual({ ...creditoActual, [e.target.name]: e.target.value });
  };

  const agregarCredito = (e) => {
    e.preventDefault();
    setListaCreditos([...listaCreditos, creditoActual]);
    setCreditoActual({ monto: '', tasainteres: '', plazoMeses: '', cuotaMensual: '', estado: 'activo' });
  };

  const eliminarCredito = (index) => {
    const nuevaLista = listaCreditos.filter((_, i) => i !== index);
    setListaCreditos(nuevaLista);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* TARJETA DEL FORMULARIO */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg">
            <Plus className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Agregar Obligación Financiera</h2>
            <p className="text-sm text-slate-500">Registre los créditos o deudas vigentes del cliente.</p>
          </div>
        </div>

        <form onSubmit={agregarCredito} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Monto del Crédito</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input type="number" name="monto" value={creditoActual.monto} onChange={manejarCambio} required className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tasa Interés (%)</label>
              <input type="number" step="0.01" name="tasainteres" value={creditoActual.tasainteres} onChange={manejarCambio} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. 2.5" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Plazo (Meses)</label>
              <input type="number" name="plazoMeses" value={creditoActual.plazoMeses} onChange={manejarCambio} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. 12" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Valor de la Cuota</label>
              <input type="number" name="cuotaMensual" value={creditoActual.cuotaMensual} onChange={manejarCambio} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cuota mensual" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Estado</label>
              <select name="estado" value={creditoActual.estado} onChange={manejarCambio} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                <option value="activo">Al día / Activo</option>
                <option value="mora">En Mora</option>
                <option value="pagado">Cerrado / Pagado</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Agregar a la Lista
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
                  <th className="px-6 py-4 font-semibold">Cuota</th>
                  <th className="px-6 py-4 font-semibold">Plazo</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listaCreditos.map((credito, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">${parseFloat(credito.monto).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">${parseFloat(credito.cuotaMensual).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">{credito.plazoMeses} meses</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${credito.estado === 'mora' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {credito.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => eliminarCredito(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button onClick={() => navigate('/pagos')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-transform hover:scale-105">
              Continuar a Pagos <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroCreditos;