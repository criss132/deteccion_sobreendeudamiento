import { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const manejarIngreso = (e) => {
    e.preventDefault();
    // Aquí en el futuro tu compañero del backend validará que el correo y clave existan en la base de datos.
    // Por ahora, como estamos en el frontend, simplemente lo dejamos pasar al hacer clic.
    onLoginExitoso();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
      
      {/* Contenedor Principal del Login */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Mitad Izquierda: Branding (Oscura) */}
        <div className="bg-slate-900 md:w-5/12 p-10 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Círculos decorativos de fondo */}
          <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
              <ShieldCheck className="w-10 h-10 text-blue-500" />
              FinRisk
            </h1>
            <p className="text-slate-300 text-lg">Sistema Inteligente de Detección de Sobreendeudamiento.</p>
          </div>
          
          <div className="relative z-10 text-sm text-slate-500">
            &copy; 2026 FinRisk. Todos los derechos reservados.
          </div>
        </div>

        {/* Mitad Derecha: Formulario (Blanca) */}
        <div className="md:w-7/12 p-10 lg:p-16 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Iniciar sesión</h2>
          <p className="text-slate-500 mb-8">Ingrese sus credenciales de administrador para continuar.</p>

          <form onSubmit={manejarIngreso} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Correo electrónico</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400"><Mail className="w-5 h-5" /></span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@finrisk.com" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400"><Lock className="w-5 h-5" /></span>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                Recordarme
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-blue-200">
              Ingresar al Sistema <ArrowRight className="w-5 h-5" />
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;