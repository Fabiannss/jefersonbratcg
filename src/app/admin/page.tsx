"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Edit3,
  Gavel,
  ImagePlus,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  PlusCircle,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  Video,
  X,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { uploadProductMedia } from "@/lib/supabase";
import {
  AUCTION_STATUS_LABELS,
  CATEGORY_LABELS,
  DELIVERY_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  RARITY_LABELS,
  formatBRL,
  whatsappLink,
} from "@/lib/format";
import {
  CardCondition,
  OrderStatus,
  Product,
  ProductCategory,
  RarityTier,
} from "@/types";

type AdminTab = "CATALOG" | "AUCTIONS" | "ORDERS";

const DEFAULT_IMAGE = "https://images.pokemontcg.io/sv8/238_hires.png";
const ORDER_STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
const OPEN_ORDER_STATUSES: OrderStatus[] = [
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "AGUARDANDO_PONTO_ENCONTRO",
  "EM_ROTA_MANAUS",
  "POSTADO_CORREIOS",
];

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
  const [activeTab, setActiveTab] = useState<AdminTab>("CATALOG");

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
  const [imagesText, setImagesText] = useState(DEFAULT_IMAGE);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPromo, setIsPromo] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Lista do catálogo: busca rápida e confirmação em 2 toques para ações destrutivas
  const [productSearch, setProductSearch] = useState("");
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  // Estados do Formulário de Novo Leilão
  const [auctionProductId, setAuctionProductId] = useState(products[0]?.id || "");
  const [startingBid, setStartingBid] = useState("250.00");
  const [minIncrement, setMinIncrement] = useState("10.00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [auctionFeedback, setAuctionFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  // Filtro de pedidos por status
  const [orderFilter, setOrderFilter] = useState<"ALL" | "OPEN" | OrderStatus>("OPEN");

  const visibleProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.setName.toLowerCase().includes(q) ||
        (p.cardNumber || "").toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const openOrders = useMemo(
    () => orders.filter((o) => OPEN_ORDER_STATUSES.includes(o.status)),
    [orders]
  );

  const visibleOrders = useMemo(() => {
    if (orderFilter === "ALL") return orders;
    if (orderFilter === "OPEN") return openOrders;
    return orders.filter((o) => o.status === orderFilter);
  }, [orders, openOrders, orderFilter]);

  const activeAuctionsCount = auctions.filter((a) => a.status === "ACTIVE").length;
  const soldOutCount = products.filter((p) => p.stock <= 0).length;
  const revenue = orders
    .filter((o) => o.status !== "CANCELADO" && o.status !== "AGUARDANDO_PAGAMENTO")
    .reduce((acc, o) => acc + o.total, 0);

  // Rota Protegida (/admin) — Bloqueia usuários comuns
  if (user.role !== "ADMIN") {
    const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const ok = loginAsAdmin(email.trim(), password);
      if (!ok) {
        setLoginError("Credenciais inválidas. Use admin@jefersonbratcg.com.br e senha admin123");
      } else {
        setLoginError("");
      }
    };

    return (
      <div className="max-w-md mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-tcg-surface border border-purple-500/40 shadow-2xl space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400">
                Área restrita
              </span>
              <h1 className="text-lg sm:text-xl font-black text-white">Acesso do Administrador</h1>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Clientes navegam pelo catálogo, dão lances e compram sem precisar de login. Entre como
            administrador da <strong>JefersonBRATCG</strong> para gerenciar catálogo, leilões e
            pedidos.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label htmlFor="adm-email" className="tcg-label">
                E-mail do admin
              </label>
              <input
                id="adm-email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="tcg-input"
              />
            </div>

            <div>
              <label htmlFor="adm-pass" className="tcg-label">
                Senha (demo: <code className="text-yellow-400">admin123</code>)
              </label>
              <input
                id="adm-pass"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite admin123"
                className="tcg-input"
              />
            </div>

            {loginError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-300 font-bold"
              >
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs transition"
            >
              Entrar no painel administrativo
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
    setFormFeedback(null);
    setConfirmKey(null);
    document.getElementById("admin-product-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const resetProductForm = () => {
    setEditingId(undefined);
    setTitle("");
    setCardNumber("");
    setPrice("199.90");
    setStock("1");
    setDescription("");
    setImagesText(DEFAULT_IMAGE);
    setVideoUrl("");
    setIsPromo(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const images = imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedPrice = parseFloat(price.replace(",", "."));
    const parsedStock = parseInt(stock, 10);
    const existing = editingId ? products.find((p) => p.id === editingId) : undefined;

    upsertProduct({
      id: editingId,
      title: title.trim(),
      slug: title
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      category,
      setName: setName.trim(),
      cardNumber: category === "SINGLE" ? cardNumber.trim() || undefined : undefined,
      rarity,
      rarityDetail: rarityDetail.trim(),
      condition: category === "ETB" ? "SEALED" : condition,
      language,
      price: Number.isFinite(parsedPrice) ? Math.max(0, parsedPrice) : 0,
      // Estoque 0 é válido: o item aparece como "Esgotado" na loja
      stock: Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : 0,
      description,
      images: images.length > 0 ? images : [DEFAULT_IMAGE],
      videoUrl: videoUrl.trim() || undefined,
      isPromo,
      isFeatured: existing ? existing.isFeatured : true,
    });

    setFormFeedback({
      ok: true,
      text: editingId ? "Produto atualizado com sucesso!" : "Novo item adicionado ao catálogo!",
    });
    resetProductForm();
    setTimeout(() => setFormFeedback(null), 3500);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mediaType: "IMAGE" | "VIDEO"
  ) => {
    const input = e.target;
    const files = input.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setFormFeedback(null);
    try {
      if (mediaType === "IMAGE") {
        const urls: string[] = [];
        for (const file of Array.from(files)) {
          const url = await uploadProductMedia(file, "cards-hi-res");
          urls.push(url);
        }
        setImagesText((prev) => {
          const kept = prev.trim() === DEFAULT_IMAGE ? "" : prev.trim();
          return kept ? `${kept}\n${urls.join("\n")}` : urls.join("\n");
        });
      } else {
        const url = await uploadProductMedia(files[0], "holo-videos");
        setVideoUrl(url);
      }
    } catch (err) {
      setFormFeedback({
        ok: false,
        text: err instanceof Error ? err.message : "Não foi possível enviar o arquivo.",
      });
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  const handleCreateAuction = (e: React.FormEvent) => {
    e.preventDefault();
    const endsAt = new Date(Date.now() + (parseInt(durationMinutes, 10) || 60) * 60000).toISOString();
    const res = createAuction({
      productId: auctionProductId || products[0]?.id || "",
      startingBid: parseFloat(startingBid.replace(",", ".")) || 100,
      minIncrement: parseFloat(minIncrement.replace(",", ".")) || 5,
      endsAt,
    });
    setAuctionFeedback({ ok: res.ok, text: res.message });
    setTimeout(() => setAuctionFeedback(null), 4000);
  };

  const previewImages = imagesText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const tabs: { key: AdminTab; label: string; count: number; active: string }[] = [
    { key: "CATALOG", label: "Catálogo", count: products.length, active: "bg-yellow-400 text-slate-950" },
    { key: "AUCTIONS", label: "Leilões", count: auctions.length, active: "bg-red-500 text-white" },
    { key: "ORDERS", label: "Pedidos", count: openOrders.length, active: "bg-emerald-500 text-slate-950" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-8">
      {/* Topbar do Painel Admin */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-900/30 via-tcg-surface to-slate-900 border border-purple-500/40 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" /> Painel Administrativo • Manaus - AM
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-white mt-0.5">
              Catálogo, leilões e pedidos
            </h1>
          </div>
          <button
            onClick={logoutToCustomer}
            className="shrink-0 min-h-[42px] px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>

        {/* Resumo do dia: toque para ir direto à aba */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <button
            onClick={() => {
              setActiveTab("ORDERS");
              setOrderFilter("OPEN");
            }}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 text-left transition"
          >
            <span className="text-[11px] text-slate-400 block">Pedidos em aberto</span>
            <strong className="text-xl font-black text-emerald-400">{openOrders.length}</strong>
          </button>
          <button
            onClick={() => setActiveTab("AUCTIONS")}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-red-500/50 text-left transition"
          >
            <span className="text-[11px] text-slate-400 block">Leilões ao vivo</span>
            <strong className="text-xl font-black text-red-400">{activeAuctionsCount}</strong>
          </button>
          <button
            onClick={() => setActiveTab("CATALOG")}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 text-left transition"
          >
            <span className="text-[11px] text-slate-400 block">Produtos esgotados</span>
            <strong className="text-xl font-black text-amber-300">{soldOutCount}</strong>
          </button>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 min-w-0">
            <span className="text-[11px] text-slate-400 block">Faturamento (pagos)</span>
            <strong className="text-base sm:text-xl font-black text-yellow-400 block truncate">
              {formatBRL(revenue)}
            </strong>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Seções do painel"
          className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 lg:max-w-xl"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setConfirmKey(null);
              }}
              className={`min-h-[44px] px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition ${
                activeTab === tab.key ? tab.active : "text-slate-300 hover:text-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* ABA 1: GESTÃO DE CATÁLOGO (CRUD DE SINGLES E ETBs + FOTOS HI-RES + VÍDEO HOLOGRAFIA) */}
      {activeTab === "CATALOG" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">
          {/* Formulário de Inserção / Edição */}
          <form
            id="admin-product-form"
            onSubmit={handleSaveProduct}
            className={`lg:col-span-5 tcg-panel space-y-4 self-start scroll-mt-32 ${
              editingId ? "border-yellow-400/60" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                {editingId ? "Editando produto" : "Cadastrar carta ou ETB"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="shrink-0 text-xs text-slate-400 hover:text-white underline py-2"
                >
                  Cancelar edição
                </button>
              )}
            </div>

            <div>
              <label htmlFor="pf-title" className="tcg-label">
                Título da carta ou ETB *
              </label>
              <input
                id="pf-title"
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Rayquaza VMAX (218/203) Alt Art Secret"
                className="tcg-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="pf-category" className="tcg-label">
                  Categoria *
                </label>
                <select
                  id="pf-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="tcg-input"
                >
                  <option value="SINGLE">Carta Avulsa (Single)</option>
                  <option value="ETB">ETB (Elite Trainer Box) Selada</option>
                </select>
              </div>

              <div>
                <label htmlFor="pf-rarity" className="tcg-label">
                  Nível de raridade *
                </label>
                <select
                  id="pf-rarity"
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value as RarityTier)}
                  className="tcg-input"
                >
                  <option value="BASICA">Básica (Comum/Incomum/Rara)</option>
                  <option value="MEDIA">Média (Holo/Reverse/Ultra Reg.)</option>
                  <option value="RARA">Rara (Secreta/SIR/Alt Art/Gold)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="pf-set" className="tcg-label">
                  Coleção / Set *
                </label>
                <input
                  id="pf-set"
                  required
                  type="text"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  className="tcg-input"
                />
              </div>
              <div>
                <label htmlFor="pf-rarity-detail" className="tcg-label">
                  Detalhe da raridade
                </label>
                <input
                  id="pf-rarity-detail"
                  type="text"
                  value={rarityDetail}
                  onChange={(e) => setRarityDetail(e.target.value)}
                  placeholder="Ex: Special Illustration Rare (SIR)"
                  className="tcg-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pf-number" className="tcg-label">
                  Numeração
                </label>
                <input
                  id="pf-number"
                  type="text"
                  value={category === "ETB" ? "" : cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  disabled={category === "ETB"}
                  placeholder={category === "ETB" ? "Não se aplica" : "Ex: 238/191"}
                  className="tcg-input"
                />
              </div>
              <div>
                <label htmlFor="pf-language" className="tcg-label">
                  Idioma *
                </label>
                <select
                  id="pf-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "PT-BR" | "EN" | "JP")}
                  className="tcg-input"
                >
                  <option value="PT-BR">Português</option>
                  <option value="EN">Inglês</option>
                  <option value="JP">Japonês</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="pf-condition" className="tcg-label">
                  Condição *
                </label>
                <select
                  id="pf-condition"
                  value={category === "ETB" ? "SEALED" : condition}
                  onChange={(e) => setCondition(e.target.value as CardCondition)}
                  disabled={category === "ETB"}
                  className="tcg-input"
                >
                  <option value="NM">Near Mint (NM)</option>
                  <option value="LP">Lightly Played (LP)</option>
                  <option value="MP">Moderately Played (MP)</option>
                  <option value="HP">Heavily Played (HP)</option>
                  <option value="DAMAGED">Danificada</option>
                  <option value="SEALED">Lacrado</option>
                </select>
              </div>

              <div>
                <label htmlFor="pf-price" className="tcg-label">
                  Preço (R$) *
                </label>
                <input
                  id="pf-price"
                  required
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="tcg-input text-yellow-400 font-bold"
                />
              </div>

              <div>
                <label htmlFor="pf-stock" className="tcg-label">
                  Estoque *
                </label>
                <input
                  id="pf-stock"
                  required
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="tcg-input"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isPromo}
                onChange={(e) => setIsPromo(e.target.checked)}
                className="w-4 h-4 shrink-0 accent-yellow-400"
              />
              Marcar como promoção
            </label>

            {/* Múltiplas Fotos em Alta Resolução */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <label htmlFor="pf-images" className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <ImagePlus className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  Fotos (1 URL por linha)
                </label>
                <label className="text-[11px] font-bold text-yellow-400 hover:underline cursor-pointer py-1.5">
                  {uploading ? "Enviando…" : "+ Enviar fotos"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => handleFileUpload(e, "IMAGE")}
                    className="sr-only"
                  />
                </label>
              </div>
              <textarea
                id="pf-images"
                rows={3}
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                className="tcg-input text-slate-200 font-mono break-all"
              />
              {previewImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
                  {previewImages.map((src, i) => (
                    <img
                      key={`${src}-${i}`}
                      src={src}
                      alt={`Pré-visualização da foto ${i + 1}`}
                      loading="lazy"
                      className="w-12 h-16 shrink-0 object-contain rounded-lg bg-slate-950 border border-slate-800 p-0.5"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Vídeo Curto de Demonstração da Holografia / Estado */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <label htmlFor="pf-video" className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 shrink-0" />
                  Vídeo de holografia / estado (URL)
                </label>
                <label className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer py-1.5">
                  {uploading ? "Enviando…" : "+ Enviar vídeo"}
                  <input
                    type="file"
                    accept="video/*"
                    disabled={uploading}
                    onChange={(e) => handleFileUpload(e, "VIDEO")}
                    className="sr-only"
                  />
                </label>
              </div>
              <input
                id="pf-video"
                type="url"
                inputMode="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://.../video-holografia.mp4"
                className="tcg-input"
              />
            </div>

            <div>
              <label htmlFor="pf-description" className="tcg-label">
                Descrição de conservação / centralização
              </label>
              <textarea
                id="pf-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva bordas, textura, centralização e conteúdo..."
                className="tcg-input"
              />
            </div>

            {formFeedback && (
              <div
                role="status"
                className={`p-3 rounded-xl border text-xs font-bold ${
                  formFeedback.ok
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-red-500/20 border-red-500/40 text-red-300"
                }`}
              >
                {formFeedback.text}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition disabled:opacity-60"
            >
              {editingId ? "Salvar alterações" : "Publicar no catálogo"}
            </button>
          </form>

          {/* Lista de Produtos Cadastrados */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Buscar produto cadastrado"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={`Buscar entre ${products.length} produtos (nome, coleção ou número)`}
                className="tcg-input pl-10"
              />
            </div>

            {visibleProducts.length === 0 && (
              <p className="tcg-panel text-center text-xs text-slate-400">
                Nenhum produto encontrado{productSearch ? ` para “${productSearch}”` : ""}.
              </p>
            )}

            {visibleProducts.map((p) => {
              const deleteKey = `product:${p.id}`;
              const lowStock = p.stock <= 0;
              return (
                <div
                  key={p.id}
                  className={`p-3 sm:p-4 rounded-2xl bg-tcg-surface border flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
                    editingId === p.id ? "border-yellow-400/60" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.images[0]}
                      alt=""
                      loading="lazy"
                      className="w-14 h-20 object-contain rounded-lg bg-slate-950 p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-yellow-400">
                          {CATEGORY_LABELS[p.category]}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          {RARITY_LABELS[p.rarity]}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {p.condition === "SEALED" ? "Lacrado" : p.condition}
                        </span>
                        {p.isPromo && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                            Promo
                          </span>
                        )}
                        {p.videoUrl && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                            Vídeo ✓
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-white line-clamp-2 sm:truncate sm:line-clamp-none mt-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-400">
                        <strong className="text-slate-200">{formatBRL(p.price)}</strong> •{" "}
                        <span className={lowStock ? "text-amber-300 font-bold" : ""}>
                          {p.stock === 0 ? "Esgotado" : `Estoque: ${p.stock} un.`}
                        </span>{" "}
                        • {p.images.length} foto(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {confirmKey === deleteKey ? (
                      <>
                        <button
                          onClick={() => {
                            deleteProduct(p.id);
                            setConfirmKey(null);
                            if (editingId === p.id) resetProductForm();
                          }}
                          className="min-h-[42px] px-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-extrabold"
                        >
                          Confirmar exclusão
                        </button>
                        <button
                          onClick={() => setConfirmKey(null)}
                          aria-label="Cancelar exclusão"
                          className="w-[42px] h-[42px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => loadProductForEdit(p)}
                          className="min-h-[42px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Edit3 className="w-4 h-4" /> Editar
                        </button>
                        <button
                          onClick={() => setConfirmKey(deleteKey)}
                          className="w-[42px] h-[42px] flex items-center justify-center rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300"
                          title="Remover produto"
                          aria-label={`Remover ${p.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: GESTÃO DO MÓDULO DE LEILÃO EM TEMPO REAL */}
      {activeTab === "AUCTIONS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">
          <form
            onSubmit={handleCreateAuction}
            className="lg:col-span-5 tcg-panel border-red-500/30 space-y-4 self-start"
          >
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-red-400 shrink-0" />
              Iniciar novo leilão
            </h2>

            <div>
              <label htmlFor="af-product" className="tcg-label">
                Carta ou ETB do catálogo *
              </label>
              <select
                id="af-product"
                required
                value={auctionProductId}
                onChange={(e) => setAuctionProductId(e.target.value)}
                className="tcg-input"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (tabela: {formatBRL(p.price)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
              <div>
                <label htmlFor="af-start" className="tcg-label">
                  Lance inicial (R$)
                </label>
                <input
                  id="af-start"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  className="tcg-input text-yellow-400 font-bold"
                />
              </div>
              <div>
                <label htmlFor="af-inc" className="tcg-label">
                  Incremento (R$)
                </label>
                <input
                  id="af-inc"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={minIncrement}
                  onChange={(e) => setMinIncrement(e.target.value)}
                  className="tcg-input"
                />
              </div>
              <div>
                <label htmlFor="af-duration" className="tcg-label">
                  Duração (min)
                </label>
                <input
                  id="af-duration"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="tcg-input"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "30 min", value: "30" },
                { label: "1 hora", value: "60" },
                { label: "24 horas", value: "1440" },
                { label: "3 dias", value: "4320" },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setDurationMinutes(preset.value)}
                  className={`px-3 py-2 rounded-lg border text-[11px] font-bold ${
                    durationMinutes === preset.value
                      ? "bg-red-500/20 border-red-500/50 text-red-200"
                      : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {auctionFeedback && (
              <div
                role="status"
                className={`p-3 rounded-xl border text-xs font-bold ${
                  auctionFeedback.ok
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-red-500/20 border-red-500/40 text-red-300"
                }`}
              >
                {auctionFeedback.text}
              </div>
            )}

            <button
              type="submit"
              disabled={products.length === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-slate-950 font-black text-xs disabled:opacity-50"
            >
              Publicar leilão em tempo real
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            {auctions.length === 0 && (
              <p className="tcg-panel text-center text-xs text-slate-400">
                Nenhum leilão criado ainda.
              </p>
            )}

            {auctions.map((auc) => {
              const endKey = `auction:${auc.id}`;
              return (
                <div
                  key={auc.id}
                  className="p-4 sm:p-5 rounded-2xl bg-tcg-surface border border-slate-800 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span
                        className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          auc.status === "ACTIVE"
                            ? "bg-red-500/20 text-red-300 border border-red-500/40"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {AUCTION_STATUS_LABELS[auc.status]}
                      </span>
                      <h3 className="text-sm font-extrabold text-white mt-1">{auc.product.title}</h3>
                      <p className="text-[11px] text-slate-400">
                        Termina em{" "}
                        {new Date(auc.endsAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {auc.status === "ACTIVE" &&
                      (confirmKey === endKey ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              endAuctionNow(auc.id);
                              setConfirmKey(null);
                            }}
                            className="min-h-[42px] px-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-extrabold"
                          >
                            Confirmar encerramento
                          </button>
                          <button
                            onClick={() => setConfirmKey(null)}
                            aria-label="Cancelar encerramento"
                            className="w-[42px] h-[42px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmKey(endKey)}
                          className="min-h-[42px] px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-300"
                        >
                          Encerrar agora
                        </button>
                      ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/90 text-xs">
                    <div>
                      <span className="text-slate-400 block">Lance inicial</span>
                      <strong className="text-white">{formatBRL(auc.startingBid)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">
                        Lance atual ({auc.bidsCount} {auc.bidsCount === 1 ? "lance" : "lances"})
                      </span>
                      <strong className="text-yellow-400 text-sm">{formatBRL(auc.currentBid)}</strong>
                    </div>
                    <div className="col-span-2 sm:col-span-1 min-w-0">
                      <span className="text-slate-400 block">
                        {auc.status === "ACTIVE" ? "Líder" : "Vencedor"}
                      </span>
                      <strong className="text-emerald-400 break-words">
                        {auc.winnerName || "Sem lances"}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 3: GERENCIAMENTO DE PEDIDOS E LOGÍSTICA MANAUS */}
      {activeTab === "ORDERS" && (
        <div className="space-y-3 sm:space-y-4">
          {/* Filtro por status (rolagem horizontal no celular) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 pb-1">
            {(
              [
                { key: "OPEN", label: "Em aberto", count: openOrders.length },
                { key: "ALL", label: "Todos", count: orders.length },
                ...ORDER_STATUS_OPTIONS.map((status) => ({
                  key: status,
                  label: ORDER_STATUS_LABELS[status],
                  count: orders.filter((o) => o.status === status).length,
                })),
              ] as { key: "ALL" | "OPEN" | OrderStatus; label: string; count: number }[]
            ).map((chip) => (
              <button
                key={chip.key}
                onClick={() => setOrderFilter(chip.key)}
                aria-pressed={orderFilter === chip.key}
                className={`shrink-0 min-h-[40px] px-3 rounded-full border text-[11px] font-bold whitespace-nowrap transition ${
                  orderFilter === chip.key
                    ? "bg-emerald-500 border-emerald-400 text-slate-950"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                {chip.label} ({chip.count})
              </button>
            ))}
          </div>

          {visibleOrders.length === 0 && (
            <p className="tcg-panel text-center text-xs text-slate-400">
              Nenhum pedido neste filtro.
            </p>
          )}

          {visibleOrders.map((ord) => {
            const waLink = whatsappLink(
              ord.customerWhatsapp,
              `Olá, ${ord.customerName}! Aqui é da JefersonBRATCG sobre o seu pedido ${ord.orderCode}.`
            );
            return (
              <div
                key={ord.id}
                className="p-4 sm:p-5 rounded-2xl bg-tcg-surface border border-slate-800 flex flex-col lg:flex-row lg:items-start justify-between gap-4"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded bg-yellow-400 text-slate-950 font-black text-xs">
                      {ord.orderCode}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${ORDER_STATUS_STYLES[ord.status]}`}
                    >
                      {ORDER_STATUS_LABELS[ord.status]}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(ord.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm font-extrabold text-white break-words">
                    {ord.customerName}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      • {ord.customerWhatsapp}
                    </span>
                  </p>

                  <p className="text-xs text-emerald-300 flex items-start gap-1.5 font-semibold">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      {DELIVERY_LABELS[ord.deliveryMethod]} — {ord.neighborhood} ({ord.city}/
                      {ord.state} • CEP {ord.cep})
                    </span>
                  </p>

                  {ord.manausMeetingPoint && (
                    <p className="text-xs text-yellow-300 font-bold">
                      📍 Ponto de encontro: {ord.manausMeetingPoint}
                    </p>
                  )}

                  <ul className="text-xs text-slate-400 space-y-0.5">
                    {ord.items.map((i) => (
                      <li key={i.product.id}>
                        {i.quantity}x {i.product.title}
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-slate-400">
                    Entrega: {ord.shippingCost === 0 ? "grátis" : formatBRL(ord.shippingCost)} •{" "}
                    <strong className="text-white text-sm">Total: {formatBRL(ord.total)}</strong>
                  </p>
                </div>

                <div className="flex flex-col xs:flex-row lg:flex-col gap-2 lg:w-64 shrink-0">
                  <div className="relative flex-1">
                    <Truck className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      aria-label={`Status do pedido ${ord.orderCode}`}
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="tcg-input pl-9 font-bold"
                    >
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[42px] px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <MessageCircle className="w-4 h-4" /> Chamar no WhatsApp
                    </a>
                  ) : (
                    <span className="min-h-[42px] px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-[11px] font-bold flex items-center justify-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> WhatsApp inválido
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
