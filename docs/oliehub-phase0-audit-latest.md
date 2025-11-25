# OlieHub – Relatório de Auditoria Fase 0 (atual)

## 1. Resumo da Auditoria
- **Estrutura geral**: OK, módulos organizados por domínio e shared components centralizados.
- **Entrypoints**: OK após revisão (`index.html`, `src/main.tsx`, `src/App.tsx`).
- **Contextos**: OK, AppContext consolidado com usuário, organizações e fluxo de seleção.
- **Supabase/Mock**: OK, client único com `isMockMode` e fallback para mockData.
- **Rotas principais**: OK, protegidas e alinhadas ao fluxo Login → Select Org → Dashboard → módulos.

## 2. Arquitetura & Estrutura
- `src/` segue padrão por domínio (`modules/orders`, `modules/production`, `modules/crm`, `modules/inventory`, etc.), componentes compartilhados em `components/shared`.
- Removido item de navegação para rota inexistente (`/catalog`).
- Organização de rotas ajustada para caminhos canônicos (`/select-org`, `/customers`, `/orders/:id/edit`).
- Entry consolidado em `index.html` sem import maps CDN; uso do bundler do projeto.

## 3. Qualidade do Código
- Hooks dependem de `organization_id` e respeitam modo mock/real antes de consultar Supabase.
- Ajustes de tipos e inicialização do AppContext evitam estados nulos sem guardas.
- Build checado via `npm run build` (ver seção de testes) – status OK.

## 4. Supabase & Segurança
- Client frontend utiliza apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- `isMockMode` ativa automaticamente quando variáveis não estão presentes.
- Operações de dados filtram por `organization_id` e usam tabelas no plural.
- Sem uso de service role no frontend.
- **Sugestão para DBA**: validar RLS para tabelas `orders`, `customers`, `production_orders`, `inventory_items`, `inventory_movements` garantindo filtro por `organization_id`.

## 5. UX Base
- Fluxo suportado: Login (mock) → Seleção de Organização → Dashboard → Pedidos → Demais módulos (Produção, CRM/Clientes, Estoque, Logística, Finanças, Configurações).
- Proteção de rotas redireciona para login ou seleção de organização conforme contexto.
- AppTour habilitado apenas após usuário + organização selecionados.

## 6. Checklist de Fase 0
- [x] Estrutura de pastas consolidada por domínio.
- [x] Entrypoints consistentes (`index.html`, `main.tsx`, `App.tsx`).
- [x] Contexto de app com usuário, organizações e seleção atualizada.
- [x] Supabase client único com fallback mock e sem service role.
- [x] Rotas documentadas e protegidas.
- [ ] Testes automatizados adicionais (apenas build executado nesta fase).
- [ ] Documentação de esquema/DB (fora do escopo deste commit).

## 7. Sugestão de Próximos Passos (Fase 1)
1. UX/Visual: aprimorar Layout, estados vazios, skeletons e responsividade mobile/desktop.
2. CRM & Pedidos: unificar componentes de formulário (inputs, selects) e estados de erro; adicionar busca/filters.
3. Produção: visão Kanban simples para `production_orders` com atualização de status.
4. Estoque: registrar movimentações com validação de quantidade e impacto em itens.
5. Autenticação: integrar Supabase Auth real (email/link) e sincronizar usuário no AppContext.
6. Observabilidade: logging básico de erros e toasts consistentes em todas as operações async.
7. Documentação: adicionar README de rotas e quickstart de ambiente (env vars + mock mode).
