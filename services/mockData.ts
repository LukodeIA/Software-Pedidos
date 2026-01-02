import { Product, Order } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with cheddar, lettuce, tomato, and house sauce.',
    price: 12.99,
    category: 'Burgers',
    active: true,
    image_url: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: '2',
    name: 'Truffle Fries',
    description: 'Crispy fries tossed with truffle oil and parmesan.',
    price: 6.50,
    category: 'Sides',
    active: true,
    image_url: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: '3',
    name: 'Margherita Pizza',
    description: 'San Marzano tomato sauce, fresh mozzarella, basil.',
    price: 15.00,
    category: 'Pizza',
    active: true,
    image_url: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: '4',
    name: 'Caesar Salad',
    description: 'Romaine hearts, croutons, parmesan, caesar dressing.',
    price: 9.00,
    category: 'Salads',
    active: true,
    image_url: 'https://picsum.photos/400/300?random=4'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: '101',
    customer_name: 'Alice Johnson',
    customer_phone: '555-0101',
    address: '123 Main St, Apt 4B',
    items: [{ ...MOCK_PRODUCTS[0], quantity: 2 }, { ...MOCK_PRODUCTS[1], quantity: 1 }],
    total: 32.48,
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 mins ago
  },
  {
    id: '102',
    customer_name: 'Bob Smith',
    customer_phone: '555-0102',
    address: '456 Oak Ave',
    items: [{ ...MOCK_PRODUCTS[2], quantity: 1 }],
    total: 15.00,
    status: 'preparing',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString() // 25 mins ago
  }
];