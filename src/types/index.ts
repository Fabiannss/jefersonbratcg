/**
 * JEFERSONBRATCG - Tipagens centrais do domínio (100% Pokémon TCG)
 */

export type ProductCategory = "SINGLE" | "ETB";

/**
 * Filtro de Raridade em 3 níveis claros:
 * - BASICA: Comuns, Incomuns, Raras simples
 * - MEDIA: Holo, Reverse Holo, Ultra Raras regulares (ex, V, VSTAR regulares)
 * - RARA: Secretas, Ilustrações Especiais (SIR), Alt Arts, Hyper Rare (Gold)
 */
export type RarityTier = "BASICA" | "MEDIA" | "RARA";

export type CardCondition = "NM" | "LP" | "MP" | "HP" | "DAMAGED" | "SEALED";

export type AuctionStatus = "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";

export type ManausDeliveryMethod =
  | "MOTOBOY_MANAUS"
  | "PONTO_ENCONTRO_MANAUS"
  | "RETIRADA_LOCAL_MANAUS"
  | "CORREIOS_NACIONAL";

export type OrderStatus =
  | "AGUARDANDO_PAGAMENTO"
  | "PAGO"
  | "EM_ROTA_MANAUS"
  | "AGUARDANDO_PONTO_ENCONTRO"
  | "POSTADO_CORREIOS"
  | "ENTREGUE"
  | "CANCELADO";

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  setName: string;
  cardNumber?: string;
  rarity: RarityTier;
  rarityDetail: string;
  condition: CardCondition;
  language: "PT-BR" | "EN" | "JP";
  price: number;
  originalPrice?: number;
  stock: number;
  description: string;
  images: string[];
  videoUrl?: string; // Vídeo curto de demonstração de holografia/estado da carta
  isPromo: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface AuctionBid {
  id: string;
  auctionId: string;
  userId?: string;
  bidderName: string;
  bidderNeighborhood: string;
  amount: number;
  createdAt: string;
}

export interface Auction {
  id: string;
  productId: string;
  product: Product;
  startingBid: number;
  currentBid: number;
  minIncrement: number;
  bidsCount: number;
  startsAt: string;
  endsAt: string;
  status: AuctionStatus;
  winnerName?: string;
  bids: AuctionBid[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerWhatsapp: string;
  cep: string;
  neighborhood: string;
  city: string;
  state: string;
  deliveryMethod: ManausDeliveryMethod;
  manausMeetingPoint?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  items: CartItem[];
  createdAt: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  neighborhood?: string;
}
