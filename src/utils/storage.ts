import type { Order } from '../types';
import { MOCK_ORDERS } from './mockData';

const ORDERS_KEY = 'ananya_order_placement_orders';

export const getOrders = (): Order[] => {
  const data = localStorage.getItem(ORDERS_KEY);
  if (!data) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(MOCK_ORDERS));
    return MOCK_ORDERS;
  }
  return JSON.parse(data);
};

export const saveOrders = (orders: Order[]): void => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const addOrder = (order: Order): void => {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
};

export const toggleOrderStatus = (orderId: string): Order[] => {
  const orders = getOrders();
  const updatedOrders = orders.map((order) => {
    if (order.id === orderId) {
      const nextStatus: Order['status'] = order.status === 'delivered' ? 'pending' : 'delivered';
      return {
        ...order,
        status: nextStatus
      };
    }
    return order;
  });
  saveOrders(updatedOrders);
  return updatedOrders;
};

export const deleteOrder = (orderId: string): Order[] => {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== orderId);
  saveOrders(filtered);
  return filtered;
};

// --- PARTY STORAGE HELPERS ---
import type { Party } from '../types';

const PARTIES_KEY = 'ananya_order_placement_parties';

const DEFAULT_PARTIES: Party[] = [
  { id: '1', name: 'Apex Logistics', phone: '919876543210', phone2: '' },
  { id: '2', name: 'SwiftCare Pharma', phone: '918888888888', phone2: '' },
  { id: '3', name: 'Metro Foods', phone: '917777777777', phone2: '' }
];

export const getParties = (): Party[] => {
  const data = localStorage.getItem(PARTIES_KEY);
  if (!data) {
    localStorage.setItem(PARTIES_KEY, JSON.stringify(DEFAULT_PARTIES));
    return DEFAULT_PARTIES;
  }
  return JSON.parse(data);
};

export const saveParties = (parties: Party[]): void => {
  localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
};

export const addParty = (party: Party): void => {
  const parties = getParties();
  parties.push(party);
  saveParties(parties);
};

export const updateParty = (updatedParty: Party): void => {
  const parties = getParties();
  const updated = parties.map(p => p.id === updatedParty.id ? updatedParty : p);
  saveParties(updated);
};

export const deleteParty = (partyId: string): void => {
  const parties = getParties();
  const filtered = parties.filter(p => p.id !== partyId);
  saveParties(filtered);
};

