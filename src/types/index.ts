export interface Distributor {
  id: string;
  name: string;
  avatar: string;
  description: string;
  phone: string;
  email: string;
  rating: number;
  tags: string[]; // e.g., ["Medical", "Bulk Goods", "Groceries"]
}

export interface Comment {
  id: string;
  author: 'retailer' | 'distributor';
  authorName: string;
  message: string;
  timestamp: string; // ISO String
}

export interface Order {
  id: string;
  photoData: string; // Base64 data URI
  distributorId: string;
  notes: string;
  priority: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: string; // ISO String
  comments: Comment[];
}
