"use client";

import React, { useState } from "react";
import {
  Edit3,
  Gavel,
  ImagePlus,
  Lock,
  LogOut,
  MapPin,
  Package,
  PlusCircle,
  ShieldCheck,
  Trash2,
  Truck,
  Video,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ProductImporter } from "@/components/ProductImporter";
import { uploadProductMedia } from "@/lib/supabase";
import {
  CardCondition,
  OrderStatus,
  Product,
  ProductCategory,
  RarityTier,
} from "@/types";

export default function AdminDashboardPage() {
  const {
    user,
    loginAsAdmin,
    logoutToCustomer,
    products,
    upsertProduct,
    deleteProduct,
    auctions,
    createAuction,
    endAuctionNow,
    orders,
    updateOrderStatus,
  } = useStore();

  // Estados de Login Admin
  const [email, setEmail] = useState("admin@jefersonbratcg.com.br");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Abas do Painel Admin
  const [activeTab, setActiveTab] = useState<"CATALOG" | "AUCTIONS" | "ORDERS">("CATALOG");

  // Estados do Formulário CRUD de Produto (Cartas Avulsas & ETBs)
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ProductCategory>("SINGLE");
  const [setName, setSetName] = useState("Escarlate e Violeta: Fagulhas Impetuosas (SV08)");
  const [cardNumber, setCardNumber] = useState("");
  const [rarity, setRarity] = useState<RarityTier>("RARA");
  const [rarityDetail, setRarityDetail] = useState("Special Illustration Rare (SIR)");
  const [condition, setCondition] = useState<CardCondition>("NM");
  const [language, setLanguage] = useState<"PT-BR" | "EN" | "JP">("PT-BR");
  const [price, setPrice] = useState("299.90");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [imagesText, setImagesText] = useState("https://images.pokemontcg.io/sv8/238_hires.png");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPromo, setIsPromo] = useState(false);
  const [formFeedback, setFormFeedback] = useState("");

  // Estados do Formulário de Novo Leilão
  const [auctionProductId, setAuctionProductId] = useState(products[0]?.id || "");
  const [startingBid, setStartingBid] = useState("250.00");
  const [minIncrement, setMinIncrement] = useState("10.00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [auctionFeedback, setAuctionFeedback] = useState("");

  // Rota Protegida (/admin) — Bloqueia usuários comuns
  if (user.role !== "ADMIN") {
    const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const ok = loginAsAdmin(email, password);
      if (!ok) {
        setLoginError("Credenciais inválidas. Use admin@jefersonbratcg.com.br e senha admin123");
      } else {
        setLoginError("");
      }
    };

    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="p-8 rounded-3xl bg-[#121722] border border-purple-500/40 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400">
                Rota Protegida (/admin)
              </span>
              <h1 className="text-xl font-black text-white">Acesso Restrito ao Administrador</h1>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Usuários comuns possuem permissão exclusiva para visualização do catálogo, filtros, lances em
            leilões e compra. Faça login como administrador da <strong>JefersonBRATCG</strong> para
            acessar as ferramentas editoriais.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">E-mail do Admin</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Senha Administrativa (Demo: <code className="text-yellow-400">admin123</code>)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite admin123"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-300 font-bold">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs transition"
            >
              Entrar no Painel Administrativo
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Funções auxiliares de edição de produto
  const loadProductForEdit = (p: Product) => {
    setEditingId(p.id);
    setTitle(p.title);
    setCategory(p.category);
    setSetName(p.setName);
    setCardNumber(p.cardNumber || "");
    setRarity(p.rarity);
    setRarityDetail(p.rarityDetail);
    setCondition(p.condition);
    setLanguage(p.language);
    setPrice(String(p.price));
    setStock(String(p.stock));
    setDescription(p.description);
    setImagesText(p.images.join("\n"));
    setVideoUrl(p.videoUrl || "");
    setIsPromo(p.isPromo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetProductForm = () => {
    setEditingId(undefined);
    setTitle("");
    setCardNumber("");
    setPrice("199.90");
    setStock("1");
    setDescription("");
    setImagesText("https://images.pokemontcg.io/sv8/238_hires.png");
    setVideoUrl("");
    setIsPromo(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const images = imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    upsertProduct({
      id: editingId,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      setName,
      cardNumber: category === "SINGLE" ? cardNumber : undefined,
      rarity,
      rarityDetail,
      condition: category === "ETB" ? "SEALED" : condition,
      language,
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 1,
      description,
      images: images.length > 0 ? images : ["https://images.pokemontcg.io/sv8/238_hires.png"],
      videoUrl: videoUrl.trim() || undefined,
      isPromo,
      isFeatured: true,
    });

    setFormFeedback(editingId ? "Produto atualizado com sucesso!" : "Novo item adicionado ao catálogo!");
    resetProductForm();
    setTimeout(() => setFormFeedback(""), 3500);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mediaType: "IMAGE" | "VIDEO"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mediaType === "IMAGE") {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadProductMedia(file, "cards-hi-res");
        urls.push(url);
      }
      setImagesText((prev) => (prev ? `${prev}\n${urls.join("\n")}` : urls.join("\n")));
    } else {
      const url = await uploadProductMedia(files[0], "holo-videos");
      setVideoUrl(url);
    }
  };

  const handleCreateAuction = (e: React.FormEvent) => {
    e.preventDefault();
    const endsAt = new Date(Date.now() + (parseInt(durationMinutes, 10) || 60) * 60000).toISOString();
    const res = createAuction({
      productId: auctionProductId,
      startingBid: parseFloat(startingBid) || 100,
      minIncrement: parseFloat(minIncrement) || 5,
      endsAt,
    });
    setAuctionFeedback(res.message);
    setTimeout(() => setAuctionFeedback(""), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Topbar do Painel Admin */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/30 via-[#121722] to-slate-900 border border-purple-500/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Painel Administrativo • JefersonBRATCG (Manaus - AM)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Gestão de Catálogo, Leilões em Tempo Real & Logística
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab("CATALOG")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === "CATALOG" ? "bg-yellow-400 text-slate-950" : "text-slate-300"
              }`}
            >
              1. Catálogo ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("AUCTIONS")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === "AUCTIONS" ? "bg-red-500 text-white" : "text-slate-300"
              }`}
            >
              2. Leilões ({auctions.length})
            </button>
            <button
              onClick={() => setActiveTab("ORDERS")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === "ORDERS" ? "bg-emerald-500 text-slate-950" : "text-slate-300"
              }`}
            >
              3. Pedidos Manaus ({orders.length})
            </button>
          </div>

          <button
            onClick={logoutToCustomer}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </div>

      {/* ABA 1: GESTÃO DE CATÁLOGO (CRUD COMPLETO DE SINGLES E ETBs + FOTOS HI-RES + VÍDEO HOLOGRAFIA) */}
      {activeTab === "CATALOG" && (
        <div className="space-y-8">
        <ProductImporter />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulário de Inserção / Edição */}
          <form
            onSubmit={handleSaveProduct}
            className="lg:col-span-5 p-6 rounded-3xl bg-[#121722] border border-slate-800 space-y-4 self-start"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-yellow-400" />
                {editingId ? "Editando Produto" : "Cadastrar Nova Carta ou ETB"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Título da Carta Avulsa ou ETB *
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Rayquaza VMAX (218/203) Alt Art Secret"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Categoria Permitida *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="SINGLE">1. Carta Avulsa (Single)</option>
                  <option value="ETB">2. ETB (Elite Trainer Box) Selado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nível de Raridade (3 Níveis) *
                </label>
                <select
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value as RarityTier)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="BASICA">Básica (Comum/Incomum/Rara)</option>
                  <option value="MEDIA">Média (Holo/Reverse/Ultra Reg.)</option>
                  <option value="RARA">Rara (Secreta/SIR/Alt Art/Gold)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Coleção / Set *</label>
                <input
                  required
                  type="text"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Numeração (se Carta)
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Ex: 238/191"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Condição *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as CardCondition)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="NM">Near Mint (NM)</option>
                  <option value="LP">Lightly Played (LP)</option>
                  <option value="MP">Moderately Played (MP)</option>
                  <option value="HP">Heavily Played (HP)</option>
                  <option value="SEALED">Lacrado (SEALED)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Preço (R$) *</label>
                <input
                  required
                  type="number"
                  step="0.10"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-yellow-400 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Estoque *</label>
                <input
                  required
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            {/* Múltiplas Fotos em Alta Resolução */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <ImagePlus className="w-3.5 h-3.5 text-yellow-400" />
                  Fotos Hi-Res (1 URL por linha ou Upload Múltiplo)
                </label>
                <label className="text-[11px] font-bold text-yellow-400 hover:underline cursor-pointer">
                  + Upload Fotos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, "IMAGE")}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                rows={3}
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
              />
            </div>

            {/* Vídeo Curto de Demonstração da Holografia / Estado */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  Vídeo de Holografia / Estado da Carta (URL ou Upload MP4)
                </label>
                <label className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer">
                  + Upload Vídeo
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, "VIDEO")}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://.../video-holografia.mp4"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Descrição de Conservação / Centralização
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva bordas, textura, centralização e conteúdo..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            {formFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
                {formFeedback}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition"
            >
              {editingId ? "Salvar Alterações no Produto" : "Publicar no Catálogo"}
            </button>
          </form>

          {/* Tabela de Produtos Cadastrados */}
          <div className="lg:col-span-7 space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#121722] border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-14 h-20 object-contain rounded-lg bg-slate-950 p-1 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-yellow-400">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        {p.rarity}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {p.condition}
                      </span>
                      {p.videoUrl && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          Vídeo Holo ✓
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-extrabold text-white truncate mt-1">{p.title}</h3>
                    <p className="text-xs text-slate-400">
                      R$ {p.price.toFixed(2).replace(".", ",")} • Estoque: {p.stock} un. •{" "}
                      {p.images.length} foto(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => loadProductForEdit(p)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Editar produto"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300"
                    title="Remover produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}

      {/* ABA 2: GESTÃO DO MÓDULO DE LEILÃO EM TEMPO REAL */}
      {activeTab === "AUCTIONS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleCreateAuction}
            className="lg:col-span-5 p-6 rounded-3xl bg-[#121722] border border-red-500/30 space-y-4 self-start"
          >
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-red-400" />
              Iniciar Novo Leilão Pokémon TCG
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Selecione a Carta ou ETB do Catálogo *
              </label>
              <select
                value={auctionProductId}
                onChange={(e) => setAuctionProductId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (Tabela: R$ {p.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Lance Inicial (R$)
                </label>
                <input
                  type="number"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-yellow-400 font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Incremento Mín (R$)
                </label>
                <input
                  type="number"
                  value={minIncrement}
                  onChange={(e) => setMinIncrement(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Duração (Minutos)
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            {auctionFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
                {auctionFeedback}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-slate-950 font-black text-xs"
            >
              Publicar Leilão em Tempo Real
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            {auctions.map((auc) => (
              <div
                key={auc.id}
                className="p-5 rounded-2xl bg-[#121722] border border-slate-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        auc.status === "ACTIVE"
                          ? "bg-red-500/20 text-red-300 border border-red-500/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {auc.status}
                    </span>
                    <h3 className="text-sm font-extrabold text-white mt-1">{auc.product.title}</h3>
                  </div>

                  {auc.status === "ACTIVE" && (
                    <button
                      onClick={() => endAuctionNow(auc.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-300"
                    >
                      Encerrar e Definir Vencedor Agora
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/90 text-xs">
                  <div>
                    <span className="text-slate-400 block">Lance Inicial:</span>
                    <strong className="text-white">R$ {auc.startingBid.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lance Atual ({auc.bidsCount}):</span>
                    <strong className="text-yellow-400 text-sm">
                      R$ {auc.currentBid.toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Líder / Vencedor:</span>
                    <strong className="text-emerald-400">{auc.winnerName || "Sem lances"}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: GERENCIAMENTO DE PEDIDOS E LOGÍSTICA MANAUS */}
      {activeTab === "ORDERS" && (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-5 rounded-2xl bg-[#121722] border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-yellow-400 text-slate-950 font-black text-xs">
                    {ord.orderCode}
                  </span>
                  <span className="text-sm font-extrabold text-white">{ord.customerName}</span>
                  <span className="text-xs text-slate-400">• WhatsApp: {ord.customerWhatsapp}</span>
                </div>

                <p className="text-xs text-emerald-300 flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  Modalidade: {ord.deliveryMethod} — {ord.neighborhood} ({ord.city}/{ord.state} • CEP{" "}
                  {ord.cep})
                </p>

                {ord.manausMeetingPoint && (
                  <p className="text-xs text-yellow-300 font-bold">
                    📍 Ponto de Encontro em Manaus: {ord.manausMeetingPoint}
                  </p>
                )}

                <p className="text-xs text-slate-400">
                  Itens:{" "}
                  {ord.items.map((i) => `${i.quantity}x ${i.product.title}`).join(" | ")} —{" "}
                  <strong className="text-white">
                    Total: R$ {ord.total.toFixed(2).replace(".", ",")}
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Truck className="w-4 h-4 text-cyan-400" />
                <select
                  value={ord.status}
                  onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                >
                  <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
                  <option value="PAGO">Pago (Em Separação Manaus)</option>
                  <option value="AGUARDANDO_PONTO_ENCONTRO">
                    Aguardando Ponto de Encontro (Shopping Manaus)
                  </option>
                  <option value="EM_ROTA_MANAUS">Saiu para Entrega (Motoboy Manaus)</option>
                  <option value="POSTADO_CORREIOS">Postado nos Correios (Nacional)</option>
                  <option value="ENTREGUE">Entregue ao Colecionador ✓</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
