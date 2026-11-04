"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, MapPin, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import {
  calculateShippingOptions,
  isManausCep,
  MANAUS_MEETING_POINTS,
  MANAUS_ZONES,
} from "@/lib/manaus-shipping";
import { ManausDeliveryMethod, Order } from "@/types";

export default function CheckoutPage() {
  const { cart, createOrder } = useStore();

  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("(92) 9");
  const [cep, setCep] = useState("69057-070");
  const [zoneKey, setZoneKey] = useState("centro-sul");
  const [neighborhood, setNeighborhood] = useState("Adrianópolis");
  const [city, setCity] = useState("Manaus");
  const [state, setState] = useState("AM");
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [meetingPoint, setMeetingPoint] = useState(MANAUS_MEETING_POINTS[0]);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const manaus = isManausCep(cep);
  const shippingOptions = calculateShippingOptions(cep, zoneKey);
  const chosenShipping = shippingOptions[selectedMethodIndex] || shippingOptions[0];

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal + (chosenShipping ? chosenShipping.price : 0);

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const order = createOrder({
      customerName: customerName.trim() || "Treinador Manaus",
      customerWhatsapp,
      cep,
      neighborhood,
      city: manaus ? "Manaus" : city,
      state: manaus ? "AM" : state,
      deliveryMethod: chosenShipping.method as ManausDeliveryMethod,
      manausMeetingPoint:
        chosenShipping.method === "PONTO_ENCONTRO_MANAUS" ? meetingPoint : undefined,
      subtotal,
      shippingCost: chosenShipping.price,
      total,
      items: cart,
    });

    setCompletedOrder(order);
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-14">
        <div className="p-8 rounded-3xl bg-[#121722] border border-emerald-500/40 text-center space-y-5 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold">
            PEDIDO CONFIRMADO • {completedOrder.orderCode}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Obrigado, {completedOrder.customerName}!
          </h1>
          <p className="text-sm text-slate-300">
            Seu pedido já está registrado no painel logístico da{" "}
            <strong className="text-yellow-400">JefersonBRATCG (Manaus - AM)</strong>.
          </p>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left text-xs space-y-2">
            <p className="text-slate-400">
              Modalidade escolhida:{" "}
              <strong className="text-emerald-400">{completedOrder.deliveryMethod}</strong>
            </p>
            {completedOrder.manausMeetingPoint && (
              <p className="text-slate-400">
                Ponto de Encontro em Manaus:{" "}
                <strong className="text-yellow-300">{completedOrder.manausMeetingPoint}</strong>
              </p>
            )}
            <p className="text-slate-400">
              Total do Pedido:{" "}
              <strong className="text-white text-sm">
                R$ {completedOrder.total.toFixed(2).replace(".", ",")}
              </strong>
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-yellow-400 text-slate-950 font-black text-xs"
            >
              Voltar para a Loja
            </Link>
            <Link
              href="/admin"
              className="px-5 py-3 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
            >
              Ver Pedido no Painel Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
          <MapPin className="w-4 h-4" /> Checkout Facilitado Manaus - AM & Brasil
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Finalizar Compra & Logística de Entrega
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121722] border border-slate-800 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-base font-bold text-white">Seu carrinho está vazio</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-yellow-400 text-slate-950 font-black text-xs"
          >
            Explorar Cartas Avulsas e ETBs
          </Link>
        </div>
      ) : (
        <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Dados do Cliente e Opções de Entrega Manaus */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121722] border border-slate-800 space-y-4">
              <h2 className="text-base font-extrabold text-white">1. Dados do Colecionador</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nome Completo *</label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Lucas Oliveira"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    WhatsApp (p/ combinar entrega/rastreio) *
                  </label>
                  <input
                    required
                    type="text"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder="(92) 99123-4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Bloco Logístico Manaus - AM vs Outras Regiões */}
            <div className="p-6 rounded-3xl bg-[#121722] border border-emerald-500/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  2. CEP & Modalidade de Entrega (Destaque Manaus - AM)
                </h2>
                {manaus && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                    ✓ Logística Local Manaus Ativa
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">CEP *</label>
                  <input
                    required
                    type="text"
                    value={cep}
                    onChange={(e) => {
                      setCep(e.target.value);
                      setSelectedMethodIndex(0);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Bairro *</label>
                  <input
                    required
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={manaus ? "Manaus / AM" : `${city} / ${state}`}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300"
                  />
                </div>
              </div>

              {manaus && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Selecione sua Zona em Manaus (para cálculo exato do Motoboy Expresso):
                  </label>
                  <select
                    value={zoneKey}
                    onChange={(e) => setZoneKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    {Object.entries(MANAUS_ZONES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.zone} — Motoboy R$ {v.motoboyPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Lista de Opções */}
              <div className="space-y-2.5 pt-2">
                {shippingOptions.map((opt, idx) => (
                  <label
                    key={idx}
                    onClick={() => setSelectedMethodIndex(idx)}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-4 cursor-pointer transition ${
                      selectedMethodIndex === idx
                        ? "bg-emerald-500/10 border-emerald-400"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={selectedMethodIndex === idx}
                        onChange={() => setSelectedMethodIndex(idx)}
                        className="mt-1 accent-yellow-400"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-white block">{opt.label}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {opt.subtitle}
                        </span>
                        <span className="text-[11px] text-cyan-300 font-semibold block mt-0.5">
                          Prazo estimado: {opt.eta}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-400 shrink-0">
                      {opt.price === 0 ? "GRÁTIS" : `R$ ${opt.price.toFixed(2).replace(".", ",")}`}
                    </span>
                  </label>
                ))}
              </div>

              {/* Seletor de Ponto de Encontro em Manaus */}
              {chosenShipping?.method === "PONTO_ENCONTRO_MANAUS" && (
                <div className="p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 space-y-2">
                  <label className="text-xs font-extrabold text-yellow-300 block">
                    📍 Escolha o Ponto de Encontro Seguro em Manaus:
                  </label>
                  <select
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-yellow-400/40 text-xs text-white"
                  >
                    {MANAUS_MEETING_POINTS.map((mp) => (
                      <option key={mp} value={mp}>
                        {mp}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121722] border border-slate-800 space-y-4">
              <h2 className="text-base font-extrabold text-white">Resumo do Pedido</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-10 h-14 object-contain rounded bg-slate-950 p-0.5"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{product.title}</p>
                        <p className="text-[11px] text-slate-400">
                          Qtd: {quantity} • {product.condition}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-yellow-400 shrink-0">
                      R$ {(product.price * quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({cart.length} itens):</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frete / Entrega Manaus:</span>
                  <span className="text-emerald-400 font-bold">
                    {chosenShipping?.price === 0
                      ? "GRÁTIS"
                      : `R$ ${chosenShipping?.price.toFixed(2).replace(".", ",")}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total:</span>
                  <span className="text-yellow-400">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm transition shadow-lg shadow-yellow-400/20"
              >
                Confirmar Pedido & Agendar Entrega
              </button>

              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Compra 100% protegida • JefersonBRATCG Manaus/AM
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
