/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { User, Table, MenuItem, Client, Order, OrderItem } from '../types';
import {
  Sparkles,
  LayoutGrid,
  Receipt,
  LogOut,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Plus,
  Minus,
  Check,
  Percent,
  TrendingUp,
  Store,
  ChefHat,
  Play,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WaiterPOSProps {
  currentUser: User;
  users: User[];
  tables: Table[];
  menu: MenuItem[];
  clients: Client[];
  orders: Order[];
  history: Order[];
  onLogout: () => void;
  onUpdateTables: (newTables: Table[]) => void;
  onUpdateOrders: (newOrders: Order[]) => void;
  onUpdateHistory: (newHistory: Order[]) => void;
  onUpdateClients: (newClients: Client[]) => void;
  onTriggerKitchen: (order: Order) => void;
  onCompleteCooking: (orderId: string, chefId: string, chefName: string) => void;
}

type TabType = 'mesas' | 'cobros';

export default function WaiterPOS({
  currentUser,
  users,
  tables,
  menu,
  clients,
  orders,
  history,
  onLogout,
  onUpdateTables,
  onUpdateOrders,
  onUpdateHistory,
  onUpdateClients,
  onTriggerKitchen,
  onCompleteCooking
}: WaiterPOSProps) {
  const [activeTab, setActiveTab] = useState<TabType>('mesas');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Take Order Sub-flow States
  const [isTakingOrder, setIsTakingOrder] = useState(false);
  const [orderItems, setOrderItems] = useState<{ [itemId: string]: number }>({});
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('cli-1'); // Default: Consumidor Final
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilter, setMenuFilter] = useState<string>('Todo');

  // Checkout billing States
  const [checkoutTableId, setCheckoutTableId] = useState<string | null>(null);
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [discountInput, setDiscountInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta' | 'Efectivo' | 'Transferencia' | 'Pago Móvil' | 'Tarjeta de Crédito' | 'Tarjeta de Débito' | 'SINPE Móvil' | 'Cortesía' | 'Criptomonedas'>('Tarjeta');

  // Computed Properties for top KPI bar
  const totalSalesAccrued = useMemo(() => {
    return history.reduce((sum, h) => sum + h.total, 0);
  }, [history]);

  const activeOccupiedCount = useMemo(() => {
    return tables.filter(t => t.status === 'Ocupada').length;
  }, [tables]);

  const activeKitchenOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'Ordenado' || o.status === 'En Cocina').length;
  }, [orders]);

  // Selected Table Details
  const selectedTable = useMemo(() => {
    return tables.find(t => t.id === selectedTableId) || null;
  }, [tables, selectedTableId]);

  // Selected Active Order for Table
  const tableActiveOrder = useMemo(() => {
    if (!selectedTableId) return null;
    return orders.find(o => o.tableId === selectedTableId && o.status !== 'Cobrado') || null;
  }, [orders, selectedTableId]);

  // Checkout Active Order
  const checkoutActiveOrder = useMemo(() => {
    if (!checkoutTableId) return null;
    const order = orders.find(o => o.tableId === checkoutTableId && o.status !== 'Cobrado');
    return order?.status === 'Entregado' ? order : null;
  }, [orders, checkoutTableId]);

  // Handle direct state override/change for table status
  const handleChangeTableStatus = (status: 'Libre' | 'Reservada' | 'Sucia') => {
    if (!selectedTableId) return;

    // Guard if occupied
    const currentT = tables.find(t => t.id === selectedTableId);
    if (currentT && currentT.status === 'Ocupada') {
      if (status === 'Libre') {
        if (!confirm('La mesa está ocupada con una comanda activa. ¿Deseas vaciar y desocupar esta mesa de todas formas? Se cancelará el pedido pendiente.')) {
          return;
        }
        // Cancel active order associated with this table
        const activeOrd = orders.find(o => o.tableId === selectedTableId && o.status !== 'Cobrado');
        if (activeOrd) {
          onUpdateOrders(orders.filter(o => o.id !== activeOrd.id));
        }
      } else {
        alert('La mesa está ocupada con una comanda activa. Debe desocuparla a estado Libre o cobrar la cuenta primero para cambiar su estado.');
        return;
      }
    }

    onUpdateTables(
      tables.map((t) => {
        if (t.id === selectedTableId) {
          return {
            ...t,
            status,
            currentWaiterId: undefined,
            currentWaiterName: undefined,
            totalCost: undefined,
            currentOrderId: undefined
          };
        }
        return t;
      })
    );
  };

  // Resume Pending Draft Order into active taking state
  const handleResumePendingOrder = (pendingOrder: Order) => {
    const preloadedItems: Record<string, number> = {};
    pendingOrder.items.forEach((it) => {
      preloadedItems[it.menuItemId] = it.quantity;
    });
    setOrderItems(preloadedItems);
    setOrderNotes(pendingOrder.notes || '');
    setSelectedClientId('cli-1'); // Default client
    setIsTakingOrder(true);
  };

  // Trigger New Order Taking flow
  const handleStartTakingOrder = () => {
    setOrderItems({});
    setOrderNotes('');
    setSelectedClientId('cli-1'); // Default to Consumidor Final
    setIsTakingOrder(true);
  };

  const handleAddItem = (itemId: string) => {
    setOrderItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => {
      const copy = { ...prev };
      if (!copy[itemId]) return prev;
      copy[itemId]--;
      if (copy[itemId] <= 0) {
        delete copy[itemId];
      }
      return copy;
    });
  };

  // Submit and confirm command to kitchen or leave pending
  const handleConfirmOrder = (isPending = false) => {
    if (!selectedTableId || Object.keys(orderItems).length === 0) return;

    // Build items contract
    const itemsList: OrderItem[] = Object.entries(orderItems).map(([id, qty]) => {
      const matchItem = menu.find(m => m.id === id);
      return {
        menuItemId: id,
        name: matchItem?.name || 'Clásico Desconocido',
        price: matchItem?.price || 0,
        quantity: Number(qty)
      };
    });

    const subtotal = itemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check if there is already an active pending order for this table
    const existingPendingOrder = orders.find(o => o.tableId === selectedTableId && o.status === 'Pendiente');
    const orderId = existingPendingOrder ? existingPendingOrder.id : `ord-${Date.now().toString().slice(-4)}`;

    const newOrder: Order = {
      id: orderId,
      tableId: selectedTableId,
      waiterId: currentUser.id,
      waiterName: currentUser.name,
      items: itemsList,
      notes: orderNotes.trim() || undefined,
      status: isPending ? 'Pendiente' : 'Ordenado',
      subtotal,
      tipPercentage: 0,
      discountAmount: 0,
      total: subtotal,
      timestamp: new Date().toISOString()
    };

    let updatedOrders: Order[];
    if (existingPendingOrder) {
      updatedOrders = orders.map(o => o.id === existingPendingOrder.id ? newOrder : o);
    } else {
      updatedOrders = [...orders, newOrder];
    }

    // Update orders list & map state of room table
    onUpdateOrders(updatedOrders);
    onUpdateTables(
      tables.map(t =>
        t.id === selectedTableId
          ? {
              ...t,
              status: 'Ocupada',
              currentWaiterId: currentUser.id,
              currentWaiterName: currentUser.name,
              totalCost: subtotal,
              currentOrderId: orderId
            }
          : t
      )
    );

    // Save and close
    setIsTakingOrder(false);
  };

  // Filter Menu List
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
      const matchesCategory = menuFilter === 'Todo' ? true : item.category === menuFilter;
      return matchesSearch && matchesCategory;
    });
  }, [menu, menuSearch, menuFilter]);

  // Order Subtotal & totals calculated for checkout screen
  const checkoutSubtotal = useMemo(() => {
    if (!checkoutActiveOrder) return 0;
    return checkoutActiveOrder.subtotal;
  }, [checkoutActiveOrder]);

  const checkoutTotalCalculated = useMemo(() => {
    const tip = checkoutSubtotal * (tipPercentage / 100);
    const discount = Number(discountInput) || 0;
    return Math.max(0, checkoutSubtotal + tip - discount);
  }, [checkoutSubtotal, tipPercentage, discountInput]);

  // Switch and pre-load billing details
  const handleRouteToCheckout = (tableId: string) => {
    setCheckoutTableId(tableId);
    setTipPercentage(10);
    setDiscountInput('');
    setActiveTab('cobros');
  };

  // Complete Payment Submission / Imprimir cobro
  const handleRegisterPayment = () => {
    if (!checkoutTableId || !checkoutActiveOrder) return;

    const discountAmount = Number(discountInput) || 0;
    const finalTotal = checkoutTotalCalculated;

    // 1. Mark order as paid
    const updatedOrder: Order = {
      ...checkoutActiveOrder,
      status: 'Cobrado',
      tipPercentage,
      discountAmount,
      total: finalTotal,
      paymentMethod,
      invoiceId: `sal-${Math.floor(1000 + Math.random() * 9000)}`
    };

    // Remove active order & append to history
    onUpdateOrders(orders.filter(o => o.id !== checkoutActiveOrder.id));
    onUpdateHistory([updatedOrder, ...history]);

    // 2. Marcar la mesa como sucia - Set back table state to Dirty/Sucia
    onUpdateTables(
      tables.map(t =>
        t.id === checkoutTableId
          ? {
              ...t,
              status: 'Sucia',
              currentWaiterId: undefined,
              currentWaiterName: undefined,
              totalCost: undefined,
              currentOrderId: undefined
            }
          : t
      )
    );

    // 3. Update client visits/spending metrics if VIP customer
    onUpdateClients(
      clients.map((cl) => {
        if (cl.id === selectedClientId) {
          return {
            ...cl,
            visits: cl.visits + 1,
            totalSpent: cl.totalSpent + finalTotal
          };
        }
        return cl;
      })
    );

    alert(`¡Transacción Procesada!\nFactura: ${updatedOrder.invoiceId}\nMesa: ${checkoutTableId}\nTotal Cobrado: $${finalTotal.toFixed(2)}`);

    // Reset checkout states
    setCheckoutTableId(null);
    setSelectedTableId(null);
    setActiveTab('mesas');
  };

  return (
    <div id="waiter_pos_root" className="min-h-screen bg-[#070b19] flex flex-col font-sans select-none text-slate-100 pb-12">
      
      {/* Dynamic Header Metrics Bar */}
      <header className="bg-[#0f172a] border-b border-slate-800 p-4 shrink-0 shadow-lg relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold text-white uppercase tracking-tight">GastroGestión OS</h1>
                <span className="text-[9px] font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full uppercase font-bold">{currentUser.role === 'Chef' ? 'CHEF' : 'MESERO'}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-[10px] text-slate-400 font-mono">Sesión: {currentUser.name}</span>
              </div>
            </div>
          </div>

          {/* Core ERP KPI metrics */}
          <div className="flex items-center gap-6 sm:gap-8 bg-slate-900/60 p-2 px-5 border border-slate-800/80 rounded-2xl">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Total de Ventas</span>
              <p className="text-white font-mono text-sm font-bold">${totalSalesAccrued.toFixed(2)}</p>
            </div>
            <div className="w-[1px] h-6 bg-slate-850" />
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Mesas Ocupadas</span>
              <p className="text-white font-mono text-sm font-bold">{activeOccupiedCount} / {tables.length}</p>
            </div>
            <div className="w-[1px] h-6 bg-slate-850" />
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Pedidos Activos</span>
              <p className="text-amber-400 font-mono text-sm font-bold">{activeKitchenOrdersCount} Cola</p>
            </div>
          </div>

          {/* Exit controls */}
          <button
            id="waiter_pos_exit_btn"
            onClick={onLogout}
            className="p-2 bg-red-500/10 hover:bg-red-500 group text-red-400 hover:text-white border border-red-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>SALIR</span>
          </button>

        </div>
      </header>

      {/* Main split dashboard area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column (Selector and map grids) */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
          
          {/* Tabs Selector Buttons */}
          {currentUser.role !== 'Chef' ? (
            <div className="flex items-center gap-2 font-mono">
              <button
                id="btn_tab_tables"
                onClick={() => setActiveTab('mesas')}
                className={`flex-1 justify-center py-3 px-4 rounded-xl flex items-center gap-2 text-xs font-bold border transition-all cursor-pointer ${activeTab === 'mesas' ? 'bg-[#1e293b] border-slate-700 text-teal-400 shadow-md shadow-teal-500/[0.02]' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'}`}
              >
                <LayoutGrid className="w-4 h-4 text-cyan-400" />
                Croquis de Mesas
              </button>

              <button
                id="btn_tab_checkout"
                onClick={() => {
                  // If a table is occupied on selection and its active order is Entregado, default checkout to it
                  const isSelectedTableDeliverable = selectedTableId && 
                    selectedTable?.status === 'Ocupada' && 
                    orders.find(o => o.tableId === selectedTableId && o.status !== 'Cobrado')?.status === 'Entregado';

                  if (isSelectedTableDeliverable) {
                    setCheckoutTableId(selectedTableId);
                  } else {
                    // Pre-load first occupied table that is delivered
                    const finishedOccupied = tables.find(t => {
                      if (t.status !== 'Ocupada') return false;
                      const order = orders.find(o => o.tableId === t.id && o.status !== 'Cobrado');
                      return order?.status === 'Entregado';
                    });
                    if (finishedOccupied) {
                      setCheckoutTableId(finishedOccupied.id);
                    } else {
                      setCheckoutTableId(null);
                    }
                  }
                  setActiveTab('cobros');
                }}
                className={`flex-1 justify-center py-3 px-4 rounded-xl flex items-center gap-2 text-xs font-bold border transition-all cursor-pointer ${activeTab === 'cobros' ? 'bg-[#1e293b] border-slate-700 text-teal-400 shadow-md shadow-teal-500/[0.02]' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'}`}
              >
                <Receipt className="w-4 h-4 text-emerald-400" />
                Caja & Cobros
              </button>
            </div>
          ) : (
            <div className="bg-[#111827] border border-orange-500/20 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-orange-400">
                <ChefHat className="w-4 h-4 animate-bounce" />
                <span>Panel de Cocina Silencioso activo • Solo Vista y Despacho de Platos</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded uppercase">MODO CHEF</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'mesas' ? (
              <motion.div
                key="tab-mesas-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 space-y-5 flex-1 flex flex-col min-h-0"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-950/20 p-3 rounded-2xl border border-slate-850">
                  <div>
                    <h2 className="text-white text-md font-bold font-sans">Croquis de Salón</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Selecciona una mesa para gestionar comandas o su disponibilidad</p>
                  </div>
                  {currentUser.role !== 'Chef' && (
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro que deseas desocupar y liberar TODAS las mesas? Esto restablecerá sus estados a Libre.')) {
                          onUpdateTables(tables.map(t => ({
                            ...t,
                            status: 'Libre',
                            currentWaiterId: undefined,
                            currentWaiterName: undefined,
                            totalCost: undefined,
                            currentOrderId: undefined
                          })));
                          // Cancel active unpaid orders
                          onUpdateOrders(orders.filter(o => o.status === 'Cobrado'));
                          setSelectedTableId(null);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/25 text-red-400 text-[10px] font-mono font-bold rounded-xl transition-all uppercase cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Desocupar Todas las Mesas
                    </button>
                  )}
                </div>

                {/* State Legend badges row */}
                <div className="flex flex-wrap items-center gap-3.5 text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 pb-1 border-b border-slate-850">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 shadow shadow-emerald-500/25 inline-block" /> Libres
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-500 shadow shadow-red-500/20 inline-block" /> Ocupadas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-400 shadow shadow-amber-400/25 inline-block" /> Reservadas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-slate-500 shadow shadow-slate-500/25 inline-block" /> Sucias
                  </span>
                </div>

                {/* Interactive Grid matching table layout in restaurant */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto pr-1 flex-1 custom-scrollbar min-h-[300px]">
                  {tables.map((tbl) => {
                    const isSelected = tbl.id === selectedTableId;
                    const isActiveOrder = orders.find(o => o.tableId === tbl.id && o.status !== 'Cobrado');
                    
                    // State Styling mapper
                    const stateColor: { [key: string]: string } = {
                      Libre: 'border-emerald-500/20 bg-emerald-500/[0.02] hover:border-emerald-500/50',
                      Ocupada: 'border-red-500/20 bg-red-500/[0.02] hover:border-red-500/50',
                      Reservada: 'border-amber-400/20 bg-amber-400/[0.02] hover:border-amber-400/50',
                      Sucia: 'border-slate-500/20 bg-slate-500/[0.02] hover:border-slate-500/50'
                    };

                    const badgeColor: { [key: string]: string } = {
                      Libre: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      Ocupada: 'text-red-400 bg-red-500/10 border-red-500/20',
                      Reservada: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
                      Sucia: 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                    };

                    return (
                      <div
                        key={tbl.id}
                        id={`pos_table_card_${tbl.id}`}
                        onClick={() => setSelectedTableId(tbl.id)}
                        className={`border rounded-2xl p-4 flex flex-col justify-between transition-all duration-150 cursor-pointer text-left h-[135px] relative group ${stateColor[tbl.status]} ${
                          isSelected ? 'ring-2 ring-teal-500/60 shadow-lg scale-[1.02]' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-white font-extrabold text-lg tracking-tight font-mono">{tbl.label}</span>
                          <span className={`text-[8.5px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${badgeColor[tbl.status]}`}>
                            {tbl.status}
                          </span>
                        </div>

                        {/* Mid Meta description text details */}
                        <div className="text-slate-400 text-xs">
                          {tbl.status === 'Ocupada' ? (
                            <p className="line-clamp-2">
                              {tbl.currentWaiterName?.split(' ')[0]} • {tbl.totalCost ? `$${tbl.totalCost.toFixed(2)}` : ''}
                            </p>
                          ) : tbl.status === 'Reservada' ? (
                            <p className="text-amber-400/70">Reserva activa hoy</p>
                          ) : tbl.status === 'Sucia' ? (
                            <p className="text-slate-500">Mesa por limpiar</p>
                          ) : (
                            <p className="text-slate-500 font-mono text-[10px]">Limpio</p>
                          )}
                        </div>

                        {/* Bottom Pax limitation indicator */}
                        <div className="border-t border-slate-850/60 pt-2 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-sans">Capacidad: {tbl.capacity} pax</span>
                          {tbl.status === 'Ocupada' && isActiveOrder && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
                              isActiveOrder.status === 'Pendiente'
                                ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                                : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/10'
                            }`}>
                              <Clock className="w-2.5 h-2.5" />
                              {isActiveOrder.status === 'Pendiente' ? 'PEND' : isActiveOrder.status === 'Ordenado' ? 'ORD' : isActiveOrder.status === 'En Cocina' ? 'PREP' : 'LISTO'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="tab-checkout-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 space-y-5 flex-1 flex flex-col min-h-0"
              >
                <div>
                  <h2 className="text-white text-md font-bold font-sans">Caja Registradora / Terminal de Cobros</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Realiza el arqueo final de comandas de mesa asociadas y revisa cobros</p>
                </div>

                {/* Split grid layout of register */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
                  
                  {/* Left Block: Active billing */}
                  <div className="xl:col-span-7 space-y-4 flex flex-col justify-between min-h-0">
                    <div>
                      {/* Occupied tables selector for checkout quick tab */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 pr-2">Mesa a cobrar:</span>
                        {tables.filter(t => {
                          if (t.status !== 'Ocupada') return false;
                          const order = orders.find(o => o.tableId === t.id && o.status !== 'Cobrado');
                          return order?.status === 'Entregado';
                        }).map((ot) => (
                          <button
                            key={ot.id}
                            onClick={() => setCheckoutTableId(ot.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${checkoutTableId === ot.id ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-850 text-slate-400'}`}
                          >
                            {ot.label} ({ot.currentWaiterName?.split(' ')[0]})
                          </button>
                        ))}

                        {tables.filter(t => {
                          if (t.status !== 'Ocupada') return false;
                          const order = orders.find(o => o.tableId === t.id && o.status !== 'Cobrado');
                          return order?.status === 'Entregado';
                        }).length === 0 && (
                          <span className="text-xs text-slate-500 italic block">No hay mesas ocupadas listas para cobrar hoy.</span>
                        )}
                      </div>

                      {checkoutActiveOrder ? (
                        <div className="space-y-4 pt-1">
                          <div className="bg-slate-950/40 rounded-2xl border border-slate-850 p-4 shrink-0 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Receipt className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-slate-400 text-[10px] font-mono uppercase leading-none">Mesa {checkoutTableId} • Comanda activa</p>
                                <span className="text-white text-xs font-semibold block mt-1">Socio / Cliente: Consumidor Final</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-slate-500 block">SUBTOTAL CONSUMO</span>
                              <span className="text-white font-mono font-bold text-sm">${checkoutSubtotal.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Table of products */}
                          <div className="bg-slate-900/60 rounded-2xl border border-slate-850 p-4 max-h-[140px] overflow-y-auto custom-scrollbar">
                            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Desglose de Platillos</h4>
                            <div className="space-y-2">
                              {checkoutActiveOrder.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between justify-items-center text-xs">
                                  <span className="text-slate-300 font-medium">{it.quantity}x {it.name}</span>
                                  <span className="font-mono text-slate-400">${(it.price * it.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tip percentage calculation selection row */}
                          <div className="bg-[#0a101d] border border-slate-850/80 rounded-2xl p-4 shrink-0 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Sugerir Propina</label>
                                <div className="flex gap-1">
                                  {[0, 10, 15, 20].map((perc) => (
                                    <button
                                      key={perc}
                                      onClick={() => setTipPercentage(perc)}
                                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${tipPercentage === perc ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-300'}`}
                                    >
                                      {perc}%
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-1.5">
                                  <label className="block text-[10px] uppercase font-mono text-slate-400">Descuento Directo ($)</label>
                                  <span className="text-[8.5px] uppercase font-mono text-emerald-400 bg-emerald-500/10 px-1 border border-emerald-500/30 rounded">Canjeable</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="Ej. 5.00 o 0"
                                  value={discountInput}
                                  onChange={(e) => setDiscountInput(e.target.value)}
                                  className="w-full bg-[#070b19] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white uppercase focus:border-amber-500 focus:outline-none font-mono"
                                />
                              </div>
                            </div>

                            {/* Method of payment selected */}
                            <div>
                              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-2">Método de Pago Seleccionado</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {([
                                  'Tarjeta',
                                  'Tarjeta de Crédito',
                                  'Tarjeta de Débito',
                                  'Efectivo',
                                  'Transferencia',
                                  'Pago Móvil',
                                  'SINPE Móvil',
                                  'Cortesía',
                                  'Criptomonedas'
                                ] as const).map((method) => (
                                  <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-2 rounded-xl text-[10px] font-bold border transition-all duration-100 ${paymentMethod === method ? 'bg-[#1e293b] border-slate-750 text-teal-400' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-300'}`}
                                  >
                                    {method}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                          <AlertCircle className="w-10 h-10 text-slate-500 animate-pulse mb-2" />
                          <p className="text-slate-400 text-xs">Ninguna comanda activa seleccionada para facturar.</p>
                          <p className="text-slate-505 text-[10px]">Elige una de las mesas ocupadas listadas arriba para proceder con el cobro de la cuenta.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Block: Live invoice logs history of paid orders */}
                  <div className="xl:col-span-5 flex flex-col h-full bg-[#080d19] border border-slate-800 p-4 rounded-2xl min-h-[350px]">
                    <div className="pb-2 border-b border-slate-800 mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1">
                          <span>Historial de Cobros ({history.length})</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Comandas liquidadas durante hoy</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[380px] custom-scrollbar">
                      {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-600">
                          <Receipt className="w-8 h-8 opacity-20 mb-2" />
                          <span className="text-[10px] font-mono uppercase tracking-widest block">No hay cierres registrados aún</span>
                        </div>
                      ) : (
                        history.map((h, i) => (
                          <div key={h.id || i} className="bg-[#0b1324] border border-slate-850 rounded-xl p-3.5 space-y-3.5 relative shadow-md">
                            
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-white text-[10px] font-extrabold font-mono uppercase bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                  Ticket #{h.invoiceId || 'N/A'}
                                </span>
                                <span className="text-[11px] text-amber-400 font-black ml-2">Mesa {h.tableId}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">
                                {h.timestamp ? new Date(h.timestamp).toLocaleTimeString() : ''}
                              </span>
                            </div>

                            <div className="text-[10px] font-mono text-slate-400 leading-tight space-y-0.5">
                              <p>Mesero: <span className="text-slate-200">{h.waiterName}</span></p>
                              {h.chefName && <p>Despachó Chef: <span className="text-cyan-400 font-bold">{h.chefName}</span></p>}
                            </div>

                            {/* Consumed items listing with quantities and unit break down */}
                            <div className="border-t border-b border-dashed border-slate-800/80 py-2.5 space-y-1.5 bg-[#070b16]/30 px-2 rounded-lg">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Consumo Detallado:</span>
                              {h.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px] font-mono">
                                  <span className="text-slate-300 font-medium">
                                    <span className="text-amber-500 font-bold mr-1">{it.quantity}x</span> {it.name}
                                  </span>
                                  <span className="text-slate-350 font-bold">${(it.price * it.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center pt-1.5">
                              <span className="text-[9.5px] font-bold text-teal-400 bg-teal-500/5 border border-teal-500/15 px-2 py-0.5 rounded font-mono uppercase">
                                {h.paymentMethod || 'Tarjeta'}
                              </span>
                              <div className="text-right">
                                <span className="text-[9px] font-mono text-slate-500 block uppercase">Monto Total Pago:</span>
                                <span className="text-white font-mono font-black text-xs block mt-0.5">${h.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column (Sidebar details order & command placing) */}
        <div className="lg:col-span-4 bg-[#0a0f1d] border border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between min-h-[440px]">
          
          <AnimatePresence mode="wait">
            {isTakingOrder ? (
              <motion.div
                key="sidebar-taking-order"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4 flex flex-col justify-between h-full"
              >
                {/* Header taking order */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-extrabold text-white font-mono">{selectedTable?.label} • Nueva Comanda</h3>
                    <p className="text-slate-400 text-[10px]">Selecciona platos y bebidas del menú</p>
                  </div>
                  <button
                    id="cancel_taking_order_btn"
                    onClick={() => setIsTakingOrder(false)}
                    className="text-slate-400 hover:text-white text-xs bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 transition-colors"
                  >
                    Volver
                  </button>
                </div>

                {/* Dropdowns/Searches for standard item filters */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative col-span-2">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar en el menú..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="w-full bg-slate-905 border border-slate-800 rounded-xl pl-8.5 pr-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[8.5px] uppercase font-mono text-slate-500 block mb-1">ATENDIDO POR</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300 block py-1 text-center rounded">
                      {currentUser.name.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] uppercase font-mono text-slate-500 block mb-1">CLIENTE / SOCIO</span>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-[10px] text-white py-1 rounded focus:outline-none"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items menu results list */}
                <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 custom-scrollbar flex-1 border-t border-b border-slate-850 py-3">
                  {filteredMenu.map((m) => {
                    const qtyInTicket = orderItems[m.id] || 0;
                    return (
                      <div key={m.id} className="flex justify-between items-center p-2 bg-slate-950/40 border border-slate-850 rounded-xl">
                        <div className="text-left">
                          <h4 className="text-white text-xs font-bold leading-tight">{m.name}</h4>
                          <span className="text-amber-400 text-xs font-semibold mt-0.5 inline-block font-mono">${m.price.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {qtyInTicket > 0 && (
                            <>
                              <button
                                onClick={() => handleRemoveItem(m.id)}
                                className="w-6 h-6 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold"
                              >
                                -
                              </button>
                              <span className="text-white font-bold font-mono text-xs w-4 text-center">{qtyInTicket}</span>
                            </>
                          )}
                          <button
                            onClick={() => handleAddItem(m.id)}
                            className="w-6 h-6 rounded-lg bg-teal-500 hover:scale-105 hover:brightness-110 text-slate-950 flex items-center justify-center text-xs font-black transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Special directions recipe notes */}
                <div>
                  <label className="text-[9px] uppercase font-mono text-slate-400 block mb-1">Instrucciones Especiales</label>
                  <textarea
                    placeholder="Notas de cocina para toda la mesa..."
                    rows={1}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-[#050b15] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Order total placement */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-slate-400">Total estimado:</span>
                    <span className="text-white font-mono font-bold text-sm">
                      ${Object.entries(orderItems).reduce((sum, [id, qty]) => {
                        const m = menu.find(i => i.id === id);
                        return sum + ((m?.price || 0) * Number(qty));
                      }, 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      id="submit_new_order_btn"
                      onClick={() => handleConfirmOrder(false)}
                      disabled={Object.keys(orderItems).length === 0}
                      className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 disabled:brightness-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/10 flex items-center justify-center gap-1.5 uppercase transition-all cursor-pointer"
                    >
                      <ChefHat className="w-4 h-4 text-slate-955" />
                      Enviar a Cocina
                    </button>

                    <button
                      id="submit_pending_order_btn"
                      onClick={() => handleConfirmOrder(true)}
                      disabled={Object.keys(orderItems).length === 0}
                      className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-350 disabled:brightness-50 disabled:cursor-not-allowed hover:bg-slate-850 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 uppercase transition-all cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                      Dejar Pendiente (Borrador)
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="sidebar-table-details"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="flex flex-col justify-between h-full space-y-4"
              >
                {selectedTableId ? (
                  <div className="space-y-4 flex flex-col h-full justify-between">
                    <div>
                      {/* Top change direct state header */}
                      <div className="pb-3 border-b border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">GESTIÓN DE MESA</span>
                        <h3 className="text-sm font-bold text-white mb-3">Mesa {selectedTable?.label} ({selectedTable?.status})</h3>
                        
                        {currentUser.role !== 'Chef' ? (
                          <div className="flex items-center gap-1.5 font-mono">
                            <button
                              id="set_table_libre"
                              onClick={() => handleChangeTableStatus('Libre')}
                              className={`flex-1 py-1.5 text-[10px] uppercase font-bold text-center rounded-lg border transition-all cursor-pointer ${selectedTable?.status === 'Libre' ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-400' : 'bg-slate-900 border-slate-850 text-slate-400'}`}
                            >
                              Libre
                            </button>
                            <button
                              id="set_table_reservada"
                              onClick={() => handleChangeTableStatus('Reservada')}
                              className={`flex-1 py-1.5 text-[10px] uppercase font-bold text-center rounded-lg border transition-all cursor-pointer ${selectedTable?.status === 'Reservada' ? 'bg-amber-400/15 border-amber-400/60 text-amber-400' : 'bg-slate-900 border-slate-850 text-slate-400'}`}
                            >
                              Reservada
                            </button>
                            <button
                              id="set_table_sucia"
                              onClick={() => handleChangeTableStatus('Sucia')}
                              className={`flex-1 py-1.5 text-[10px] uppercase font-bold text-center rounded-lg border transition-all cursor-pointer ${selectedTable?.status === 'Sucia' ? 'bg-slate-500/15 border-slate-500/60 text-slate-400' : 'bg-slate-900 border-slate-850 text-slate-450'}`}
                            >
                              Sucia / Limpiar
                            </button>
                          </div>
                        ) : (
                          <div className="py-2.5 px-3 bg-slate-950/40 border border-slate-850 rounded-xl text-[10px] font-mono text-slate-500 flex justify-between items-center">
                            <span>Estado asignado por mesero:</span>
                            <span className="text-amber-400 font-bold uppercase">{selectedTable?.status}</span>
                          </div>
                        )}
                      </div>

                      {/* Display sub-details depending on current status */}
                      {selectedTable?.status === 'Libre' && (
                        <div className="py-6 text-center space-y-5">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                            <Check className="w-5 h-5" />
                          </div>
                          <div className="space-y-1 px-4">
                            <h4 className="text-white text-xs font-bold">Mesa {selectedTable?.label} está Libre</h4>
                            <p className="text-slate-400 text-[10px]">
                              Esta mesa se encuentra disponible para registrar nuevos consumos. Haz clic abajo para sentar clientes o programar una reserva.
                            </p>
                          </div>
                          
                          {/* Inner specifications card */}
                          <div className="bg-slate-950/40 rounded-xl border border-slate-850 p-3 max-w-[200px] mx-auto text-left space-y-1.5 font-mono text-[10px] text-slate-400">
                            <div className="flex justify-between">
                              <span>Capacidad:</span>
                              <span className="text-white font-bold">{selectedTable?.capacity} Pax máximo</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Estado Actual:</span>
                              <span className="text-emerald-400 font-bold">Disponible</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedTable?.status === 'Reservada' && (
                        <div className="py-6 text-center space-y-4">
                          <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mx-auto">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-white text-xs font-bold">Mesa Reservada</h4>
                            <p className="text-slate-400 text-[10px] px-4">
                              Hay una reserva asignada para hoy. Puedes cambiar el estado a "Ocupada" directamente tomando un pedido para sentar a los comensales.
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedTable?.status === 'Sucia' && (
                        <div className="py-6 text-center space-y-4">
                          <div className="w-12 h-12 rounded-full bg-slate-500/10 border border-slate-505/20 flex items-center justify-center text-slate-400 mx-auto">
                            <Clock className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-white text-xs font-bold">Mesa por Sanitizar</h4>
                            <p className="text-slate-400 text-[10px] px-4">
                              Esta mesa ha sido desocupada recientemente. Por favor, marque "Libre" una vez que el personal de limpieza desinfecte el espacio.
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedTable?.status === 'Ocupada' && tableActiveOrder && (
                        <div className="space-y-4 pt-1">
                          <div className="bg-slate-950/40 rounded-xl border border-slate-850 p-3 flex justify-between justify-items-center">
                            <div className="text-left text-[11px]">
                              <span className="text-[10px] font-mono text-slate-405 uppercase block">MESERO</span>
                              <span className="text-white font-bold">{tableActiveOrder.waiterName}</span>
                            </div>
                            <div className="text-right text-[11px]">
                              <span className="text-[10px] font-mono text-slate-405 uppercase block">FECHA HORA</span>
                              <span className="text-white font-bold">{new Date().toLocaleTimeString()}</span>
                            </div>
                          </div>

                          {/* List of ordered products inside side card */}
                          <div className="bg-[#050b15]/60 border border-slate-850 p-3 rounded-xl max-h-[160px] overflow-y-auto custom-scrollbar">
                            <h4 className="text-[9px] font-mono text-slate-501 uppercase tracking-widest mb-2 pb-1 border-b border-slate-850">Artículos Consumidos</h4>
                            <div className="space-y-2">
                              {tableActiveOrder.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <span className="text-slate-300">
                                    <span className="font-bold text-amber-400 mr-1">{it.quantity}x</span> {it.name}
                                  </span>
                                  <span className="font-mono text-white text-[11px] font-bold">${(it.price * it.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order subtotal line */}
                          <div className="flex justify-between text-xs py-1 border-b border-slate-850">
                            <span className="text-slate-400">Subtotal:</span>
                            <span className="text-white font-mono font-bold">${tableActiveOrder.subtotal.toFixed(2)}</span>
                          </div>

                          {/* Active Kitchen simulator card widget links if ORDER IS PENDING OR ORDERED */}
                          {currentUser.role !== 'Chef' && tableActiveOrder.status === 'Pendiente' && (
                            <div className="p-3 bg-amber-500/5 border border-amber-500/25 rounded-2xl space-y-2">
                              <p className="text-[10px] text-amber-400 leading-relaxed font-sans font-medium flex gap-1 items-start">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                                <span>
                                  <strong>Pedido Pendiente (Borrador):</strong> Esta comanda está guardada como borrador. Haz clic abajo para retomar el pedido, añadir más platillos o enviarlo a la cocina.
                                </span>
                              </p>
                              <button
                                id="resume_pending_badge_btn"
                                onClick={() => handleResumePendingOrder(tableActiveOrder)}
                                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-bold text-[10.5px] rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current text-slate-955" />
                                Retomar Pedido
                              </button>
                            </div>
                          )}

                          {/* Active Kitchen simulator card widget links if ORDER IS ORDERED */}
                          {currentUser.role !== 'Chef' && tableActiveOrder.status === 'Ordenado' && (
                            <div className="p-3 bg-amber-500/5 border border-amber-500/25 rounded-2xl space-y-2">
                              <p className="text-[10px] text-amber-400/90 leading-relaxed font-sans font-medium flex gap-1 items-start">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Pedido en Cocina (Estado: Ordenado):</strong> El Chef debe preparar y despachar la comanda. Puedes simular el proceso de cocina ahora mismo:
                                </span>
                              </p>
                              <button
                                id="trigger_kitchen_simulate_btn"
                                onClick={() => onTriggerKitchen(tableActiveOrder)}
                                className="w-full py-2 bg-amber-500 text-slate-950 font-bold hover:brightness-115 text-[10.5px] rounded-lg transition-all flex items-center justify-center gap-1 uppercase"
                              >
                                <ChefHat className="w-4 h-4 text-slate-950 animate-bounce" />
                                Ir a la Cocina (Simulador)
                              </button>
                            </div>
                          )}

                          {currentUser.role !== 'Chef' && tableActiveOrder.status === 'En Cocina' && (
                            <div className="p-3 bg-cyan-500/5 border border-cyan-500/25 rounded-2xl space-y-2">
                              <p className="text-[10px] text-cyan-400 leading-relaxed font-sans font-medium flex gap-1 items-start">
                                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>
                                  El pedido se encuentra actualmente <strong>En Cocina</strong> por el chef asignado. Puedes volver a ver el progreso:
                                </span>
                              </p>
                              <button
                                onClick={() => onTriggerKitchen(tableActiveOrder)}
                                className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 font-bold text-[10.5px] rounded-lg transition-all uppercase"
                              >
                                Revisar Progreso Cocina
                              </button>
                            </div>
                          )}

                          {tableActiveOrder.status === 'Entregado' && (
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-1.5 text-left">
                              <p className="text-[10px] text-emerald-400 font-sans font-medium flex gap-1 items-start">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                                <span>
                                  <strong>¡Comanda Despachada!</strong> {tableActiveOrder.chefName ? `Cocinado por Chef: ${tableActiveOrder.chefName}.` : 'El Chef terminó la comanda.'} Listo para cobrar la cuenta.
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom general action triggers */}
                    <div className="pt-4 border-t border-slate-800 flex gap-2.5">
                      {currentUser.role === 'Chef' ? (
                        selectedTable?.status === 'Ocupada' ? (
                          tableActiveOrder && tableActiveOrder.status !== 'Entregado' ? (
                            <button
                              id="chef_despachar_btn"
                              onClick={() => {
                                onCompleteCooking(tableActiveOrder.id, currentUser.id, currentUser.name);
                                alert(`¡Pedido despachado con éxito!\nMesa: ${selectedTable.label}\nAtendido originalmente por: ${tableActiveOrder.waiterName}`);
                              }}
                              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-500/10 flex items-center justify-center gap-1.5 uppercase transition-all"
                            >
                              <ChefHat className="w-4 h-4 text-slate-955 animate-bounce" />
                              Despachar Pedido a Mesa
                            </button>
                          ) : (
                            <div className="w-full py-3 text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-mono text-[10px] uppercase font-bold">
                              ✓ Pedido ya se encuentra Despachado
                            </div>
                          )
                        ) : (
                          <div className="w-full text-center text-[10px] font-mono text-slate-500 leading-relaxed uppercase py-1">
                            No hay pedidos activos para despachar.
                          </div>
                        )
                      ) : (
                        selectedTable?.status === 'Ocupada' ? (
                          tableActiveOrder?.status === 'Pendiente' ? (
                            <button
                              id="resume_occupied_btn"
                              onClick={() => handleResumePendingOrder(tableActiveOrder)}
                              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 uppercase transition-all cursor-pointer"
                            >
                              <Play className="w-4 h-4 text-slate-950 fill-current" />
                              Retomar Pedido
                            </button>
                          ) : (
                            <>
                              <button
                                id="add_items_occupied_btn"
                                onClick={handleStartTakingOrder}
                                className={`${tableActiveOrder?.status === 'Entregado' ? 'flex-1' : 'w-full'} py-3 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-all uppercase cursor-pointer`}
                              >
                                + Añadir Items
                              </button>
                              {tableActiveOrder?.status === 'Entregado' && (
                                <button
                                  id="go_checkout_occupied_btn"
                                  onClick={() => handleRouteToCheckout(selectedTable.id)}
                                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all uppercase cursor-pointer"
                                >
                                  Ir a Cobrar
                                </button>
                              )}
                            </>
                          )
                        ) : (
                          <>
                            {selectedTable?.status === 'Libre' && (
                              <button
                                id="take_new_order_btn"
                                onClick={handleStartTakingOrder}
                                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/10 flex items-center justify-center gap-1.5 uppercase transition-all"
                              >
                                Tomar Pedido
                              </button>
                            )}
                            {selectedTable?.status === 'Reservada' && (
                              <button
                                id="reserve_direct_order_btn"
                                onClick={handleStartTakingOrder}
                                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 uppercase transition-all"
                              >
                                Sentar / Tomar Pedido
                              </button>
                            )}
                            {selectedTable?.status === 'Sucia' && (
                              <button
                                id="clean_table_direct_btn"
                                onClick={() => handleChangeTableStatus('Libre')}
                                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 uppercase transition-all cursor-pointer"
                              >
                                <Check className="w-4 h-4 text-white" />
                                Limpiar y Habilitar Mesa (Libre)
                              </button>
                            )}
                          </>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <LayoutGrid className="w-10 h-10 text-slate-600 animate-pulse mb-1" />
                    <h4 className="text-white text-xs font-bold leading-tight">Mesa Sin Seleccionar</h4>
                    <p className="text-slate-450 text-[10px] px-4">
                      Por favor, haz clic/presiona sobre cualquiera de las mesas del salón a la izquierda para administrar consumos, reservaciones o limpiar su espacio.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </main>

      {/* Outer Checkout button panel if checkout selected table is registered */}
      {activeTab === 'cobros' && checkoutTableId && checkoutActiveOrder && (
        <div className="max-w-7xl mx-auto w-full px-4 mt-2 shrink-0">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="text-left">
                <span className="text-slate-500 text-[10px] uppercase font-mono block">MESA SELECCIONADA</span>
                <span className="text-white font-extrabold text-base font-mono">{checkoutTableId} ({checkoutActiveOrder.waiterName})</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800 hidden md:block" />
              <div className="text-left font-mono text-xs text-slate-300 space-y-0.5">
                <div className="flex gap-2">
                  <span>Consumo:</span>
                  <span className="font-bold text-white">${checkoutSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <span>Propina ({tipPercentage}%):</span>
                  <span className="font-bold text-teal-400">+${(checkoutSubtotal * (tipPercentage / 100)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto text-right">
              <div>
                <span className="text-slate-400 text-[10.5px] font-mono block uppercase">Total a Cobrar</span>
                <span className="text-white font-mono font-black text-2xl">${checkoutTotalCalculated.toFixed(2)}</span>
              </div>

              <button
                id="register_and_invoice_btn"
                onClick={handleRegisterPayment}
                className="w-full md:w-auto py-3.5 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/20 uppercase tracking-widest transition-all"
              >
                Registrar Cobro e Imprimir Transacción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Legal disclaimer footer */}
      <footer className="mt-12 text-center text-[10px] font-mono text-slate-600 space-y-1">
        <p>© 2026 GastroGestión ERP. Todos los derechos reservados.</p>
        <p>Sistema en Línea y Autónomo • Clean Minimalism Style</p>
      </footer>

    </div>
  );
}
