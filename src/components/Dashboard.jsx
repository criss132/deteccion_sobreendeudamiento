function Dashboard() {
  const resultadoEvaluacion = {
    nivelRiesgo: 'Alto',
    deudaTotal: 4500000,
    porcentajeEndeudamiento: 65, 
    alerta: 'El cliente supera el umbral de riesgo permitido.',
    recomendacion: {
      tipoAccion: 'Reestructuración de Deuda',
      mensaje: 'Se sugiere consolidar las deudas actuales a un mayor plazo para disminuir la cuota mensual y liberar flujo de caja.'
    }
  };

  const colorRiesgo = resultadoEvaluacion.nivelRiesgo === 'Alto' ? '#ff4d4d' :
                      resultadoEvaluacion.nivelRiesgo === 'Medio' ? '#ffcc00' : '#4caf50';

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Panel de Resultados de Evaluación</h2>
      <p>Análisis generado por el modelo de detección de sobreendeudamiento.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        <div style={{ padding: '20px', border: `3px solid ${colorRiesgo}`, borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center' }}>
          <h3>Nivel de Riesgo</h3>
          <h1 style={{ color: colorRiesgo, fontSize: '3rem', margin: '10px 0' }}>
            {resultadoEvaluacion.nivelRiesgo}
          </h1>
          <p style={{ color: '#555' }}><strong>Alerta:</strong> {resultadoEvaluacion.alerta}</p>
        </div>

        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Historial Financiero</h3>
          <p><strong>Deuda Total:</strong> ${resultadoEvaluacion.deudaTotal.toLocaleString()}</p>
          <p><strong>Nivel de Endeudamiento:</strong> {resultadoEvaluacion.porcentajeEndeudamiento}%</p>
        </div>

        <div style={{ gridColumn: '1 / span 2', padding: '20px', border: '1px solid #0056b3', borderRadius: '8px', backgroundColor: '#e6f2ff' }}>
          <h3 style={{ color: '#0056b3', marginTop: 0 }}>Recomendación Financiera</h3>
          <p><strong>Acción sugerida:</strong> {resultadoEvaluacion.recomendacion.tipoAccion}</p>
          <p><strong>Detalle:</strong> {resultadoEvaluacion.recomendacion.mensaje}</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;