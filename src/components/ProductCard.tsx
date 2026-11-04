"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Eye, Package, ShoppingCart, Sparkles, Video } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/types";

const RARITY_STYLES = {
  BASICA: {
    label: "Raridade: Básica",
    classes: "bg-slate-800 text-slate-200 border-slate-700",
  },
  MEDIA: {
    label: "Raridade: Média (Holo/ex)",
    classes: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  },
  RARA: {
    label: "Raridade: Rara (SIR/Alt/Gold)",
    classes: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
};

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  const rarityBadge = RARITY_STYLES[product.rarity];
  const pixPrice = product.price * 0.95;

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="group rounded-2xl bg-[#131926] border border-slate-800 hover:border-yellow-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-yellow-500/5">
      <div>
        {/* Imagem com Badges Superiores */}
        <div className="relative bg-gradient-to-b from-slate-900 to-[#0C1018] p-5 flex items-center justify-center h-64 overflow-hidden">
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                product.category === "ETB"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/40"
              }`}
            >
              {product.category === "ETB" ? "ETB Selado" : "Carta Avulsa"}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${rarityBadge.classes}`}>
              {rarityBadge.label}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-emerald-400">
              {product.condition}
            </span>
            {product.videoUrl && (
              <span
                title="Vídeo real de holografia e estado da carta disponível"
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
              >
                <Video className="w-3 h-3" /> Vídeo Holo
              </span>
            )}
          </div>

          <Link href={`/produto/${product.id}`} className="relative block">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-52 w-auto object-contain rounded-lg transform group-hover:scale-105 transition duration-300 drop-shadow-[0_12px_20px_rgba(0,0,0,0.75)]"
            />
          </Link>
        </div>

        {/* Informações da Carta / ETB */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">{product.setName}</span>
            {product.cardNumber && (
              <span className="font-mono text-slate-300 shrink-0 ml-2">#{product.cardNumber}</span>
            )}
          </div>

          <Link
            href={`/produto/${product.id}`}
            className="block text-sm font-extrabold text-white group-hover:text-yellow-400 transition line-clamp-2 min-h-[2.5rem]"
          >
            {product.title}
          </Link>

          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
            <span className="truncate">{product.rarityDetail}</span>
          </p>
        </div>
      </div>

      {/* Preço, Estoque e Botões */}
      <div className="p-4 pt-0 space-y-3">
        <div className="pt-3 border-t border-slate-800/80 flex items-end justify-between">
          <div>
            {product.originalPrice && (
              <span className="text-xs text-slate-500 line-through block">
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
            <span className="text-lg font-black text-white block">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-[11px] text-emerald-400 font-bold">
              R$ {pixPrice.toFixed(2).replace(".", ",")} no PIX (-5%)
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-slate-500" />
            {product.stock} un.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition ${
              added
                ? "bg-emerald-500 text-slate-950"
                : "bg-yellow-400 hover:bg-yellow-300 text-slate-950"
            }`}
          >
            {added ? (
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
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
            title="Ver fotos em alta resolução e vídeo da carta"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
