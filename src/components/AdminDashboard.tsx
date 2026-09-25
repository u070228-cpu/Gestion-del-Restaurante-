/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Table, MenuItem, Client, Order, Schedule, Role, TableStatus } from '../types';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  LogOut,
  Sliders,
  CreditCard,
  PlusCircle,
  PiggyBank,
  Check,
  Percent,
  UserPlus,
  Compass,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  tables: Table[];
  menu: MenuItem[];
  clients: Client[];
  history: Order[];
  schedules: Schedule[];
  onLogout: () => void;
  onUpdateUsers: (newUsers: User[]) => void;
  onUpdateMenu: (newMenu: MenuItem[]) => void;
  onUpdateClients: (newClients: Client[]) => void;
  onUpdateSchedules: (newSchedules: Schedule[]) => void;
  onUpdateTables: (newTables: Table[]) => void;
}

type AdminTab = 'resumen' | 'inventario' | 'personal' | 'horarios' | 'clientes' | 'mesas';

export default function AdminDashboard({
  currentUser,
  users,
  tables,
  menu,
  clients,
  history,
  schedules,
  onLogout,
  onUpdateUsers,
  onUpdateMenu,
  onUpdateClients,
  onUpdateSchedules,
  onUpdateTables
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('resumen');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Employee Management States
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState<Role>('Mesero');
  const [empPin, setEmpPin] = useState('');
  const [empStatus, setEmpStatus] = useState<'Active' | 'Inactive'>('Active');
  const [selectedAvatarGrad, setSelectedAvatarGrad] = useState('from-indigo-500 to-purple-600');

  // 2. Inventory Management States
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState<'Comida' | 'Bebida' | 'Postre'>('Comida');
  const [itemStock, setItemStock] = useState('50');
  const [itemMinStock, setItemMinStock] = useState('10');

  // 3. Client Management States
  const [cliName, setCliName] = useState('');
  const [cliPhone, setCliPhone] = useState('');
  const [cliEmail, setCliEmail] = useState('');

  // 4. Schedule States
  const [schEmployeeId, setSchEmployeeId] = useState('');
  const [schDay, setSchDay] = useState<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'>('Lunes');
  const [schStartTime, setSchStartTime] = useState('08:00');
  const [schEndTime, setSchEndTime] = useState('16:00');
  const [schShift, setSchShift] = useState<'Mañana' | 'Tarde' | 'Noche'>('Mañana');

  // 5. Table States
  const [tableLabel, setTableLabel] = useState('');
  const [tableCapacity, setTableCapacity] = useState('4');
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editTableLabel, setEditTableLabel] = useState('');
  const [editTableCapacity, setEditTableCapacity] = useState('4');
  const [editTableStatus, setEditTableStatus] = useState<TableStatus>('Libre');

  const avatarGradients = [
    'from-cyan-500 to-teal-600',
    'from-emerald-500 to-green-600',
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-amber-500 to-orange-600'
  ];

  // Helper Stats Calculation
  const totalAccruedSales = history.reduce((sum, order) => sum + order.total, 0);
  const totalTips = history.reduce((sum, order) => sum + (order.subtotal * (order.tipPercentage / 100)), 0);
  const totalDiscounts = history.reduce((sum, order) => sum + order.discountAmount, 0);

  const cardPayments = history.filter(h => h.paymentMethod === 'Tarjeta').reduce((s, o) => s + o.total, 0);
  const cashPayments = history.filter(h => h.paymentMethod === 'Efectivo').reduce((s, o) => s + o.total, 0);
  const transPayments = history.filter(h => h.paymentMethod === 'Transferencia').reduce((s, o) => s + o.total, 0);
  const mobilePayments = history.filter(h => h.paymentMethod === 'Pago Móvil').reduce((s, o) => s + o.total, 0);

  // Add Employees
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empPin.trim()) return;

    const newEmp: User = {
      id: `usr-${Date.now()}`,
      name: empName.trim(),
      role: empRole,
      avatarColor: selectedAvatarGrad,
      pinCode: empPin,
      status: empStatus
    };

    onUpdateUsers([...users, newEmp]);
    setEmpName('');
    setEmpPin('');
    alert(`Personal "${newEmp.name}" creado con éxito. Ya puede iniciar sesión.`);
  };

  const handleToggleUserStatus = (id: string) => {
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } as User;
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('¿Está seguro de eliminar este usuario del sistema?')) {
      onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  // Add Menu Items
  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice || isNaN(Number(itemPrice))) return;

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: itemName.trim(),
      price: Math.max(0.1, Number(itemPrice)),
      category: itemCategory,
      stock: Math.max(0, Number(itemStock)),
      minStock: Math.max(0, Number(itemMinStock))
    };

    onUpdateMenu([...menu, newItem]);
    setItemName('');
    setItemPrice('');
    setItemStock('50');
    setItemMinStock('10');
  };

  const handleDeleteMenuItem = (id: string) => {
    if (confirm('¿Desea eliminar este artículo del menú?')) {
      onUpdateMenu(menu.filter(m => m.id !== id));
    }
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    onUpdateMenu(menu.map(m => m.id === id ? { ...m, stock: Math.max(0, newStock) } : m));
  };

  // Add Client
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliName.trim()) return;

    const newCli: Client = {
      id: `cli-${Date.now()}`,
      name: cliName.trim(),
      phone: cliPhone.trim() || undefined,
      email: cliEmail.trim() || undefined,
      visits: 0,
      totalSpent: 0
    };

    onUpdateClients([newCli, ...clients]);
    setCliName('');
    setCliPhone('');
    setCliEmail('');
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('¿Eliminar cliente logueado?')) {
      onUpdateClients(clients.filter(c => c.id !== id));
    }
  };

  // Add Schedule
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schEmployeeId) return;

    const selectedEmployee = users.find(u => u.id === schEmployeeId);
    if (!selectedEmployee) return;

    const newSch: Schedule = {
      id: `sch-${Date.now()}`,
      employeeId: schEmployeeId,
      employeeName: selectedEmployee.name,
      day: schDay,
      startTime: schStartTime,
      endTime: schEndTime,
      shift: schShift
    };

    onUpdateSchedules([...schedules, newSch]);
  };

  const handleDeleteSchedule = (id: string) => {
    onUpdateSchedules(schedules.filter(s => s.id !== id));
  };

  // Add Table
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableLabel.trim() || isNaN(Number(tableCapacity))) return;

    const formattedLabel = tableLabel.trim().toUpperCase().startsWith('T-')
      ? tableLabel.trim().toUpperCase()
      : `T-${tableLabel.trim().toUpperCase()}`;

    const newTable: Table = {
      id: `T-${Date.now()}`,
      label: formattedLabel,
      capacity: Math.max(1, Number(tableCapacity)),
      status: 'Libre'
    };

    // Check collision with existing table label
    if (tables.some(t => t.label.trim().toLowerCase() === newTable.label.trim().toLowerCase())) {
      alert('Ya existe una mesa con esa identificación.');
      return;
    }

    onUpdateTables([...tables, newTable]);
    setTableLabel('');
    setTableCapacity('4');
  };

  const handleStartEditTable = (table: Table) => {
    setEditingTable(table);
    setEditTableLabel(table.label);
    setEditTableCapacity(table.capacity.toString());
    setEditTableStatus(table.status);
  };

  const handleCancelEditTable = () => {
    setEditingTable(null);
  };

  const handleSaveEditTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    const trimmedLabel = editTableLabel.trim();
    if (!trimmedLabel) {
      alert('Por favor ingrese una identificación o nombre para la mesa.');
      return;
    }
    const cap = Number(editTableCapacity);
    if (isNaN(cap) || cap <= 0) {
      alert('Por favor ingrese una capacidad válida (mínimo 1 comensal).');
      return;
    }

    // Check collision with another table's label (case insensitive)
    const duplicate = tables.some(
      t => t.id !== editingTable.id && t.label.trim().toLowerCase() === trimmedLabel.toLowerCase()
    );
    if (duplicate) {
      alert('Ya existe otra mesa con esa misma identificación.');
      return;
    }

    const updatedTables = tables.map(t => {
      if (t.id === editingTable.id) {
        return {
          ...t,
          label: trimmedLabel,
          capacity: cap,
          status: editTableStatus
        };
      }
      return t;
    });

    onUpdateTables(updatedTables);
    setEditingTable(null);
  };

  const handleDeleteTable = (id: string) => {
    const table = tables.find(t => t.id === id);
    const tableName = table ? table.label : id;

    if (table && table.status === 'Ocupada') {
      if (!confirm(`La mesa "${tableName}" actualmente está marcada como Ocupada. ¿Está totalmente seguro de eliminarla?`)) {
        return;
      }
    } else {
      if (!confirm(`¿Está seguro de que desea eliminar la mesa "${tableName}" permanentemente?`)) {
        return;
      }
    }

    if (editingTable?.id === id) {
      setEditingTable(null);
    }
    onUpdateTables(tables.filter(t => t.id !== id));
  };

  return (
    <div id="admin_dashboard_root" className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Banner Control Bar */}
      <header className="bg-[#0f172a] border-b border-slate-800 py-4 px-6 flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-white flex items-center gap-1.5">
              GastroGestión <span className="text-amber-400 font-bold">OS</span> 
              <span className="text-[10px] font-mono font-bold uppercase py-0.5 px-2.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">Administrador</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Panel de Control General del Sistema</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 font-mono block">Sesión Activa</span>
            <span className="text-white text-xs font-semibold">{currentUser.name}</span>
          </div>

          <button
            id="admin_logout_btn"
            onClick={onLogout}
            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Core View Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Sub Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#0a0f1d] border-r border-slate-800 p-4 flex flex-col gap-1 md:shrink-0">
          <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase mb-2 px-3">NAVEGACIÓN</span>
          <button
            id="tab_resumen"
            onClick={() => setActiveTab('resumen')}
            className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all duration-150 ${activeTab === 'resumen' ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
          >
            <TrendingUp className="w-4 h-4" />
            Ventas y Resumen
          </button>
          
          <button
            id="tab_inventario"
            onClick={() => setActiveTab('inventario')}
            className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all duration-150 ${activeTab === 'inventario' ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            Menú e Inventario
          </button>

          <button
            id="tab_personal"
            onClick={() => setActiveTab('personal')}
            className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all duration-150 ${activeTab === 'personal' ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
          >
            <Users className="w-4 h-4" />
            Personal (Chefs & Meseros)
          </button>

          <button
            id="tab_horarios"
            onClick={() => setActiveTab('horarios')}
            className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all duration-150 ${activeTab === 'horarios' ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
          >
            <Calendar className="w-4 h-4" />
            Horarios de Turnos
          </button>

          <button
            id="tab_clientes"
            onClick={() => setActiveTab('clientes')}
            className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all duration-150 ${activeTab === 'clientes' ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
          >
            <Sparkles className="w-4 h-4" />
            Clientes Club
          </button>

          <button
            id="tab_mesas"
            onClick={() => setActiveTab('mesas')}
            className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all duration-150 ${activeTab === 'mesas' ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
          >
            <Layers className="w-4 h-4" />
            Diseño de Mesas
          </button>

          <div className="mt-auto pt-6 border-t border-slate-800/60 p-3 hidden md:block">
            <span className="text-[9px] font-mono text-slate-500 block">SISTEMA POS</span>
            <span className="text-white text-xs font-semibold">Local En Línea ✔</span>
            <p className="text-[10px] text-slate-500 font-mono mt-1">2026 GastroGestión ERP</p>
          </div>
        </aside>

        {/* Action Panel Workspace Section */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#070b19] relative">
          
          <AnimatePresence mode="wait">
            {/* TAB: RESUMEN GENERAL (SALES & BILLS) */}
            {activeTab === 'resumen' && (
              <motion.div
                key="tab-resumen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/65 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-mono text-slate-400">Ventas Registradas</span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white font-mono">${totalAccruedSales.toFixed(2)}</h3>
                      <p className="text-[10px] text-emerald-400 font-mono mt-1">▲ Total de ingresos acumulados</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/65 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-mono text-slate-400">Total Propinas</span>
                      <PiggyBank className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white font-mono">${totalTips.toFixed(2)}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Adicionales para meseros</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/65 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-mono text-slate-400">Descuentos Aplicados</span>
                      <Percent className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white font-mono">${totalDiscounts.toFixed(2)}</h3>
                      <p className="text-[10px] text-amber-500/80 font-mono mt-1">Cortesías y promociones</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/65 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-mono text-slate-400">Transacciones</span>
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white font-mono">{history.length}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Facturas impresas y cobradas</p>
                    </div>
                  </div>
                </div>

                {/* Grid for payments breakdown and search list */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column Method Analytics */}
                  <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      Arqueo de Caja / Métodos de Pago
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1">Tarjeta</span>
                        <span className="font-mono text-white font-bold">${cardPayments.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1">Efectivo</span>
                        <span className="font-mono text-white font-bold">${cashPayments.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1">Transferencia</span>
                        <span className="font-mono text-white font-bold">${transPayments.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1">Pago Móvil</span>
                        <span className="font-mono text-white font-bold">${mobilePayments.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Invoices List */}
                  <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h3 className="text-sm font-bold text-white">Facturas / Historial de Ventas</h3>
                      <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                        {history.length} registradas
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-850 text-slate-400">
                            <th className="py-2">FACTURA</th>
                            <th>MESA</th>
                            <th>CLIENTE</th>
                            <th>MÉTODO</th>
                            <th>DESC.</th>
                            <th className="text-right">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((inv, idx) => (
                            <tr key={idx} className="border-b border-slate-850/40 text-slate-300 hover:bg-slate-900/20">
                              <td className="py-2.5 font-mono text-amber-400 font-bold">{inv.invoiceId || '#N/A'}</td>
                              <td>{inv.tableId}</td>
                              <td>{inv.waiterName ? `${inv.waiterName.split(' ')[0]} (Mesero)` : 'Mesa'}</td>
                              <td>
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-300">
                                  {inv.paymentMethod || 'Tarjeta'}
                                </span>
                              </td>
                              <td className="font-mono text-red-400">-${inv.discountAmount.toFixed(2)}</td>
                              <td className="text-right font-mono font-bold text-white">${inv.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: STOCK & INVENTORY MENU */}
            {activeTab === 'inventario' && (
              <motion.div
                key="tab-inventario"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Form to Create New MenuItem */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <PlusCircle className="w-4 h-4 text-amber-500" />
                    Añadir Nuevo Artículo al Inventario / Menú
                  </h3>
                  <form onSubmit={handleAddMenuItem} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nombre del Platillo/Bebida</label>
                      <input
                        type="text"
                        placeholder="Ej. Lasagna Bolognesa Especial"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 underline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Precio ($ USD)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="12.50"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Categoría</label>
                      <select
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value as any)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="Comida">Comida (Plato fuerte)</option>
                        <option value="Bebida">Bebida</option>
                        <option value="Postre">Postre</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        Agregar Item
                      </button>
                    </div>
                  </form>
                </div>

                {/* Inventory Table List */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white">Catálogo de Platillos e Inventario Activo</h3>
                    <span className="text-xs text-slate-400 font-mono">Stock Crítico &lt; Min</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menu.map((it) => {
                      const isLowStock = it.stock <= it.minStock;
                      return (
                        <div key={it.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${it.category === 'Comida' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : it.category === 'Bebida' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}`}>
                                {it.category}
                              </span>
                              <h4 className="text-white font-bold text-sm tracking-wide mt-2">{it.name}</h4>
                              <p className="text-amber-400 font-mono text-xs font-semibold mt-1">${it.price.toFixed(2)}</p>
                            </div>
                            <button
                              id={`del_item_${it.id}`}
                              onClick={() => handleDeleteMenuItem(it.id)}
                              className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="border-t border-slate-850 pt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-mono font-bold ${isLowStock ? 'text-red-400' : 'text-emerald-400'}`}>
                                Stock: {it.stock} uds
                              </span>
                              {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateStock(it.id, it.stock - 5)}
                                className="w-6 h-6 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 flex items-center justify-center text-xs border border-slate-800 font-bold"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleUpdateStock(it.id, it.stock + 5)}
                                className="w-6 h-6 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 flex items-center justify-center text-xs border border-slate-800 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: PERSONAL (STAFF CHEFS WAITERS MANAGERS) */}
            {activeTab === 'personal' && (
              <motion.div
                key="tab-personal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Form to Create New Personnel */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <UserPlus className="w-4 h-4 text-emerald-500" />
                    Registrar Nuevo Empleado / Credenciales
                  </h3>
                  <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        placeholder="Ej. Lucía del Valle"
                        value={empName}
                        onChange={(e) => setEmpName(e.target.value)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Rol Operativo</label>
                      <select
                        value={empRole}
                        onChange={(e) => setEmpRole(e.target.value as Role)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Mesero">Mesero (POS Frontend)</option>
                        <option value="Chef">Chef (Cocina Simuladora)</option>
                        <option value="Admin">Administrador (Control Total)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">PIN numérico (4 dígitos)</label>
                      <input
                        type="password"
                        placeholder="4040"
                        maxLength={4}
                        value={empPin}
                        onChange={(e) => setEmpPin(e.target.value)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 font-mono tracking-widest focus:outline-none"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        Crear Cuenta Mesero/Chef
                      </button>
                    </div>
                  </form>

                  {/* Avatar gradients select */}
                  <div className="pt-4 flex items-center gap-3">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Avatar Color:</span>
                    <div className="flex items-center gap-2">
                      {avatarGradients.map((grad, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedAvatarGrad(grad)}
                          className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} border transition-all ${selectedAvatarGrad === grad ? 'scale-125 border-white ring-2 ring-emerald-500/40' : 'border-transparent'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Personnel Cards List */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Personal Activo en el Sistema</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((usr) => {
                      const initials = usr.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                      return (
                        <div key={usr.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${usr.avatarColor} flex items-center justify-center text-white text-xs font-bold leading-none`}>
                              {initials}
                            </div>
                            <div>
                              <h4 className="text-white text-sm font-semibold">{usr.name}</h4>
                              <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${usr.role === 'Admin' ? 'bg-amber-400' : usr.role === 'Chef' ? 'bg-blue-400' : 'bg-cyan-400'}`}></span>
                                {usr.role}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              id={`toggle_status_${usr.id}`}
                              onClick={() => handleToggleUserStatus(usr.id)}
                              className={`px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition-colors ${usr.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-slate-800 text-slate-500'}`}
                            >
                              {usr.status === 'Active' ? 'ACTIVO' : 'PAUSADO'}
                            </button>

                            {usr.id !== 'usr-admin' && (
                              <button
                                id={`del_usr_${usr.id}`}
                                onClick={() => handleDeleteUser(usr.id)}
                                className="text-slate-500 hover:text-red-400 p-1 bg-transparent hover:bg-slate-800 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: SHIFTS & SCHEDULES */}
            {activeTab === 'horarios' && (
              <motion.div
                key="tab-horarios"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Add Shift Event */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    Asignar Horarios y Guardias Semanales
                  </h3>
                  <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Empleado</label>
                      <select
                        value={schEmployeeId}
                        onChange={(e) => setSchEmployeeId(e.target.value)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        required
                      >
                        <option value="">--Seleccionar--</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Día de Semana</label>
                      <select
                        value={schDay}
                        onChange={(e) => setSchDay(e.target.value as any)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                        <option value="Sábado">Sábado</option>
                        <option value="Domingo">Domingo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Turno (Grupo)</label>
                      <select
                        value={schShift}
                        onChange={(e) => setSchShift(e.target.value as any)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Mañana">Mañana (08:00 - 16:00)</option>
                        <option value="Tarde">Tarde (15:00 - 23:00)</option>
                        <option value="Noche">Noche (16:00 - 24:00)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Rango Horario</label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={schStartTime}
                          onChange={(e) => setSchStartTime(e.target.value)}
                          placeholder="08:00"
                          className="w-16 bg-[#0a101d] border border-slate-800 rounded-xl py-2 text-center text-xs text-white focus:outline-none"
                        />
                        <span className="text-slate-500 text-xs text-center">-</span>
                        <input
                          type="text"
                          value={schEndTime}
                          onChange={(e) => setSchEndTime(e.target.value)}
                          placeholder="16:00"
                          className="w-16 bg-[#0a101d] border border-slate-800 rounded-xl py-2 text-center text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={!schEmployeeId}
                        className="w-full bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        Crear Guardia
                      </button>
                    </div>
                  </form>
                </div>

                {/* Schedules Matrix table layout */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Cronograma Semanal de Turnos</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-400 font-mono">
                          <th className="py-2.5">DÍA</th>
                          <th>EMPLEADO</th>
                          <th>GRUPO TURNO</th>
                          <th>RANGO HORARIO</th>
                          <th className="text-right">ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map((sh) => (
                          <tr key={sh.id} className="border-b border-slate-850/40 text-slate-300 hover:bg-slate-900/10">
                            <td className="py-3 font-semibold text-white">{sh.day}</td>
                            <td className="font-medium text-slate-200">{sh.employeeName}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${sh.shift === 'Mañana' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : sh.shift === 'Tarde' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                                {sh.shift}
                              </span>
                            </td>
                            <td className="font-mono text-xs">{sh.startTime} - {sh.endTime}</td>
                            <td className="text-right">
                              <button
                                id={`del_sch_${sh.id}`}
                                onClick={() => handleDeleteSchedule(sh.id)}
                                className="text-slate-500 hover:text-red-400 p-1 hover:bg-red-500/15 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: CLIENTS CLUB REGISTRY */}
            {activeTab === 'clientes' && (
              <motion.div
                key="tab-clientes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Add client registry */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-slate-100" />
                    Registrar Nuevo Cliente / Membresía
                  </h3>
                  <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        placeholder="Ej. Sofía Herrera"
                        value={cliName}
                        onChange={(e) => setCliName(e.target.value)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Teléfono (Móvil)</label>
                      <input
                        type="text"
                        placeholder="555-0199"
                        value={cliPhone}
                        onChange={(e) => setCliPhone(e.target.value)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        Crear Ficha Cliente
                      </button>
                    </div>
                  </form>
                </div>

                {/* Clients logs table */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Ficheros de Clientes Registrados</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-400 font-mono">
                          <th className="py-2.5">CLIENTE</th>
                          <th>TELÉFONO</th>
                          <th>COMIDAS/VISITAS</th>
                          <th>VENTAS TOTALES</th>
                          <th className="text-right">ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clients.map((cl) => (
                          <tr key={cl.id} className="border-b border-slate-850/40 text-slate-300 hover:bg-slate-900/10">
                            <td className="py-3 font-semibold text-white">{cl.name}</td>
                            <td className="font-mono text-slate-400">{cl.phone || 'No registrado'}</td>
                            <td className="font-mono font-bold text-teal-400">{cl.visits} visitas</td>
                            <td className="font-mono font-bold text-white">${cl.totalSpent.toFixed(2)}</td>
                            <td className="text-right">
                              {cl.id !== 'cli-1' && (
                                <button
                                  id={`del_cli_${cl.id}`}
                                  onClick={() => handleDeleteClient(cl.id)}
                                  className="text-slate-500 hover:text-red-400 p-1 hover:bg-red-500/15 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: TABLES LAYOUT DESIGN (MESAS) */}
            {activeTab === 'mesas' && (
              <motion.div
                key="tab-mesas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Form to edit existing table when selected */}
                {editingTable && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-amber-950/20 border-2 border-amber-500/40 rounded-2xl p-5 shadow-xl relative backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-center mb-4 border-b border-amber-500/20 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Edit className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            Modificar Mesa: <span className="text-amber-400 font-mono font-black">{editingTable.label}</span>
                          </h3>
                          <p className="text-[11px] text-slate-400">Edita la identificación, capacidad o estado de esta mesa.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelEditTable}
                        className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Cancelar edición"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditTable} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-300 uppercase mb-1 font-bold">Identificación / Nombre</label>
                        <input
                          type="text"
                          value={editTableLabel}
                          onChange={(e) => setEditTableLabel(e.target.value)}
                          className="w-full bg-[#0a101d] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-bold"
                          placeholder="Ej. T-01 o Terraza 1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-300 uppercase mb-1 font-bold">Capacidad Máxima (Pax)</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={editTableCapacity}
                          onChange={(e) => setEditTableCapacity(e.target.value)}
                          className="w-full bg-[#0a101d] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-300 uppercase mb-1 font-bold">Estado de la Mesa</label>
                        <select
                          value={editTableStatus}
                          onChange={(e) => setEditTableStatus(e.target.value as TableStatus)}
                          className="w-full bg-[#0a101d] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        >
                          <option value="Libre">🟢 Libre (Disponible)</option>
                          <option value="Ocupada">🔴 Ocupada (En servicio)</option>
                          <option value="Reservada">🟡 Reservada</option>
                          <option value="Sucia">🟠 Sucia (Por limpiar)</option>
                        </select>
                      </div>

                      <div className="flex items-end gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Guardar Cambios
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditTable}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Form to add table configuration */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <Plus className="w-4 h-4 text-emerald-500" />
                    Diseñar e Incorporar Nuevas Mesas del Salón
                  </h3>
                  <form onSubmit={handleAddTable} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Mesa ID (Ej. 09 para T-09)</label>
                      <input
                        type="text"
                        placeholder="Ej. 09 o T-09"
                        value={tableLabel}
                        onChange={(e) => setTableLabel(e.target.value)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Capacidad Máxima (Pax)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="4"
                        value={tableCapacity}
                        onChange={(e) => setTableCapacity(e.target.value)}
                        className="w-full bg-[#0a101d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        Crear Mesa T-{tableLabel || 'X'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Mesas grid viewer with edit and delete options */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Croquis y Capacidad Física del Salón</h3>
                      <p className="text-[11px] text-slate-400">Total de mesas configuradas: <strong className="text-white">{tables.length}</strong></p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {tables.filter(t => t.status === 'Libre').length} Libres
                      </span>
                      <span className="flex items-center gap-1.5 text-red-400">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {tables.filter(t => t.status === 'Ocupada').length} Ocupadas
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        {tables.filter(t => t.status === 'Reservada').length} Reservadas
                      </span>
                      <span className="flex items-center gap-1.5 text-orange-400">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        {tables.filter(t => t.status === 'Sucia').length} Sucias
                      </span>
                    </div>
                  </div>

                  {tables.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No hay mesas registradas actualmente. Agrega una nueva mesa con el formulario superior.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {tables.map((t) => {
                        const isBeingEdited = editingTable?.id === t.id;
                        return (
                          <div
                            key={t.id}
                            className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all shadow-sm ${
                              isBeingEdited
                                ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-950/10'
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="text-[10px] font-mono font-bold text-slate-500 block">Identificación</span>
                                <span className="text-white font-extrabold text-base font-mono">{t.label}</span>
                              </div>

                              {/* Status Badge */}
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 border ${
                                  t.status === 'Libre'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : t.status === 'Ocupada'
                                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                    : t.status === 'Reservada'
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    t.status === 'Libre'
                                      ? 'bg-emerald-400'
                                      : t.status === 'Ocupada'
                                      ? 'bg-red-400'
                                      : t.status === 'Reservada'
                                      ? 'bg-amber-400'
                                      : 'bg-orange-400'
                                  }`}
                                />
                                {t.status}
                              </span>
                            </div>

                            <div className="text-xs text-slate-400 font-mono mb-4">
                              Capacidad: <span className="text-slate-200 font-bold">{t.capacity} Personas (Pax)</span>
                            </div>

                            {/* Action Buttons: Modificar y Eliminar */}
                            <div className="flex items-center gap-2 border-t border-slate-800/80 pt-3">
                              <button
                                type="button"
                                id={`edit_table_${t.id}`}
                                onClick={() => handleStartEditTable(t)}
                                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                                  isBeingEdited
                                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                                    : 'bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20'
                                }`}
                                title="Modificar mesa existente"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Modificar</span>
                              </button>

                              <button
                                type="button"
                                id={`del_table_${t.id}`}
                                onClick={() => handleDeleteTable(t.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 px-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all cursor-pointer"
                                title="Eliminar mesa permanentemente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
