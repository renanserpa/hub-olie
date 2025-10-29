# Plano de Migração: Retorno ao Supabase

Este documento descreve os passos necessários para reverter a aplicação do modo `SANDBOX` (offline) para o modo `SUPABASE` (online), reconectando-a ao banco de dados e serviços reais.

**Executor:** Arquiteto-Executor Sênior
**Status Atual:** Operando em `SANDBOX`

---

## Checklist de Reversão

1.  **[ ] Alterar a Flag de Runtime**
    -   **Arquivo:** `lib/runtime.ts`
    -   **Ação:** Mude a constante `RUNTIME` de `'SANDBOX'` para `'SUPABASE'`.
        ```typescript
        // Antes
        export const RUNTIME: RuntimeMode = 'SANDBOX';

        // Depois
        export const RUNTIME: RuntimeMode = 'SUPABASE';
        ```
    -   **Impacto:** Esta é a mudança principal que fará o `dataService` rotear todas as chamadas para o `supabaseService` em vez do `sandboxDb`.

2.  **[ ] Validar Conexão e Variáveis de Ambiente**
    -   **Ação:** Verifique se as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou equivalentes) estão corretamente configuradas no ambiente de deploy (Vercel).
    -   **Arquivo de Referência:** `reports/vercel_env_checklist.md`
    -   **Verificação:** Rode a aplicação em ambiente de desenvolvimento e verifique o console para a mensagem de sucesso da conexão do `lib/supabaseClient.ts`.

3.  **[ ] Revisar Serviços Mockados**
    -   **Arquivo:** `services/integrationsService.ts`, `services/authService.ts`
    -   **Ação:** A lógica de roteamento baseada em `isSandbox()` já está implementada. Nenhuma ação é necessária, mas é um bom ponto para confirmar que as chamadas reais (ex: API Gemini) estão configuradas com as chaves de API corretas no ambiente de produção.

4.  **[ ] Teste de Regressão Completo**
    -   **Ação:** Navegue por todas as páginas da aplicação para garantir que os dados do Supabase estão sendo carregados corretamente.
        -   [ ] **Login/Autenticação:** Testar login e logout com um usuário real.
        -   [ ] **Pedidos:** Carregar, criar, editar status.
        -   [ ] **Contatos:** Carregar, criar, editar.
        -   [ ] **Produtos:** Carregar, criar, editar.
        -   [ ] **Estoque:** Carregar saldos e movimentações.
        -   [ ] **Produção:** Carregar OPs. O Kanban pode não funcionar se as tabelas `tasks` não existirem no Supabase (ver `reports/schema_audit.md`).
        -   [ ] **Configurações:** Validar o carregamento dos catálogos.

5.  **[ ] Remover o Banner de "SANDBOX MODE"**
    -   **Arquivo:** `App.tsx`
    -   **Ação:** A lógica condicional `isSandbox()` já removerá o banner automaticamente. Nenhuma ação manual é necessária.

---

Após completar estes passos, a aplicação estará totalmente operacional com o backend Supabase.
