"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Eye, Package, ShoppingCart, Sparkles, Video } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { CATEGORY_LABELS, RARITY_LABELS, formatBRL } from "@/lib/format";
import { Product } from "@/types";

const RARITY_STYLES = {
  BASICA: "bg-slate-800 text-slate-200 border-slate-700",
  MEDIA: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  RARA: "bg-purple-500/20 text-purple-300 border-purple-500/40",
};

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  const pixPrice = product.price * 0.95;
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 2;

  const handleAdd = () => {
    if (soldOut) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="group rounded-2xl bg-tcg-surface border border-slate-800 hover:border-yellow-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-yellow-500/5">
      <div>
        {/* Imagem com selos superiores (um de cada lado, sem sobreposição em telas estreitas) */}
        <div className="relative bg-gradient-to-b from-slate-900 to-tcg-bg px-3 pt-9 pb-3 sm:p-5 flex items-center justify-center h-48 sm:h-64 overflow-hidden">
          <span
            className={`absolute top-2.5 left-2.5 z-10 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
              product.category === "ETB"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-blue-500/20 text-blue-300 border-blue-500/40"
            }`}
          >
            {CATEGORY_LABELS[product.category]}
          </span>

          <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-emerald-400">
              {product.condition === "SEALED" ? "Lacrado" : product.condition}
            </span>
            {product.videoUrl && (
              <span
                title="Vídeo real de holografia e estado da carta disponível"
                className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
              >
                <Video className="w-3 h-3" />
                <span className="hidden sm:inline">Vídeo Holo</span>
              </span>
            )}
          </div>

          <Link href={`/produto/${product.id}`} className="relative block">
            <img
              src={product.images[0]}
              alt={product.title}
              loading="lazy"
              className={`h-36 sm:h-52 w-auto object-contain rounded-lg transform group-hover:scale-105 transition duration-300 drop-shadow-[0_12px_20px_rgba(0,0,0,0.75)] ${
                soldOut ? "opacity-50 grayscale" : ""
              }`}
            />
          </Link>

          {soldOut && (
            <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-slate-950/90 border border-slate-600 text-[11px] font-black uppercase tracking-wider text-slate-200">
              Esgotado
            </span>
          )}
        </div>

        {/* Informações da Carta / ETB */}
        <div className="p-3 sm:p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="truncate">{product.setName}</span>
            {product.cardNumber && (
              <span className="font-mono text-slate-300 shrink-0">#{product.cardNumber}</span>
            )}
          </div>

          <Link
            href={`/produto/${product.id}`}
            className="text-sm font-extrabold text-white group-hover:text-yellow-400 transition line-clamp-2 min-h-[2.5rem]"
          >
            {product.title}
          </Link>

          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${RARITY_STYLES[product.rarity]}`}
            >
              {RARITY_LABELS[product.rarity]}
            </span>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 min-w-0">
              <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
              <span className="truncate">{product.rarityDetail}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Preço, Estoque e Botões */}
      <div className="p-3 sm:p-4 pt-0 sm:pt-0 space-y-3">
        <div className="pt-3 border-t border-slate-800/80">
          {product.originalPrice && (
            <span className="text-xs text-slate-500 line-through block">
              {formatBRL(product.originalPrice)}
            </span>
          )}
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="text-base sm:text-lg font-black text-white">
              {formatBRL(product.price)}
            </span>
            <span
              className={`text-[11px] font-semibold inline-flex items-center gap-1 ${
                soldOut ? "text-slate-500" : lowStock ? "text-amber-300" : "text-slate-400"
              }`}
            >
              <Package className="w-3.5 h-3.5 shrink-0" />
              {soldOut ? "0 un." : lowStock ? `Só ${product.stock}` : `${product.stock} un.`}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold block">
            {formatBRL(pixPrice)} no PIX (-5%)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className={`flex-1 min-h-[42px] py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition disabled:cursor-not-allowed ${
              soldOut
                ? "bg-slate-800 text-slate-500"
                : added
                ? "bg-emerald-500 text-slate-950"
                : "bg-yellow-400 hover:bg-yellow-300 text-slate-950"
            }`}
          >
            {soldOut ? (
              "Esgotado"
            ) : added ? (
              <>
                <Check className="w-4 h-4" /> Adicionado!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Comprar
              </>
            )}
          </button>

          <Link
            href={`/produto/${product.id}`}
            className="w-[42px] h-[42px] shrink-0 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
            title="Ver fotos em alta resolução e vídeo da carta"
            aria-label={`Ver detalhes de ${product.title}`}
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
