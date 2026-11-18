/**
 * Importação em massa de cartas e ETBs a partir de planilha (CSV ou texto copiado do Excel / Google Planilhas).
 * Só "titulo" e "preco" são obrigatórios; o resto tem valor padrão.
 */
import type { CardCondition, Product, ProductCategory, RarityTier } from "@/types";

export type ImportDraft = Omit<Product, "id" | "createdAt">;

export interface ImportRow {
  line: number;
  title: string;
  mode: "novo" | "atualiza";
  existingId?: string;
  draft?: ImportDraft;
  errors: string[];
  warnings: string[];
}

export interface ImportPreview {
  rows: ImportRow[];
  headerError?: string;
}

export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="700" viewBox="0 0 500 700">' +
      '<rect width="500" height="700" rx="28" fill="#1e293b"/>' +
      '<rect x="24" y="24" width="452" height="652" rx="18" fill="none" stroke="#475569" stroke-width="4"/>' +
      '<text x="250" y="350" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#94a3b8">Sem foto</text>' +
      "</svg>"
  );

const HEADER =
  "titulo;colecao;numero;tipo;raridade;condicao;preco;preco_original;estoque;codigo_imagem;imagem;video;descricao;destaque";

export const CSV_TEMPLATE = [
  HEADER,
  "Pikachu ex (238/191) - Special Illustration Rare;Fagulhas Impetuosas;238/191;carta;rara;NM;1890,00;2150,00;2;sv8-238;;;Centralização impecável;sim",
  "ETB Coleção 151 Lacrada;Coleção 151;;etb;rara;;689,90;;3;;https://exemplo.com/foto-etb.png;;;nao",
].join("\n");

// ---------- utilidades de texto ----------

const strip = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

const keyOf = (s: string) =>
  strip(s)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

type Field =
  | "titulo"
  | "colecao"
  | "numero"
  | "tipo"
  | "raridade"
  | "detalhe"
  | "condicao"
  | "preco"
  | "precoOriginal"
  | "estoque"
  | "codigoImagem"
  | "imagem"
  | "video"
  | "descricao"
  | "destaque"
  | "promocao"
  | "idioma";

const ALIASES: Record<Field, string[]> = {
  titulo: ["titulo", "title", "nome", "carta", "produto"],
  colecao: ["colecao", "set", "expansao", "serie"],
  numero: ["numero", "num", "number", "cardnumber", "n"],
  tipo: ["tipo", "categoria", "category"],
  raridade: ["raridade", "rarity", "nivel"],
  detalhe: ["detalhe_raridade", "raridade_detalhe", "rarity_detail"],
  condicao: ["condicao", "estado", "condition"],
  preco: ["preco", "valor", "price", "preco_r"],
  precoOriginal: ["preco_original", "preco_de", "de", "original", "valor_original"],
  estoque: ["estoque", "qtd", "quantidade", "stock"],
  codigoImagem: ["codigo_imagem", "codigo", "id_carta", "card_id"],
  imagem: ["imagem", "imagens", "foto", "fotos", "url", "image"],
  video: ["video"],
  descricao: ["descricao", "description", "obs", "observacao"],
  destaque: ["destaque", "featured"],
  promocao: ["promocao", "promo"],
  idioma: ["idioma", "language"],
};

const FIELD_BY_ALIAS = new Map<string, Field>();
(Object.keys(ALIASES) as Field[]).forEach((field) =>
  ALIASES[field].forEach((alias) => FIELD_BY_ALIAS.set(alias, field))
);

// ---------- leitura do CSV / texto colado ----------

