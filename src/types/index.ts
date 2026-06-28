export interface Party {
  id: string;
  name: string;
  phone: string;
  phone2?: string;
}

export interface Order {
  id: string;
  photos: string[]; // Array of Base64 image data URIs
  phone: string; // Can be a comma-separated list of numbers
  partyName?: string; // Optional name of the party the order was sent to
  status: 'pending' | 'delivered';
  timestamp: string; // ISO string
}
