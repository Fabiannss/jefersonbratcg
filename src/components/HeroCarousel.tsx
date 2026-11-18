"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  MapPin,
  Pause,
  Play,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Product, RarityTier } from "@/types";

const AUTOPLAY_MS = 6500;
const MAX_SLIDES = 6;
const SWIPE_MIN_PX = 50;

// Cor do degradê de fundo conforme a raridade da carta em destaque
const ACCENT_BY_RARITY: Record<RarityTier, string> = {
  RARA: "from-yellow-500/25 via-amber-500/10 to-slate-950",
  MEDIA: "from-cyan-500/25 via-blue-500/10 to-slate-950",
  BASICA: "from-emerald-500/25 via-cyan-500/10 to-slate-950",
};

const brl = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

function discountPercent(product: Product): number | null {
  if (!product.originalPrice || product.originalPrice <= product.price) return null;
  return Math.round((1 - product.price / product.originalPrice) * 100);
}

export function HeroCarousel() {
  const { products, addToCart } = useStore();

  // Cartas em destaque vêm do catálogo: marcadas como destaque e com estoque.
  const slides = useMemo(() => {
    const featured = products.filter((p) => p.isFeatured && p.stock > 0);
    const list = featured.length > 0 ? featured : products.filter((p) => p.stock > 0);
    return list.slice(0, MAX_SLIDES);
  }, [products]);

  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Quem prefere menos movimento começa com a troca automática desligada.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  // Se a lista de cartas mudar (estoque, admin), mantém o índice válido.
  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  const goTo = useCallback(
    (target: number) => {
      if (count === 0) return;
      setIndex(((target % count) + count) % count);
    },
    [count]
  );

  // Troca automática: pausa com mouse em cima, foco dentro, aba escondida ou botão pausar.
  useEffect(() => {
    if (!playing || hovering || focusInside || count < 2) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        setIndex((prev) => (prev + 1) % count);
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [playing, hovering, focusInside, count, index]);

  if (count === 0) return null;

  const current = slides[Math.min(index, count - 1)];
  const discount = discountPercent(current);
  const pixPrice = current.price * 0.95;
  const lastUnit = current.stock === 1;
  const justAdded = addedId === current.id;

  const handleAdd = () => {
    addToCart(current, 1);
    setAddedId(current.id);
    setTimeout(() => setAddedId((id) => (id === current.id ? null : id)), 1600);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Só conta como deslize horizontal se for bem mais horizontal que vertical.
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      goTo(dx < 0 ? index + 1 : index - 1);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    }
  };

  return (
    <section
      role="region"
      aria-roledescription="carrossel"
      aria-label="Cartas em destaque"
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-[#0E131F] shadow-2xl"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocusInside(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusInside(false);
      }}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={`bg-gradient-to-br ${ACCENT_BY_RARITY[current.rarity]} p-4 sm:p-8 lg:p-12 transition-all duration-500 touch-pan-y`}
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
          aria-live={playing ? "off" : "polite"}
          aria-atomic="true"
        >
          {/* Coluna de texto */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-5 order-2 lg:order-1 text-center lg:text-left">
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-[10px] sm:text-xs font-extrabold tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                {discount ? `Promoção: ${discount}% de desconto` : "Carta em destaque"}
              </span>
              {lastUnit && (
                <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] sm:text-xs font-bold">
                  Última unidade
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" /> Manaus - AM
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {current.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              {current.setName} • {current.rarityDetail}
            </p>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 line-clamp-3">
              {current.description}
            </p>

            <div className="flex flex-wrap items-end justify-center lg:justify-start gap-x-4 gap-y-1">
              <div>
                {current.originalPrice && discount && (
                  <span className="block text-xs text-slate-500 line-through">
                    {brl(current.originalPrice)}
                  </span>
                )}
                <span className="block text-2xl sm:text-3xl font-black text-white">
                  {brl(current.price)}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 pb-1">
                {brl(pixPrice)} no PIX (-5%)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Link
                href={`/produto/${current.id}`}
                className="px-5 sm:px-6 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 transition"
              >
                <Flame className="w-4 h-4 shrink-0" />
                Ver carta e vídeo
              </Link>
              <button
                type="button"
                onClick={handleAdd}
                className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Adicionado ao carrinho
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-yellow-400 shrink-0" /> Adicionar ao carrinho
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Carta em destaque com brilho */}
          <div className="lg:col-span-5 flex justify-center relative order-1 lg:order-2 pt-2 lg:pt-0">
            <Link
              href={`/produto/${current.id}`}
              className="relative group"
              aria-label={`Ver detalhes: ${current.title}`}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/30 via-purple-500/30 to-cyan-400/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition" />
              <img
                key={current.id}
                src={current.images[0]}
                alt={current.title}
                className="relative w-44 sm:w-60 lg:w-72 h-auto object-contain rounded-2xl shadow-2xl transform group-hover:scale-105 group-hover:-rotate-1 transition duration-500 border border-white/10"
              />
            </Link>
          </div>
        </div>

        {/* Controles */}
        <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === index ? "w-8 bg-yellow-400" : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
                aria-label={`Ir para ${s.title}`}
                aria-current={idx === index ? "true" : undefined}
              />
            ))}
            <span className="ml-2 text-[11px] font-semibold text-slate-400" aria-hidden="true">
              {index + 1} / {count}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {count > 1 && (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200"
                aria-label={playing ? "Pausar troca automática" : "Retomar troca automática"}
                title={playing ? "Pausar" : "Retomar"}
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200"
              aria-label="Carta anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200"
              aria-label="Próxima carta"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
