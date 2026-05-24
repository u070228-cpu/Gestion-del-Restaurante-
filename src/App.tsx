/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Table, MenuItem, Client, Order, Schedule } from './types';
import {
  INITIAL_USERS,
  INITIAL_TABLES,
  INITIAL_MENU,
  INITIAL_CLIENTS,
  INITIAL_ORDERS,
  INITIAL_HISTORY,
  INITIAL_SCHEDULES
} from './data/initialData';
import AccessControl from './components/AccessControl';
import KitchenSimulator from './components/KitchenSimulator';
import WaiterPOS from './components/WaiterPOS';
import AdminDashboard from './components/AdminDashboard';
import { ShieldCheck, ArrowLeftRight, Settings, Eye } from 'lucide-react';

export default function App() {
  // Core System States
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Active Kitchen simulation state
  const [cookingOrder, setCookingOrder] = useState<Order | null>(null);

  // Administrative mode toggle (admins can switch between Admin panel and Waiter/POS terminal)
  const [isAdminTerminalMode, setIsAdminTerminalMode] = useState<boolean>(false);

  // 1. Load data from LocalStorage on mount
  useEffect(() => {
    const localUsers = localStorage.getItem('gastro_users');
    const localTables = localStorage.getItem('gastro_tables');
    const localMenu = localStorage.getItem('gastro_menu');
    const localClients = localStorage.getItem('gastro_clients');
    const localOrders = localStorage.getItem('gastro_orders');
    const localHistory = localStorage.getItem('gastro_history');
    const localSchedules = localStorage.getItem('gastro_schedules');
    const localSession = localStorage.getItem('gastro_current_session');

    if (localUsers) {
      setUsers(JSON.parse(localUsers));
      setTables(JSON.parse(localTables || '[]'));
      setMenu(JSON.parse(localMenu || '[]'));
      setClients(JSON.parse(localClients || '[]'));
      setOrders(JSON.parse(localOrders || '[]'));
      setHistory(JSON.parse(localHistory || '[]'));
      setSchedules(JSON.parse(localSchedules || '[]'));
    } else {
      // Seed initial data on very first boot
      localStorage.setItem('gastro_users', JSON.stringify(INITIAL_USERS));
      localStorage.setItem('gastro_tables', JSON.stringify(INITIAL_TABLES));
      localStorage.setItem('gastro_menu', JSON.stringify(INITIAL_MENU));
      localStorage.setItem('gastro_clients', JSON.stringify(INITIAL_CLIENTS));
      localStorage.setItem('gastro_orders', JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem('gastro_history', JSON.stringify(INITIAL_HISTORY));
      localStorage.setItem('gastro_schedules', JSON.stringify(INITIAL_SCHEDULES));

      setUsers(INITIAL_USERS);
      setTables(INITIAL_TABLES);
      setMenu(INITIAL_MENU);
      setClients(INITIAL_CLIENTS);
      setOrders(INITIAL_ORDERS);
      setHistory(INITIAL_HISTORY);
      setSchedules(INITIAL_SCHEDULES);
    }

    if (localSession) {
      setCurrentUser(JSON.parse(localSession));
    }
  }, []);

  // Sync methods that trigger both state and LocalStorage updates
  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('gastro_users', JSON.stringify(newUsers));
  };

  const handleUpdateTables = (newTables: Table[]) => {
    setTables(newTables);
    localStorage.setItem('gastro_tables', JSON.stringify(newTables));
  };

  const handleUpdateMenu = (newMenu: MenuItem[]) => {
    setMenu(newMenu);
    localStorage.setItem('gastro_menu', JSON.stringify(newMenu));
  };

  const handleUpdateClients = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem('gastro_clients', JSON.stringify(newClients));
  };

  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('gastro_orders', JSON.stringify(newOrders));
  };

  const handleUpdateHistory = (newHistory: Order[]) => {
    setHistory(newHistory);
    localStorage.setItem('gastro_history', JSON.stringify(newHistory));
  };

  const handleUpdateSchedules = (newSchedules: Schedule[]) => {
    setSchedules(newSchedules);
    localStorage.setItem('gastro_schedules', JSON.stringify(newSchedules));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('gastro_current_session', JSON.stringify(user));
    // Default administrators to Administrative dashboard layout first
    if (user.role === 'Admin') {
      setIsAdminTerminalMode(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gastro_current_session');
    setIsAdminTerminalMode(false);
  };

  // Kitchen Simulation dispatcher
  const handleTriggerKitchenSimulator = (order: Order) => {
    setCookingOrder(order);
  };

  const handleCompleteCooking = (orderId: string, chefId: string, chefName: string) => {
    // 1. Update order status to "Entregado"
    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        return { ...ord, status: 'Entregado', chefId, chefName } as Order;
      }
      return ord;
    });
    handleUpdateOrders(updatedOrders);

    // 2. Adjust Menu inventory stocks levels
    const cooking = orders.find(o => o.id === orderId);
    if (cooking) {
      const updatedMenu = menu.map((mi) => {
        const itemOrdered = cooking.items.find(it => it.menuItemId === mi.id);
        if (itemOrdered) {
          return { ...mi, stock: Math.max(0, mi.stock - itemOrdered.quantity) };
        }
        return mi;
      });
      handleUpdateMenu(updatedMenu);
    }

    // 3. Clear simulation modal overlay
    setCookingOrder(null);
  };

  return (
    <div id="app_routing_node" className="min-h-screen bg-[#070b19]">
      
      {/* 1. Gatekeeper User Session */}
      {!currentUser ? (
        <AccessControl users={users} onLogin={handleLogin} />
      ) : (
        <div id="authenticated_session_wrapper" className="min-h-screen flex flex-col relative">
          
          {/* Admin Role System Toggle Toolbar */}
          {currentUser.role === 'Admin' && (
            <div id="admin_control_rail" className="bg-[#1e1b4b] border-b border-indigo-900 px-6 py-2.5 flex items-center justify-between text-xs font-mono relative z-30 shadow-md">
              <div className="flex items-center gap-1.5 text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Nivel: <strong>SUPERUSUARIO (ADMIN)</strong></span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Panel Activo:</span>
                <span className="text-white font-bold bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-805 text-[10px]">
                  {isAdminTerminalMode ? 'TÉRM. VENDEDOR / POS' : 'DASHBOARD ADMINISTRADOR'}
                </span>
                
                <button
                  id="admin_mode_toggle_btn"
                  onClick={() => setIsAdminTerminalMode(!isAdminTerminalMode)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded-lg border border-indigo-500 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>{isAdminTerminalMode ? 'Ver Panel Administrador' : 'Probar Vista de Mesero'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Page Router Decider */}
          {currentUser.role === 'Admin' && !isAdminTerminalMode ? (
            <AdminDashboard
              currentUser={currentUser}
              users={users}
              tables={tables}
              menu={menu}
              clients={clients}
              history={history}
              schedules={schedules}
              onLogout={handleLogout}
              onUpdateUsers={handleUpdateUsers}
              onUpdateMenu={handleUpdateMenu}
              onUpdateClients={handleUpdateClients}
              onUpdateSchedules={handleUpdateSchedules}
              onUpdateTables={handleUpdateTables}
            />
          ) : (
            <WaiterPOS
              currentUser={currentUser}
              users={users}
              tables={tables}
              menu={menu}
              clients={clients}
              orders={orders}
              history={history}
              onLogout={handleLogout}
              onUpdateTables={handleUpdateTables}
              onUpdateOrders={handleUpdateOrders}
              onUpdateHistory={handleUpdateHistory}
              onUpdateClients={handleUpdateClients}
              onTriggerKitchen={handleTriggerKitchenSimulator}
              onCompleteCooking={handleCompleteCooking}
            />
          )}

          {/* 3. Interactive Chefs cooking Simulator Overlay */}
          {cookingOrder && (
            <KitchenSimulator
              order={cookingOrder}
              chefs={users}
              onCompleteCooking={handleCompleteCooking}
              onClose={() => setCookingOrder(null)}
            />
          )}

        </div>
      )}

    </div>
  );
}
