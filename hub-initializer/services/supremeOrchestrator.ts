import { uploadFileToSupabase } from './supabaseSyncService'

export async function sendToSupreme(text: string) {
  try {
    console.log(`[SUPREME] Dispatching command: ${text}`)
    await new Promise(res => setTimeout(res, 800)) // simulação de chamada
    const result = `[OK] ArquitetoSupremo processou: "${text.slice(0, 80)}..."`
    
    // In a real scenario, this path might be different, but we follow the user's intent.
    // Note: The supabaseSyncService.uploadFile is a sandbox simulation.
    await uploadFileToSupabase(
      new File([text], 'supreme_command.txt', { type: 'text/plain' }),
      `/reports/supreme_commands/${Date.now()}_command.txt`
    )
    return { status: result }
  } catch (err) {
    return { status: `[ERROR] Falha ao enviar comando: ${(err as Error).message}` }
  }
}
