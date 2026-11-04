"use client";

import React, { useState } from "react";
import { Clock, Gavel, MapPin, ShieldCheck, Trophy } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { AuctionCard } from "@/components/AuctionCard";

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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header da Sala de Leilões */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-red-500/20 via-[#121722] to-slate-950 border border-red-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-extrabold">
            <Gavel className="w-3.5 h-3.5 animate-bounce" /> SALA OFICIAL DE LEILÕES • TEMPO REAL
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Leilões Pokémon TCG • JefersonBRATCG
          </h1>
          <p className="text-sm text-slate-300">
            Arremate Cartas Avulsas (Singles SIR / Alt Art) e ETBs Seladas abaixo do valor de mercado!
            Todos os leilões contam com sincronização em tempo real, anti-sniping (+30s nos segundos finais)
            e retirada gratuita nos shoppings de Manaus ou envio nacional.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 self-start">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              filter === "ALL" ? "bg-yellow-400 text-slate-950" : "text-slate-300 hover:text-white"
            }`}
          >
            Todos ({auctions.length})
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              filter === "ACTIVE" ? "bg-red-500 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Ativos ({auctions.filter((a) => a.status === "ACTIVE").length})
          </button>
          <button
            onClick={() => setFilter("ENDED")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              filter === "ENDED" ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Encerrados ({auctions.filter((a) => a.status === "ENDED").length})
          </button>
        </div>
      </div>

      {/* Layout Principal: Cards de Leilão + Feed Lateral de Lances Ao Vivo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>

        {/* Coluna Direita: Feed de Lances Ao Vivo & Regras */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-[#121722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                Histórico de Lances Ao Vivo
              </h3>
              <span className="text-[11px] text-slate-400">Realtime Feed</span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
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
                      R$ {bid.amount.toFixed(2).replace(".", ",")}
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
          <div className="p-5 rounded-2xl bg-[#121722] border border-yellow-500/30 space-y-3 text-xs text-slate-300">
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
