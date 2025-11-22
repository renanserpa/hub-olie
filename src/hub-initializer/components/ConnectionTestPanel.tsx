import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

type ConnectionStatus = "idle" | "testing" | "ok" | "error";

export default function ConnectionTestPanel() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleTestConnection = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setStatus("error");
      setMessage(
        "As variáveis de ambiente do Supabase não estão configuradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
      );
      return;
    }

    try {
      setStatus("testing");
      setMessage(null);

      // Teste simples: tentar ler 1 registro de system_config
      const { error } = await supabase
        .from("system_config")
        .select("id")
        .limit(1);

      if (error) {
        // Se o erro for de tabela não encontrada, a conexão existe, mas o banco está vazio
        if (error.code === '42P01') {
             setStatus("ok"); // Conexão OK, mas precisa de bootstrap
             setMessage("Conexão OK (Tabelas ainda não criadas).");
             return;
        }
        console.error("Erro ao testar conexão Supabase:", error);
        setStatus("error");
        setMessage(`Erro ao conectar no Supabase: ${error.message}`);
        return;
      }

      setStatus("ok");
      setMessage("Conexão com Supabase bem-sucedida.");
    } catch (err: any) {
      console.error("Erro inesperado ao testar conexão:", err);
      setStatus("error");
      setMessage("Erro inesperado ao testar a conexão com o Supabase.");
    }
  };

  const renderStatusLabel = () => {
    switch (status) {
      case "idle":
        return "Aguardando teste de conexão.";
      case "testing":
        return "Testando conexão com o Supabase...";
      case "ok":
        return "✅ Conexão OK.";
      case "error":
        return "❌ Falha na conexão.";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Teste de Conexão com Supabase</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-textSecondary">
            Este painel verifica se:
          </p>
          <ul className="list-disc list-inside text-sm text-textSecondary">
            <li>As variáveis de ambiente do Supabase estão configuradas.</li>
            <li>A aplicação consegue se conectar ao banco de dados.</li>
          </ul>
        </div>

        <div className="rounded-md border border-border p-3 text-sm">
          <p className="font-medium mb-1">Status atual:</p>
          <p>{renderStatusLabel()}</p>
          {!isSupabaseConfigured && (
            <p className="mt-2 text-xs text-red-500">
              Atenção: isSupabaseConfigured = false.{" "}
              Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
              no .env.local e na Vercel.
            </p>
          )}
        </div>

        {message && (
          <div
            className={`rounded-md border p-3 text-sm ${
              status === "error"
                ? "border-red-500 text-red-600 bg-red-50"
                : "border-green-500 text-green-600 bg-green-50"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleTestConnection}
            disabled={status === "testing"}
          >
            {status === "testing" ? "Testando..." : "Testar conexão"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
