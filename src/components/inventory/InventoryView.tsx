import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Package,
  Plus,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  Boxes,
  X,
} from 'lucide-react';
import { Product } from '../../types';

export const InventoryView: React.FC = () => {
  const { currentTenant, products, addProduct, updateStock } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'home_care' | 'internal_use'>('all');

  // Stock Movement Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Compra de Reposição');

  // New Product Modal
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<'home_care' | 'internal_use'>('home_care');
  const [price, setPrice] = useState(120);
  const [costPrice, setCostPrice] = useState(50);
  const [stockQuantity, setStockQuantity] = useState(10);
  const [minStock, setMinStock] = useState(3);
  const [unitOfMeasure, setUnitOfMeasure] = useState('un');

  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStock);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const delta = movementType === 'in' ? quantity : -quantity;
    updateStock(selectedProduct.id, delta, reason);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProduct({
      name: name.trim(),
      brand: brand.trim() || 'Genérica',
      category,
      price,
      costPrice,
      stockQuantity,
      minStock,
      unitOfMeasure,
      active: true,
    });

    setIsNewProductOpen(false);
    setName('');
    setBrand('');
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Estoque & Produtos</h1>
            <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
              {products.length} itens cadastrados
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Controle de produtos Home-Care (venda ao cliente) e insumos de cabine (uso interno dos profissionais).
          </p>
        </div>

        <button
          onClick={() => setIsNewProductOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all shadow-xs"
          style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Cadastrar Produto</span>
        </button>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Alerta de Reposição Urgente: </span>
              {lowStockProducts.length} produto(s) atingiram ou estão abaixo do estoque mínimo de segurança.
            </div>
          </div>
          <span className="font-bold text-[11px] bg-amber-200/80 text-amber-950 px-2.5 py-1 rounded-lg">
            Abaixo do Mínimo
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome ou marca do produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'all' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setCategoryFilter('home_care')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'home_care' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Venda Home-Care
          </button>
          <button
            onClick={() => setCategoryFilter('internal_use')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'internal_use' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Uso Interno Cabine
          </button>
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Produto & Marca</th>
                <th className="p-4">Finalidade</th>
                <th className="p-4">Preço Venda</th>
                <th className="p-4">Custo</th>
                <th className="p-4">Estoque Atual</th>
                <th className="p-4">Estoque Mínimo</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((p) => {
                const isLow = p.stockQuantity <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">{p.name}</div>
                      <div className="text-[10px] text-neutral-400">{p.brand}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.category === 'home_care'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {p.category === 'home_care' ? 'Venda Direta' : 'Cabine / Lavatório'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-neutral-900">
                      R$ {p.price.toFixed(2)}
                    </td>
                    <td className="p-4 font-mono text-neutral-500">
                      R$ {p.costPrice.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                          isLow
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {p.stockQuantity} {p.unitOfMeasure}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-neutral-400">
                      {p.minStock} {p.unitOfMeasure}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setMovementType('in');
                            setReason('Entrada de Nota / Fornecedor');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          + Entrada
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setMovementType('out');
                            setReason('Consumo Interno do Profissional');
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          - Baixa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                {movementType === 'in' ? (
                  <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ArrowDownCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{movementType === 'in' ? 'Entrada de Estoque' : 'Baixa de Insumo'}</span>
              </h3>
              <button onClick={() => setSelectedProduct(null)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <span className="text-neutral-400 block text-[10px]">Produto Selecionado:</span>
              <span className="font-bold text-neutral-900">{selectedProduct.name}</span>
              <div className="text-neutral-500 mt-0.5">
                Estoque Atual: <strong>{selectedProduct.stockQuantity} {selectedProduct.unitOfMeasure}</strong>
              </div>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Quantidade a {movementType === 'in' ? 'Adicionar' : 'Deduzir'} ({selectedProduct.unitOfMeasure})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Motivo da Movimentação</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-bold text-white rounded-xl shadow-xs ${
                    movementType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {isNewProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" /> Cadastrar Produto
              </h3>
              <button onClick={() => setIsNewProductOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Shampoo Nutritivo 500ml"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Marca / Fornecedor</label>
                  <input
                    type="text"
                    placeholder="Ex: Wella Professionals"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  >
                    <option value="home_care">Venda Home-Care</option>
                    <option value="internal_use">Uso Interno Cabine</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Preço Venda (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Unidade</label>
                  <select
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  >
                    <option value="un">un (Unidade)</option>
                    <option value="ml">ml (Mililitros)</option>
                    <option value="g">g (Gramas)</option>
                    <option value="kit">kit (Kit)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white rounded-xl shadow-xs"
                  style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
