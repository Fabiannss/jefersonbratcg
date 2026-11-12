import {
  AuctionStatus,
  CardCondition,
  ManausDeliveryMethod,
  OrderStatus,
  ProductCategory,
  RarityTier,
} from "@/types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formata valores em Real com separador de milhar: 1890 -> "R$ 1.890,00" */
export function formatBRL(value: number | undefined | null): string {
  return brl.format(Number.isFinite(value as number) ? (value as number) : 0);
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  SINGLE: "Carta Avulsa",
  ETB: "ETB Selada",
};

export const RARITY_LABELS: Record<RarityTier, string> = {
  BASICA: "Básica",
  MEDIA: "Média",
  RARA: "Rara",
};

export const CONDITION_LABELS: Record<CardCondition, string> = {
  NM: "Near Mint (NM)",
  LP: "Lightly Played (LP)",
  MP: "Moderately Played (MP)",
  HP: "Heavily Played (HP)",
  DAMAGED: "Danificada",
  SEALED: "Lacrado",
};

export const DELIVERY_LABELS: Record<ManausDeliveryMethod, string> = {
  MOTOBOY_MANAUS: "Motoboy Expresso Manaus",
  PONTO_ENCONTRO_MANAUS: "Ponto de Encontro em Manaus",
  RETIRADA_LOCAL_MANAUS: "Retirada Local em Manaus",
  CORREIOS_NACIONAL: "Correios (envio nacional)",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGO: "Pago (em separação)",
  AGUARDANDO_PONTO_ENCONTRO: "Aguardando ponto de encontro",
  EM_ROTA_MANAUS: "Saiu para entrega (motoboy)",
  POSTADO_CORREIOS: "Postado nos Correios",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

/** Classes de cor por status de pedido (badge) */
export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  AGUARDANDO_PAGAMENTO: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  PAGO: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  AGUARDANDO_PONTO_ENCONTRO: "bg-yellow-400/15 text-yellow-300 border-yellow-400/40",
  EM_ROTA_MANAUS: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  POSTADO_CORREIOS: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  ENTREGUE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  CANCELADO: "bg-slate-800 text-slate-400 border-slate-700",
};

export const AUCTION_STATUS_LABELS: Record<AuctionStatus, string> = {
  SCHEDULED: "Agendado",
  ACTIVE: "Ao vivo",
  ENDED: "Encerrado",
  CANCELLED: "Cancelado",
};

/** Link de conversa no WhatsApp a partir de um telefone brasileiro digitado livremente */
export function whatsappLink(rawPhone: string, message?: string): string | null {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountry = digits.startsWith("55") && digits.length > 11 ? digits : `55${digits}`;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${withCountry}${query}`;
}
