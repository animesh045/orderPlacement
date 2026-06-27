export interface Order {
  id: string;
  photos: string[]; // Array of Base64 image data URIs
  phone: string;
  status: 'pending' | 'delivered';
  timestamp: string; // ISO string
}
