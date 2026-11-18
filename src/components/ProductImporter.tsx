"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload, XCircle } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import {
  buildImportPreview,
  downloadCsvTemplate,
  ImportDraft,
  readCsvFile,
} from "@/lib/product-import";

export function ProductImporter() {
  const { products, importProducts } = useStore();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState("");

  const preview = useMemo(
    () => (text.trim() ? buildImportPreview(text, products) : null),
    [text, products]
  );

  const valid = preview?.rows.filter((r) => r.draft) ?? [];
  const invalid = preview?.rows.filter((r) => !r.draft) ?? [];
  const toCreate = valid.filter((r) => r.mode === "novo").length;
  const toUpdate = valid.filter((r) => r.mode === "atualiza").length;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult("");
    setFileName(file.name);
    setText(await readCsvFile(file));
    e.target.value = "";
  };

  const handleImport = () => {
    const items = valid.map((r) => ({ ...(r.draft as ImportDraft), id: r.existingId }));
    const done = importProducts(items);
    setResult(
      `Pronto! ${done.created} ${done.created === 1 ? "item novo" : "itens novos"} e ${done.updated} ${
        done.updated === 1 ? "atualizado" : "atualizados"
      }.`
    );
    setText("");
    setFileName("");
  };

  const clear = () => {
    setText("");
    setFileName("");
    setResult("");
  };

  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-[#121722] border border-emerald-500/30 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">Importar várias cartas de uma vez</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Preencha uma planilha e envie. Só <strong className="text-slate-200">título</strong> e{" "}
              <strong className="text-slate-200">preço</strong> são obrigatórios.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={downloadCsvTemplate}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-emerald-400" /> 1. Baixar modelo da planilha
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <label className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 p-5 flex flex-col items-center justify-center text-center gap-1.5 transition">
          <Upload className="w-6 h-6 text-emerald-400" />
          <span className="text-sm font-bold text-white">2. Enviar arquivo CSV</span>
          <span className="text-[11px] text-slate-400">
            {fileName || "Salve a planilha como CSV (Excel ou Google Planilhas) e escolha aqui"}
          </span>
          <input type="file" accept=".csv,.txt,text/csv" onChange={handleFile} className="hidden" />
        </label>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            Ou copie as linhas da planilha (com o cabeçalho) e cole aqui
          </label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFileName("");
              setResult("");
            }}
            placeholder={"titulo\tpreco\testoque\nPikachu ex 238/191\t1890,00\t2"}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
          />
        </div>
      </div>

      {result && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {result}
        </div>
      )}

      {preview?.headerError && (
        <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs font-bold text-red-300 flex items-start gap-2">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> {preview.headerError}
        </div>
      )}

      {preview && !preview.headerError && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-300">
              <strong className="text-emerald-300">{toCreate} novas</strong>
              {" • "}
              <strong className="text-cyan-300">{toUpdate} para atualizar</strong>
              {invalid.length > 0 && (
                <>
                  {" • "}
                  <strong className="text-red-300">{invalid.length} com erro (não serão importadas)</strong>
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clear}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={valid.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs"
              >
                3. Importar {valid.length} {valid.length === 1 ? "carta" : "cartas"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 sticky top-0">
                <tr>
                  <th className="px-3 py-2 font-bold">Linha</th>
                  <th className="px-3 py-2 font-bold">Situação</th>
                  <th className="px-3 py-2 font-bold">Título</th>
                  <th className="px-3 py-2 font-bold">Preço</th>
                  <th className="px-3 py-2 font-bold">Estoque</th>
                  <th className="px-3 py-2 font-bold">Avisos</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.line} className="border-t border-slate-800 align-top">
                    <td className="px-3 py-2 text-slate-500">{row.line}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {row.draft ? (
                        <span
                          className={`font-bold ${
                            row.mode === "novo" ? "text-emerald-300" : "text-cyan-300"
                          }`}
                        >
                          {row.mode === "novo" ? "Nova" : "Atualiza"}
                        </span>
                      ) : (
                        <span className="font-bold text-red-300">Erro</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-white font-semibold min-w-[12rem]">{row.title}</td>
                    <td className="px-3 py-2 text-slate-200 whitespace-nowrap">
                      {row.draft ? `R$ ${row.draft.price.toFixed(2).replace(".", ",")}` : "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-200">{row.draft ? row.draft.stock : "-"}</td>
                    <td className="px-3 py-2 min-w-[14rem]">
                      {row.errors.map((msg) => (
                        <p key={msg} className="text-red-300 flex items-start gap-1">
                          <XCircle className="w-3 h-3 shrink-0 mt-0.5" /> {msg}
                        </p>
                      ))}
                      {row.warnings.map((msg) => (
                        <p key={msg} className="text-yellow-300 flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> {msg}
                        </p>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <details className="text-xs text-slate-400">
        <summary className="cursor-pointer font-bold text-slate-300">Colunas aceitas</summary>
        <ul className="mt-2 space-y-1 leading-relaxed">
          <li>
            <strong className="text-slate-200">titulo, preco</strong> (obrigatórias). Preço aceita 1890,00 ou R$ 1.890,00.
          </li>
          <li>
            <strong className="text-slate-200">colecao, numero, estoque</strong>: estoque vazio vale 1.
          </li>
          <li>
            <strong className="text-slate-200">tipo</strong>: carta ou etb. <strong className="text-slate-200">raridade</strong>:
            basica, media ou rara. <strong className="text-slate-200">condicao</strong>: NM, LP, MP, HP (ETB é sempre lacrado).
          </li>
          <li>
            <strong className="text-slate-200">codigo_imagem</strong>: código da carta, como sv8-238, puxa a foto oficial.{" "}
            <strong className="text-slate-200">imagem</strong>: link da foto, se preferir.
          </li>
          <li>
            <strong className="text-slate-200">preco_original, destaque, video, descricao</strong>: opcionais. Destaque =
            sim coloca a carta no carrossel.
          </li>
          <li>Se a carta (mesmo título e número) já existe, ela é atualizada em vez de duplicada.</li>
        </ul>
      </details>
    </section>
  );
}
