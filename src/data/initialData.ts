/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Table, MenuItem, Client, Order, Schedule } from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'usr-admin', name: 'Administrador Principal', role: 'Admin', avatarColor: 'from-amber-500 to-orange-600', pinCode: '1234', status: 'Active' },
  { id: 'usr-chef1', name: 'Chef Roberto Russo', role: 'Chef', avatarColor: 'from-blue-500 to-indigo-600', pinCode: '2020', status: 'Active' },
  { id: 'usr-chef2', name: 'Chef Lucía Méndez', role: 'Chef', avatarColor: 'from-pink-500 to-rose-600', pinCode: '3030', status: 'Active' },
  { id: 'usr-waiter1', name: 'Ana Martínez', role: 'Mesero', avatarColor: 'from-cyan-500 to-teal-600', pinCode: '4040', status: 'Active' },
  { id: 'usr-waiter2', name: 'Carlos Gómez', role: 'Mesero', avatarColor: 'from-emerald-500 to-green-600', pinCode: '5050', status: 'Active' },
  { id: 'usr-waiter3', name: 'Diego Torres', role: 'Mesero', avatarColor: 'from-violet-500 to-purple-600', pinCode: '6060', status: 'Active' }
];

export const INITIAL_TABLES: Table[] = [
  { id: 'T-01', label: 'T-01', capacity: 2, status: 'Ocupada', currentWaiterId: 'usr-waiter1', currentWaiterName: 'Ana Martínez', activeSeconds: 2400, totalCost: 32.00, currentOrderId: 'ord-init-1' },
  { id: 'T-02', label: 'T-02', capacity: 4, status: 'Libre' },
  { id: 'T-03', label: 'T-03', capacity: 4, status: 'Ocupada', currentWaiterId: 'usr-waiter2', currentWaiterName: 'Carlos Gómez', activeSeconds: 1200, totalCost: 24.00, currentOrderId: 'ord-init-2' },
  { id: 'T-04', label: 'T-04', capacity: 6, status: 'Reservada' },
  { id: 'T-05', label: 'T-05', capacity: 2, status: 'Libre' },
  { id: 'T-06', label: 'T-06', capacity: 8, status: 'Ocupada', currentWaiterId: 'usr-waiter3', currentWaiterName: 'Diego Torres', activeSeconds: 3600, totalCost: 86.50, currentOrderId: 'ord-init-3' },
  { id: 'T-07', label: 'T-07', capacity: 4, status: 'Sucia' },
  { id: 'T-08', label: 'T-08', capacity: 4, status: 'Libre' }
];

export const INITIAL_MENU: MenuItem[] = [
  { id: 'item-1', name: 'Hamburguesa Clásica con Papas', price: 12.50, category: 'Comida', stock: 45, minStock: 10 },
  { id: 'item-2', name: 'Pizza Margherita Grande', price: 14.00, category: 'Comida', stock: 30, minStock: 8 },
  { id: 'item-3', name: 'Fettuccine Alfredo con Pollo', price: 15.50, category: 'Comida', stock: 25, minStock: 5 },
  { id: 'item-4', name: 'Tacos Al Pastor (x3)', price: 9.00, category: 'Comida', stock: 60, minStock: 15 },
  { id: 'item-5', name: 'Ensalada César', price: 10.00, category: 'Comida', stock: 40, minStock: 8 },
  { id: 'item-6', name: 'Limonada de Hierbabuena (400ml)', price: 3.50, category: 'Bebida', stock: 100, minStock: 20 },
  { id: 'item-7', name: 'Cerveza Artesanal IPA', price: 5.00, category: 'Bebida', stock: 80, minStock: 15 },
  { id: 'item-8', name: 'Refresco Coca-Cola', price: 2.50, category: 'Bebida', stock: 120, minStock: 30 },
  { id: 'item-9', name: 'Copa de Vino Tinto', price: 6.50, category: 'Bebida', stock: 24, minStock: 6 },
  { id: 'item-10', name: 'Volcán de Chocolate', price: 6.50, category: 'Postre', stock: 18, minStock: 4 },
  { id: 'item-11', name: 'Cheesecake de Frutos Rojos', price: 7.00, category: 'Postre', stock: 20, minStock: 5 }
];

