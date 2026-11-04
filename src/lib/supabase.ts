import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("seu-projeto"));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Helper para upload de múltiplas fotos em alta resolução ou vídeo de holografia no Supabase Storage
 */
export async function uploadProductMedia(file: File, folder: "cards-hi-res" | "holo-videos"): Promise<string> {
  if (!supabase) {
    // Fallback local (Object URL) caso o Supabase ainda não esteja conectado
    return URL.createObjectURL(file);
  }

  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("catalog-media").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Falha no upload de mídia: ${error.message}`);
  }

  const { data } = supabase.storage.from("catalog-media").getPublicUrl(fileName);
  return data.publicUrl;
}
