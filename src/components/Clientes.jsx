import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  CreditCard,
  Eye,
  History,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import {
  actualizarEstadoCredito,
  analizarConIA,
  eliminarCredito,
  listarClientes,
  listarCreditosCliente,
  listarPagosCliente,
} from "../api";

function normalizarCliente(cliente) {
  return {
    idcliente: cliente.idcliente,
    nombre: cliente.nombre ?? "",
    iddocumento: cliente.iddocumento ?? "",
    ingresosM: cliente.ingresos_m ?? "",
    tipoEmpleado: cliente.tipo_empleado ?? "",
    scoreCredito: cliente.score_credito,
  };
}

function normalizarPago(pago) {
  return {
    ...pago,
    fechaPago: pago.fecha_pago,
    montoPagado: pago.monto_pagado,
    retrasoDias: pago.retraso_dias,
    estadoPago: pago.estado_pago,
  };
}

function formatoMoneda(valor) {
  return `$${Number(valor || 0).toLocaleString("es-CO", {
    maximumFractionDigits: 0,
  })}`;
}

function Clientes({
  setDatosCliente,
  setListaCreditos,
  setHistorialPagos,
  setResultadoIA,
  setErrorIA,
}) {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [creditosPorCliente, setCreditosPorCliente] = useState({});
  const [pagosPorCliente, setPagosPorCliente] = useState({});
  const [panelExpandido, setPanelExpandido] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoAccion, setCargandoAccion] = useState(null);
  const [creditoEditando, setCreditoEditando] = useState(null);
  const [creditoBorrando, setCreditoBorrando] = useState(null);
  const [error, setError] = useState(null);

  const cargarClientes = async () => {
    setCargando(true);
    setError(null);

    try {
      const data = await listarClientes();
      setClientes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
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
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return clientes;

    return clientes.filter((cliente) => {
      return [cliente.nombre, cliente.iddocumento, cliente.tipo_empleado]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(termino));
    });
  }, [busqueda, clientes]);

  const cargarDatosCliente = async (cliente, opciones = {}) => {
    const creditos = await listarCreditosCliente(cliente.idcliente);
    let pagos = [];

    try {
      pagos = await listarPagosCliente(cliente.idcliente);
    } catch (e) {
      if (!opciones.permitirPagosFallidos) {
        throw e;
      }
    }

    const clienteNormalizado = normalizarCliente(cliente);
    const pagosNormalizados = pagos.map(normalizarPago);

    setDatosCliente(clienteNormalizado);
    setListaCreditos(creditos);
    setHistorialPagos(pagosNormalizados);
    setResultadoIA(null);
    setErrorIA(null);

    return {
      datosCliente: clienteNormalizado,
      creditos,
      pagos: pagosNormalizados,
    };
  };

  const verCreditos = async (cliente) => {
    const key = `creditos-${cliente.idcliente}`;
    setCargandoAccion(key);
    setError(null);

    try {
      const creditos = await listarCreditosCliente(cliente.idcliente);
      setDatosCliente(normalizarCliente(cliente));
      setListaCreditos(creditos);
      setResultadoIA(null);
      setErrorIA(null);
      setCreditosPorCliente((actual) => ({
        ...actual,
        [cliente.idcliente]: creditos,
      }));
      setPanelExpandido((actual) =>
        actual?.idcliente === cliente.idcliente && actual?.tipo === "creditos"
          ? null
          : { idcliente: cliente.idcliente, tipo: "creditos" },
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setCargandoAccion(null);
    }
  };

  const verPagos = async (cliente) => {
    const key = `pagos-${cliente.idcliente}`;
    setCargandoAccion(key);
    setError(null);

    try {
      const pagos = await listarPagosCliente(cliente.idcliente);
      const pagosNormalizados = pagos.map(normalizarPago);

      setDatosCliente(normalizarCliente(cliente));
      setHistorialPagos(pagosNormalizados);
      setResultadoIA(null);
      setErrorIA(null);
      setPagosPorCliente((actual) => ({
        ...actual,
        [cliente.idcliente]: pagosNormalizados,
      }));
      setPanelExpandido((actual) =>
        actual?.idcliente === cliente.idcliente && actual?.tipo === "pagos"
          ? null
          : { idcliente: cliente.idcliente, tipo: "pagos" },
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setCargandoAccion(null);
    }
  };

  const cambiarEstadoCredito = async (cliente, credito, estado) => {
    setCreditoEditando(credito.idcredito);
    setError(null);

    try {
      const creditoActualizado = await actualizarEstadoCredito(
        credito.idcredito,
        estado,
      );

      setCreditosPorCliente((actual) => ({
        ...actual,
        [cliente.idcliente]: (actual[cliente.idcliente] ?? []).map((item) =>
          item.idcredito === credito.idcredito ? creditoActualizado : item,
        ),
      }));
      setListaCreditos((actual) =>
        actual.map((item) =>
          item.idcredito === credito.idcredito ? creditoActualizado : item,
        ),
      );
      setResultadoIA(null);
      setErrorIA(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreditoEditando(null);
    }
  };

  const borrarCredito = async (cliente, credito) => {
    const confirmar = window.confirm(
      `Deseas borrar el credito #${credito.idcredito}?`,
    );
    if (!confirmar) return;

    setCreditoBorrando(credito.idcredito);
    setError(null);

    try {
      await eliminarCredito(credito.idcredito);

      setCreditosPorCliente((actual) => ({
        ...actual,
        [cliente.idcliente]: (actual[cliente.idcliente] ?? []).filter(
          (item) => item.idcredito !== credito.idcredito,
        ),
      }));
      setListaCreditos((actual) =>
        actual.filter((item) => item.idcredito !== credito.idcredito),
      );
      setResultadoIA(null);
      setErrorIA(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreditoBorrando(null);
    }
  };

  const analizarCliente = async (cliente) => {
    const key = `analisis-${cliente.idcliente}`;
    setCargandoAccion(key);
    setError(null);
    setErrorIA(null);
    setResultadoIA(null);

    try {
      const expediente = await cargarDatosCliente(cliente, {
        permitirPagosFallidos: true,
      });
      const resultado = await analizarConIA(
        expediente.datosCliente,
        expediente.creditos,
        expediente.pagos,
      );

      setResultadoIA(resultado);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
      setErrorIA(e.message);
    } finally {
      setCargandoAccion(null);
    }
  };

  const gestionarCreditos = async (cliente) => {
    const key = `gestionar-${cliente.idcliente}`;
    setCargandoAccion(key);
    setError(null);

    try {
      await cargarDatosCliente(cliente);
      navigate("/creditos");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargandoAccion(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Cartera</p>
          <h2 className="text-2xl font-bold text-slate-800">
            Clientes registrados
          </h2>
          <p className="text-slate-500 mt-1">
            Consulta la cartera registrada y abre las acciones operativas por
            cliente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cliente"
              className="w-full sm:w-72 pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={cargarClientes}
            disabled={cargando}
            className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-medium"
          >
            {cargando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Base de clientes
          </h3>
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {clientesFiltrados.length} visibles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Documento</th>
                <th className="px-6 py-4 font-semibold">Ingresos</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-slate-500">Cargando clientes...</p>
                  </td>
                </tr>
              )}

              {!cargando && clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      No hay clientes para mostrar.
                    </p>
                  </td>
                </tr>
              )}

              {!cargando &&
                clientesFiltrados.map((cliente) => {
                  const creditos = creditosPorCliente[cliente.idcliente] ?? [];
                  const pagos = pagosPorCliente[cliente.idcliente] ?? [];
                  const expandido = panelExpandido?.idcliente === cliente.idcliente;
                  const mostrandoCreditos =
                    expandido && panelExpandido?.tipo === "creditos";
                  const mostrandoPagos =
                    expandido && panelExpandido?.tipo === "pagos";

                  return (
                    <Fragment key={cliente.idcliente}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            {cliente.nombre}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID {cliente.idcliente}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {cliente.iddocumento}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {formatoMoneda(cliente.ingresos_m)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600 uppercase">
                            {cliente.tipo_empleado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => verCreditos(cliente)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver deudas y creditos"
                            >
                              {cargandoAccion ===
                              `creditos-${cliente.idcliente}` ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => gestionarCreditos(cliente)}
                              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Gestionar creditos"
                            >
                              {cargandoAccion ===
                              `gestionar-${cliente.idcliente}` ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <CreditCard className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => verPagos(cliente)}
                              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Ver historial de pagos"
                            >
                              {cargandoAccion ===
                              `pagos-${cliente.idcliente}` ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <History className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => analizarCliente(cliente)}
                              className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                              title="Analizar capacidad de endeudamiento"
                            >
                              {cargandoAccion ===
                              `analisis-${cliente.idcliente}` ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Activity className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {mostrandoCreditos && (
                        <tr key={`${cliente.idcliente}-panel-creditos`}>
                          <td colSpan="5" className="bg-slate-50 px-6 py-5">
                            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <p className="font-semibold text-slate-700 flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-blue-500" />
                                  Deudas y creditos con nosotros
                                </p>
                                <span className="text-xs font-bold text-slate-500">
                                  {creditos.length} registros
                                </span>
                              </div>

                              {creditos.length === 0 ? (
                                <div className="px-4 py-6 text-sm text-slate-500">
                                  Este cliente no tiene creditos registrados.
                                </div>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-slate-500 bg-slate-50">
                                      <th className="px-4 py-3 text-left">
                                        Monto
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Cuota mensual
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Plazo
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Estado
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Accion
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {creditos.map((credito) => (
                                      <tr key={credito.idcredito}>
                                        <td className="px-4 py-3 font-medium text-slate-700">
                                          {formatoMoneda(credito.monto)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                          {formatoMoneda(
                                            credito.cuota_mensual,
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                          {credito.plazo_meses} meses
                                        </td>
                                        <td className="px-4 py-3">
                                          <select
                                            value={credito.estado}
                                            onChange={(e) =>
                                              cambiarEstadoCredito(
                                                cliente,
                                                credito,
                                                e.target.value,
                                              )
                                            }
                                            disabled={
                                              creditoEditando ===
                                              credito.idcredito
                                            }
                                            className="px-2 py-1 rounded border border-slate-300 bg-white text-xs font-bold uppercase text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                                          >
                                            <option value="activo">
                                              Activo
                                            </option>
                                            <option value="pagado">
                                              Pagado
                                            </option>
                                            <option value="en_mora">
                                              En mora
                                            </option>
                                            <option value="reestructurado">
                                              Reestructurado
                                            </option>
                                            <option value="castigado">
                                              Castigado
                                            </option>
                                          </select>
                                        </td>
                                        <td className="px-4 py-3">
                                          <button
                                            onClick={() =>
                                              borrarCredito(cliente, credito)
                                            }
                                            disabled={
                                              creditoBorrando ===
                                              credito.idcredito
                                            }
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                                            title="Borrar credito"
                                          >
                                            {creditoBorrando ===
                                            credito.idcredito ? (
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <Trash2 className="w-4 h-4" />
                                            )}
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                      {mostrandoPagos && (
                        <tr key={`${cliente.idcliente}-panel-pagos`}>
                          <td colSpan="5" className="bg-slate-50 px-6 py-5">
                            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <p className="font-semibold text-slate-700 flex items-center gap-2">
                                  <History className="w-4 h-4 text-amber-500" />
                                  Historial de pagos
                                </p>
                                <span className="text-xs font-bold text-slate-500">
                                  {pagos.length} registros
                                </span>
                              </div>

                              {pagos.length === 0 ? (
                                <div className="px-4 py-6 text-sm text-slate-500">
                                  Este cliente no tiene pagos registrados.
                                </div>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-slate-500 bg-slate-50">
                                      <th className="px-4 py-3 text-left">
                                        Fecha
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Credito
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Monto pagado
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Retraso
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Estado
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {pagos.map((pago) => (
                                      <tr key={pago.idpago}>
                                        <td className="px-4 py-3 font-medium text-slate-700">
                                          {pago.fechaPago}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                          #{pago.idcredito}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                          {formatoMoneda(pago.montoPagado)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                          {pago.retrasoDias} dias
                                        </td>
                                        <td className="px-4 py-3">
                                          <span
                                            className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                              pago.estadoPago === "a_tiempo"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-amber-100 text-amber-600"
                                            }`}
                                          >
                                            {pago.estadoPago}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Clientes;
