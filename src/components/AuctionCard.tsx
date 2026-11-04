"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Flame, Gavel, ShieldCheck, Trophy, UserCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Auction } from "@/types";

function formatRemaining(endsAt: string): { text: string; expired: boolean; urgent: boolean } {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { text: "ENCERRADO", expired: true, urgent: false };

  const totalSec = Math.floor(diff / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    text: `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
    expired: false,
    urgent: totalSec < 1200, // Menos de 20 min fica vermelho pulsante
  };
}

export function AuctionCard({ auction }: { auction: Auction }) {
  const { placeBid, user } = useStore();
  const minNextBid =
    auction.bidsCount === 0
      ? auction.startingBid
      : auction.currentBid + auction.minIncrement;

  const [bidValue, setBidValue] = useState<string>(String(minNextBid));
  const [bidderName, setBidderName] = useState<string>("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [countdown, setCountdown] = useState(() => formatRemaining(auction.endsAt));

  useEffect(() => {
    setBidValue(String(minNextBid));
  }, [minNextBid]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatRemaining(auction.endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [auction.endsAt]);

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(bidValue.replace(",", "."));
    if (isNaN(numeric)) {
      setFeedback({ ok: false, text: "Informe um valor numérico válido." });
      return;
    }

    const res = placeBid(
      auction.id,
      numeric,
      bidderName.trim() || user.name,
      user.neighborhood || "Manaus - AM"
    );
    setFeedback({ ok: res.ok, text: res.message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const isEnded = auction.status === "ENDED" || countdown.expired;

  return (
    <div className="rounded-2xl bg-[#131926] border border-red-500/30 hover:border-red-500/60 transition-all shadow-xl overflow-hidden flex flex-col justify-between">
      {/* Barra Superior de Tempo Real */}
      <div>
        <div
          className={`px-4 py-2.5 flex items-center justify-between text-xs font-extrabold ${
            isEnded
              ? "bg-slate-800 text-slate-300"
              : countdown.urgent
              ? "bg-gradient-to-r from-red-600 to-orange-600 text-white animate-pulse"
              : "bg-gradient-to-r from-red-500/20 to-amber-500/20 text-red-200 border-b border-red-500/20"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5" />
            {isEnded ? "LEILÃO FINALIZADO" : "AO VIVO • TEMPO REAL"}
          </span>
          <span className="flex items-center gap-1 font-mono text-xs tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            {countdown.text}
          </span>
        </div>

        {/* Conteúdo da Carta/ETB Leiloada */}
        <div className="p-4 flex gap-4 items-center">
          <Link href={`/produto/${auction.product.id}`} className="shrink-0 group relative">
            <img
              src={auction.product.images[0]}
              alt={auction.product.title}
              className="w-24 h-32 object-contain rounded-xl bg-slate-950 p-1.5 border border-slate-800 group-hover:scale-105 transition"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-yellow-400">
              {auction.product.condition}
            </span>
          </Link>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {auction.product.category === "ETB" ? "ETB SELADA" : `RARIDADE: ${auction.product.rarity}`}
              </span>
              <span className="text-[10px] text-slate-400">{auction.bidsCount} lances</span>
            </div>

            <Link
              href={`/produto/${auction.product.id}`}
              className="block text-sm font-extrabold text-white hover:text-yellow-400 line-clamp-2 transition"
            >
              {auction.product.title}
            </Link>

            <p className="text-[11px] text-slate-400 truncate">{auction.product.setName}</p>

            {/* Box de Lance Atual */}
            <div className="pt-1 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                  {isEnded ? "Arrematado por:" : "Lance Atual:"}
                </span>
                <span className="text-xl font-black text-yellow-400">
                  R$ {auction.currentBid.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Incremento mín.</span>
                <span className="text-xs font-bold text-slate-200">
                  + R$ {auction.minIncrement.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {auction.winnerName && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                {isEnded ? (
                  <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span className="truncate">
                  {isEnded ? "Vencedor: " : "Líder: "}
                  <strong>{auction.winnerName}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulário de Novo Lance em Tempo Real */}
      <div className="p-4 pt-3 bg-slate-950/70 border-t border-slate-800/80 space-y-2.5">
        {!isEnded ? (
          <form onSubmit={handleBidSubmit} className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={bidderName}
                onChange={(e) => setBidderName(e.target.value)}
                placeholder="Seu nome / Nick (ex: João - Flores)"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="number"
                  step="0.50"
                  min={minNextBid}
                  value={bidValue}
                  onChange={(e) => setBidValue(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-extrabold text-yellow-400 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBidValue(String(minNextBid))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300"
              >
                Mín: R$ {minNextBid}
              </button>
              <button
                type="button"
                onClick={() => setBidValue(String(minNextBid + auction.minIncrement))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300"
              >
                + R$ {auction.minIncrement * 2}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Flame className="w-3.5 h-3.5" />
                Dar Lance Agora
              </button>
            </div>
          </form>
        ) : (
          <div className="py-2 text-center text-xs font-bold text-slate-400">
            Leilão encerrado • Vencedor notificado para retirada/entrega em Manaus
          </div>
        )}

        {feedback && (
          <div
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${
              feedback.ok
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-red-500/20 text-red-300 border border-red-500/40"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Anti-Sniping Ativo (+30s)
          </span>
          <Link href="/leiloes" className="text-yellow-400 hover:underline font-semibold">
            Ver histórico ({auction.bidsCount}) →
          </Link>
        </div>
      </div>
    </div>
  );
}
