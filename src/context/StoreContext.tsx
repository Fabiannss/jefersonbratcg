"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { INITIAL_AUCTIONS, INITIAL_ORDERS, INITIAL_PRODUCTS } from "@/data/mockCatalog";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Auction, CartItem, Order, OrderStatus, Product, UserSession } from "@/types";

interface StoreContextValue {
  products: Product[];
  auctions: Auction[];
  orders: Order[];
  cart: CartItem[];
  user: UserSession;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Auth / RBAC
  loginAsCustomer: (name?: string, neighborhood?: string) => void;
  loginAsAdmin: (email: string, password: string) => boolean;
  logoutToCustomer: () => void;
  // Cart
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  // Auctions (Real-time)
  placeBid: (
    auctionId: string,
    amount: number,
    bidderName?: string,
    bidderNeighborhood?: string
  ) => { ok: boolean; message: string };
  createAuction: (payload: {
    productId: string;
    startingBid: number;
    minIncrement: number;
    endsAt: string;
  }) => { ok: boolean; message: string };
  endAuctionNow: (auctionId: string) => void;
  // Admin Product CRUD
  upsertProduct: (product: Omit<Product, "id" | "createdAt"> & { id?: string }) => void;
  deleteProduct: (productId: string) => void;
  // Orders & Manaus Logistics
  createOrder: (orderData: Omit<Order, "id" | "orderCode" | "createdAt" | "status">) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const DEFAULT_CUSTOMER: UserSession = {
  id: "usr-customer-manaus",
  name: "Treinador Visitante",
  email: "treinador@manaus.com",
  role: "CUSTOMER",
  neighborhood: "Adrianópolis - Manaus/AM",
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [auctions, setAuctions] = useState<Auction[]>(INITIAL_AUCTIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserSession>(DEFAULT_CUSTOMER);
  const [searchQuery, setSearchQuery] = useState("");

  // Sincronização em tempo real entre abas (BroadcastChannel) + Supabase Realtime
  useEffect(() => {
    const channel = typeof window !== "undefined" ? new BroadcastChannel("jefersonbratcg_realtime") : null;

    if (channel) {
      channel.onmessage = (ev) => {
        if (ev.data?.type === "SYNC_AUCTIONS") setAuctions(ev.data.payload);
        if (ev.data?.type === "SYNC_PRODUCTS") setProducts(ev.data.payload);
        if (ev.data?.type === "SYNC_ORDERS") setOrders(ev.data.payload);
      };
    }

    // Subscrição Supabase Realtime caso configurado no .env
    let supabaseSub: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
    if (isSupabaseConfigured && supabase) {
      supabaseSub = supabase
        .channel("auctions-live-room")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "auctions" },
          (payload) => {
            console.log("[Supabase Realtime] Atualização de leilão:", payload);
          }
        )
        .subscribe();
    }

    return () => {
      channel?.close();
      if (supabaseSub && supabase) {
        supabase.removeChannel(supabaseSub);
      }
    };
  }, []);

  // Verificador automático a cada 1 segundo para encerrar leilões cujo tempo zerou e definir vencedor
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setAuctions((prev) => {
        let changed = false;
        const next = prev.map((auc) => {
          if (auc.status === "ACTIVE" && new Date(auc.endsAt).getTime() <= now) {
            changed = true;
            return {
              ...auc,
              status: "ENDED" as const,
              winnerName: auc.bids[0]
                ? `${auc.bids[0].bidderName} (${auc.bids[0].bidderNeighborhood})`
                : "Sem lances registrados",
            };
          }
          return auc;
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const broadcast = (type: string, payload: unknown) => {
    if (typeof window !== "undefined") {
      const bc = new BroadcastChannel("jefersonbratcg_realtime");
      bc.postMessage({ type, payload });
      bc.close();
    }
  };

  const loginAsCustomer = (name = "Treinador Manaus", neighborhood = "Parque 10 - Manaus/AM") => {
    setUser({
      id: "usr-customer-manaus",
      name,
      email: "cliente@jefersonbratcg.com.br",
      role: "CUSTOMER",
      neighborhood,
    });
  };

  const loginAsAdmin = (email: string, password: string): boolean => {
    if (
      (email.toLowerCase() === "admin@jefersonbratcg.com.br" || email.toLowerCase() === "jeferson") &&
      password === "admin123"
    ) {
      setUser({
        id: "usr-admin-jeferson",
        name: "Jeferson (Admin Manaus)",
        email: "admin@jefersonbratcg.com.br",
        role: "ADMIN",
        neighborhood: "Matriz Manaus - AM",
      });
      return true;
    }
    return false;
  };

  const logoutToCustomer = () => {
    setUser(DEFAULT_CUSTOMER);
  };

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + qty) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, qty) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.product.stock, qty) }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const placeBid = (
    auctionId: string,
    amount: number,
    bidderName?: string,
    bidderNeighborhood?: string
  ) => {
    const target = auctions.find((a) => a.id === auctionId);
    if (!target) return { ok: false, message: "Leilão não encontrado." };

    if (target.status !== "ACTIVE" || new Date(target.endsAt).getTime() <= Date.now()) {
      return { ok: false, message: "Este leilão já foi encerrado." };
    }

    const minRequired =
      target.bidsCount === 0 ? target.startingBid : target.currentBid + target.minIncrement;

    if (amount < minRequired) {
      return {
        ok: false,
        message: `O lance mínimo permitido é R$ ${minRequired.toFixed(2).replace(".", ",")}.`,
      };
    }

    const finalName = bidderName?.trim() || user.name || "Colecionador Manaus";
    const finalNeighborhood = bidderNeighborhood?.trim() || user.neighborhood || "Manaus - AM";

    const newBid = {
      id: `bid-${Date.now()}`,
      auctionId,
      userId: user.id,
      bidderName: finalName,
      bidderNeighborhood: finalNeighborhood,
      amount,
      createdAt: new Date().toISOString(),
    };

    const updatedAuctions = auctions.map((auc) => {
      if (auc.id !== auctionId) return auc;
      // Regra Anti-Sniping: se faltar menos de 30s, estende em +30s
      const remainingMs = new Date(auc.endsAt).getTime() - Date.now();
      const newEndsAt =
        remainingMs < 30000
          ? new Date(Date.now() + 45000).toISOString()
          : auc.endsAt;

      return {
        ...auc,
        currentBid: amount,
        bidsCount: auc.bidsCount + 1,
        winnerName: `${finalName} (${finalNeighborhood})`,
        endsAt: newEndsAt,
        bids: [newBid, ...auc.bids],
      };
    });

    setAuctions(updatedAuctions);
    broadcast("SYNC_AUCTIONS", updatedAuctions);
    return {
      ok: true,
      message: `Lance de R$ ${amount.toFixed(2).replace(".", ",")} confirmado com sucesso!`,
    };
  };

