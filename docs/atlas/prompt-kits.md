# Kits de Prompts – Catalyst Agent & Ecossistema OlieHub

Este arquivo reúne **modelos de prompts** reutilizáveis para:
- conversar com o **Catalyst Agent** (ideias, módulos, agentes, integrações);
- acionar um **Code Assistant** (ligado ao GitHub/Supabase);
- acionar um **DB/SQL Assistant**;
- acionar agentes **criativos** (design, conteúdo, mídia).

A ideia é padronizar o fluxo:
IDEIA → Catalyst (planeja) → Code/DB/Creative Agents (executam).

---

## 1. Prompts-base para o Catalyst Agent

### 1.1. Novo módulo ou feature em um sistema existente

Use quando quiser desenhar um novo módulo/feature (ex.: CRM do OlieHub).

```text
Quero desenhar um novo módulo em um sistema existente.

Sistema: [nome do sistema, ex.: OlieHub]  
Tecnologias principais: [ex.: React + Vite + Supabase + Tailwind]  
Contexto rápido: [2–4 frases sobre o sistema atual]

Módulo/feature desejado(a):
- Nome: [ex.: CRM simples de clientes]
- Objetivo principal: [ex.: ter uma visão dos clientes, histórico de pedidos e tags de segmentação]
- Usuários que vão usar: [ex.: time de vendas e atendimento]
- Problemas que quero resolver: [liste em bullets]

Por favor:
1. Reescreva com suas palavras o que você entendeu.  
2. Me faça de 5 a 8 perguntas para clarificar objetivo, fluxos principais, dados necessários e restrições.  
3. Depois das minhas respostas, organize os requisitos, proponha arquitetura/fluxos e faça um plano em etapas.  
4. No final, sugira 3 a 5 melhorias extras que eu poderia considerar.
```

---

### 1.2. Novo sistema / app do zero

```text
Quero desenhar um novo sistema/app do zero.

Nome (provisório): [ex.: Hub de Projetos, Agentes e Ideias]  
Visão geral (rápida): [2–5 frases]  
Quem vai usar: [perfis de usuário, ex.: GOD user, devs, PMs]  
Problemas que quero resolver: [lista em bullets]

Por favor:
1. Reescreva com suas palavras o que você entendeu sobre esse sistema.  
2. Me faça de 5 a 10 perguntas para clarificar escopo, tipos de usuário, dados centrais, integrações e o que é sucesso para a v1.  
3. Depois das respostas, monte um resumo de requisitos + proposta de módulos principais + plano de fases.  
4. Liste também 3 a 5 ideias de agentes que poderiam nascer junto com esse sistema.
```

---

### 1.3. Novo AGENTE (Agent Blueprint)

```text
Quero desenhar um **novo agente de IA**.

Nome (provisório): [ex.: OlieHub Ops Agent]  
Projeto ao qual pertence: [ex.: OlieHub]  
Objetivo principal: [ex.: ajudar operadores a acompanhar OPs, estoque e prazos]  

Contexto rápido do projeto:
[2–4 frases]

Por favor:
1. Reescreva com suas palavras o que você entendeu sobre esse agente.  
2. Me faça 5 a 8 perguntas para definir melhor:
   - escopo,
   - o que ele pode/não pode fazer,
   - quais entradas/saídas ele terá,
   - com quais APIs/sistemas ele deve falar.  
3. Depois das respostas, produza um **Agent Blueprint** completo com:
   - name, id, project, role, goals,
   - scope, out_of_scope,
   - inputs, outputs,
   - ferramentas/integrações,
   - safety/constraints,
   - 2–5 example_prompts,
   - ideias de evolução (v2, v3...).  
4. No final, sugira onde esse agent poderia ser salvo (ex.: arquivo `.md` em `agents/`) e como ele poderia ser reutilizado em outros projetos.
```

---

### 1.4. Revisão / Redesign de um fluxo existente

```text
Quero revisar e melhorar um fluxo que já existe em um sistema.

Sistema: [ex.: OlieHub]  
Módulo/fluxo: [ex.: Pedidos → Produção → Estoque]  
Problemas que estou percebendo hoje:
- [ex.: estados confusos]
- [ex.: usuários se perdem nas telas]
- [ex.: carece de visibilidade de prazos]

Tenho materiais para te mandar: [descreva se vai enviar prints, diagramas, trechos de código, etc.]

Por favor:
1. Me diga que tipo de material seria mais útil para você entender esse fluxo (e.g. diagrama, prints, descrição passo a passo).  
2. Depois que eu te mandar, reescreva o fluxo atual com suas palavras, identifique pontos confusos e proponha uma versão melhorada de:
   - estados,
   - eventos,
   - telas,
   - mensagens de erro e feedback.  
3. No final, proponha um plano de implementação em etapas + 3 a 5 melhorias futuras.
```

---

## 2. Prompts-base para Code Assistant (ligado a GitHub / Supabase)

> Estes prompts são pensados para serem usados em um **Code Assistant com acesso ao repositório** e, idealmente, ao Supabase.

### 2.1. Implementar módulo a partir do plano do Catalyst