function detectDelimiter(firstLine: string): string {
  const counts: Array<[string, number]> = [
    ["\t", (firstLine.match(/\t/g) || []).length],
    [";", (firstLine.match(/;/g) || []).length],
    [",", (firstLine.match(/,/g) || []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ";";
}

function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

// ---------- conversões ----------

/** Aceita "R$ 1.890,00", "1890,50", "1890.50" e "49.9". */
export function parseMoney(raw: string): number | null {
  let s = raw.replace(/r\$/gi, "").replace(/\s/g, "");
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseRarity(raw: string): RarityTier | null {
  const v = keyOf(raw);
  if (!v) return null;
  if (["basica", "basico", "comum", "incomum", "common", "uncommon", "1"].includes(v)) return "BASICA";
  if (["media", "medio", "holo", "reverse", "reverse_holo", "ex", "v", "vmax", "vstar", "2"].includes(v))
    return "MEDIA";
  if (
    ["rara", "raro", "sir", "secreta", "secret", "alt", "alt_art", "altart", "gold", "hyper", "ultra", "3"].includes(v)
  )
    return "RARA";
  return null;
}

function parseCondition(raw: string): CardCondition | null {
  const v = keyOf(raw);
  if (!v) return null;
  if (["nm", "near_mint", "mint"].includes(v)) return "NM";
  if (["lp", "lightly_played"].includes(v)) return "LP";
  if (["mp", "moderately_played"].includes(v)) return "MP";
  if (["hp", "heavily_played"].includes(v)) return "HP";
  if (["damaged", "danificada", "danificado"].includes(v)) return "DAMAGED";
  if (["sealed", "lacrado", "lacrada", "selado", "selada"].includes(v)) return "SEALED";
  return null;
}

function parseCategory(raw: string): ProductCategory {
  const v = keyOf(raw);
  return /etb|box|lacrad|selad|elite/.test(v) ? "ETB" : "SINGLE";
}

function parseYesNo(raw: string): boolean {
  return ["sim", "s", "1", "true", "yes", "y", "x"].includes(strip(raw));
}

function parseLanguage(raw: string): "PT-BR" | "EN" | "JP" {
  const v = strip(raw);
  if (v === "en" || v === "ingles" || v === "english") return "EN";
  if (v === "jp" || v === "japones" || v === "japanese") return "JP";
  return "PT-BR";
}

/** "sv8-238" vira a imagem oficial da carta; assim a pessoa não precisa procurar a foto. */
function imageFromCode(raw: string): string | null {
  const m = raw.trim().match(/^([a-z0-9.]+)-([a-z0-9]+)$/i);
  return m ? `https://images.pokemontcg.io/${m[1].toLowerCase()}/${m[2]}_hires.png` : null;
}

const RARITY_DETAIL: Record<RarityTier, string> = {
  BASICA: "Comum / Incomum / Rara",
  MEDIA: "Holo / Reverse / Ultra Rara",
  RARA: "Raridade especial (SIR / Alt Art / Secreta)",
};

function productKey(title: string, number: string | undefined) {
  return `${keyOf(title)}|${keyOf(number || "")}`;
}

// ---------- prévia ----------

export function buildImportPreview(rawText: string, existing: Product[]): ImportPreview {
  const text = rawText.replace(/^﻿/, "").trim();
  if (!text) {
    return { rows: [], headerError: "Cole as linhas da planilha ou escolha um arquivo CSV." };
  }

  const firstLine = text.split(/\r?\n/, 1)[0];
  const delimiter = detectDelimiter(firstLine);
  const table = parseDelimited(text, delimiter);
  const header = table[0].map((h) => FIELD_BY_ALIAS.get(keyOf(h)));

  if (!header.includes("titulo") || !header.includes("preco")) {
    return {
      rows: [],
      headerError:
        'Não achei as colunas "titulo" e "preco" na primeira linha. Use o modelo para começar: ele já vem com os nomes certos.',
    };
  }

  const existingByKey = new Map<string, Product>();
  existing.forEach((p) => existingByKey.set(productKey(p.title, p.cardNumber), p));

  const seen = new Set<string>();
  const rows: ImportRow[] = [];

  for (let r = 1; r < table.length; r++) {
    const cells = table[r];
    if (cells.every((c) => c.trim() === "")) continue;

    const get = (field: Field) => {
      const idx = header.indexOf(field);
      return idx >= 0 ? (cells[idx] ?? "").trim() : "";
    };

    const errors: string[] = [];
    const warnings: string[] = [];
    const title = get("titulo");
    const priceRaw = get("preco");
    const price = parseMoney(priceRaw);

    if (!title) errors.push("Falta o título");
    if (price === null || price <= 0) errors.push(priceRaw ? `Preço inválido: "${priceRaw}"` : "Falta o preço");

    const typeRaw = get("tipo");
    const category = parseCategory(typeRaw || (/\betb\b/i.test(title) ? "etb" : ""));

    const rarityRaw = get("raridade");
    let rarity = parseRarity(rarityRaw);
    if (!rarity) {
      rarity = "MEDIA";
      warnings.push(rarityRaw ? `Raridade "${rarityRaw}" não reconhecida (usei Média)` : "Sem raridade (usei Média)");
    }

    const conditionRaw = get("condicao");
    let condition = parseCondition(conditionRaw);
    if (category === "ETB") {
      condition = "SEALED";
    } else if (!condition) {
      condition = "NM";
      if (conditionRaw) warnings.push(`Condição "${conditionRaw}" não reconhecida (usei NM)`);
    }

    const stockRaw = get("estoque");
    let stock = stockRaw ? parseInt(stockRaw, 10) : 1;
    if (!Number.isFinite(stock) || stock < 0) {
      errors.push(`Estoque inválido: "${stockRaw}"`);
      stock = 1;
    }

    const originalRaw = get("precoOriginal");
    const original = originalRaw ? parseMoney(originalRaw) : null;
    if (originalRaw && original === null) warnings.push(`Preço original ignorado: "${originalRaw}"`);

    const images = get("imagem")
      .split(/[\s|]+/)
      .filter((u) => /^https?:\/\//i.test(u));
    const fromCode = imageFromCode(get("codigoImagem"));
    if (fromCode) images.unshift(fromCode);
    if (images.length === 0) {
      images.push(IMAGE_PLACEHOLDER);
      warnings.push("Sem foto (coloque o código da carta, ex: sv8-238, ou um link)");
    }

    const setName = get("colecao");
    if (!setName) warnings.push("Sem coleção");

    const number = category === "SINGLE" ? get("numero") || undefined : undefined;
    const key = productKey(title, number);
    if (title && seen.has(key)) errors.push("Linha repetida (a carta já aparece acima)");
    seen.add(key);

    const match = existingByKey.get(key);
    const promoFlag = get("promocao");
    const isPromo = promoFlag ? parseYesNo(promoFlag) : !!(original && price && original > price);
    const featuredFlag = get("destaque");

    const draft: ImportDraft | undefined =
      errors.length === 0 && price !== null
        ? {
            title,
            slug: keyOf(`${title}-${number || ""}`).replace(/_/g, "-"),
            category,
            setName: setName || "Sem coleção informada",
            cardNumber: number,
            rarity,
            rarityDetail: get("detalhe") || RARITY_DETAIL[rarity],
            condition,
            language: parseLanguage(get("idioma")),
            price,
            originalPrice: original && original > price ? original : undefined,
            stock,
            description: get("descricao"),
            images,
            videoUrl: get("video") || undefined,
            isPromo,
            isFeatured: featuredFlag ? parseYesNo(featuredFlag) : match ? match.isFeatured : false,
          }
        : undefined;

    rows.push({
      line: r + 1,
      title: title || "(sem título)",
      mode: match ? "atualiza" : "novo",
      existingId: match?.id,
      draft,
      errors,
      warnings,
    });
  }

  if (rows.length === 0) {
    return { rows, headerError: "A planilha tem só o cabeçalho. Adicione ao menos uma carta abaixo dele." };
  }
  return { rows };
}

/** Lê um arquivo CSV: tenta UTF-8 e, se falhar, usa o padrão do Excel em português (Windows-1252). */
export async function readCsvFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

export function downloadCsvTemplate() {
  const blob = new Blob(["﻿" + CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelo-cartas.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
