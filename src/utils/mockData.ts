import type { Distributor, Order } from '../types';

export const MOCK_DISTRIBUTORS: Distributor[] = [
  {
    id: 'dist-1',
    name: 'Apex Logistics',
    avatar: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=60',
    description: 'Fast, secure shipping for consumer packaged goods, bulk orders, and retail items. Nationwide network.',
    phone: '+1 (555) 019-2834',
    email: 'orders@apexlogistics.com',
    rating: 4.8,
    tags: ['Consumer Goods', 'Bulk Orders', 'Express']
  },
  {
    id: 'dist-2',
    name: 'SwiftCare Pharma',
    avatar: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=150&auto=format&fit=crop&q=60',
    description: 'Specialized healthcare, pharmaceutical, and medical equipment distributors. Temperature-controlled shipping.',
    phone: '+1 (555) 014-9982',
    email: 'delivery@swiftcarepharma.com',
    rating: 4.9,
    tags: ['Medical', 'Pharma', 'Cold Chain']
  },
  {
    id: 'dist-3',
    name: 'Metro Foods Hub',
    avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60',
    description: 'Daily fresh produce, dairy, frozen foods, and grocery essentials for local supermarkets and restaurants.',
    phone: '+1 (555) 017-4321',
    email: 'sales@metrofoodshub.com',
    rating: 4.7,
    tags: ['Groceries', 'Fresh Produce', 'Cold Storage']
  },
  {
    id: 'dist-4',
    name: 'Vertex Tech Suppliers',
    avatar: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=150&auto=format&fit=crop&q=60',
    description: 'B2B distributor of IT hardware, office electronics, computing accessories, and paper products.',
    phone: '+1 (555) 012-6547',
    email: 'b2b@vertextech.com',
    rating: 4.6,
    tags: ['Electronics', 'Office Supplies', 'Wholesale']
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-101',
    photoData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%23f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">Order Sheet %23A492</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="12">10x Wheat Bread, 5x Fresh Butter</text></svg>',
    distributorId: 'dist-3',
    notes: 'Please ensure butter is kept refrigerated during transit. Urgent delivery needed.',
    priority: 'high',
    status: 'processing',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    comments: [
      {
        id: 'c-1',
        author: 'retailer',
        authorName: 'Central Grocery Store',
        message: 'Order sheet uploaded. Please verify the brand preference for the butter.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'c-2',
        author: 'distributor',
        authorName: 'Metro Foods Hub',
        message: 'Received. We will dispatch the Organic Pasture brand as requested. Delivery scheduled for 5 PM.',
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString()
      }
    ]
  },
  {
    id: 'ord-102',
    photoData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%23f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">Medical Supply Slip</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="12">50x Sterile Syringes, 20x Saline Bags</text></svg>',
    distributorId: 'dist-2',
    notes: 'Standard replenishment order for the community clinic.',
    priority: 'normal',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    comments: [
      {
        id: 'c-3',
        author: 'retailer',
        authorName: 'Community Clinic',
        message: 'Order sheet attached.',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'c-4',
        author: 'distributor',
        authorName: 'SwiftCare Pharma',
        message: 'Order has been dispatched.',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString()
      },
      {
        id: 'c-5',
        author: 'distributor',
        authorName: 'SwiftCare Pharma',
        message: 'Delivered and signed by Dr. Harrison.',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    ]
  }
];
