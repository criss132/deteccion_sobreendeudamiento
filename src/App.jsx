import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  ShieldCheck,
  UserPlus,
  CreditCard,
  Wallet,
  Users,
  User,
  LogOut,
} from "lucide-react";

import Login from "./components/Login";
import FormularioCliente from "./components/FormularioCliente";
import RegistroCreditos from "./components/RegistroCreditos";
import RegistroPagos from "./components/RegistroPagos";
import Dashboard from "./components/Dashboard";
import Clientes from "./components/Clientes";

const clienteVacio = {
  idcliente: null,
  nombre: "",
  iddocumento: "",
  ingresosM: "",
  tipoEmpleado: "",
};

function App() {
  // --- ESTADO DE AUTENTICACIÓN ---
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  // --- MEMORIA CENTRAL DEL SISTEMA ---
  const [datosCliente, setDatosCliente] = useState(clienteVacio);
  const [listaCreditos, setListaCreditos] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [resultadoIA, setResultadoIA] = useState(null);
  const [errorIA, setErrorIA] = useState(null);
  const [resetKeys, setResetKeys] = useState({
    cliente: 0,
    creditos: 0,
    pagos: 0,
  });

  const limpiarResultado = () => {
    setResultadoIA(null);
    setErrorIA(null);
  };

  const irARegistroCliente = () => {
    setDatosCliente(clienteVacio);
    setListaCreditos([]);
    setHistorialPagos([]);
    limpiarResultado();
    setResetKeys((actual) => ({ ...actual, cliente: actual.cliente + 1 }));
  };

  const irARegistroCreditos = () => {
    setDatosCliente(clienteVacio);
    setListaCreditos([]);
    setHistorialPagos([]);
    limpiarResultado();
    setResetKeys((actual) => ({ ...actual, creditos: actual.creditos + 1 }));
  };

  const irARegistroPagos = () => {
    setDatosCliente(clienteVacio);
    setListaCreditos([]);
    setHistorialPagos([]);
    limpiarResultado();
    setResetKeys((actual) => ({ ...actual, pagos: actual.pagos + 1 }));
  };

  const cerrarSesion = () => {
    // Al cerrar sesión, limpiamos la memoria y ocultamos el sistema
    setEstaAutenticado(false);
    setDatosCliente(clienteVacio);
    setListaCreditos([]);
    setHistorialPagos([]);
    limpiarResultado();
  };

  return (
    <Router>
      {!estaAutenticado ? (
        // Si no está autenticado, pasamos la función para validar
        <Login onLoginExitoso={() => setEstaAutenticado(true)} />
      ) : (
        // Si está autenticado, mostramos el layout principal
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
          {/* BARRA LATERAL (SIDEBAR) */}
          <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-800">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
                FinRisk
              </h1>
              <p className="text-xs text-slate-400 mt-1 ml-10">
                Detección de Riesgo
              </p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              <Link
                to="/clientes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors font-medium"
              >
                <Users className="w-5 h-5 text-slate-400" /> Clientes
              </Link>
              <Link
                to="/"
                onClick={irARegistroCliente}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors font-medium"
              >
                <UserPlus className="w-5 h-5 text-slate-400" /> Registro de
                Cliente
              </Link>
              <Link
                to="/creditos"
                onClick={irARegistroCreditos}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors font-medium"
              >
                <CreditCard className="w-5 h-5 text-slate-400" /> Deudas y
                Créditos
              </Link>
              <Link
                to="/pagos"
                onClick={irARegistroPagos}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors font-medium"
              >
                <Wallet className="w-5 h-5 text-slate-400" /> Historial de Pagos
              </Link>
            </nav>

            {/* Zona de Usuario y Cerrar Sesión */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded-full">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Usuario</p>
                  <p className="text-white font-medium text-sm">Admin</p>
                </div>
              </div>

              <button
                onClick={cerrarSesion}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </aside>

          {/* ÁREA DE CONTENIDO PRINCIPAL */}
          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className="bg-white h-16 border-b border-slate-200 flex items-center px-8 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-700">
                Panel de Administración
              </h2>
            </header>

            <div className="p-8 flex-1 overflow-auto">
              <Routes>
                <Route
                  path="/clientes"
                  element={
                    <Clientes
                      setDatosCliente={setDatosCliente}
                      setListaCreditos={setListaCreditos}
                      setHistorialPagos={setHistorialPagos}
                      setResultadoIA={setResultadoIA}
                      setErrorIA={setErrorIA}
                    />
                  }
                />
                <Route
                  path="/"
                  element={
                    <FormularioCliente
                      key={resetKeys.cliente}
                      datosCliente={datosCliente}
                      setDatosCliente={setDatosCliente}
                    />
                  }
                />
                <Route
                  path="/creditos"
                  element={
                    <RegistroCreditos
                      key={resetKeys.creditos}
                      datosCliente={datosCliente}
                      setDatosCliente={setDatosCliente}
                      listaCreditos={listaCreditos}
                      setListaCreditos={setListaCreditos}
                      historialPagos={historialPagos}
                      setResultadoIA={setResultadoIA}
                      setErrorIA={setErrorIA}
                    />
                  }
                />
                <Route
                  path="/pagos"
                  element={
                    <RegistroPagos
                      key={resetKeys.pagos}
                      datosCliente={datosCliente}
                      setDatosCliente={setDatosCliente}
                      listaCreditos={listaCreditos}
                      setListaCreditos={setListaCreditos}
                      historialPagos={historialPagos}
                      setHistorialPagos={setHistorialPagos}
                      setResultadoIA={setResultadoIA}
                      setErrorIA={setErrorIA}
                    />
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Dashboard
                      datosCliente={datosCliente}
                      listaCreditos={listaCreditos}
                      historialPagos={historialPagos}
                      resultadoIA={resultadoIA}
                      errorIA={errorIA}
                      setResultadoIA={setResultadoIA}
                      setErrorIA={setErrorIA}
                    />
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