export const INITIAL_CLIENTS: Client[] = [
  { id: 'cli-1', name: 'Consumidor Final', phone: '', email: '', visits: 120, totalSpent: 2450.00 },
  { id: 'cli-2', name: 'Sofia Herrera', phone: '555-0199', email: 'sofia.herrera@email.com', visits: 12, totalSpent: 350.50 },
  { id: 'cli-3', name: 'Alejandro Domínguez', phone: '555-0123', email: 'alejandro.dom@email.com', visits: 8, totalSpent: 185.00 },
  { id: 'cli-4', name: 'Isabel Benítez', phone: '555-0145', email: 'isabel.b@email.com', visits: 4, totalSpent: 92.50 }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-init-1',
    tableId: 'T-01',
    waiterId: 'usr-waiter1',
    waiterName: 'Ana Martínez',
    chefId: 'usr-chef2',
    chefName: 'Chef Lucía Méndez',
    items: [
      { menuItemId: 'item-1', name: 'Hamburguesa Clásica con Papas', price: 12.50, quantity: 2 },
      { menuItemId: 'item-6', name: 'Limonada de Hierbabuena (400ml)', price: 3.50, quantity: 2 }
    ],
    notes: 'Hamburguesas término medio.',
    status: 'Entregado',
    subtotal: 32.00,
    tipPercentage: 0,
    discountAmount: 0,
    total: 32.00,
    timestamp: '2026-05-24T15:30:00Z'
  },
  {
    id: 'ord-init-2',
    tableId: 'T-03',
    waiterId: 'usr-waiter2',
    waiterName: 'Carlos Gómez',
    chefId: 'usr-chef1',
    chefName: 'Chef Roberto Russo',
    items: [
      { menuItemId: 'item-5', name: 'Ensalada César', price: 10.00, quantity: 1 },
      { menuItemId: 'item-11', name: 'Cheesecake de Frutos Rojos', price: 7.00, quantity: 2 }
    ],
    notes: 'Aderezo de ensalada por separado.',
    status: 'En Cocina',
    subtotal: 24.00,
    tipPercentage: 0,
    discountAmount: 0,
    total: 24.00,
    timestamp: '2026-05-24T16:10:00Z'
  },
  {
    id: 'ord-init-3',
    tableId: 'T-06',
    waiterId: 'usr-waiter3',
    waiterName: 'Diego Torres',
    chefId: 'usr-chef1',
    chefName: 'Chef Roberto Russo',
    items: [
      { menuItemId: 'item-2', name: 'Pizza Margherita Grande', price: 14.00, quantity: 3 },
      { menuItemId: 'item-7', name: 'Cerveza Artesanal IPA', price: 5.00, quantity: 6 },
      { menuItemId: 'item-10', name: 'Volcán de Chocolate', price: 6.50, quantity: 2 }
    ],
    notes: 'Traer las cervezas primero.',
    status: 'Ordenado',
    subtotal: 85.00,
    tipPercentage: 0,
    discountAmount: 0,
    total: 86.50, // Including extra orders or slight diff
    timestamp: '2026-05-24T16:00:00Z'
  }
];

