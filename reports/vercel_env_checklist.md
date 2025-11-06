# Checklist de Variáveis de Ambiente - Vercel (para projetos Vite)

Este documento serve para garantir que todas as variáveis de ambiente necessárias para a aplicação estejam configuradas corretamente no painel do projeto no Vercel.

**Importante:** Projetos baseados em Vite, como este, exigem que as variáveis de ambiente expostas ao frontend comecem com o prefixo `VITE_`. Chaves de API para serviços de backend usados durante o build (como o Gemini) podem não precisar do prefixo. Siga os nomes exatos abaixo.

---

### [ ] Variáveis de Conexão com Supabase

Estas variáveis são usadas no código do navegador e **precisam** do prefixo `VITE_`.

-   [ ] **`VITE_SUPABASE_URL`**
    -   **Descrição:** URL pública do seu projeto Supabase.
    -   **Valor:** Copie o valor diretamente do painel do Supabase (Settings > API). Ex: `https://seuprojeto.supabase.co`

-   [ ] **`VITE_SUPABASE_ANON_KEY`**
    -   **Descrição:** Chave anônima (public) do seu projeto Supabase. É segura para ser exposta no frontend.
    -   **Valor:** Copie o valor "anon public" diretamente do painel do Supabase (Settings > API).

---

### [ ] Variáveis da API do Google Gemini

Esta variável é usada pelo SDK da Google e **não deve** ter o prefixo `VITE_`.

-   [ ] **`API_KEY`**
    -   **Descrição:** Sua chave de API para acessar os modelos do Google Gemini.
    -   **Valor:** Obtenha sua chave no Google AI Studio.

---

### Instruções de Configuração no Vercel

1.  Acesse o dashboard do seu projeto no Vercel.
2.  Navegue até a aba **Settings**.
3.  No menu lateral, selecione **Environment Variables**.
4.  Para cada uma das variáveis acima:
    -   Clique em **Add New**.
    -   Insira o `Name` (ex: `VITE_SUPABASE_URL` ou `API_KEY`).
    -   Insira o `Value` correspondente.
    -   Certifique-se de que a variável estará disponível em todos os ambientes (Production, Preview, Development).
5.  Salve as alterações.
6.  **Importante:** Após adicionar as variáveis, você **precisa** fazer um novo deploy (ou "Redeploy with existing build") para que as alterações entrem em vigor.