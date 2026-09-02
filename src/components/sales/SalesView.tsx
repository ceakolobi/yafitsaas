import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  ShoppingBag,
  Plus,
  Trash2,
  DollarSign,
  QrCode,
  CreditCard,
  Banknote,
  Sparkles,
  User,
  Scissors,
  Package,
  Receipt,
  CheckCircle2,
  Percent,
  Search,
  Check,
  X,
  Printer,
} from 'lucide-react';
import { PaymentMethod, SaleItem, Sale } from '../../types';

export const SalesView: React.FC = () => {
  const {
    currentTenant,
    customers,
    services,
    professionals,
    products,
    coupons,
    sales,
    createSale,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'pdv' | 'history'>('pdv');

  // PDV State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [useCashbackAmount, setUseCashbackAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [selectedPayments, setSelectedPayments] = useState<{ method: PaymentMethod; amount: number; installments?: number }[]>([
    { method: 'pix', amount: 0 },
  ]);

  // Modals
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [pixModalOpen, setPixModalOpen] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Cart calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalPayable = Math.max(0, subtotal - discountAmount - useCashbackAmount + tipAmount);

  // Add Service to Cart
  const handleAddService = (serviceId: string) => {
    const s = services.find((srv) => srv.id === serviceId);
    if (!s) return;

    const newItem: SaleItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'service',
      referenceId: s.id,
      name: s.name,
      quantity: 1,
      unitPrice: s.price,
      totalPrice: s.price,
      professionalId: professionals[0]?.id,
    };

    setCartItems([...cartItems, newItem]);
  };

  // Add Product to Cart
  const handleAddProduct = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p || p.stockQuantity <= 0) return;

    const existingIndex = cartItems.findIndex((item) => item.referenceId === p.id && item.type === 'product');

    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCartItems(updated);
    } else {
      const newItem: SaleItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'product',
        referenceId: p.id,
        name: p.name,
        quantity: 1,
        unitPrice: p.price,
        totalPrice: p.price,
        professionalId: professionals[0]?.id,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    setCartItems(cartItems.filter((i) => i.id !== itemId));
  };

  // Apply Coupon
  const handleApplyCoupon = () => {
    const code = appliedCouponCode.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code === code && c.active);

    if (coupon) {
      if (coupon.discountType === 'percentage') {
        setDiscountAmount((subtotal * coupon.discountValue) / 100);
      } else {
        setDiscountAmount(coupon.discountValue);
      }
    } else {
      alert('Cupom inválido ou expirado.');
    }
  };

  // Finalize Sale
  const handleFinalizeSale = () => {
    if (cartItems.length === 0) {
      alert('O carrinho está vazio.');
      return;
    }

    const sale = createSale({
      customerId: selectedCustomerId,
      items: cartItems,
      subtotal,
      discount: discountAmount + useCashbackAmount,
      cashbackUsed: useCashbackAmount,
      tipAmount,
      total: totalPayable,
      payments: selectedPayments.map((p) => ({
        ...p,
        amount: p.amount > 0 ? p.amount : totalPayable,
      })),
      status: 'completed',
    });

    setCompletedSale(sale);
    // Reset PDV
    setCartItems([]);
    setDiscountAmount(0);
    setUseCashbackAmount(0);
    setTipAmount(0);
    setAppliedCouponCode('');
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Frente de Caixa & Vendas (PDV)</h1>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              PDV Aberto
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Baixa de estoque em tempo real, split payment, cashback, gorjetas e comissionamento automático.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('pdv')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'pdv' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Frente de Caixa (PDV)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Histórico de Vendas ({sales.length})
          </button>
        </div>
      </div>

      {activeTab === 'pdv' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Catalog of Services and Home-Care Products */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Selector Card */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-neutral-400" />
                <label className="text-xs font-bold text-neutral-700">Cliente na Recepção:</label>
              </div>

              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    setUseCashbackAmount(0);
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-neutral-50 font-bold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — Cashback: R$ {c.cashbackBalance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Catalog Grid */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Scissors className="w-4 h-4 text-rose-600" /> Procedimentos & Serviços
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleAddService(s.id)}
                      className="p-3 bg-neutral-50 hover:bg-rose-50/50 hover:border-rose-200 border border-neutral-200 rounded-xl text-left transition-all group"
                    >
                      <div className="text-xs font-bold text-neutral-900 group-hover:text-rose-600 line-clamp-1">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center justify-between mt-1 font-mono">
                        <span>{s.durationMinutes}m</span>
                        <span className="font-bold text-neutral-900">R$ {s.price.toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Package className="w-4 h-4 text-amber-600" /> Produtos Home-Care & Varejo
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {products
                    .filter((p) => p.category === 'home_care')
                    .map((p) => {
                      const isOutOfStock = p.stockQuantity <= 0;
                      return (
                        <button
                          key={p.id}
                          disabled={isOutOfStock}
                          onClick={() => handleAddProduct(p.id)}
                          className={`p-3 border rounded-xl text-left transition-all ${
                            isOutOfStock
                              ? 'bg-neutral-100 border-neutral-200 opacity-50 cursor-not-allowed'
                              : 'bg-neutral-50 hover:bg-amber-50/50 hover:border-amber-200 border-neutral-200 group'
                          }`}
                        >
                          <div className="text-xs font-bold text-neutral-900 group-hover:text-amber-700 line-clamp-1">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">{p.brand}</div>
                          <div className="text-[11px] text-neutral-500 flex items-center justify-between mt-1 font-mono">
                            <span className={p.stockQuantity <= p.minStock ? 'text-amber-600 font-bold' : ''}>
                              {p.stockQuantity} em estoque
                            </span>
                            <span className="font-bold text-neutral-900">R$ {p.price.toFixed(2)}</span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Cart & Payment Checkout */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-600" /> Cupom de Venda
                </h2>
                <span className="text-xs font-bold text-neutral-500">{cartItems.length} itens</span>
              </div>

              {/* Items in Cart */}
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  Nenhum item adicionado ao carrinho.
                  <p className="text-[11px] text-neutral-400 mt-1">Clique nos serviços ou produtos ao lado para incluir.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1">
                        <div className="font-bold text-neutral-900 line-clamp-1">{item.name}</div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <span>Qtd: {item.quantity}</span>
                          <span>•</span>
                          <select
                            value={item.professionalId}
                            onChange={(e) => {
                              const updated = cartItems.map((ci) =>
                                ci.id === item.id ? { ...ci, professionalId: e.target.value } : ci
                              );
                              setCartItems(updated);
                            }}
                            className="text-[10px] bg-white border border-neutral-300 rounded px-1 py-0.2"
                          >
                            {professionals.map((p) => (
                              <option key={p.id} value={p.id}>
                                Prof: {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-900">
                          R$ {item.totalPrice.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-neutral-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Discounts & Cashback */}
              {cartItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
                  {/* Coupon Input */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Código do Cupom"
                      value={appliedCouponCode}
                      onChange={(e) => setAppliedCouponCode(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs uppercase rounded-lg border border-neutral-300 bg-neutral-50 font-mono"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3 py-1 bg-neutral-800 text-white rounded-lg font-bold text-xs hover:bg-neutral-900"
                    >
                      Aplicar
                    </button>
                  </div>

                  {/* Cashback Usage */}
                  {selectedCustomer && selectedCustomer.cashbackBalance > 0 && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-950 block">Usar Saldo de Cashback</span>
                        <span className="text-[10px] text-emerald-700">
                          Disponível: R$ {selectedCustomer.cashbackBalance.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setUseCashbackAmount(
                            useCashbackAmount > 0 ? 0 : Math.min(subtotal, selectedCustomer.cashbackBalance)
                          )
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          useCashbackAmount > 0
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-emerald-700 border border-emerald-300'
                        }`}
                      >
                        {useCashbackAmount > 0 ? 'Abatido R$ ' + useCashbackAmount.toFixed(2) : 'Abater Saldo'}
                      </button>
                    </div>
                  )}

                  {/* Tip Addition */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-600">
                    <span>Gorjeta / Caixinha da Equipe (R$):</span>
                    <input
                      type="number"
                      min="0"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-0.5 rounded border border-neutral-300 text-right font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Total and Checkout */}
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Desconto Cupom</span>
                    <span className="font-mono">- R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {useCashbackAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Cashback Abatido</span>
                    <span className="font-mono">- R$ {useCashbackAmount.toFixed(2)}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-neutral-700 font-medium">
                    <span>Gorjeta da Equipe</span>
                    <span className="font-mono">+ R$ {tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-1 border-t border-neutral-100">
                  <span>Total a Pagar</span>
                  <span className="font-mono text-base text-emerald-700">
                    {currentTenant.whiteLabelConfig.currencySymbol} {totalPayable.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedPayments([{ method: 'pix', amount: totalPayable }])}
                  className={`p-2 rounded-xl border text-center font-bold flex flex-col items-center gap-1 ${
                    selectedPayments[0]?.method === 'pix'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" /> Pix
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayments([{ method: 'credit_card', amount: totalPayable, installments: 1 }])}
                  className={`p-2 rounded-xl border text-center font-bold flex flex-col items-center gap-1 ${
                    selectedPayments[0]?.method === 'credit_card'
                      ? 'bg-blue-50 border-blue-500 text-blue-900'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" /> Crédito
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayments([{ method: 'cash', amount: totalPayable }])}
                  className={`p-2 rounded-xl border text-center font-bold flex flex-col items-center gap-1 ${
                    selectedPayments[0]?.method === 'cash'
                      ? 'bg-amber-50 border-amber-500 text-amber-900'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-amber-600" /> Dinheiro
                </button>
              </div>

              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={handleFinalizeSale}
                className="w-full py-3 text-xs font-extrabold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalizar Venda & Emitir Recibo</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Sales History Tab */
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Histórico de Vendas Realizadas
            </h3>
            <span className="text-xs text-neutral-500">
              Total Faturado: R$ {sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
            </span>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {sales.map((s) => {
              const cust = customers.find((c) => c.id === s.customerId);
              return (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{cust?.name || 'Cliente'}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">#{s.id.slice(-6)}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {s.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-3">
                      <span>{new Date(s.createdAt).toLocaleString('pt-BR')}</span>
                      <span>•</span>
                      <span>{s.items.length} itens</span>
                      <span>•</span>
                      <span className="capitalize">Pgto: {s.payments[0]?.method || 'Pix'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-sm text-neutral-900 font-mono">
                      R$ {s.total.toFixed(2)}
                    </span>
                    <button
                      onClick={() => setCompletedSale(s)}
                      className="block mt-1 text-[11px] text-rose-600 font-semibold hover:underline"
                    >
                      Ver Comprovante
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sale Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4 text-xs font-mono">
            <div className="text-center border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-base text-neutral-900 uppercase font-sans">
                {currentTenant.name}
              </h3>
              <p className="text-[10px] text-neutral-500 font-sans mt-0.5">
                Comprovante de Venda / Recibo Digital
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">
                Data: {new Date(completedSale.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-1.5 border-b border-neutral-200 pb-3">
              {completedSale.items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>
                    {it.quantity}x {it.name}
                  </span>
                  <span>R$ {it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 border-b border-neutral-200 pb-3">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal:</span>
                <span>R$ {completedSale.subtotal.toFixed(2)}</span>
              </div>
              {completedSale.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Descontos/Cashback:</span>
                  <span>- R$ {completedSale.discount.toFixed(2)}</span>
                </div>
              )}
              {completedSale.tipAmount && completedSale.tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>Gorjeta da Equipe:</span>
                  <span>+ R$ {completedSale.tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-neutral-900 pt-1">
                <span>TOTAL PAGO:</span>
                <span>R$ {completedSale.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-neutral-400 font-sans">
              Obrigado pela preferência! Volte sempre.
            </div>

            <div className="flex gap-2 font-sans pt-2">
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 py-2 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center justify-center gap-1.5 flex-1 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-black rounded-xl"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
