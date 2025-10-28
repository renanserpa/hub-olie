# Checklist de Variáveis de Ambiente - Vercel

Este documento serve para garantir que todas as variáveis de ambiente necessárias para a conexão com o Supabase estejam configuradas corretamente no painel do projeto no Vercel.

Estas variáveis são **essenciais** para os ambientes de **Production**, **Preview**, e **Development**.

---

### [ ] Variáveis de Conexão com Supabase

-   [ ] **`NEXT_PUBLIC_SUPABASE_URL`**
    -   **Descrição:** URL pública do seu projeto Supabase.
    -   **Valor:** `https://qrfvdoecpmcnlpxklcsu.supabase.co`
    -   **Verificação:** Copie o valor diretamente do painel do Supabase (Settings > API) para evitar erros de digitação.

-   [ ] **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
    -   **Descrição:** Chave anônima (public) do seu projeto Supabase. É segura para ser exposta no frontend.
    -   **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZnZkb2VjcG1jbmxweGtsY3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU2OTEsImV4cCI6MjA3NjAzMTY5MX0.dpX90AmxL_JrxkYacPFkzQzhmCETDTa21Up5TdQgLLk`
    -   **Verificação:** Copie o valor "anon public" diretamente do painel do Supabase (Settings > API). Verifique se não há caracteres truncados ou espaços no início/fim.

---

### Instruções de Configuração no Vercel

1.  Acesse o dashboard do seu projeto no Vercel.
2.  Navegue até a aba **Settings**.
3.  No menu lateral, selecione **Environment Variables**.
4.  Para cada uma das variáveis acima:
    -   Clique em **Add New**.
    -   Insira o `Name` (ex: `NEXT_PUBLIC_SUPABASE_URL`).
    -   Insira o `Value` correspondente.
    -   Certifique-se de que a variável estará disponível em todos os ambientes (Production, Preview, Development).
5.  Salve as alterações.
6.  **Importante:** Após adicionar as variáveis, você pode precisar fazer um novo deploy (ou "Redeploy") para que as alterações entrem em vigor.