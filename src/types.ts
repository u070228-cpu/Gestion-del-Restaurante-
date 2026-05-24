/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'Admin' | 'Chef' | 'Mesero';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatarColor: string;
  pinCode: string;
  status: 'Active' | 'Inactive';
}

export type TableStatus = 'Libre' | 'Ocupada' | 'Reservada' | 'Sucia';

export interface Table {
  id: string;
  label: string;
  capacity: number;
  status: TableStatus;
  currentWaiterId?: string;
  currentWaiterName?: string;
  activeSeconds?: number;
  totalCost?: number;
  currentOrderId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'Comida' | 'Bebida' | 'Postre';
  stock: number;
  minStock: number;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  visits: number;
  totalSpent: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  tableId: string;
  waiterId: string;
  waiterName: string;
  chefId?: string;
  chefName?: string;
  items: OrderItem[];
  notes?: string;
  status: 'Pendiente' | 'Ordenado' | 'En Cocina' | 'Preparado' | 'Entregado' | 'Cobrado';
  subtotal: number;
  tipPercentage: number;
  discountAmount: number;
  total: number;
  paymentMethod?: 'Tarjeta' | 'Efectivo' | 'Transferencia' | 'Pago Móvil' | 'Tarjeta de Crédito' | 'Tarjeta de Débito' | 'SINPE Móvil' | 'Cortesía' | 'Criptomonedas';
  timestamp: string;
  invoiceId?: string;
}

export interface Schedule {
  id: string;
  employeeId: string;
  employeeName: string;
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  startTime: string;
  endTime: string;
  shift: 'Mañana' | 'Tarde' | 'Noche';
}
