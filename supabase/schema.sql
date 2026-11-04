-- ============================================================================
-- JEFERSONBRATCG - SCHEMA SUPABASE (PostgreSQL + RLS + Realtime + Storage)
-- Nicho: 100% Pokémon TCG | Origem: Manaus - AM
-- ============================================================================

-- 1. ENUMS ESTRITOS DE NEGÓCIO
CREATE TYPE product_category AS ENUM ('SINGLE', 'ETB');
CREATE TYPE rarity_tier AS ENUM ('BASICA', 'MEDIA', 'RARA');
CREATE TYPE card_condition AS ENUM ('NM', 'LP', 'MP', 'HP', 'DAMAGED', 'SEALED');
CREATE TYPE auction_status AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED');
CREATE TYPE manaus_delivery_method AS ENUM (
  'MOTOBOY_MANAUS',
  'PONTO_ENCONTRO_MANAUS',
  'RETIRADA_LOCAL_MANAUS',
  'CORREIOS_NACIONAL'
);
CREATE TYPE order_status AS ENUM (
  'AGUARDANDO_PAGAMENTO',
  'PAGO',
  'EM_ROTA_MANAUS',
  'AGUARDANDO_PONTO_ENCONTRO',
  'POSTADO_CORREIOS',
  'ENTREGUE',
  'CANCELADO'
);

-- 2. TABELA DE PERFIS (RBAC: CUSTOMER vs ADMIN)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  neighborhood TEXT, -- Bairro em Manaus (Adrianópolis, Vieiralves, Cidade Nova, etc.)
  role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATÁLOGO DE PRODUTOS (Cartas Avulsas & ETBs Selados)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category product_category NOT NULL,
  set_name TEXT NOT NULL,            -- Ex: "Escarlate e Violeta - Fagulhas Impetuosas (SV08)"
  card_number TEXT,                  -- Ex: "238/191" (nulo se for ETB)
  rarity rarity_tier NOT NULL,       -- BASICA | MEDIA | RARA
  rarity_detail TEXT NOT NULL,       -- Ex: "Special Illustration Rare (SIR)", "Reverse Holo", "ETB Selada"
  condition card_condition NOT NULL DEFAULT 'NM',
  language TEXT NOT NULL DEFAULT 'PT-BR',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2),
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  description TEXT,
  images TEXT[] NOT NULL DEFAULT '{}', -- Múltiplas fotos de alta resolução (frente, verso, bordas)
  video_url TEXT,                      -- Vídeo curto demonstrando holografia/textura e conservação
  is_promo BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MÓDULO DE LEILÕES (Tempo Real)
CREATE TABLE public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  starting_bid NUMERIC(10, 2) NOT NULL CHECK (starting_bid > 0),
  current_bid NUMERIC(10, 2) NOT NULL,
  min_increment NUMERIC(10, 2) NOT NULL DEFAULT 5.00 CHECK (min_increment >= 1),
  bids_count INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  status auction_status NOT NULL DEFAULT 'ACTIVE',
  winner_user_id UUID REFERENCES public.profiles(id),
  winner_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. HISTÓRICO DE LANCES DO LEILÃO
CREATE TABLE public.auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  bidder_name TEXT NOT NULL,
  bidder_neighborhood TEXT DEFAULT 'Manaus - AM',
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PEDIDOS & LOGÍSTICA MANAUS / NACIONAL
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  delivery_method manaus_delivery_method NOT NULL,
  manaus_meeting_point TEXT, -- Ex: "Amazonas Shopping", "Manauara Shopping", "Sumaúma Park Shopping"
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  status order_status NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FUNÇÃO TRANSACIONAL ATÔMICA PARA DAR LANCE (Evita Race Condition)
CREATE OR REPLACE FUNCTION public.place_auction_bid(
  p_auction_id UUID,
  p_user_id UUID,
  p_bidder_name TEXT,
  p_bidder_neighborhood TEXT,
  p_amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction public.auctions%ROWTYPE;
  v_min_required NUMERIC;
BEGIN
  SELECT * INTO v_auction
  FROM public.auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Leilão não encontrado.';
  END IF;

  IF v_auction.status <> 'ACTIVE' OR NOW() >= v_auction.ends_at THEN
    UPDATE public.auctions SET status = 'ENDED' WHERE id = p_auction_id;
    RAISE EXCEPTION 'Este leilão já foi encerrado.';
  END IF;

  IF v_auction.bids_count = 0 THEN
    v_min_required := v_auction.starting_bid;
  ELSE
    v_min_required := v_auction.current_bid + v_auction.min_increment;
  END IF;

  IF p_amount < v_min_required THEN
    RAISE EXCEPTION 'O lance mínimo atual é de R$ %', v_min_required;
  END IF;

  INSERT INTO public.auction_bids (auction_id, user_id, bidder_name, bidder_neighborhood, amount)
  VALUES (p_auction_id, p_user_id, p_bidder_name, p_bidder_neighborhood, p_amount);

  -- Anti-sniping opcional: se faltar menos de 30s, estende em +30s
  UPDATE public.auctions
  SET current_bid = p_amount,
      bids_count = bids_count + 1,
      winner_user_id = p_user_id,
      winner_name = p_bidder_name,
      ends_at = CASE
        WHEN (ends_at - NOW()) < INTERVAL '30 seconds' THEN ends_at + INTERVAL '30 seconds'
        ELSE ends_at
      END
  WHERE id = p_auction_id
  RETURNING * INTO v_auction;

  RETURN to_jsonb(v_auction);
END;
$$;

-- 8. ROW LEVEL SECURITY (RLS) - PERMISSÕES CLIENTE vs ADMIN
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode visualizar produtos, leilões e lances
CREATE POLICY "Leitura pública de produtos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Leitura pública de leilões" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Leitura pública de lances" ON public.auction_bids FOR SELECT USING (true);

-- Apenas ADMIN pode criar, editar ou excluir produtos e leilões
CREATE POLICY "Admin gerencia produtos" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admin gerencia leilões" ON public.auctions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- 9. HABILITAR SUPABASE REALTIME PARA LEILÕES E LANCES
ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_bids;
