"use client";

import React, { useState } from "react";
import { Clock, Gavel, MapPin, ShieldCheck, Trophy } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { AuctionCard } from "@/components/AuctionCard";
import { formatBRL } from "@/lib/format";

export default function AuctionsPage() {
  const { auctions } = useStore();
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "ENDED">("ALL");

  const filtered = auctions.filter((a) => {
    if (filter === "ALL") return true;
    return a.status === filter;
  });

  // Feed consolidado dos últimos lances em tempo real
  const allRecentBids = auctions
    .flatMap((auc) =>
      auc.bids.map((b) => ({
        ...b,
        productTitle: auc.product.title,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-6 sm:space-y-10">
      {/* Header da Sala de Leilões */}
      <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-red-500/20 via-tcg-surface to-slate-950 border border-red-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] sm:text-xs font-extrabold">
            <Gavel className="w-3.5 h-3.5 shrink-0 animate-bounce" /> SALA DE LEILÕES • TEMPO REAL
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Leilões Pokémon TCG • JefersonBRATCG
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Arremate Cartas Avulsas (Singles SIR / Alt Art) e ETBs Seladas abaixo do valor de mercado!
            Todos os leilões contam com sincronização em tempo real, anti-sniping (+30s nos segundos finais)
            e retirada gratuita nos shoppings de Manaus ou envio nacional.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filtrar leilões por situação"
          className="grid grid-cols-3 gap-1 sm:gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 w-full lg:w-auto lg:shrink-0"
        >
          <button
            onClick={() => setFilter("ALL")}
            aria-pressed={filter === "ALL"}
            className={`min-h-[42px] px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition ${
              filter === "ALL" ? "bg-yellow-400 text-slate-950" : "text-slate-300 hover:text-white"
            }`}
          >
            Todos ({auctions.length})
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            aria-pressed={filter === "ACTIVE"}
            className={`min-h-[42px] px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition ${
              filter === "ACTIVE" ? "bg-red-500 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Ativos ({auctions.filter((a) => a.status === "ACTIVE").length})
          </button>
          <button
            onClick={() => setFilter("ENDED")}
            aria-pressed={filter === "ENDED"}
            className={`min-h-[42px] px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition ${
              filter === "ENDED" ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Encerrados ({auctions.filter((a) => a.status === "ENDED").length})
          </button>
        </div>
      </div>

      {/* Layout Principal: Cards de Leilão + Feed Lateral de Lances Ao Vivo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 content-start">
          {filtered.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
          {filtered.length === 0 && (
            <div className="md:col-span-2 tcg-panel text-center space-y-3">
              <Gavel className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">Nenhum leilão nesta situação</p>
              <button
                onClick={() => setFilter("ALL")}
                className="px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs"
              >
                Ver todos os leilões
              </button>
            </div>
          )}
        </div>

        {/* Coluna Direita: Feed de Lances Ao Vivo & Regras */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6 lg:sticky lg:top-32 lg:self-start">
          <div className="p-4 sm:p-5 rounded-2xl bg-tcg-surface border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 shrink-0 rounded-full bg-emerald-400 animate-ping" />
                Últimos lances ao vivo
              </h3>
              <span className="text-[11px] text-slate-400 shrink-0">Tempo real</span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto overscroll-contain pr-1">
              {allRecentBids.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400">
                  Ainda não há lances. Seja o primeiro a disputar!
                </p>
              )}
              {allRecentBids.map((bid) => (
                <div
                  key={bid.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{bid.bidderName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{bid.bidderNeighborhood}</p>
                    <p className="text-[11px] text-yellow-400/90 truncate mt-0.5">
                      {bid.productTitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-emerald-400 block">
                      {formatBRL(bid.amount)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(bid.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regras de Arremate & Entrega Manaus */}
          <div className="p-4 sm:p-5 rounded-2xl bg-tcg-surface border border-yellow-500/30 space-y-3 text-xs text-slate-300">
            <h4 className="text-sm font-extrabold text-yellow-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> Como Funciona o Arremate?
            </h4>
            <p className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Anti-Sniping:</strong> Qualquer lance realizado nos últimos 30 segundos adiciona
                automaticamente +30s ao relógio para garantir disputa justa.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Arrematou em Manaus - AM?</strong> Você pode retirar sem custo nos Pontos de
                Encontro (Amazonas Shopping, Manauara, Ponta Negra ou Sumaúma) ou pedir Motoboy Expresso!
              </span>
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Garantia Original Copag/Pokémon:</strong> Todas as cartas leiloadas possuem vídeo
                de verificação de textura e conservação.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
