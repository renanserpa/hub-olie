# Backlog Fase 1 – OlieHub

## Épico 1 – CRM & Pedidos integrados
- **User stories (negócio)**
  - Como vendedor, quero criar/editar pedidos e clientes no mesmo fluxo para reduzir retrabalho.
  - Como gerente, quero ver filtros por status, cliente e data em pedidos para priorizar entregas.
- **Tarefas (Code)**
  - Padronizar formulários de Pedido/Cliente com componentes compartilhados e validação.
  - Implementar filtros e paginação leve em `/orders` e `/customers`.
  - Exibir indicadores de erro/loading consistentes com Toasts.
- **Tarefas (DB)**
  - Ajustar RLS para `orders`/`customers` garantindo escopo por `organization_id`.
  - Adicionar índices em colunas de filtro (status, organization_id, created_at).
- **Tarefas (UX)**
  - Refinar estados vazios e mensagens de sucesso/erro.
  - Criar fluxos de navegação entre pedido ↔ cliente.
- **Tarefas (Docs)**
  - Documentar rotas e contratos de payload para pedidos/clientes.

## Épico 2 – Produção (Kanban) + Estoque básico
- **User stories (negócio)**
  - Como PCP, quero mover ordens de produção por status em um quadro para acompanhar bloqueios.
  - Como almoxarife, quero registrar entradas/saídas e ver saldo atualizado em tempo real.
- **Tarefas (Code)**
  - Implementar board Kanban simples para `production_orders` com drag-and-drop opcional.
  - Criar formulário de movimentação de estoque com validação de quantidade e notas.
- **Tarefas (DB)**
  - Garantir triggers de ajuste de saldo em `inventory_items` após `inventory_movements`.
  - Revisar índices para consultas por `organization_id` e `item_id`.
- **Tarefas (UX)**
  - Estados de loading/skeleton para produção e estoque.
  - Feedback visual para mudanças de status e movimentações salvas.
- **Tarefas (Docs)**
  - Guia de uso do Kanban e definição de status suportados.

## Épico 3 – UX & Feedback
- **User stories (negócio)**
  - Como usuário, quero clareza sobre o que está carregando ou falhou para confiar na aplicação.
  - Como usuário móvel, quero telas responsivas para usar no tablet/celular.
- **Tarefas (Code)**
  - Componentizar toasts, banners de erro e skeletons reutilizáveis.
  - Revisar Layout para breakpoints principais (mobile, tablet, desktop) e ajustes de sidebar.
- **Tarefas (UX)**
  - Criar guia de estilo rápido (tipografia, cores, espaçamentos) para Fase 1.
  - Prototipar telas responsivas prioritárias (Dashboard, Orders, Customers).
- **Tarefas (Docs)**
  - Registrar padrões de feedback e guidelines de responsividade.

## Épico 4 – Segurança & Observabilidade básicas
- **User stories (negócio)**
  - Como admin, preciso garantir que somente usuários autenticados acessem dados da organização correta.
  - Como operador, quero que erros sejam registrados para suporte rápido.
- **Tarefas (Code)**
  - Integrar Supabase Auth real (email magic link) ao AppContext e ProtectedRoute.
  - Adicionar logging de erros (console + opcional provider) e boundaries simples.
- **Tarefas (DB)**
  - Revisar políticas RLS para todas as tabelas usadas no app.
  - Configurar auditoria básica (triggers de created_at/updated_at, histórico de login se aplicável).
- **Tarefas (UX)**
  - Fluxo de login com estados claros (enviando email, erro, sucesso).
- **Tarefas (Docs)**
  - Checklist de segurança (env vars, RLS, perfis de usuário) e playbook de incidentes básico.
