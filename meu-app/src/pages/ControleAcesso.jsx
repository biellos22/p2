import { useState, useEffect, useCallback } from 'react';
import httpNode from '../services/httpNode';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Shield, Search, AlertCircle, CheckCircle, X } from 'lucide-react';
import { FeedbackModal } from '../components/FeedbackModal';

export function ControleAcesso() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({ user: '', senha: '', funcao: 'funcionario' });
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentUser?.funcao?.toLowerCase() === 'admin';

  const triggerAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await httpNode.get('/user');
      setUsers(response.data);
    } catch (err) {
      triggerAlert(err.response?.data?.msg || 'Erro de conexão com o banco de colaboradores.', 'danger');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreateModal = () => {
    if (!isAdmin) {
      triggerAlert('Apenas administradores podem cadastrar novos colaboradores.', 'danger');
      return;
    }
    setModalType('create');
    setFormData({ user: '', senha: '', funcao: 'funcionario' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    if (!isAdmin) {
      triggerAlert('Apenas administradores possuem acesso de alteração cadastral.', 'danger');
      return;
    }
    setModalType('edit');
    setSelectedUser(user);
    setFormData({ user: user.user, senha: '', funcao: user.funcao });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user || (modalType === 'create' && !formData.senha)) {
      triggerAlert('Campos obrigatórios não preenchidos.', 'danger');
      return;
    }

    try {
      setLoading(true);
      if (modalType === 'create') {
        await httpNode.post('/user', formData);
        triggerAlert('Colaborador incluído com sucesso!');
      } else {
        const updateData = { user: formData.user, funcao: formData.funcao };
        if (formData.senha) updateData.senha = formData.senha;
        
        await httpNode.put(`/user/${selectedUser._id}`, updateData);
        triggerAlert('Cadastro atualizado com sucesso!');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      triggerAlert(err.response?.data?.msg || 'Falha ao salvar colaborador.', 'danger');
      setLoading(false);
    }
  };

  const handleOpenConfirmDelete = (user) => {
    if (!isAdmin) {
      triggerAlert('Acesso negado para remoção.', 'danger');
      return;
    }
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setLoading(true);
      await httpNode.delete(`/user/${userToDelete._id}`);
      triggerAlert('O registro do colaborador foi removido.');
      fetchUsers();
    } catch (err) {
      triggerAlert(err.response?.data?.msg || 'Erro ao remover colaborador do banco.', 'danger');
      setLoading(false);
    } finally {
      setIsConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.funcao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border shadow-glow transition-all transform translate-y-0 max-w-md ${
          alert.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {alert.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-3 text-red-600 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold">{alert.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Equipe & Controle de Acesso</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin 
              ? 'Painel administrativo para controle e edição de cargos da equipe.' 
              : 'Lista de membros cadastrados (apenas modo de leitura).'}
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center px-4 py-2.5 bg-brand hover:opacity-95 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Membro
          </button>
        )}
      </div>

      <div className="flex items-center bg-white p-4 rounded-xl shadow-xs border border-slate-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Filtrar por nome de usuário ou função..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand text-sm bg-white text-slate-800"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-150">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand mx-auto"></div>
            <p className="text-slate-500 mt-4 text-sm font-medium">Buscando lista de equipe...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-150">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Identificador</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Função / Cargo</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-sm">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                        {user.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          user.funcao?.toLowerCase() === 'admin' 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Shield className="w-3.5 h-3.5 mr-1" />
                          {user.funcao}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isAdmin 
                                ? 'text-slate-500 hover:text-brand hover:bg-brand/5 border-slate-200' 
                                : 'text-slate-300 border-slate-100 cursor-not-allowed'
                            }`}
                            disabled={!isAdmin}
                            title="Editar cadastro"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenConfirmDelete(user)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isAdmin && user.user !== currentUser?.user
                                ? 'text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-200' 
                                : 'text-slate-300 border-slate-100 cursor-not-allowed'
                            }`}
                            disabled={!isAdmin || user.user === currentUser?.user}
                            title={user.user === currentUser?.user ? "Você não pode excluir a si mesmo" : "Remover colaborador"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-card w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {modalType === 'create' ? 'Cadastrar Colaborador' : 'Editar Colaborador'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nome de Usuário (Login)
                </label>
                <input
                  type="text"
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  placeholder="Ex: joao.silva"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {modalType === 'create' ? 'Senha de Acesso' : 'Nova Senha (opcional)'}
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand"
                  required={modalType === 'create'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nível de Função
                </label>
                <select
                  value={formData.funcao}
                  onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand bg-white"
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:opacity-95 transition-colors shadow-sm"
                >
                  {modalType === 'create' ? 'Cadastrar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FeedbackModal
        isOpen={isConfirmOpen}
        title="Remover Colaborador"
        message={`Esta ação revogará definitivamente as credenciais de "${userToDelete?.user}". Tem certeza de que deseja remover?`}
        confirmText="Confirmar"
        cancelText="Voltar"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
}
