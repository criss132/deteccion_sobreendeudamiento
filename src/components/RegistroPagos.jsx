import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  History,
  LayoutDashboard,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Wallet,
} from 'lucide-react';
import {
  analizarConIA,
  crearPago,
  listarClientes,
  listarCreditosCliente,
} from '../api';

function normalizarCliente(cliente) {
  return {
    idcliente: cliente.idcliente,
    nombre: cliente.nombre ?? '',
    iddocumento: cliente.iddocumento ?? '',
    ingresosM: cliente.ingresos_m ?? '',
    tipoEmpleado: cliente.tipo_empleado ?? '',
  };
}

function normalizarPago(pago) {
  return {
    ...pago,
    fechaPago: pago.fechaPago ?? pago.fecha_pago,
    montoPagado: pago.montoPagado ?? pago.monto_pagado,
    retrasoDias: pago.retrasoDias ?? pago.retraso_dias,
    estadoPago: pago.estadoPago ?? pago.estado_pago,
  };
}

function RegistroPagos({
  datosCliente,
  setDatosCliente,
  listaCreditos,
  setListaCreditos,
  historialPagos,
  setHistorialPagos,
  setResultadoIA,
  setErrorIA,
}) {
  const navigate = useNavigate();
  const [cargandoIA, setCargandoIA] = useState(false);
  const [cargandoPago, setCargandoPago] = useState(false);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [cargandoCreditos, setCargandoCreditos] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [documentoBusqueda, setDocumentoBusqueda] = useState(
    datosCliente.iddocumento ?? '',
  );
  const [pagoActual, setPagoActual] = useState({
    idcredito: '',
    fechaPago: '',
    montoPagado: '',
    retrasoDias: '0',
    estadoPago: 'a_tiempo',
  });

  const manejarCambio = (e) => {
    setPagoActual({
      ...pagoActual,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    let activo = true;

    listarClientes()
      .then((data) => {
        if (activo) setClientes(data);
      })
      .catch((e) => {
        if (activo) setErrorLocal(e.message);
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
        const documento = String(cliente.iddocumento ?? '').toLowerCase();
        const nombre = String(cliente.nombre ?? '').toLowerCase();
        return documento.includes(termino) || nombre.includes(termino);
      })
      .slice(0, 5);
  }, [clientes, documentoBusqueda]);

  const seleccionarCliente = async (cliente) => {
    const clienteNormalizado = normalizarCliente(cliente);
    setDatosCliente(clienteNormalizado);
    setDocumentoBusqueda(cliente.iddocumento ?? '');
    setHistorialPagos([]);
    setResultadoIA(null);
    setErrorIA(null);
    setErrorLocal(null);
    setCargandoCreditos(true);

    try {
      const creditos = await listarCreditosCliente(cliente.idcliente);
      setListaCreditos(creditos);
      setPagoActual((actual) => ({
        ...actual,
        idcredito: creditos[0]?.idcredito ? String(creditos[0].idcredito) : '',
      }));
    } catch (e) {
      setListaCreditos([]);
      setPagoActual((actual) => ({ ...actual, idcredito: '' }));
      setErrorLocal(e.message);
    } finally {
      setCargandoCreditos(false);
    }
  };

  const cambiarDocumento = (e) => {
    const valor = e.target.value;
    setDocumentoBusqueda(valor);

    if (datosCliente.idcliente && valor !== datosCliente.iddocumento) {
      setDatosCliente({
        idcliente: null,
        nombre: '',
        iddocumento: valor,
        ingresosM: '',
        tipoEmpleado: '',
      });
      setListaCreditos([]);
      setHistorialPagos([]);
      setPagoActual((actual) => ({ ...actual, idcredito: '' }));
      setResultadoIA(null);
      setErrorIA(null);
    }
  };

  const agregarPago = async (e) => {
    e.preventDefault();

    if (!datosCliente.idcliente) {
      setErrorLocal('Selecciona un cliente por numero de documento antes de registrar pagos.');
      return;
    }

    if (!pagoActual.idcredito) {
      setErrorLocal('Selecciona el credito al que pertenece este pago.');
      return;
    }

    setCargandoPago(true);
    setErrorLocal(null);

    try {
      const pagoGuardado = await crearPago({
        idcredito: parseInt(pagoActual.idcredito),
        idcliente: datosCliente.idcliente,
        fecha_pago: pagoActual.fechaPago,
        monto_pagado: parseFloat(pagoActual.montoPagado),
        retraso_dias: parseInt(pagoActual.retrasoDias || 0),
        estado_pago: pagoActual.estadoPago,
      });

      setHistorialPagos([...historialPagos, normalizarPago(pagoGuardado)]);
      setPagoActual({
        idcredito: pagoActual.idcredito,
        fechaPago: '',
        montoPagado: '',
        retrasoDias: '0',
        estadoPago: 'a_tiempo',
      });
    } catch (e) {
      setErrorLocal(e.message);
    } finally {
      setCargandoPago(false);
    }
  };

  const eliminarPago = (index) => {
    const nuevaLista = historialPagos.filter((_, i) => i !== index);
    setHistorialPagos(nuevaLista);
  };

  const finalizarYEvaluar = async () => {
    if (!datosCliente.idcliente) {
      setErrorLocal('Selecciona un cliente antes de evaluar el riesgo.');
      return;
    }

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
                        className="w-full px-4 py-3 text-left hover:bg-cyan-50 transition-colors border-b border-slate-100 last:border-b-0"
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
              {cargandoClientes || cargandoCreditos ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {cargandoClientes ? 'Cargando clientes...' : 'Cargando creditos...'}
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
                  <p className="text-xs text-slate-400">
                    {listaCreditos.length} creditos cargados
                  </p>
                </div>
              ) : (
                <div className="text-sm text-slate-500 flex items-start gap-2">
                  <UserCheck className="w-4 h-4 mt-0.5 text-slate-400" />
                  Selecciona una coincidencia para asociar los pagos.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Credito asociado
              </label>
              <select
                name="idcredito"
                value={pagoActual.idcredito}
                onChange={manejarCambio}
                required
                disabled={!datosCliente.idcliente || listaCreditos.length === 0}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                <option value="">Seleccione un credito...</option>
                {listaCreditos.map((credito) => (
                  <option key={credito.idcredito} value={credito.idcredito}>
                    #{credito.idcredito} - ${parseFloat(credito.monto ?? 0).toLocaleString()} - {credito.estado}
                  </option>
                ))}
              </select>
              {datosCliente.idcliente && listaCreditos.length === 0 && !cargandoCreditos && (
                <p className="text-xs text-amber-600">
                  Este cliente no tiene creditos registrados para asociar pagos.
                </p>
              )}
            </div>

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

          <button
            type="submit"
            disabled={!datosCliente.idcliente || !pagoActual.idcredito || cargandoPago}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            {cargandoPago ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" /> Registrar Pago
              </>
            )}
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
                  <th className="px-6 py-4 font-semibold">Credito</th>
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
                    <td className="px-6 py-4 text-slate-600">#{pago.idcredito}</td>
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
