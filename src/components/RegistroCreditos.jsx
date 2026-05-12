import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegistroCreditos({ listaCreditos, setListaCreditos }) {
  const navigate = useNavigate();

  // El estado temporal del formulario sigue aquí
  const [creditoActual, setCreditoActual] = useState({
    monto: '', tasainteres: '', plazoMeses: '', cuotaMensual: '', estado: 'activo'
  });

  const manejarCambio = (e) => {
    setCreditoActual({ ...creditoActual, [e.target.name]: e.target.value });
  };

  const agregarCredito = (e) => {
    e.preventDefault();
    // Guardamos en la memoria central (App.jsx)
    setListaCreditos([...listaCreditos, creditoActual]);
    
    // Limpiamos el formulario temporal
    setCreditoActual({ monto: '', tasainteres: '', plazoMeses: '', cuotaMensual: '', estado: 'activo' });
  };

  const irAPagos = () => {
    navigate('/pagos');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', borderTop: '2px solid #eee', fontFamily: 'sans-serif' }}>
      <h2>Registro de Créditos</h2>
      <p>Agregue las deudas actuales del cliente.</p>

      <form onSubmit={agregarCredito} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label>Monto ($):</label>
            <input type="number" name="monto" value={creditoActual.monto} onChange={manejarCambio} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label>Tasa de Interés (%):</label>
            <input type="number" step="0.01" name="tasainteres" value={creditoActual.tasainteres} onChange={manejarCambio} required />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label>Plazo (Meses):</label>
            <input type="number" name="plazoMeses" value={creditoActual.plazoMeses} onChange={manejarCambio} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label>Cuota Mensual ($):</label>
            <input type="number" name="cuotaMensual" value={creditoActual.cuotaMensual} onChange={manejarCambio} required />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Estado del Crédito:</label>
          <select name="estado" value={creditoActual.estado} onChange={manejarCambio}>
            <option value="activo">Activo</option>
            <option value="mora">En Mora</option>
            <option value="pagado">Pagado</option>
          </select>
        </div>

        <button type="submit" style={{ padding: '8px', marginTop: '10px', cursor: 'pointer' }}>
          + Agregar a la lista
        </button>
      </form>

      {listaCreditos.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Créditos Registrados ({listaCreditos.length})</h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            {listaCreditos.map((credito, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <strong>Deuda {index + 1}:</strong> ${credito.monto} a {credito.plazoMeses} meses. 
                <br/> Cuota: ${credito.cuotaMensual} | Estado: {credito.estado}
              </li>
            ))}
          </ul>
          
          <button onClick={irAPagos} style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1em' }}>
            Continuar a Pagos
          </button>
        </div>
      )}
    </div>
  );
}

export default RegistroCreditos;