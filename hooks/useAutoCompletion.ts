import { geminiGenerate } from "../services/geminiService";
import { supabase } from "../lib/supabaseClient";

export async function autoCompleteMissingSections(reportPath: string) {
  const { data, error } = await supabase.storage.from("reports").download(reportPath);
  if (error || !data) {
      console.error(`[AI-FILL] Erro ao baixar relatório: ${reportPath}`, error);
      return;
  }
  
  const content = await data.text();

  if (!content.includes("Critérios de Aceite")) {
    console.log(`[AI-FILL] 🧩 Adicionando seção ausente no ${reportPath}`);
    const completion = await geminiGenerate("autoFill", { report: reportPath });
    
    // In a real scenario, you'd merge this completion into the existing content.
    // For this simulation, we'll just log it.
    console.log(`[AI-FILL] Conteúdo gerado para ${reportPath}:`, completion);
    
    // The line below would overwrite the file, which might not be desired.
    // await supabase.storage.from("reports").upload(reportPath, completion, { upsert: true });
  }
}
