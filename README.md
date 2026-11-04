# ⚡ JefersonBRATCG — Plataforma E-Commerce & Leilões Pokémon TCG (Manaus - AM)

Plataforma completa de e-commerce e leilões em tempo real **100% exclusiva de Pokémon TCG**, inspirada na fluidez e organização visual dark-gamer da Kanto Nerd, com logística local otimizada para **Manaus - AM** e envio blindado para todo o Brasil.

---

## 📂 Estrutura de Pastas do Projeto

```text
c:\Projetos\jefersonbratcg\
├── supabase/
│   └── schema.sql                     # Schema PostgreSQL + RLS + Função Atômica de Lance + Realtime
├── src/
│   ├── types/
│   │   └── index.ts                   # Tipagens (SINGLE, ETB, 3 Raridades, Condições, Leilões, Pedidos)
│   ├── lib/
│   │   ├── supabase.ts                # Cliente Supabase + Upload Storage (Fotos Hi-Res & Vídeos Holo)
│   │   └── manaus-shipping.ts         # Motor Logístico Manaus (Motoboy, Pontos de Encontro, Correios)
│   ├── data/
│   │   └── mockCatalog.ts             # Catálogo Inicial 100% Pokémon TCG + Leilões Ativos + Pedidos
│   ├── context/
│   │   └── StoreContext.tsx           # Estado Global + Sincronização em Tempo Real (Realtime + BroadcastChannel)
│   ├── components/
│   │   ├── Navbar.tsx                 # Header com Topbar Manaus, Busca, Links Rápidos e Drawer de Carrinho
│   │   ├── HeroCarousel.tsx           # Carrossel Principal (Cartas Promo/Chase, Leilões e Entrega Manaus)
│   │   ├── AuctionCard.tsx            # Card de Leilão com Contador Regressivo e Lance em Tempo Real
│   │   └── ProductCard.tsx            # Card de Produto (Badges de Raridade, Condição, Vídeo Holo e PIX)
│   └── app/
│       ├── layout.tsx                 # Layout Global Dark Gamer + Footer Institucional Manaus
│       ├── globals.css                # Estilos Tailwind CSS
│       ├── page.tsx                   # Homepage (Carrossel, Destaques, Filtros 3 Raridades, ETBs, Leilões)
│       ├── produto/[id]/page.tsx      # Detalhes do Produto (Galeria Hi-Res + Player Vídeo Holografia + Frete)
│       ├── leiloes/page.tsx           # Sala de Leilões Ao Vivo + Feed de Lances em Tempo Real
│       ├── checkout/page.tsx          # Checkout com Pontos de Encontro em Manaus, Motoboy e Correios
│       └── admin/page.tsx             # Painel Administrativo Protegido (/admin) - CRUD + Leilões + Pedidos
├── JefersonBRATCG_Preview_Interativo.html  # Preview Interativo Instantâneo (Funciona direto no navegador)
├── iniciar_preview.bat                # Inicializador rápido (1 clique no Windows)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## 🚀 Como Executar o Projeto

### Opção 1: Execução Instantânea (Sem precisar instalar dependências)
Dê dois cliques em [`iniciar_preview.bat`](file:///c:/Projetos/jefersonbratcg/iniciar_preview.bat) ou abra diretamente o arquivo [`JefersonBRATCG_Preview_Interativo.html`](file:///c:/Projetos/jefersonbratcg/JefersonBRATCG_Preview_Interativo.html) no navegador.

### Opção 2: Ambiente Completo Next.js 15 + Supabase
1. Instale o Node.js LTS (v20+) caso ainda não esteja instalado na máquina.
2. Copie o arquivo `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Execute o script [`supabase/schema.sql`](file:///c:/Projetos/jefersonbratcg/supabase/schema.sql) no SQL Editor do Supabase.
4. No terminal, dentro de `c:\Projetos\jefersonbratcg`:
   ```bash
   npm install
   npm run dev
   ```
5. Acesse `http://localhost:3000`.

---

## 🔐 Credenciais de Demonstração do Painel Admin (`/admin`)
- **E-mail:** `admin@jefersonbratcg.com.br`
- **Senha:** `admin123`
*(Usuários comuns têm acesso apenas ao catálogo, filtros, lances em leilões e checkout).*
