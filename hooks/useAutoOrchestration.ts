import { orchestrateCommand } from "../services/atlasOrchestrator";
import { supabase } from "../lib/supabaseClient";

export function useAutoOrchestration() {
  const learnNewCommand = async (command: string, route: string[], context: string, action: string) => {
    await supabase
      .from("ai_commands")
      .upsert({ command, route, context, action });
    console.log(`[AI-LEARN] Novo comando aprendido: ${command}`);
  };

  const handleCommand = async (input: string) => {
    await orchestrateCommand(input);
  };

  return { handleCommand, learnNewCommand };
}
