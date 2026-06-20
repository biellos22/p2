import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header({ onMenuToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
      <button 
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="hidden md:block">
        <h2 className="text-sm font-semibold text-slate-500">Área de Trabalho</h2>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left leading-none hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user?.user}</p>
            <span className="text-[10px] font-bold text-slate-400 capitalize">{user?.funcao}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          title="Sair da conta"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
