# Plano de Migração: Ativação do Supabase

Este documento descreve os passos necessários para ativar a conexão da aplicação com o banco de dados e serviços reais do Supabase, saindo do modo `SANDBOX` (offline).

**Executor:** Arquiteto-Executor Sênior
**Status Atual:** Operando em `SUPABASE` (Online)

---

## Checklist de Ativação

1.  **[✅] Alterar a Flag de Runtime**
    -   **Arquivo:** `lib/runtime.ts`
    -   **Ação:** O valor da constante `runtime.mode` foi alterado de `'SANDBOX'` para `'SUPABASE'`.
        ```typescript
        // O estado atual da aplicação é:
        export const runtime: { mode: RuntimeMode } = {
          mode: 'SUPABASE',
        };
        ```
    -   **Impacto:** Esta é a mudança principal que faz o `dataService` rotear todas as chamadas para o `supabaseService` em vez do `sandboxDb`. A aplicação agora se comunica com o banco de dados real.
    -   **Para reverter para o modo offline (desenvolvimento):** Altere o valor de volta para `'SANDBOX'`.

2.  **[ ] Validar Conexão e Variáveis de Ambiente**
    -   **Ação:** Verifique se as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretamente configuradas no ambiente de deploy (Vercel).
    -   **Arquivo de Referência:** `reports/vercel_env_checklist.md`
    -   **Verificação:** Rode a aplicação e verifique o console para a mensagem "🛰️ SUPABASE mode active".

3.  **[ ] Revisar Serviços Mockados**
    -   **Ação:** A lógica de roteamento baseada em `runtime.mode` já está implementada. Nenhuma ação é necessária, mas é um bom ponto para confirmar que as chaves de API para serviços como o Gemini (`VITE_API_KEY`) estão configuradas no ambiente de produção.

4.  **[ ] Teste de Regressão Completo**
    -   **Ação:** Navegue por todas as páginas da aplicação para garantir que os dados do Supabase estão sendo carregados corretamente.
        -   [ ] **Login/Autenticação:** Testar login e logout com um usuário real.
        -   [ ] **Pedidos:** Carregar, criar, editar status.
        -   [ ] **Contatos:** Carregar, criar, editar.
        -   [ ] **Produtos:** Carregar, criar, editar.
        -   [ ] **Estoque:** Carregar saldos e movimentações.
        -   [ ] **Configurações:** Validar o carregamento dos catálogos e materiais.

5.  **[✅] Remover o Banner de "SANDBOX MODE"**
    -   **Ação:** A lógica condicional `isSandbox()` no arquivo `App.tsx` já remove o banner automaticamente. Nenhuma ação manual é necessária.

---

Após completar estes passos, a aplicação estará totalmente operacional com o backend Supabase.