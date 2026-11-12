"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Filter,
  Flame,
  Gavel,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { HeroCarousel } from "@/components/HeroCarousel";
import { AuctionCard } from "@/components/AuctionCard";
import { ProductCard } from "@/components/ProductCard";
import { ProductCategory, RarityTier } from "@/types";

export default function HomePage() {
  const { products, auctions, searchQuery, setSearchQuery } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | ProductCategory>("ALL");
  const [selectedRarity, setSelectedRarity] = useState<"ALL" | RarityTier>("ALL");

  const activeAuctions = useMemo(
    () => auctions.filter((a) => a.status === "ACTIVE"),
    [auctions]
  );

  const sealedEtbs = useMemo(
    () => products.filter((p) => p.category === "ETB"),
    [products]
  );

  // Vitrine da home: prioriza leilões ao vivo e completa com os encerrados mais recentes
  const showcaseAuctions = useMemo(
    () => [...activeAuctions, ...auctions.filter((a) => a.status !== "ACTIVE")].slice(0, 3),
    [activeAuctions, auctions]
  );

  const hasActiveFilters =
    selectedCategory !== "ALL" || selectedRarity !== "ALL" || searchQuery.trim() !== "";

  const clearAllFilters = () => {
    setSelectedCategory("ALL");
    setSelectedRarity("ALL");
    setSearchQuery("");
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "ALL" || product.category === selectedCategory;
      const matchesRarity =
        selectedRarity === "ALL" || product.rarity === selectedRarity;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.title.toLowerCase().includes(q) ||
        product.setName.toLowerCase().includes(q) ||
        (product.cardNumber && product.cardNumber.toLowerCase().includes(q)) ||
        product.rarityDetail.toLowerCase().includes(q);

      return matchesCategory && matchesRarity && matchesSearch;
    });
  }, [products, selectedCategory, selectedRarity, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-10 sm:space-y-14">
      {/* 1. Carrossel Principal em Destaque */}
      <HeroCarousel />

      {/* 2. Faixa de Identidade Local Manaus - AM & Logística */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-tcg-surface border border-yellow-500/30 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-yellow-400/15 text-yellow-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white">
              Pontos de Encontro em Manaus (GRÁTIS)
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
              Entregamos em mãos no Amazonas Shopping, Manauara, Ponta Negra e Sumaúma com conferência na hora.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-tcg-surface border border-emerald-500/30 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white">
              Motoboy Expresso Manaus & Envio Nacional
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
              Receba em até 2h em qualquer bairro de Manaus ou via Correios SEDEX/PAC blindado para todo o Brasil.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-tcg-surface border border-purple-500/30 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white">
              Fotos Hi-Res + Vídeo Real da Holografia
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
              Transparência total no estado de conservação (Near Mint, LP, Selado) antes de você comprar ou dar lance.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Seção de Leilões Ativos em Tempo Real */}
      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Gavel className="w-4 h-4 animate-bounce" /> Disputa em Tempo Real
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white mt-1">
              Leilões Ativos Pokémon TCG
            </h2>
          </div>
          <Link
            href="/leiloes"
            className="self-start sm:self-auto text-xs font-extrabold text-yellow-400 hover:text-yellow-300 border border-yellow-400/30 px-4 py-2.5 rounded-xl bg-yellow-400/10"
          >
            Ver todos os leilões ({activeAuctions.length} ao vivo) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {showcaseAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
        {showcaseAuctions.length === 0 && (
          <p className="tcg-panel text-center text-xs text-slate-400">
            Nenhum leilão no ar agora. Novas disputas são publicadas toda semana.
          </p>
        )}
      </section>

      {/* 4. Catálogo Principal com Filtros Simplificados (3 Níveis de Raridade + Tipo de Produto) */}
      <section id="catalogo" className="space-y-5 sm:space-y-6 scroll-mt-28">
        <div className="tcg-panel space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filtro Simplificado Pokémon TCG
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-0.5">
                Catálogo Exclusivo: Cartas Avulsas & ETBs Seladas
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-semibold">
              <span aria-live="polite">
                Exibindo <strong className="text-white">{filteredProducts.length}</strong>{" "}
                {filteredProducts.length === 1 ? "item" : "itens"}
              </span>
              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1 max-w-[220px] px-2.5 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300"
                  title="Remover busca"
                >
                  <span className="truncate">Busca: {searchQuery.trim()}</span>
                  <X className="w-3 h-3 shrink-0" />
                </button>
              )}
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="underline hover:text-white py-1">
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 pt-3 border-t border-slate-800/80">
            {/* Filtro por Tipo de Produto */}
            <div className="lg:col-span-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Tipo de produto
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  aria-pressed={selectedCategory === "ALL"}
                  className={`min-h-[44px] py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-extrabold border transition ${
                    selectedCategory === "ALL"
                      ? "bg-yellow-400 text-slate-950 border-yellow-400"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  Todos ({products.length})
                </button>
                <button
                  onClick={() => setSelectedCategory("SINGLE")}
                  aria-pressed={selectedCategory === "SINGLE"}
                  className={`min-h-[44px] py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-extrabold border transition flex items-center justify-center gap-1 ${
                    selectedCategory === "SINGLE"
                      ? "bg-blue-500 text-white border-blue-400"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 shrink-0" /> Singles
                </button>
                <button
                  onClick={() => setSelectedCategory("ETB")}
                  aria-pressed={selectedCategory === "ETB"}
                  className={`min-h-[44px] py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-extrabold border transition flex items-center justify-center gap-1 ${
                    selectedCategory === "ETB"
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <Package className="w-3.5 h-3.5 shrink-0" /> ETB Selado
                </button>
              </div>
            </div>

            {/* Filtro por Raridade em 3 Níveis Claros */}
            <div className="lg:col-span-7 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Raridade (3 níveis)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setSelectedRarity("ALL")}
                  aria-pressed={selectedRarity === "ALL"}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-extrabold border transition ${
                    selectedRarity === "ALL"
                      ? "bg-white text-slate-950 border-white"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  Todas Raridades
                </button>
                <button
                  onClick={() => setSelectedRarity("BASICA")}
                  aria-pressed={selectedRarity === "BASICA"}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-left border transition ${
                    selectedRarity === "BASICA"
                      ? "bg-slate-200 text-slate-950 border-white"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-extrabold block">• Básicas</span>
                  <span className="text-[10px] opacity-75 block truncate">
                    Comum / Incomum / Rara
                  </span>
                </button>
                <button
                  onClick={() => setSelectedRarity("MEDIA")}
                  aria-pressed={selectedRarity === "MEDIA"}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-left border transition ${
                    selectedRarity === "MEDIA"
                      ? "bg-cyan-400 text-slate-950 border-cyan-300"
                      : "bg-slate-900 text-cyan-300 border-cyan-500/30 hover:border-cyan-400"
                  }`}
                >
                  <span className="text-xs font-extrabold block">•• Médias</span>
                  <span className="text-[10px] opacity-80 block truncate">
                    Holo, Reverse, Ultra Reg.
                  </span>
                </button>
                <button
                  onClick={() => setSelectedRarity("RARA")}
                  aria-pressed={selectedRarity === "RARA"}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-left border transition ${
                    selectedRarity === "RARA"
                      ? "bg-purple-500 text-white border-purple-300"
                      : "bg-slate-900 text-purple-300 border-purple-500/30 hover:border-purple-400"
                  }`}
                >
                  <span className="text-xs font-extrabold block">••• Raras</span>
                  <span className="text-[10px] opacity-80 block truncate">
                    Secretas, SIR, Alt Art, Gold
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grade de Produtos Responsiva */}
        {filteredProducts.length === 0 ? (
          <div className="p-10 sm:p-12 rounded-3xl bg-tcg-surface border border-slate-800 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-yellow-400 mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Nenhum produto encontrado com esses filtros
            </h3>
            <p className="text-xs text-slate-400">
              Experimente limpar os filtros ou buscar por outro Pokémon.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-3 rounded-xl bg-yellow-400 text-slate-950 font-extrabold text-xs"
            >
              Limpar filtros e busca
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Seção Dedicada: ETBs (Elite Trainer Boxes) Seladas */}
      <section id="etbs" className="space-y-4 sm:space-y-5 pt-2 sm:pt-4 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Package className="w-4 h-4" /> Produto Lacrado Oficial Copag
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              ETBs (Elite Trainer Boxes) Seladas em Manaus
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory("ETB");
              setSelectedRarity("ALL");
              document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="self-start sm:self-auto text-xs font-bold text-amber-300 hover:underline py-2"
          >
            Filtrar apenas ETBs →
          </button>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {sealedEtbs.map((etb) => (
            <ProductCard key={etb.id} product={etb} />
          ))}
        </div>
      </section>
    </div>
  );
}
