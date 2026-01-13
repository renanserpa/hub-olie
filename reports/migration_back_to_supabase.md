# Guia de Migração e Diagnóstico: Ativando o Supabase

**Executor:** Arquiteto-Executor Sênior
**Status Atual:** Operando em `SANDBOX` (Offline - Modo de Segurança)

---

## 1. Visão Geral

Para resolver o problema de "tela travada" e "placeholders", a aplicação foi revertida para o modo **`SANDBOX`**. Isso garante que você possa continuar trabalhando offline enquanto investiga a causa raiz do problema de conexão com o Supabase.

A causa mais provável é uma **falha na aplicação das Políticas de Segurança (RLS)** no seu banco de dados, o que faz com que o Supabase retorne dados vazios, mesmo que as tabelas existam.

Siga os passos abaixo para diagnosticar e corrigir o problema antes de tentar a migração novamente.

## 2. Checklist de Diagnóstico e Ativação

### Passo 1: [✅] Executar o Script de Bootstrap Definitivo

A fonte única da verdade para o schema do banco de dados está no modal que aparece na tela de login (`BootstrapModal.tsx`).

1.  **Faça logout** da aplicação se estiver logado.
2.  Tente fazer login com credenciais incorretas para forçar o erro `BOOTSTRAP_REQUIRED` e abrir o modal de configuração.
3.  **Copie o script SQL completo (v7.0)** do modal.
4.  **Execute o script inteiro** no `SQL Editor` do seu projeto Supabase. Verifique se não há erros no final da execução. Este script é idempotente e seguro para ser executado várias vezes. Ele irá:
    - Criar **TODAS** as tabelas ausentes.
    - Aplicar **políticas RLS permissivas** que permitem que qualquer usuário logado leia e escreva dados. Esta é a correção mais crítica.
    - Configurar o usuário administrador.

### Passo 2: [ ] Validar Conexão e Variáveis de Ambiente (Vercel)

Se você estiver fazendo deploy no Vercel, confirme que as variáveis de ambiente estão corretas.

-   **Arquivo de Referência:** `reports/vercel_env_checklist.md`
-   Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas no painel do Vercel.

### Passo 3: [ ] Ativar o Modo Supabase Novamente

Quando tiver certeza de que o script do Passo 1 foi executado com sucesso no Supabase, você pode tentar a migração novamente.

1.  **Arquivo:** `lib/runtime.ts`
2.  **Ação:** Altere o valor da constante `runtime.mode` de `'SANDBOX'` para `'SUPABASE'`.
    ```typescript
    // Mude esta linha para tentar a conexão real novamente:
    export const runtime: { mode: RuntimeMode } = {
      mode: 'SUPABASE',
    };
    ```
3.  **Recarregue a aplicação** e tente fazer login. Se tudo estiver correto, a aplicação deve funcionar com os dados do seu banco.

---

Se os problemas persistirem após seguir estes passos, a causa pode ser mais complexa (configurações de rede, bloqueios de CORS específicos do seu ambiente).