import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "JefersonBRATCG | E-Commerce & Leilões Pokémon TCG • Manaus - AM",
  description:
    "Sua loja especializada 100% em Pokémon TCG em Manaus - AM. Cartas Avulsas (Singles), ETBs Seladas e Leilões em Tempo Real com entrega expressa em Manaus e envio para todo o Brasil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Aplica o tema antes da primeira pintura para evitar piscar */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('jb-theme');var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#090B10] text-slate-100 antialiased pb-20 sm:pb-0">
        <StoreProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-800/80 bg-[#07090E] mt-14 sm:mt-20">
            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-slate-400">
              <div className="space-y-2">
                <span className="text-lg font-black text-white">
                  Jeferson<span className="text-yellow-400">BRA</span>TCG
                </span>
                <p>
                  Plataforma exclusiva de Pokémon Trading Card Game sediada em{" "}
                  <strong className="text-yellow-400">Manaus - Amazonas</strong>.
                </p>
                <p className="text-[11px] text-slate-500">
                  Foco 100% em Singles verificadas, Elite Trainer Boxes (ETBs) lacradas e Leilões ao vivo.
                </p>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase tracking-wider">Categorias Exclusivas</h4>
                <ul className="space-y-1">
                  <li>1. Cartas Avulsas (Singles NM / LP)</li>
                  <li>2. ETBs (Elite Trainer Boxes) Seladas</li>
                  <li>3. Leilões Ao Vivo em Tempo Real</li>
                </ul>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase tracking-wider">Logística Manaus - AM</h4>
                <ul className="space-y-1">
                  <li>• Motoboy Expresso Manaus (Entrega até 2h)</li>
                  <li>• Pontos de Encontro Seguros (Shoppings Manaus)</li>
                  <li>• Retirada Local Agendada (Taxa R$ 0)</li>
                  <li>• Correios SEDEX/PAC Blindado p/ todo o Brasil</li>
                </ul>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase tracking-wider">Garantia & Autenticidade</h4>
                <p>
                  100% das cartas são originais Copag / The Pokémon Company, acompanhadas de fotos reais em alta
                  resolução e vídeo de verificação de textura/holografia.
                </p>
              </div>
            </div>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
