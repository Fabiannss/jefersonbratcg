"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gavel,
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

function formatRemaining(ms: number): string {
  if (ms <= 0) return "encerrando";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function HeroCarousel() {
  const { products, auctions, addToCart } = useStore();

  // Cartas com leilão ao vivo vêm primeiro; depois as marcadas como destaque (com estoque).
  const slides = useMemo(() => {
    const liveIds = new Set(auctions.filter((a) => a.status === "ACTIVE").map((a) => a.productId));
    const live = products.filter((p) => liveIds.has(p.id));
    const featured = products.filter((p) => p.isFeatured && p.stock > 0 && !liveIds.has(p.id));
    const fallback = products.filter((p) => p.stock > 0 && !liveIds.has(p.id));
    const list = [...live, ...(featured.length > 0 ? featured : fallback)];
    return list.slice(0, MAX_SLIDES);
  }, [products, auctions]);

  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const current = count > 0 ? slides[Math.min(index, count - 1)] : undefined;
  const activeAuction = current
    ? auctions.find((a) => a.productId === current.id && a.status === "ACTIVE")
    : undefined;
  const activeAuctionId = activeAuction?.id;

  // Quem prefere menos movimento começa com a troca automática desligada.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  // Se a lista de cartas mudar (estoque, admin), mantém o índice válido.
  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  // Relógio de 1 segundo só quando a carta mostrada está em leilão (contagem regressiva ao vivo).
  useEffect(() => {
    if (!activeAuctionId) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeAuctionId]);

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

  if (!current) return null;

  const discount = discountPercent(current);
  const pixPrice = current.price * 0.95;
  const lastUnit = current.stock === 1;
  const justAdded = addedId === current.id;
  const remaining =
    activeAuction && now !== null ? new Date(activeAuction.endsAt).getTime() - now : null;

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
        className={`bg-gradient-to-br ${ACCENT_BY_RARITY[current.rarity]} p-4 sm:p-6 lg:p-10 transition-all duration-500 touch-pan-y`}
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10 items-center"
          aria-live={playing ? "off" : "polite"}
          aria-atomic="true"
        >
          {/* A carta é a protagonista */}
          <div className="flex justify-center relative order-1">
            <Link
              href={`/produto/${current.id}`}
              className="relative group"
              aria-label={`Ver detalhes: ${current.title}`}
            >
              <div className="absolute -inset-6 bg-gradient-to-r from-yellow-400/30 via-purple-500/30 to-cyan-400/30 rounded-3xl blur-3xl opacity-80 group-hover:opacity-100 transition" />
              <img
                key={current.id}
                src={current.images[0]}
                alt={current.title}
                className="relative w-56 sm:w-72 lg:w-[22rem] h-auto object-contain rounded-2xl shadow-2xl transform group-hover:scale-[1.03] group-hover:-rotate-1 transition duration-500 border border-white/10"
              />
            </Link>
          </div>

          {/* Informação enxuta: nome, valor ao vivo e ação */}
          <div className="order-2 space-y-4 sm:space-y-5 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
              {activeAuction ? (
                <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-[10px] sm:text-xs font-extrabold flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 shrink-0" /> Leilão ao vivo
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-[10px] sm:text-xs font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  {discount ? `${discount}% de desconto` : "Em destaque"}
                </span>
              )}
              {lastUnit && !activeAuction && (
                <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] sm:text-xs font-bold">
                  Última unidade
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" /> Manaus - AM
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight line-clamp-2">
              {current.title}
            </h1>

            {/* Valor atual */}
            <div className="inline-block w-full sm:w-auto sm:min-w-[19rem] rounded-2xl border border-yellow-400/40 bg-slate-900/80 px-5 py-4 text-left">
              {activeAuction ? (
                <>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-red-300">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    {activeAuction.bidsCount === 0 ? "Lance inicial" : "Lance atual"} • ao vivo
                  </div>
                  <div className="mt-1 text-4xl sm:text-5xl font-black text-yellow-400 tabular-nums">
                    {brl(activeAuction.currentBid)}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-slate-300 tabular-nums">
                    {activeAuction.bidsCount} {activeAuction.bidsCount === 1 ? "lance" : "lances"}
                    {remaining !== null && <> • termina em {formatRemaining(remaining)}</>}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-400">
                    {discount && current.originalPrice ? (
                      <>
                        De <span className="line-through">{brl(current.originalPrice)}</span> por
                      </>
                    ) : (
                      "Preço"
                    )}
                  </div>
                  <div className="mt-1 text-4xl sm:text-5xl font-black text-white tabular-nums">
                    {brl(current.price)}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
                    {brl(pixPrice)} no PIX (-5%)
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
              {activeAuction ? (
                <>
                  <Link
                    href="/leiloes"
                    className="px-5 sm:px-6 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 transition"
                  >
                    <Gavel className="w-4 h-4 shrink-0" />
                    Dar lance agora
                  </Link>
                  <Link
                    href={`/produto/${current.id}`}
                    className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    Ver carta
                  </Link>
                </>
              ) : (
                <>
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
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Adicionado
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 text-yellow-400 shrink-0" /> Adicionar ao carrinho
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
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
