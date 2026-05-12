import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShieldCheck, UserPlus, CreditCard, Wallet, LayoutDashboard, User, LogOut } from 'lucide-react';

import Login from './components/Login';
import FormularioCliente from './components/FormularioCliente';
import RegistroCreditos from './components/RegistroCreditos';
import RegistroPagos from './components/RegistroPagos';
import Dashboard from './components/Dashboard';

function App() {
  // --- ESTADO DE AUTENTICACIÓN ---
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  // --- MEMORIA CENTRAL DEL SISTEMA ---
  const [datosCliente, setDatosCliente] = useState({
    nombre: '', iddocumento: '', ingresosM: '', tipoEmpleado: ''
  });
  const [listaCreditos, setListaCreditos] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);

  // Si no está autenticado, devolvemos SOLO la pantalla de Login
  if (!estaAutenticado) {
    return <Login onLoginExitoso={() => setEstaAutenticado(true)} />;
  }

  // Si ESTÁ autenticado, mostramos toda la aplicación normal
  const cerrarSesion = () => {
    // Al cerrar sesión, limpiamos la memoria y lo devolvemos al login
    setEstaAutenticado(false);
    setDatosCliente({ nombre: '', iddocumento: '', ingresosM: '', tipoEmpleado: '' });
    setListaCreditos([]);
    setHistorialPagos([]);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
        
        {/* BARRA LATERAL (SIDEBAR) */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-blue-500" /> 
              FinRisk
            </h1>
            <p className="text-xs text-slate-400 mt-1 ml-10">Detección de Riesgo</p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors font-medium">
              <UserPlus className="w-5 h-5 text-slate-400" /> Registro de Cliente
            </Link>
            <Link to="/creditos" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors font-medium">
              <CreditCard className="w-5 h-5 text-slate-400" /> Deudas y Créditos
            </Link>
            <Link to="/pagos" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors font-medium">
              <Wallet className="w-5 h-5 text-slate-400" /> Historial de Pagos
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-md mt-4">
              <LayoutDashboard className="w-5 h-5 text-blue-200" /> Ver Resultados
            </Link>
          </nav>

          {/* Zona de Usuario y Cerrar Sesión */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-full"><User className="w-4 h-4 text-slate-300" /></div>
              <div>
                <p className="text-xs text-slate-400">Usuario</p>
                <p className="text-white font-medium text-sm">Admin</p>
              </div>
            </div>
            
            {/* BOTÓN CERRAR SESIÓN */}
            <button onClick={cerrarSesion} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* ÁREA DE CONTENIDO PRINCIPAL */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-white h-16 border-b border-slate-200 flex items-center px-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">Panel de Administración</h2>
          </header>

          <div className="p-8 flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<FormularioCliente datosCliente={datosCliente} setDatosCliente={setDatosCliente} />} />
              <Route path="/creditos" element={<RegistroCreditos listaCreditos={listaCreditos} setListaCreditos={setListaCreditos} />} />
              <Route path="/pagos" element={<RegistroPagos historialPagos={historialPagos} setHistorialPagos={setHistorialPagos} />} />
              <Route path="/dashboard" element={<Dashboard datosCliente={datosCliente} listaCreditos={listaCreditos} historialPagos={historialPagos} />} />
            </Routes>
          </div>
        </main>

      </div>
    </Router>
  );
}

export default App;