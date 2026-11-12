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
import { DELIVERY_LABELS, formatBRL } from "@/lib/format";
import { ManausDeliveryMethod, Order } from "@/types";

/** Máscara de CEP: 69057070 -> 69057-070 */
function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

/** Máscara de telefone brasileiro: 92991234567 -> (92) 99123-4567 */
function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function CheckoutPage() {
  const { cart, user, createOrder } = useStore();

  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("(92) 9");
  const [cep, setCep] = useState("69057-070");
  const [zoneKey, setZoneKey] = useState("centro-sul");
  const [neighborhood, setNeighborhood] = useState("Adrianópolis");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [meetingPoint, setMeetingPoint] = useState(MANAUS_MEETING_POINTS[0]);
  const [formError, setFormError] = useState("");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const manaus = isManausCep(cep);
  const cepComplete = cep.replace(/\D/g, "").length === 8;
  const shippingOptions = calculateShippingOptions(cep, zoneKey);
  const chosenShipping = shippingOptions[selectedMethodIndex] || shippingOptions[0];

  const totalUnits = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal + (chosenShipping ? chosenShipping.price : 0);

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !chosenShipping) return;

    if (customerWhatsapp.replace(/\D/g, "").length < 10) {
      setFormError("Informe um WhatsApp válido com DDD para combinarmos a entrega.");
      return;
    }
    if (!cepComplete) {
      setFormError("Informe o CEP completo (8 dígitos) para calcular a entrega.");
      return;
    }
    setFormError("");

    const order = createOrder({
      customerName: customerName.trim() || "Treinador Manaus",
      customerWhatsapp,
      cep,
      neighborhood,
      city: manaus ? "Manaus" : city.trim(),
      state: manaus ? "AM" : state.trim().toUpperCase(),
      deliveryMethod: chosenShipping.method as ManausDeliveryMethod,
      manausMeetingPoint:
        chosenShipping.method === "PONTO_ENCONTRO_MANAUS" ? meetingPoint : undefined,
      subtotal,
      shippingCost: chosenShipping.price,
      total,
      items: cart,
    });

    setCompletedOrder(order);
    window.scrollTo({ top: 0 });
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-14">
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-tcg-surface border border-emerald-500/40 text-center space-y-5 shadow-2xl">
          <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400 mx-auto" />
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold">
            PEDIDO CONFIRMADO • {completedOrder.orderCode}
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-white break-words">
            Obrigado, {completedOrder.customerName}!
          </h1>
          <p className="text-sm text-slate-300">
            Seu pedido foi registrado na{" "}
            <strong className="text-yellow-400">JefersonBRATCG (Manaus - AM)</strong>. Vamos chamar
            você no WhatsApp <strong className="text-white">{completedOrder.customerWhatsapp}</strong>{" "}
            para combinar a entrega.
          </p>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left text-xs space-y-2">
            <p className="text-slate-400">
              Código do pedido:{" "}
              <strong className="text-yellow-300">{completedOrder.orderCode}</strong>
            </p>
            <p className="text-slate-400">
              Entrega:{" "}
              <strong className="text-emerald-400">
                {DELIVERY_LABELS[completedOrder.deliveryMethod]}
              </strong>
            </p>
            {completedOrder.manausMeetingPoint && (
              <p className="text-slate-400">
                Ponto de encontro:{" "}
                <strong className="text-yellow-300">{completedOrder.manausMeetingPoint}</strong>
              </p>
            )}
            <ul className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
              {completedOrder.items.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {quantity}x {product.title}
                  </span>
                  <span className="shrink-0">{formatBRL(product.price * quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="flex justify-between gap-3 text-slate-400">
              <span>Entrega</span>
              <span>
                {completedOrder.shippingCost === 0
                  ? "GRÁTIS"
                  : formatBRL(completedOrder.shippingCost)}
              </span>
            </p>
            <p className="flex justify-between gap-3 pt-2 border-t border-slate-800 text-slate-300">
              <span>Total do pedido</span>
              <strong className="text-white text-sm">{formatBRL(completedOrder.total)}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3 pt-2">
            <Link
              href="/"
              className="px-6 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs"
            >
              Voltar para a loja
            </Link>
            <Link
              href="/leiloes"
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Ver leilões ao vivo
            </Link>
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-5 py-3.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 font-bold text-xs"
              >
                Ver pedido no painel
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-8">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 shrink-0" /> Checkout Manaus - AM & Brasil
        </span>
        <h1 className="text-xl sm:text-3xl font-black text-white mt-1">
          Finalizar compra e escolher entrega
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-tcg-surface border border-slate-800 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-base font-bold text-white">Seu carrinho está vazio</p>
          <Link
            href="/#catalogo"
            className="inline-block px-6 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs"
          >
            Explorar Cartas Avulsas e ETBs
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleConfirmOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8"
        >
          {/* Dados do Cliente e Opções de Entrega Manaus */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="tcg-panel space-y-4">
              <h2 className="text-base font-extrabold text-white">1. Seus dados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ck-name" className="tcg-label">
                    Nome completo *
                  </label>
                  <input
                    id="ck-name"
                    required
                    type="text"
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Lucas Oliveira"
                    className="tcg-input"
                  />
                </div>
                <div>
                  <label htmlFor="ck-whats" className="tcg-label">
                    WhatsApp (para combinar a entrega) *
                  </label>
                  <input
                    id="ck-whats"
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(maskPhone(e.target.value))}
                    placeholder="(92) 99123-4567"
                    className="tcg-input"
                  />
                </div>
              </div>
            </div>

            {/* Bloco Logístico Manaus - AM vs Outras Regiões */}
            <div className="tcg-panel border-emerald-500/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
                  2. Endereço e entrega
                </h2>
                {manaus && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                    ✓ CEP de Manaus: entrega local liberada
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3">
                  <label htmlFor="ck-cep" className="tcg-label">
                    CEP *
                  </label>
                  <input
                    id="ck-cep"
                    required
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={9}
                    value={cep}
                    onChange={(e) => {
                      setCep(maskCep(e.target.value));
                      setSelectedMethodIndex(0);
                    }}
                    placeholder="69057-070"
                    className="tcg-input font-mono text-yellow-400"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label htmlFor="ck-bairro" className="tcg-label">
                    Bairro *
                  </label>
                  <input
                    id="ck-bairro"
                    required
                    type="text"
                    autoComplete="address-level3"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="tcg-input"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="ck-city" className="tcg-label">
                    Cidade {manaus ? "" : "*"}
                  </label>
                  <input
                    id="ck-city"
                    type="text"
                    autoComplete="address-level2"
                    required={!manaus}
                    disabled={manaus}
                    value={manaus ? "Manaus" : city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sua cidade"
                    className="tcg-input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="ck-uf" className="tcg-label">
                    UF {manaus ? "" : "*"}
                  </label>
                  <input
                    id="ck-uf"
                    type="text"
                    autoComplete="address-level1"
                    maxLength={2}
                    required={!manaus}
                    disabled={manaus}
                    value={manaus ? "AM" : state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="tcg-input uppercase"
                  />
                </div>
              </div>

              {!cepComplete && (
                <p className="text-[11px] text-amber-300 font-semibold">
                  Digite o CEP completo para ver as opções de entrega do seu endereço.
                </p>
              )}

              {manaus && (
                <div>
                  <label htmlFor="ck-zone" className="tcg-label">
                    Sua zona em Manaus (define o valor do Motoboy Expresso)
                  </label>
                  <select
                    id="ck-zone"
                    value={zoneKey}
                    onChange={(e) => setZoneKey(e.target.value)}
                    className="tcg-input"
                  >
                    {Object.entries(MANAUS_ZONES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.zone} — Motoboy {formatBRL(v.motoboyPrice)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Lista de Opções */}
              <fieldset className="space-y-2.5 pt-1">
                <legend className="tcg-label">Como você quer receber?</legend>
                {shippingOptions.map((opt, idx) => (
                  <label
                    key={`${opt.method}-${idx}`}
                    className={`p-3.5 sm:p-4 rounded-2xl border flex items-start justify-between gap-3 cursor-pointer transition ${
                      selectedMethodIndex === idx
                        ? "bg-emerald-500/10 border-emerald-400"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={selectedMethodIndex === idx}
                        onChange={() => setSelectedMethodIndex(idx)}
                        className="mt-0.5 w-4 h-4 shrink-0 accent-yellow-400"
                      />
                      <div className="min-w-0">
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
                      {opt.price === 0 ? "GRÁTIS" : formatBRL(opt.price)}
                    </span>
                  </label>
                ))}
              </fieldset>

              {/* Seletor de Ponto de Encontro em Manaus */}
              {chosenShipping?.method === "PONTO_ENCONTRO_MANAUS" && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 space-y-2">
                  <label htmlFor="ck-point" className="text-xs font-extrabold text-yellow-300 block">
                    📍 Escolha o ponto de encontro em Manaus:
                  </label>
                  <select
                    id="ck-point"
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    className="tcg-input bg-slate-950 border-yellow-400/40"
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

          {/* Resumo do Pedido (acompanha a rolagem no desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <div className="tcg-panel space-y-4">
              <h2 className="text-base font-extrabold text-white">Resumo do pedido</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={product.images[0]}
                        alt=""
                        loading="lazy"
                        className="w-10 h-14 shrink-0 object-contain rounded bg-slate-950 p-0.5"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white line-clamp-2">{product.title}</p>
                        <p className="text-[11px] text-slate-400">
                          Qtd: {quantity} • {product.condition === "SEALED" ? "Lacrado" : product.condition}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-yellow-400 shrink-0">
                      {formatBRL(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between gap-3 text-slate-400">
                  <span>
                    Subtotal ({totalUnits} {totalUnits === 1 ? "item" : "itens"}):
                  </span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-3 text-slate-400">
                  <span className="min-w-0">Entrega{chosenShipping ? ` (${DELIVERY_LABELS[chosenShipping.method]})` : ""}:</span>
                  <span className="text-emerald-400 font-bold shrink-0">
                    {!chosenShipping
                      ? "—"
                      : chosenShipping.price === 0
                      ? "GRÁTIS"
                      : formatBRL(chosenShipping.price)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total:</span>
                  <span className="text-yellow-400">{formatBRL(total)}</span>
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-300 font-bold"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm transition shadow-lg shadow-yellow-400/20"
              >
                Confirmar pedido • {formatBRL(total)}
              </button>

              <div className="flex flex-col items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  Compra 100% protegida • JefersonBRATCG Manaus/AM
                </span>
                <Link href="/#catalogo" className="underline hover:text-white py-1">
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
