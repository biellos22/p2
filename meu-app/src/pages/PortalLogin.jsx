import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, AlertCircle, LogIn } from 'lucide-react';

export function PortalLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(username, password);

    if (result.success) {
      navigate('/ativos');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-brand-dark via-brand to-accent p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
        
        <div className="relative z-10">
          <span className="text-xl font-black text-white tracking-widest uppercase">
            ControlSystem
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Gerencie o inventário e equipes em um único lugar.
          </h1>
          <p className="text-indigo-100 text-sm font-medium leading-relaxed">
            Plataforma corporativa segura para controle de recursos físicos, integração de estoque em tempo real e administração de níveis de acesso de colaboradores.
          </p>
        </div>

        <div className="relative z-10 text-xs text-indigo-200/80">
          &copy; {new Date().getFullYear()} ControlSystem. Todos os direitos reservados.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="inline-flex lg:hidden w-12 h-12 rounded-xl bg-brand/10 text-brand items-center justify-center mb-4">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Acessar Painel
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Insira suas credenciais corporativas abaixo para entrar no sistema.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm flex items-start rounded-r-lg">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Usuário / Identificador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: admin"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand focus:border-brand bg-white text-slate-800 shadow-xs"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand focus:border-brand bg-white text-slate-800 shadow-xs"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand hover:opacity-95 text-white font-bold rounded-xl text-sm transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Autenticando...' : 'Acessar Plataforma'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