export const INITIAL_HISTORY: Order[] = [
  {
    id: 'ord-hist-1',
    tableId: 'T-02',
    waiterId: 'usr-waiter2',
    waiterName: 'Carlos Gómez',
    chefId: 'usr-chef1',
    chefName: 'Chef Roberto Russo',
    items: [
      { menuItemId: 'item-1', name: 'Hamburguesa Clásica con Papas', price: 12.50, quantity: 2 },
      { menuItemId: 'item-8', name: 'Refresco Coca-Cola', price: 2.50, quantity: 2 }
    ],
    status: 'Cobrado',
    subtotal: 30.00,
    tipPercentage: 10,
    discountAmount: 0,
    total: 33.00,
    paymentMethod: 'Tarjeta',
    invoiceId: 'sal-201',
    timestamp: '2026-05-24T14:15:00Z'
  },
  {
    id: 'ord-hist-2',
    tableId: 'T-05',
    waiterId: 'usr-waiter1',
    waiterName: 'Ana Martínez',
    chefId: 'usr-chef2',
    chefName: 'Chef Lucía Méndez',
    items: [
      { menuItemId: 'item-3', name: 'Fettuccine Alfredo con Pollo', price: 15.50, quantity: 2 },
      { menuItemId: 'item-9', name: 'Copa de Vino Tinto', price: 6.50, quantity: 2 }
    ],
    status: 'Cobrado',
    subtotal: 44.00,
    tipPercentage: 15,
    discountAmount: 5.00,
    total: 45.60,
    paymentMethod: 'Efectivo',
    invoiceId: 'sal-202',
    timestamp: '2026-05-24T14:35:00Z'
  },
  {
    id: 'ord-hist-3',
    tableId: 'T-04',
    waiterId: 'usr-waiter3',
    waiterName: 'Diego Torres',
    chefId: 'usr-chef1',
    chefName: 'Chef Roberto Russo',
    items: [
      { menuItemId: 'item-4', name: 'Tacos Al Pastor (x3)', price: 9.00, quantity: 3 },
      { menuItemId: 'item-6', name: 'Limonada de Hierbabuena (400ml)', price: 3.50, quantity: 3 }
    ],
    status: 'Cobrado',
    subtotal: 37.50,
    tipPercentage: 20,
    discountAmount: 0,
    total: 45.00,
    paymentMethod: 'Transferencia',
    invoiceId: 'sal-203',
    timestamp: '2026-05-24T15:00:00Z'
  },
  {
    id: 'ord-hist-4',
    tableId: 'T-01',
    waiterId: 'usr-waiter2',
    waiterName: 'Carlos Gómez',
    chefId: 'usr-chef2',
    chefName: 'Chef Lucía Méndez',
    items: [
      { menuItemId: 'item-2', name: 'Pizza Margherita Grande', price: 14.00, quantity: 1 },
      { menuItemId: 'item-10', name: 'Volcán de Chocolate', price: 6.50, quantity: 1 }
    ],
    status: 'Cobrado',
    subtotal: 20.50,
    tipPercentage: 0,
    discountAmount: 6.05,
    total: 14.45,
    paymentMethod: 'Pago Móvil',
    invoiceId: 'sal-204',
    timestamp: '2026-05-24T15:20:00Z'
  }
];

export const INITIAL_SCHEDULES: Schedule[] = [
  { id: 'sch-1', employeeId: 'usr-waiter1', employeeName: 'Ana Martínez', day: 'Lunes', startTime: '08:00', endTime: '16:00', shift: 'Mañana' },
  { id: 'sch-2', employeeId: 'usr-waiter1', employeeName: 'Ana Martínez', day: 'Miércoles', startTime: '08:00', endTime: '16:00', shift: 'Mañana' },
  { id: 'sch-3', employeeId: 'usr-waiter2', employeeName: 'Carlos Gómez', day: 'Martes', startTime: '15:00', endTime: '23:00', shift: 'Tarde' },
  { id: 'sch-4', employeeId: 'usr-waiter2', employeeName: 'Carlos Gómez', day: 'Jueves', startTime: '15:00', endTime: '23:00', shift: 'Tarde' },
  { id: 'sch-5', employeeId: 'usr-waiter3', employeeName: 'Diego Torres', day: 'Viernes', startTime: '16:00', endTime: '24:00', shift: 'Noche' },
  { id: 'sch-6', employeeId: 'usr-waiter3', employeeName: 'Diego Torres', day: 'Sábado', startTime: '16:00', endTime: '24:00', shift: 'Noche' },
  { id: 'sch-7', employeeId: 'usr-chef1', employeeName: 'Chef Roberto Russo', day: 'Jueves', startTime: '12:00', endTime: '20:00', shift: 'Tarde' },
  { id: 'sch-8', employeeId: 'usr-chef1', employeeName: 'Chef Roberto Russo', day: 'Viernes', startTime: '12:00', endTime: '20:00', shift: 'Tarde' },
  { id: 'sch-9', employeeId: 'usr-chef1', employeeName: 'Chef Roberto Russo', day: 'Sábado', startTime: '12:00', endTime: '20:00', shift: 'Tarde' },
  { id: 'sch-10', employeeId: 'usr-chef2', employeeName: 'Chef Lucía Méndez', day: 'Lunes', startTime: '08:00', endTime: '16:00', shift: 'Mañana' },
  { id: 'sch-11', employeeId: 'usr-chef2', employeeName: 'Chef Lucía Méndez', day: 'Martes', startTime: '08:00', endTime: '16:00', shift: 'Mañana' }
];
