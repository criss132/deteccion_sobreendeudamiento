import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegistroPagos({ historialPagos, setHistorialPagos }) {
  const navigate = useNavigate();
  
  const [pagoActual, setPagoActual] = useState({
    fechaPago: '', montoPagado: '', retrasoDias: '0', estadoPago: 'completado'
  });

  const manejarCambio = (e) => {
    setPagoActual({
      ...pagoActual,
      [e.target.name]: e.target.value
    });
  };

  const agregarPago = (e) => {
    e.preventDefault();
    // Guardamos en la memoria central (App.jsx)
    setHistorialPagos([...historialPagos, pagoActual]);
    
    setPagoActual({
      fechaPago: '', montoPagado: '', retrasoDias: '0', estadoPago: 'completado'
    });
  };

  const irADashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', borderTop: '2px solid #eee', fontFamily: 'sans-serif' }}>
      <h2>Historial de Pagos</h2>
      <p>Registre los últimos pagos realizados para evaluar el comportamiento del cliente.</p>

      <form onSubmit={agregarPago} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Fecha de Pago:</label>
            <input type="date" name="fechaPago" value={pagoActual.fechaPago} onChange={manejarCambio} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Monto Pagado ($):</label>
            <input type="number" name="montoPagado" value={pagoActual.montoPagado} onChange={manejarCambio} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Días de Retraso:</label>
            <input type="number" name="retrasoDias" value={pagoActual.retrasoDias} onChange={manejarCambio} min="0" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Estado del Pago:</label>
            <select name="estadoPago" value={pagoActual.estadoPago} onChange={manejarCambio} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="completado">Completado</option>
              <option value="parcial">Pago Parcial</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          + Registrar Pago
        </button>
      </form>

      {historialPagos.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Pagos Registrados ({historialPagos.length})</h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            {historialPagos.map((pago, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <strong>{pago.fechaPago}:</strong> ${pago.montoPagado} <br/>
                Estado: {pago.estadoPago} | Retraso: {pago.retrasoDias} días
              </li>
            ))}
          </ul>

          <button onClick={irADashboard} style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1em' }}>
            Finalizar y Evaluar Riesgo
          </button>
        </div>
      )}
    </div>
  );
}

export default RegistroPagos;