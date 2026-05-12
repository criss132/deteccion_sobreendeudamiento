import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight } from 'lucide-react'; // Importamos íconos para darle un toque premium

function FormularioCliente({ datosCliente, setDatosCliente }) {
  const navigate = useNavigate();

  const manejarCambio = (e) => {
    setDatosCliente({
      ...datosCliente,
      [e.target.name]: e.target.value
    });
  };

  const enviarDatos = (e) => {
    e.preventDefault();
    navigate('/creditos');
  };

  return (
    <div className="max-w-3xl mx-auto mt-4">
      
      {/* Contenedor Principal: La "Tarjeta" blanca */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Cabecera de la Tarjeta (Gris muy claro) */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Registro de Cliente</h2>
            <p className="text-sm text-slate-500">Ingrese los datos básicos para iniciar la evaluación.</p>
          </div>
        </div>

        {/* Cuerpo del formulario */}
        <div className="p-8">
          <form onSubmit={enviarDatos} className="space-y-6">
            
            {/* Cuadrícula (Grid): 1 columna en celulares, 2 columnas en pantallas grandes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Campo Nombre */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={datosCliente.nombre}
                  onChange={manejarCambio}
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
                />
              </div>

              {/* Campo Documento */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Documento de Identidad</label>
                <input
                  type="text"
                  name="iddocumento"
                  value={datosCliente.iddocumento}
                  onChange={manejarCambio}
                  required
                  placeholder="Ej. 1002345678"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
                />
              </div>

              {/* Campo Ingresos */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Ingresos Mensuales ($)</label>
                <input
                  type="number"
                  name="ingresosM"
                  value={datosCliente.ingresosM}
                  onChange={manejarCambio}
                  required
                  placeholder="Ej. 3500000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
                />
              </div>

              {/* Campo Tipo de Empleado */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tipo de Empleado</label>
                <select
                  name="tipoEmpleado"
                  value={datosCliente.tipoEmpleado}
                  onChange={manejarCambio}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
                >
                  <option value="">Seleccione una opción...</option>
                  <option value="asalariado">Asalariado (Dependiente)</option>
                  <option value="independiente">Independiente</option>
                  <option value="pensionado">Pensionado</option>
                </select>
              </div>

            </div>

            {/* Pie del Formulario: Botón alineado a la derecha */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                Guardar y Continuar
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