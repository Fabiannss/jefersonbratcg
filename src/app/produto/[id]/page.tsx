"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  MapPin,
  Package,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Video,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { calculateShippingOptions, isManausCep } from "@/lib/manaus-shipping";
import { AuctionCard } from "@/components/AuctionCard";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { products, auctions, addToCart } = useStore();

  const product = products.find((p) => p.id === id) || products[0];
  const relatedAuction = auctions.find(
    (a) => a.productId === product.id && a.status === "ACTIVE"
  );

  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [cep, setCep] = useState("69057-070"); // CEP padrão Adrianópolis - Manaus/AM
  const [added, setAdded] = useState(false);

  const shippingOptions = calculateShippingOptions(cep);
  const manausDetected = isManausCep(cep);

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-yellow-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Catálogo Pokémon TCG
        </Link>
        <span className="text-xs text-slate-500">
          Código: <strong className="text-slate-300">{product.id}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Coluna Esquerda: Galeria de Fotos em Alta Resolução + Vídeo de Conservação/Holografia */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-[#121722] border border-slate-800 p-6 flex items-center justify-center min-h-[430px] relative overflow-hidden">
            {showVideo && product.videoUrl ? (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-4 h-4" /> Inspeção de Holografia, Textura & Bordas
                  </span>
                  <button
                    onClick={() => setShowVideo(false)}
                    className="text-slate-400 hover:text-white underline"
                  >
                    Voltar para Fotos Hi-Res
                  </button>
                </div>
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full rounded-2xl border border-cyan-500/40 max-h-[380px] object-cover bg-black"
                />
              </div>
            ) : (
              <img
                src={product.images[activeImage] || product.images[0]}
                alt={product.title}
                className="max-h-[390px] w-auto object-contain rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-105"
              />
            )}
          </div>

          {/* Miniaturas + Botão de Vídeo de Holografia */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setShowVideo(false);
                  setActiveImage(i);
                }}
                className={`p-1.5 rounded-xl bg-[#121722] border transition ${
                  !showVideo && activeImage === i
                    ? "border-yellow-400 ring-2 ring-yellow-400/20"
                    : "border-slate-800 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-16 h-20 object-contain rounded" />
              </button>
            ))}

            {product.videoUrl && (
              <button
                onClick={() => setShowVideo(true)}
                className={`px-4 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-extrabold transition min-w-[130px] h-[94px] ${
                  showVideo
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                    : "bg-[#121722] border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
                }`}
              >
                <PlayCircle className="w-6 h-6 text-cyan-400" />
                <span>Vídeo Holografia</span>
                <span className="text-[10px] text-slate-400 font-normal">Estado Real</span>
              </button>
            )}
          </div>
        </div>

        {/* Coluna Direita: Especificações da Carta/ETB, Compra e Simulador Manaus */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-extrabold">
                {product.category === "ETB" ? "ETB (Elite Trainer Box) Selada" : "Carta Avulsa (Single)"}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-extrabold">
                Nível Raridade: {product.rarity}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold">
                Condição: {product.condition}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {product.title}
            </h1>

            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Coleção: <strong className="text-slate-200">{product.setName}</strong></span>
              {product.cardNumber && (
                <span>• Número: <strong className="text-yellow-400">#{product.cardNumber}</strong></span>
              )}
              <span>• Idioma: <strong className="text-slate-200">{product.language}</strong></span>
            </p>
          </div>

          {/* Box de Preço e Ação */}
          <div className="p-6 rounded-3xl bg-[#121722] border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                {product.originalPrice && (
                  <span className="text-xs text-slate-500 line-through block">
                    De R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                  </span>
                )}
                <div className="text-3xl font-black text-white">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </div>
                <p className="text-xs text-emerald-400 font-bold mt-0.5">
                  R$ {(product.price * 0.95).toFixed(2).replace(".", ",")} à vista no PIX (5% OFF) ou em até 6x
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200">
                  <Package className="w-3.5 h-3.5 text-yellow-400" />
                  {product.stock} unidades em Manaus
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleAdd}
                className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                  added
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-yellow-400/15"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" /> Carta Adicionada ao Carrinho!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> Adicionar ao Carrinho
                  </>
                )}
              </button>

              <Link
                href="/checkout"
                onClick={() => addToCart(product, 1)}
                className="py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm transition"
              >
                Compra Rápida
              </Link>
            </div>
          </div>

          {/* Descrição Técnica & Conservação */}
          <div className="p-5 rounded-2xl bg-[#121722]/70 border border-slate-800/80 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Laudo de Conservação & Detalhes do Produto
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
            <div className="pt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sleeve + TopLoader Inclusos
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-yellow-400" /> Estoque Físico Próprio em Manaus - AM
              </span>
            </div>
          </div>

          {/* Simulador de Entrega Manaus - AM e Nacional */}
          <div className="p-5 rounded-2xl bg-[#121722] border border-emerald-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Logística Manaus - AM & Simulador de Frete
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Digite seu CEP (CEPs 69000-000 a 69099-999 liberam Motoboy e Pontos de Encontro em Manaus)
                  </p>
                </div>
              </div>
              {manausDetected && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-extrabold">
                  ✓ CEP de Manaus Detectado!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="Ex: 69057-070 (Manaus) ou 01310-100"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-yellow-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCep("69057-070")}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-yellow-400"
              >
                CEP Manaus
              </button>
            </div>

            <div className="space-y-2">
              {shippingOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white">{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-yellow-400/15 text-yellow-300">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{opt.subtitle}</p>
                    <p className="text-[11px] text-cyan-300 font-semibold mt-0.5">Prazo: {opt.eta}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-emerald-400">
                      {opt.price === 0
                        ? "GRÁTIS"
                        : `R$ ${opt.price.toFixed(2).replace(".", ",")}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Caso este produto também esteja em Leilão Ativo */}
      {relatedAuction && (
        <section className="pt-6 border-t border-slate-800 space-y-4">
          <h2 className="text-xl font-black text-white">
            🔥 Este item também possui uma unidade em Leilão Ao Vivo!
          </h2>
          <div className="max-w-md">
            <AuctionCard auction={relatedAuction} />
          </div>
        </section>
      )}
    </div>
  );
}
