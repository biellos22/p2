import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Box, X } from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.funcao?.toLowerCase() === 'admin';

  const menuItems = [
    { name: 'Estoque de Ativos', href: '/ativos', icon: Box },
    ...(isAdmin ? [{ name: 'Gerenciar Equipe', href: '/colaboradores', icon: Users }] : []),
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 z-20 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-100 flex flex-col transform transition-transform duration-300 border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-screen
      `}>
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">
            ControlSystem
          </span>
          <button 
            onClick={onClose} 
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`
                  flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all
                  ${isActive 
                    ? 'bg-brand text-white shadow-glow' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }
                `}
              >
                <Icon className={`mr-3 h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-center">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Logado como</div>
          <div className="text-sm font-bold text-slate-200">{user?.user}</div>
          <div className="text-xs font-semibold text-indigo-400 capitalize mt-0.5">{user?.funcao}</div>
        </div>
      </aside>
    </>
  );
}
