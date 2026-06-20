import { useState, useEffect, useCallback } from 'react';
import httpFlask from '../services/httpFlask';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle, X, Box, Tag } from 'lucide-react';
import { FeedbackModal } from '../components/FeedbackModal';

export function GerenciarEstoque() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({ nome: '', descricao: '', categoria: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const triggerAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchItems = useCallback(async () => {
    try {
      const response = await httpFlask.get('/api/itens');
      setItems(response.data);
    } catch (err) {
      triggerAlert('Falha ao conectar com o serviço de ativos.', 'danger');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenCreateModal = () => {
    setModalType('create');
    setFormData({ nome: '', descricao: '', categoria: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, item) => {
    e.stopPropagation();
    setModalType('edit');
    setSelectedItem(item);
    setFormData({ nome: item.nome, descricao: item.descricao, categoria: item.categoria });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.descricao || !formData.categoria) {
      triggerAlert('Todos os campos são de preenchimento obrigatório.', 'danger');
      return;
    }

    try {
      setLoading(true);
      if (modalType === 'create') {
        await httpFlask.post('/api/itens', formData);
        triggerAlert('Ativo cadastrado com sucesso!');
      } else {
        await httpFlask.put(`/api/itens/${selectedItem.id}`, formData);
        triggerAlert('Registro atualizado com sucesso!');
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      triggerAlert(err.response?.data?.erro || 'Erro ao registrar ativo no servidor.', 'danger');
      setLoading(false);
    }
  };

  const handleOpenConfirmDelete = (e, item) => {
    e.stopPropagation();
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setLoading(true);
      await httpFlask.delete(`/api/itens/${itemToDelete.id}`);
      triggerAlert('O ativo foi removido do inventário.');
      fetchItems();
    } catch (err) {
      triggerAlert(err.response?.data?.erro || 'Erro ao deletar o ativo.', 'danger');
      setLoading(false);
    } finally {
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredItems = items.filter((item) =>
    item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Estoque de Ativos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão física de equipamentos, mobiliários e bens integrados ao sistema.
          </p>
        </div>
        
        {user && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center px-4 py-2.5 bg-brand hover:opacity-95 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Ativo
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
            placeholder="Pesquisar por nome, modelo, tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand text-sm bg-white text-slate-800"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand mx-auto"></div>
          <p className="text-slate-500 mt-4 text-sm font-medium">Buscando dados no servidor...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400">
          <Box className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-sm font-semibold">Nenhum ativo localizado no inventário.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl border border-slate-150 p-6 flex flex-col justify-between hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 relative group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-brand">
                    <Box className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                    <Tag className="w-3 h-3 mr-1 text-slate-400" />
                    {item.categoria}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
                    {item.nome}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed min-h-[40px]">
                    {item.descricao}
                  </p>
                </div>
              </div>

              {user && (
                <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleOpenEditModal(e, item)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-brand hover:bg-brand/5 hover:border-brand/20 transition-colors"
                    title="Editar registro"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleOpenConfirmDelete(e, item)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                    title="Excluir ativo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-card w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {modalType === 'create' ? 'Adicionar Novo Ativo' : 'Editar Informações'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nome do Item
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Cadeira de Escritório, Monitor"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Especificações / Descrição
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Modelo Ergonômico, Conexão HDMI"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Classificação / Categoria
                </label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Infraestrutura, TI"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand"
                  required
                />
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
                  {modalType === 'create' ? 'Adicionar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FeedbackModal
        isOpen={isConfirmOpen}
        title="Remover Ativo"
        message={`Esta ação removerá definitivamente o ativo "${itemToDelete?.nome}" do inventário. Confirma?`}
        confirmText="Confirmar"
        cancelText="Voltar"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
