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