```text
Contexto:
Estou trabalhando no projeto [nome do projeto, ex.: OlieHub ou Agents Hub].  
Stack: [ex.: React + Vite + TypeScript + Supabase + Tailwind].

Abaixo está o plano gerado pelo Catalyst Agent para o módulo [nome do módulo].  
[COLE AQUI o resumo de requisitos + arquitetura + plano em etapas]

Sua missão:
- Implementar APENAS a etapa [número da etapa, ex.: Step 1] deste plano.  
- Trabalhar diretamente nos arquivos do repositório (criar/editar conforme necessário).  
- Manter o estilo de código e padrões do projeto.

Regras:
- Não mude comportamento crítico fora do escopo da etapa.  
- Se precisar criar novos arquivos, siga a organização sugerida pelo Catalyst (pastas, nomes).  
- Se tiver dúvidas sobre requisitos, comente no código de forma clara (TODO: ...).

Por favor:
1. Me diga quais arquivos pretende criar/editar.  
2. Aplique as mudanças.  
3. No final, liste os arquivos alterados e um resumo do que foi feito.
```

---

### 2.2. Refatorar um módulo seguindo diretrizes do Catalyst

```text
Contexto:
Catalyst Agent sugeriu refatorar o módulo [nome do módulo] para [motivo da refatoração].

Resumo das diretrizes de refactor do Catalyst:
[COLE AQUI as recomendações principais]

Sua missão:
- Aplicar essas diretrizes ao código atual.  
- Melhorar legibilidade, separação de responsabilidades e tipagem (se usar TypeScript).  
- Não alterar regras de negócio essenciais, a não ser que isso faça parte do plano.

Por favor:
1. Examine os arquivos envolvidos e diga onde estão os maiores problemas.  
2. Proponha rapidamente uma estratégia de refactor (arquivos, componentes, hooks, serviços).  
3. Aplique o refactor.  
4. Liste os arquivos modificados e descreva as melhorias principais.
```

---

### 2.3. Aplicar SQL sugerido pelo Catalyst (com cuidado)

> Para ser usado com um agente de desenvolvimento/DB, mas SEM autorizar mudanças cegas.

```text
Contexto:
Catalyst Agent sugeriu as seguintes mudanças de banco para [nome do projeto].  
[COLE AQUI o SQL ou o modelo conceitual que ele propôs]

Sua missão:
- Revisar esses comandos SQL.  
- Verificar se eles se encaixam no schema atual do Supabase/Postgres.  
- Sugerir ajustes se necessário (renomes, índices, constraints, RLS).

Regras:
- NÃO executar nada automaticamente.  
- NÃO assumir que as tabelas estão vazias; considere dados existentes.

Por favor:
1. Analise o SQL e diga o que ele faz, em linguagem simples.  
2. Aponte possíveis riscos (ex.: perda de dados, conflitos de chave, migração lenta).  
3. Se necessário, proponha uma versão revisada do SQL, com comentários explicando cada bloco.  
4. Liste passos manuais recomendados para aplicar isso em ambiente real (dev/staging/prod).
```

---

## 3. Prompts-base para agentes criativos (design, conteúdo, mídia)

> Estes são prompts para agentes focados em design, marketing, mídia, etc.  
> Idealmente, esses agentes também terão seus próprios blueprints.

### 3.1. Design de landing page / site para um projeto

```text
Quero criar o design de uma **landing page** para um projeto chamado [nome do projeto].

Contexto do projeto:
[Explique o que o projeto faz em 3–6 frases]

Público-alvo: [ex.: donos de pequenos ateliês, PMEs, etc.]  
Tom/estilo desejado: [ex.: profissional, acolhedor, moderno, minimalista]

Por favor:
1. Proponha a estrutura da landing page em seções (hero, benefícios, features, depoimentos, CTA, etc.).  
2. Sugira textos de exemplo para cada seção (títulos, subtítulos, bullets).  
3. Sugira referências de estilo visual (cores, tipografia, imagens) compatíveis com a identidade do projeto.  
4. Se possível, sugira como isso poderia ser traduzido em componentes (ex.: usando Tailwind/React).
```

---

### 3.2. Kit de comunicação visual para um novo sistema

```text
Estou criando um novo sistema chamado [nome].

Descrição rápida:
[2–4 frases]

Quero um **kit de comunicação visual inicial** com:
- paleta de cores (com HEX sugeridos),
- tipografia (famílias e onde usar),
- estilo de ícones,
- estilo de ilustrações/fotos,
- 2–3 sugestões de logos conceituais (descritas em texto).

Por favor:
1. Descreva 2 ou 3 direções de identidade visual possíveis (ex.: “moderno-tech”, “artesanal-premium”, etc.).  
2. Para cada direção, proponha paleta + tipografia + estilo de ícones/imagens.  
3. Dê exemplos de como isso se traduziria na UI (botões, cards, tabelas, formulários).
```

---

### 3.3. Materiais de divulgação (posts, apresentações, etc.)

```text
Quero criar materiais de divulgação para [projeto/sistema].

Contexto do projeto:
[2–4 frases]

Público-alvo: [descreva]  
Canais principais: [ex.: Instagram, LinkedIn, Email]

Por favor:
1. Sugira 5 ideias de posts (título + descrição + call to action).  
2. Sugira 3 ideias de carrosséis ou sequências (passo a passo, storytelling, bastidores, etc.).  
3. Sugira um roteiro básico para uma apresentação de 5–10 slides explicando o projeto.  
4. Opcional: sugira um roteiro curto (30–60s) de vídeo para apresentar o sistema.
```

---

## 4. Como evoluir este kit de prompts

- Sempre que um fluxo funcionar bem (por exemplo, Catalyst → Code Assistant → resultado bom), copie esse prompt e salve aqui.  
- Organize por categorias: Catalyst, Code, DB, Criativo, Ops, etc.  
- Crie, no futuro, **blueprints de agentes** específicos para cada tipo de prompt (“Code Assistant do OlieHub”, “Agente de Design do Hub”, etc.).  
- Use este arquivo como base para treinar/ajustar novos agentes ou GPTs personalizados.
