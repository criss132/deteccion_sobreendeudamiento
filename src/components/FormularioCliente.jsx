import { useNavigate } from 'react-router-dom';


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
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Registro de Cliente</h2>
      <p>Ingrese los datos financieros para la evaluación.</p>

      <form onSubmit={enviarDatos} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Nombre Completo:</label>
          <input type="text" name="nombre" value={datosCliente.nombre} onChange={manejarCambio} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Documento de Identidad:</label>
          <input type="text" name="iddocumento" value={datosCliente.iddocumento} onChange={manejarCambio} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Ingresos Mensuales ($):</label>
          <input type="number" name="ingresosM" value={datosCliente.ingresosM} onChange={manejarCambio} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Tipo de Empleado:</label>
          <select name="tipoEmpleado" value={datosCliente.tipoEmpleado} onChange={manejarCambio} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">Seleccione una opción...</option>
            <option value="asalariado">Asalariado</option>
            <option value="independiente">Independiente</option>
            <option value="pensionado">Pensionado</option>
          </select>
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Guardar y Continuar
        </button>
      </form>
    </div>
  );
}

export default FormularioCliente;