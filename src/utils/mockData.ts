import type { Order } from '../types';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-101',
    photos: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%23f8fafc" font-family="sans-serif" font-size="14" font-weight="bold">Order Sheet %231</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="11">10x Wheat Flour, 5x Refined Oil</text></svg>'
    ],
    phone: '919876543210',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'ord-102',
    photos: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%23f8fafc" font-family="sans-serif" font-size="14" font-weight="bold">Order Sheet %232</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="11">Sugar 50kg, Basmati Rice 100kg</text></svg>'
    ],
    phone: '918888888888',
    status: 'pending',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];
