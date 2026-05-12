import { AlertTriangle, CheckCircle, Info, DollarSign, Activity, Database, TrendingUp, User } from 'lucide-react';
import { Link } from 'react-router-dom';

function Dashboard({ datosCliente, listaCreditos, historialPagos }) {
  
  // 1. Pantalla vacía si el usuario entra directo sin llenar datos
  if (!datosCliente || !datosCliente.nombre) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <div className="bg-slate-100 p-6 rounded-full">
          <Activity className="w-16 h-16 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700">Aún no hay datos para evaluar</h2>
        <p className="text-slate-500 max-w-md">Por favor, inicie el proceso registrando la información básica del cliente para que el motor pueda realizar el análisis.</p>
        <Link to="/" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          Ir al Registro de Cliente
        </Link>
      </div>
    );
  }

  // 2. Cálculos matemáticos preliminares
  const ingresos = parseFloat(datosCliente.ingresosM) || 0;
  const deudaTotal = listaCreditos.reduce((total, credito) => total + parseFloat(credito.monto || 0), 0);
  const cuotaTotalMensual = listaCreditos.reduce((total, credito) => total + parseFloat(credito.cuotaMensual || 0), 0);
  
  let porcentajeEndeudamiento = 0;
  if (ingresos > 0) {
    porcentajeEndeudamiento = ((cuotaTotalMensual / ingresos) * 100).toFixed(1);
  }

  // 3. Lógica de Riesgo y colores dinámicos
  let nivelRiesgo = 'Bajo';
  let alerta = 'El cliente tiene un nivel de deuda manejable y saludable.';
  let colorTheme = { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500' };
  let IconoRiesgo = CheckCircle;

  if (porcentajeEndeudamiento > 60) {
    nivelRiesgo = 'Alto';
    alerta = 'Crítico: El cliente compromete más del 60% de sus ingresos mensuales en cuotas.';
    colorTheme = { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500' };
    IconoRiesgo = AlertTriangle;
  } else if (porcentajeEndeudamiento > 40) {
    nivelRiesgo = 'Medio';
    alerta = 'Precaución: Nivel de endeudamiento considerable. Requiere observación.';
    colorTheme = { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500' };
    IconoRiesgo = Info;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Encabezado del Dashboard */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resultados de Evaluación</h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <User className="w-4 h-4" /> 
            Cliente evaluado: <strong className="text-slate-700">{datosCliente.nombre}</strong> (CC: {datosCliente.iddocumento})
          </p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          Fecha: {new Date().toLocaleDateString('es-CO')}
        </div>
      </div>

      {/* FILA 1: Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Ingresos Declarados</p>
            <h3 className="text-xl font-bold text-slate-800">${ingresos.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-lg"><Database className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Deuda Total</p>
            <h3 className="text-xl font-bold text-slate-800">${deudaTotal.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-slate-50 p-3 rounded-lg"><Activity className="w-6 h-6 text-slate-600" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Cuota Total Mensual</p>
            <h3 className="text-xl font-bold text-slate-800">${cuotaTotalMensual.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colorTheme.bg}`}><TrendingUp className={`w-6 h-6 ${colorTheme.icon}`} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">% Endeudamiento</p>
            <h3 className={`text-xl font-bold ${colorTheme.text}`}>{porcentajeEndeudamiento}%</h3>
          </div>
        </div>
      </div>

      {/* FILA 2: Diagnóstico y Consola de IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel de Nivel de Riesgo (Ocupa 1 columna) */}
        <div className={`col-span-1 rounded-xl border ${colorTheme.border} ${colorTheme.bg} p-8 flex flex-col items-center justify-center text-center shadow-sm`}>
          <IconoRiesgo className={`w-20 h-20 ${colorTheme.icon} mb-4`} />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Nivel de Riesgo</h3>
          <h1 className={`text-5xl font-black ${colorTheme.text} mb-4 uppercase tracking-wider`}>
            {nivelRiesgo}
          </h1>
          <p className="text-sm font-medium text-slate-600 px-4">
            {alerta}
          </p>
          <div className="mt-6 text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Análisis Frontend Preliminar
          </div>
        </div>

        {/* Panel de Datos para el Backend (Ocupa 2 columnas) */}
        <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col">
          <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Carga Útil para la IA (Backend)
            </h3>
            <span className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Listo para enviar
            </span>
          </div>
          
          <div className="p-6 overflow-auto bg-[#0d1117] flex-1">
            <p className="text-slate-400 text-sm mb-4">
              Datos que pueden servir al modelo de IA:
            </p>
            <pre className="text-blue-300 font-mono text-sm">
{JSON.stringify({
  request_id: "REQ-" + Math.floor(Math.random() * 100000),
  timestamp: new Date().toISOString(),
  datos_cliente: datosCliente,
  obligaciones_financieras: listaCreditos,
  comportamiento_pagos: historialPagos
}, null, 2)}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;