  const createAuction = (payload: {
    productId: string;
    startingBid: number;
    minIncrement: number;
    endsAt: string;
  }) => {
    if (user.role !== "ADMIN") {
      return { ok: false, message: "Acesso negado: apenas o Administrador pode criar leilões." };
    }
    const prod = products.find((p) => p.id === payload.productId);
    if (!prod) return { ok: false, message: "Produto selecionado não existe." };

    const newAuction: Auction = {
      id: `auc-${Date.now()}`,
      productId: prod.id,
      product: prod,
      startingBid: payload.startingBid,
      currentBid: payload.startingBid,
      minIncrement: payload.minIncrement,
      bidsCount: 0,
      startsAt: new Date().toISOString(),
      endsAt: new Date(payload.endsAt).toISOString(),
      status: "ACTIVE",
      bids: [],
    };

    const next = [newAuction, ...auctions];
    setAuctions(next);
    broadcast("SYNC_AUCTIONS", next);
    return { ok: true, message: "Leilão iniciado em tempo real!" };
  };

  const endAuctionNow = (auctionId: string) => {
    if (user.role !== "ADMIN") return;
    const next = auctions.map((auc) =>
      auc.id === auctionId
        ? {
            ...auc,
            status: "ENDED" as const,
            endsAt: new Date().toISOString(),
            winnerName: auc.bids[0]
              ? `${auc.bids[0].bidderName} (${auc.bids[0].bidderNeighborhood})`
              : "Encerrado sem lances",
          }
        : auc
    );
    setAuctions(next);
    broadcast("SYNC_AUCTIONS", next);
  };

  const upsertProduct = (productInput: Omit<Product, "id" | "createdAt"> & { id?: string }) => {
    if (user.role !== "ADMIN") return;

    if (productInput.id) {
      const next = products.map((p) =>
        p.id === productInput.id ? { ...p, ...productInput, id: p.id } : p
      );
      setProducts(next);
      broadcast("SYNC_PRODUCTS", next);
    } else {
      const created: Product = {
        ...productInput,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const next = [created, ...products];
      setProducts(next);
      broadcast("SYNC_PRODUCTS", next);
    }
  };

  const deleteProduct = (productId: string) => {
    if (user.role !== "ADMIN") return;
    const next = products.filter((p) => p.id !== productId);
    setProducts(next);
    broadcast("SYNC_PRODUCTS", next);
  };

  const createOrder = (
    orderData: Omit<Order, "id" | "orderCode" | "createdAt" | "status">
  ): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderCode: `JBR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "PAGO",
      createdAt: new Date().toISOString(),
    };
    const next = [newOrder, ...orders];
    setOrders(next);
    broadcast("SYNC_ORDERS", next);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    if (user.role !== "ADMIN") return;
    const next = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(next);
    broadcast("SYNC_ORDERS", next);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        auctions,
        orders,
        cart,
        user,
        searchQuery,
        setSearchQuery,
        loginAsCustomer,
        loginAsAdmin,
        logoutToCustomer,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        placeBid,
        createAuction,
        endAuctionNow,
        upsertProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider");
  return ctx;
}
