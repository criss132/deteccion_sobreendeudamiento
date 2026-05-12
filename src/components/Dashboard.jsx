function Dashboard({ datosCliente, listaCreditos, historialPagos }) {
  
  // 1. Si la persona entró directo al Dashboard sin llenar sus datos, le avisamos:
  if (!datosCliente || !datosCliente.nombre) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
        <h2>Aún no hay datos para evaluar </h2>
        <p>Por favor, regrese a la pestaña "Registro de Cliente" y complete el flujo.</p>
      </div>
    );
  }

  // 2. Cálculos matemáticos básicos con la información real
  const ingresos = parseFloat(datosCliente.ingresosM) || 0;
  
  // Sumamos el monto de todos los créditos
  const deudaTotal = listaCreditos.reduce((total, credito) => total + parseFloat(credito.monto || 0), 0);
  
  // Sumamos la cuota mensual de todos los créditos
  const cuotaTotalMensual = listaCreditos.reduce((total, credito) => total + parseFloat(credito.cuotaMensual || 0), 0);
  
  // Calculamos qué porcentaje del sueldo se va en pagar deudas
  let porcentajeEndeudamiento = 0;
  if (ingresos > 0) {
    porcentajeEndeudamiento = ((cuotaTotalMensual / ingresos) * 100).toFixed(1);
  }

  // 3. Simulador de Riesgo Preliminar (Mientras conectan la IA del Backend)
  let nivelRiesgo = 'Bajo';
  let alerta = 'El cliente tiene un nivel de deuda manejable.';
  
  if (porcentajeEndeudamiento > 60) {
    nivelRiesgo = 'Alto';
    alerta = 'Crítico: El cliente compromete más del 60% de sus ingresos en cuotas.';
  } else if (porcentajeEndeudamiento > 40) {
    nivelRiesgo = 'Medio';
    alerta = 'Precaución: Nivel de endeudamiento considerable.';
  }

  const colorRiesgo = nivelRiesgo === 'Alto' ? '#ff4d4d' : nivelRiesgo === 'Medio' ? '#ffcc00' : '#4caf50';

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Panel de Resultados de Evaluación</h2>
      <p>Análisis para el cliente: <strong>{datosCliente.nombre}</strong> (CC: {datosCliente.iddocumento})</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* Termómetro de Riesgo */}
        <div style={{ padding: '20px', border: `3px solid ${colorRiesgo}`, borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center' }}>
          <h3>Nivel de Riesgo (Preliminar)</h3>
          <h1 style={{ color: colorRiesgo, fontSize: '3rem', margin: '10px 0' }}>{nivelRiesgo}</h1>
          <p style={{ color: '#555' }}><strong>Alerta:</strong> {alerta}</p>
          <small style={{ color: '#888' }}>*Cálculo rápido del Frontend</small>
        </div>

        {/* Resumen Financiero */}
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Resumen Financiero</h3>
          <p><strong>Ingresos Declarados:</strong> ${ingresos.toLocaleString()}</p>
          <p><strong>Deuda Total:</strong> ${deudaTotal.toLocaleString()}</p>
          <p><strong>Cuota Mensual Total:</strong> ${cuotaTotalMensual.toLocaleString()}</p>
          <p><strong>Nivel de Endeudamiento:</strong> {porcentajeEndeudamiento}%</p>
        </div>

        {/* El Paquete de Datos para el Backend */}
        <div style={{ gridColumn: '1 / span 2', padding: '20px', border: '1px solid #0056b3', borderRadius: '8px', backgroundColor: '#e6f2ff' }}>
          <h3 style={{ color: '#0056b3', marginTop: 0 }}>📦 Datos Listos para Enviar a la IA (Backend)</h3>
          <p>Cuando el backend esté listo, esta es exactamente la información que React le enviará:</p>
          <pre style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', overflowX: 'auto', border: '1px solid #ccc' }}>
            {JSON.stringify({
              cliente: datosCliente,
              creditos: listaCreditos,
              pagos: historialPagos
            }, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;