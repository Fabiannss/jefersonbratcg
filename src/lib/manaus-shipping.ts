import { ManausDeliveryMethod } from "@/types";

export interface ShippingOption {
  method: ManausDeliveryMethod;
  label: string;
  subtitle: string;
  price: number;
  eta: string;
  badge?: string;
}

export const MANAUS_MEETING_POINTS = [
  "Amazonas Shopping (Praça de Alimentação / Loja Geek)",
  "Manauara Shopping (Piso Tucumã - Entrada Principal)",
  "Shopping Ponta Negra (2º Piso - Café)",
  "Sumaúma Park Shopping (Cidade Nova - Praça Central)",
  "Millennium Shopping (Chapada - Torre Médica/Central)",
];

export const MANAUS_ZONES: Record<string, { zone: string; motoboyPrice: number }> = {
  "centro-sul": { zone: "Zona Centro-Sul (Adrianópolis, Parque 10, Vieiralves, Flores, Chapada)", motoboyPrice: 12.0 },
  "oeste": { zone: "Zona Oeste (Ponta Negra, Dom Pedro, Alvorada, Compensa, São Jorge)", motoboyPrice: 15.0 },
  "norte": { zone: "Zona Norte (Cidade Nova, Nova Cidade, Parque das Laranjeiras)", motoboyPrice: 18.0 },
  "leste": { zone: "Zona Leste (Coroado, Aleixo, São José, Japiim)", motoboyPrice: 16.0 },
  "sul": { zone: "Zona Sul (Centro, Cachoeirinha, Praça 14, Aparecida)", motoboyPrice: 14.0 },
};

/**
 * Verifica se o CEP informado pertence à cidade de Manaus - AM (69000-000 a 69099-999)
 */
export function isManausCep(rawCep: string): boolean {
  const digits = rawCep.replace(/\D/g, "");
  if (digits.length !== 8) return false;
  const prefix = parseInt(digits.substring(0, 5), 10);
  return prefix >= 69000 && prefix <= 69099;
}

/**
 * Calcula opções de entrega priorizando a logística local de Manaus - AM
 * e oferecendo PAC/SEDEX com seguro para o restante do Brasil.
 */
export function calculateShippingOptions(rawCep: string, zoneKey = "centro-sul"): ShippingOption[] {
  const digits = rawCep.replace(/\D/g, "");

  if (isManausCep(digits)) {
    const selectedZone = MANAUS_ZONES[zoneKey] || MANAUS_ZONES["centro-sul"];
    return [
      {
        method: "PONTO_ENCONTRO_MANAUS",
        label: "Ponto de Encontro Seguro em Manaus",
        subtitle: "Entrega em mãos com conferência da carta (Amazonas, Manauara, Sumaúma ou Ponta Negra)",
        price: 0,
        eta: "Hoje ou Amanhã (Horário agendado via WhatsApp)",
        badge: "GRÁTIS • FAVORITO DOS COLECIONADORES",
      },
      {
        method: "MOTOBOY_MANAUS",
        label: `Motoboy Expresso Manaus (${selectedZone.zone.split("(")[0].trim()})`,
        subtitle: "Envio lacrado com TopLoader + Sleeve + Proteção rígida contra chuva",
        price: selectedZone.motoboyPrice,
        eta: "Entrega em até 2 horas úteis",
        badge: "EXPRESSO NO MESMO DIA",
      },
      {
        method: "RETIRADA_LOCAL_MANAUS",
        label: "Retirada Expressa (Base JefersonBRATCG - Manaus)",
        subtitle: "Retire pessoalmente mediante agendamento prévio após confirmação do PIX/Cartão",
        price: 0,
        eta: "Pronto em 30 minutos",
        badge: "TAXA ZERO",
      },
    ];
  }

  // Cálculo nacional (Interior do AM, Norte e demais regiões do Brasil)
  const regionDigit = digits.length >= 1 ? parseInt(digits[0], 10) : 0;
  const isNorthRegion = digits.startsWith("69") || digits.startsWith("68") || digits.startsWith("66") || digits.startsWith("76") || digits.startsWith("77");
  const baseCost = isNorthRegion ? 24.9 : 34.9 + (regionDigit % 3) * 4.0;

  return [
    {
      method: "CORREIOS_NACIONAL",
      label: "Correios SEDEX com Seguro TCG + Embalagem Blindada",
      subtitle: "Sleeve + TopLoader + Papelão Rígido + Plástico Bolha + Rastreio",
      price: Number((baseCost + 18.0).toFixed(2)),
      eta: isNorthRegion ? "2 a 4 dias úteis" : "4 a 7 dias úteis",
      badge: "COM SEGURO INTEGRAL",
    },
    {
      method: "CORREIOS_NACIONAL",
      label: "Correios PAC Econômico / Carta Registrada Protegida",
      subtitle: "Embalagem rígida anti-dobra com código de rastreamento nacional",
      price: Number(baseCost.toFixed(2)),
      eta: isNorthRegion ? "5 a 8 dias úteis" : "8 a 13 dias úteis",
    },
  ];
}
