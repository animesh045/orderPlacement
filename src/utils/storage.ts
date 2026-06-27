import type { Order, Distributor, Comment } from '../types';
import { MOCK_ORDERS, MOCK_DISTRIBUTORS } from './mockData';

const ORDERS_KEY = 'order_placement_orders';
const DISTRIBUTORS_KEY = 'order_placement_distributors';

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

export const getDistributors = (): Distributor[] => {
  const data = localStorage.getItem(DISTRIBUTORS_KEY);
  if (!data) {
    localStorage.setItem(DISTRIBUTORS_KEY, JSON.stringify(MOCK_DISTRIBUTORS));
    return MOCK_DISTRIBUTORS;
  }
  return JSON.parse(data);
};

export const saveDistributors = (distributors: Distributor[]): void => {
  localStorage.setItem(DISTRIBUTORS_KEY, JSON.stringify(distributors));
};

export const addOrder = (order: Order): void => {
  const orders = getOrders();
  orders.unshift(order); // Add to the top of list
  saveOrders(orders);
};

export const updateOrderStatus = (
  orderId: string,
  status: Order['status'],
  newCommentText?: string,
  authorRole: 'retailer' | 'distributor' = 'distributor',
  authorName: string = 'Distributor'
): Order[] => {
  const orders = getOrders();
  const updatedOrders = orders.map((order) => {
    if (order.id === orderId) {
      const updatedComments = [...order.comments];
      
      // If a comment was added or if the status changed, add comment
      if (newCommentText) {
        const comment: Comment = {
          id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          author: authorRole,
          authorName: authorName,
          message: newCommentText,
          timestamp: new Date().toISOString(),
        };
        updatedComments.push(comment);
      } else {
        // Just log status transition comment
        const comment: Comment = {
          id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          author: authorRole,
          authorName: authorName,
          message: `Status updated to ${status.toUpperCase()}`,
          timestamp: new Date().toISOString(),
        };
        updatedComments.push(comment);
      }

      return {
        ...order,
        status,
        comments: updatedComments,
      };
    }
    return order;
  });
  
  saveOrders(updatedOrders);
  return updatedOrders;
};

export const addOrderComment = (
  orderId: string,
  author: 'retailer' | 'distributor',
  authorName: string,
  message: string
): Order[] => {
  const orders = getOrders();
  const updatedOrders = orders.map((order) => {
    if (order.id === orderId) {
      const comment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        author,
        authorName,
        message,
        timestamp: new Date().toISOString(),
      };
      return {
        ...order,
        comments: [...order.comments, comment],
      };
    }
    return order;
  });
  
  saveOrders(updatedOrders);
  return updatedOrders;
};
