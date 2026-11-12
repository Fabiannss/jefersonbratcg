"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame, Gavel, MapPin, Sparkles, Video } from "lucide-react";

const SLIDES = [
  {
    id: "slide-1",
    badge: "DESTAQUE PROMO & CHASE • FAGULHAS IMPETUOSAS",
    title: "Pikachu ex (238/191) Special Illustration Rare",
    subtitle:
      "Carta verificada com fotos de alta resolução e vídeo real demonstrando a textura Terastal. Entrega presencial em Manaus ou envio blindado para todo o Brasil!",
    ctaText: "Ver Carta & Vídeo Holográfico",
    ctaHref: "/produto/prod-pikachu-sir-sv8",
    secondaryText: "Dar Lance no Leilão Ao Vivo",
    secondaryHref: "/leiloes",
    image: "https://images.pokemontcg.io/sv8/238_hires.png",
    accent: "from-yellow-500/25 via-amber-500/10 to-slate-950",
    priceTag: "R$ 1.890,00 ou em Leilão",
  },
  {
    id: "slide-2",
    badge: "NOVIDADE NO LEILÃO AO VIVO • MANAUS/AM",
    title: "Charizard ex SIR (199/165) & ETB Coleção 151 Lacrada",
    subtitle:
      "Dispute lances em tempo real com contador regressivo e proteção anti-sniping! Arrematou em Manaus? Retire hoje mesmo nos principais shoppings sem taxa de entrega.",
    ctaText: "Entrar na Sala de Leilões",
    ctaHref: "/leiloes",
    secondaryText: "Ver ETBs Seladas",
    secondaryHref: "/#etbs",
    image: "https://images.pokemontcg.io/sv3pt5/199_hires.png",
    accent: "from-red-600/25 via-orange-500/10 to-slate-950",
    priceTag: "Lances a partir de R$ 450,00",
  },
  {
    id: "slide-3",
    badge: "LOGÍSTICA ESPECIAL MANAUS - AMAZONAS",
    title: "Sua Loja 100% Pokémon TCG no Coração de Manaus",
    subtitle:
      "Sem espera de semanas! Receba suas Singles e ETBs via Motoboy Expresso em até 2h em toda Manaus ou agende Ponto de Encontro Seguro (Amazonas, Manauara, Ponta Negra e Sumaúma).",
    ctaText: "Explorar Catálogo Completo",
    ctaHref: "#catalogo",
    secondaryText: "Simular Frete / Entrega",
    secondaryHref: "/checkout",
    image: "https://images.pokemontcg.io/swsh7/215_hires.png",
    accent: "from-emerald-500/25 via-cyan-500/10 to-slate-950",
    priceTag: "Frete R$ 0 nos Pontos de Encontro",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const current = SLIDES[index];

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-tcg-surface shadow-2xl">
      <div className={`bg-gradient-to-br ${current.accent} p-4 sm:p-8 lg:p-12 transition-all duration-500`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Coluna de Texto */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-5 order-2 lg:order-1 text-center lg:text-left">
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-[10px] sm:text-xs font-extrabold tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" /> {current.badge}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" /> Manaus - AM
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {current.title}
            </h1>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {current.subtitle}
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200">
              <Video className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Destaque:</span>
              <strong className="text-yellow-400">{current.priceTag}</strong>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Link
                href={current.ctaHref}
                className="px-5 sm:px-6 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 transition"
              >
                <Flame className="w-4 h-4 shrink-0" />
                {current.ctaText}
              </Link>
              <Link
                href={current.secondaryHref}
                className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <Gavel className="w-4 h-4 text-red-400 shrink-0" />
                {current.secondaryText}
              </Link>
            </div>
          </div>

          {/* Carta em Destaque com Brilho Holográfico */}
          <div className="lg:col-span-5 flex justify-center relative order-1 lg:order-2 pt-2 lg:pt-0">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/30 via-purple-500/30 to-cyan-400/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition" />
              <img
                src={current.image}
                alt={current.title}
                className="relative w-44 sm:w-60 lg:w-72 h-auto object-contain rounded-2xl shadow-2xl transform group-hover:scale-105 group-hover:-rotate-1 transition duration-500 border border-white/10"
              />
            </div>
          </div>
        </div>

        {/* Controles do Carrossel */}
        <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === index ? "w-8 bg-yellow-400" : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIndex((prev) => (prev + 1) % SLIDES.length)}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200"
              aria-label="Próximo slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
