import { useState } from 'react'; // 1. Importamos useState
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FormularioCliente from './components/FormularioCliente';
import RegistroCreditos from './components/RegistroCreditos';
import RegistroPagos from './components/RegistroPagos';
import Dashboard from './components/Dashboard';

function App() {
  // --- MEMORIA CENTRAL DEL SISTEMA ---
  const [datosCliente, setDatosCliente] = useState({
    nombre: '', iddocumento: '', ingresosM: '', tipoEmpleado: ''
  });
  const [listaCreditos, setListaCreditos] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  // -----------------------------------

  return (
    <Router>
      <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
        
        <nav style={{ backgroundColor: '#333', padding: '15px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Registro de Cliente</Link>
          <Link to="/creditos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Deudas y Créditos</Link>
          <Link to="/pagos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Historial de Pagos</Link>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Resultados</Link>
        </nav>

        <h1 style={{ textAlign: 'center', color: '#333', marginTop: '20px' }}>Sistema de Detección de Riesgo</h1>

        <div style={{ padding: '20px' }}>
          <Routes>
            {/* 2. Le pasamos la memoria a cada componente como "props" (propiedades) */}
            <Route 
              path="/" 
              element={<FormularioCliente datosCliente={datosCliente} setDatosCliente={setDatosCliente} />} 
            />
            
            <Route 
              path="/creditos" 
              element={<RegistroCreditos listaCreditos={listaCreditos} setListaCreditos={setListaCreditos} />} 
            />
            
            <Route 
              path="/pagos" 
              element={<RegistroPagos historialPagos={historialPagos} setHistorialPagos={setHistorialPagos} />} 
            />
            
            <Route 
              path="/dashboard" 
              element={<Dashboard datosCliente={datosCliente} listaCreditos={listaCreditos} historialPagos={historialPagos} />} 
            />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;