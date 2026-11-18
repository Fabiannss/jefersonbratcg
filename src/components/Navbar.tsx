"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Gavel,
  Home,
  MapPin,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const { cart, user, searchQuery, setSearchQuery, removeFromCart, updateCartQty } = useStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <>
      {/* Topbar Logística Exclusiva Manaus - AM (Responsiva Mobile-First) */}
      <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/20 border-b border-yellow-500/30 text-[11px] sm:text-xs text-slate-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 font-medium">
            <span className="inline-flex items-center gap-1 bg-yellow-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
              <MapPin className="w-3 h-3" /> MANAUS - AM
            </span>
            <span className="text-slate-200 leading-snug">
              Entrega em Manaus:{" "}
              <strong className="text-yellow-300">Motoboy 2h</strong>,{" "}
              <strong className="text-emerald-300">Pontos de Encontro Grátis</strong> ou{" "}
              <strong className="text-cyan-300">Retirada Local</strong>!
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-300 shrink-0">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-cyan-400" /> Envio Blindado Correios p/ todo o Brasil
            </span>
            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> 100% Exclusivo Pokémon TCG
            </span>
          </div>
        </div>
      </div>

      {/* Header Principal Estilo Kanto Nerd Dark Gamer */}
      <header className="sticky top-0 z-40 bg-[#090B10]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Botão Menu Mobile + Logo JefersonBRATCG */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-yellow-400"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-red-600 p-0.5 shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-base sm:text-lg tracking-tighter text-yellow-400">
                  JB
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Jeferson<span className="text-yellow-400">BRA</span>TCG
                  </span>
                  <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    PKMN ONLY
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-none">
                  Singles • ETBs Seladas • Leilões • Manaus/AM
                </p>
              </div>
            </Link>
          </div>

          {/* Barra de Busca Central (Full-width no mobile, centralizada no desktop) */}
          <div className="w-full lg:flex-1 lg:max-w-xl lg:mx-auto order-3 lg:order-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar carta (ex: Pikachu SIR, Charizard) ou ETB..."
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-yellow-400 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Ações Rápidas: Links, Perfil & Carrinho */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0 order-2 lg:order-3">
            <Link
              href="/leiloes"
              className={`hidden sm:flex px-3.5 py-2.5 rounded-xl text-xs font-bold items-center gap-1.5 transition border ${
                pathname?.startsWith("/leiloes")
                  ? "bg-red-500/20 text-red-300 border-red-500/50"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
              }`}
            >
              <Gavel className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Leilões Ao Vivo</span>
            </Link>

            <ThemeToggle />

            <Link
              href="/admin"
              className={`hidden sm:flex px-3 py-2.5 rounded-xl text-xs font-semibold items-center gap-1.5 border transition ${
                user.role === "ADMIN"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-800"
              }`}
              title="Área Restrita do Administrador (/admin)"
            >
              {user.role === "ADMIN" ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="hidden lg:inline">Admin</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="hidden lg:inline">Admin</span>
                </>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative hidden sm:flex px-3 sm:px-3.5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs items-center gap-1.5 sm:gap-2 transition shadow-md shadow-yellow-400/10"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Carrinho</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-yellow-400 text-[11px] font-black">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        {/* Sub-Header de Categorias Permitidas (Scroll horizontal suave em telas menores) */}
        <div className="border-t border-slate-800/60 bg-slate-950/60">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar text-xs font-semibold text-slate-300">
            <Link href="/" className="hover:text-yellow-400 flex items-center gap-1.5 whitespace-nowrap py-0.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" /> Destaques & Catálogo
            </Link>
            <Link
              href="/#catalogo"
              className="hover:text-yellow-400 flex items-center gap-1.5 whitespace-nowrap py-0.5"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" /> 1. Cartas Avulsas (Singles)
            </Link>
            <Link
              href="/#etbs"
              className="hover:text-yellow-400 flex items-center gap-1.5 whitespace-nowrap py-0.5"
            >
              <Package className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> 2. ETBs Seladas
            </Link>
            <Link
              href="/leiloes"
              className="hover:text-red-400 text-red-300 flex items-center gap-1.5 whitespace-nowrap py-0.5"
            >
              <Gavel className="w-3.5 h-3.5 text-red-400 shrink-0" /> 3. Leilões (Tempo Real)
            </Link>
          </div>
        </div>

        {/* Menu Dropdown Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0E131F] border-b border-slate-800 px-4 py-4 space-y-2.5">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 text-xs font-bold text-white"
            >
              <Home className="w-4 h-4 text-yellow-400" /> Início & Catálogo Geral
            </Link>
            <Link
              href="/leiloes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-bold text-red-200"
            >
              <Gavel className="w-4 h-4 text-red-400" /> Sala de Leilões em Tempo Real
            </Link>
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-200"
            >
              <MapPin className="w-4 h-4 text-emerald-400" /> Checkout & Entrega Manaus - AM
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-200"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Painel Administrativo (/admin)
            </Link>
          </div>
        )}
      </header>

      {/* Barra de Navegação Inferior Fixa para Smartphones (Mobile-First UX) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090B10]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 grid grid-cols-4 gap-1 text-[10px] font-bold">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl ${
            pathname === "/" ? "text-yellow-400 bg-yellow-400/10" : "text-slate-400"
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>Catálogo</span>
        </Link>
        <Link
          href="/leiloes"
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl ${
            pathname?.startsWith("/leiloes") ? "text-red-400 bg-red-500/10" : "text-slate-400"
          }`}
        >
          <Gavel className="w-4 h-4 mb-0.5" />
          <span>Leilões</span>
        </Link>
        <button
          onClick={() => setCartOpen(true)}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-400 relative"
        >
          <ShoppingBag className="w-4 h-4 mb-0.5 text-emerald-400" />
          <span>Carrinho ({totalItems})</span>
        </button>
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl ${
            pathname?.startsWith("/admin") ? "text-purple-400 bg-purple-500/10" : "text-slate-400"
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          <span>Admin</span>
        </Link>
      </nav>

      {/* Drawer Lateral do Carrinho + Simulador Rápido Manaus */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-[#111622] border-l border-slate-800 h-full flex flex-col justify-between p-4 sm:p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">Seu Deck / Carrinho</h3>
                  <p className="text-xs text-slate-400">
                    Origem: Manaus - AM • Envio imediato ou retirada
                  </p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-300 font-semibold">Seu carrinho está vazio</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Adicione Cartas Avulsas (Singles) ou ETBs Seladas de Pokémon TCG.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-14 h-20 object-contain rounded bg-slate-950 p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{product.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {product.condition} • {product.rarity}
                        </p>
                        <p className="text-sm font-extrabold text-yellow-400 mt-1">
                          R$ {(product.price * quantity).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden text-xs">
                          <button
                            onClick={() => updateCartQty(product.id, quantity - 1)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-white font-bold">{quantity}</span>
                          <button
                            onClick={() => updateCartQty(product.id, quantity + 1)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                  <strong className="block text-emerald-300">
                    📍 Logística Manaus - AM Disponível:
                  </strong>
                  Ponto de encontro GRÁTIS nos shoppings de Manaus ou Motoboy Expresso em até 2h!
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="text-xl font-black text-yellow-400">
                    R$ {subtotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="block w-full py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-center text-sm transition"
                >
                  Finalizar Compra / Escolher Entrega Manaus
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
