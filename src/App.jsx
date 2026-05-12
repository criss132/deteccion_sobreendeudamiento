import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FormularioCliente from './components/FormularioCliente';
import RegistroCreditos from './components/RegistroCreditos';
import Dashboard from './components/Dashboard';
import RegistroPagos from './components/RegistroPagos';

function App() {
  return (
    <Router>
      <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
        
        {/* BARRA DE NAVEGACIÓN */}
        <nav style={{ backgroundColor: '#333', padding: '15px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
            Registro de Cliente
          </Link>
          <Link to="/creditos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
            Deudas y Créditos
          </Link>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
            Resultados (Dashboard)
          </Link>
          <Link to="/pagos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
            Historial de Pagos
          </Link>
        </nav>
        

        {/* TÍTULO PRINCIPAL */}
        <h1 style={{ textAlign: 'center', color: '#333', marginTop: '20px' }}>
          Sistema de Detección de Riesgo
        </h1>

        {/* VENTANAS */}
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<FormularioCliente />} />
            <Route path="/creditos" element={<RegistroCreditos />} />
            <Route path="/pagos" element={<RegistroPagos />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;