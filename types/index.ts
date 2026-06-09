// ============================================
// GRIDO SAN RAFAEL - Tipos TypeScript
// ============================================

// ─── ENUMS ──────────────────────────────────
export type Role = "ADMIN" | "EMPLEADO";

export type OrderStatus =
  | "CREADO"
  | "ESPERANDO_PAGO"
  | "PAGADO"
  | "PREPARANDO"
  | "LISTO"
  | "ENTREGADO"
  | "CANCELADO";

export type DeliveryType = "DELIVERY" | "RETIRO";

export type PaymentMethod = "MERCADO_PAGO" | "TRANSFERENCIA" | "EFECTIVO";

export type PaymentStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "CANCELADO";

// ─── MODELOS ────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
  active: boolean;
  _count?: { products: number };
}

export interface Flavor {
  id: string;
  name: string;
  available: boolean;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  maxFlavors: number;
  active: boolean;
  featured: boolean;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemFlavor {
  id: string;
  flavorId: string;
  flavor: Flavor;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  flavors: OrderItemFlavor[];
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  amount: number;
  transferAlias?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  address?: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  deliveryCost: number;
  total: number;
  notes?: string;
  items: OrderItem[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

// ─── CARRITO ────────────────────────────────
export interface CartFlavor {
  id: string;
  name: string;
}

export interface CartItem {
  cartId: string; // uuid para el carrito (el mismo producto puede aparecer 2 veces con distintos sabores)
  product: Product;
  quantity: number;
  selectedFlavors: CartFlavor[];
}

// ─── CHECKOUT FORM ──────────────────────────
export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  address?: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  notes?: string;
  cashAmount?: string; // Con cuánto paga (efectivo) para calcular vuelto
}

// ─── SETTINGS ───────────────────────────────
export interface AppSettings {
  deliveryCost: number;
  minOrderAmount: number;
  whatsappNumber: string;
  transferAlias: string;
  transferCbu: string;
  storeOpen: boolean;
  storeClosedMessage: string;
}

// ─── API RESPONSES ──────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── ETIQUETAS DE UI ─────────────────────────
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CREADO: "Creado",
  ESPERANDO_PAGO: "Esperando Pago",
  PAGADO: "Pagado",
  PREPARANDO: "Preparando",
  LISTO: "Listo para entrega",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  CREADO: "bg-gray-100 text-gray-700",
  ESPERANDO_PAGO: "bg-yellow-100 text-yellow-700",
  PAGADO: "bg-green-100 text-green-700",
  PREPARANDO: "bg-blue-100 text-blue-700",
  LISTO: "bg-purple-100 text-purple-700",
  ENTREGADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  MERCADO_PAGO: "Mercado Pago",
  TRANSFERENCIA: "Transferencia",
  EFECTIVO: "Efectivo",
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  DELIVERY: "Delivery",
  RETIRO: "Retiro en sucursal",
};
