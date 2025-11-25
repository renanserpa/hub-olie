# Interaction Guidelines – Como Conversar com os Agentes

> Este documento define como o GOD user (e futuros usuários) devem interagir com o
> ecossistema de agentes para obter o melhor resultado.

Ele também serve para que os próprios agentes entendam o “estilo de trabalho” esperado.

---

## 1. Princípios Gerais

1. **Sempre dar contexto mínimo**
   - Projeto em questão (ex.: Agents Hub, OlieHub, outro).
   - Objetivo da conversa (ex.: nova feature, refactor, agente novo).
   - Fase aproximada (ideia, design, implementação, operação).

2. **Trabalhar em etapas**
   - Evitar pedir “faça tudo de uma vez”.
   - Preferir:
     - entender → perguntar → planejar → executar.

3. **Permitir perguntas dos agentes**
   - É desejável que agentes como o Catalyst perguntem antes de propor soluções.
   - Perguntas ajudam a evitar suposições erradas.

4. **Evitar misturar muitos objetivos numa mesma mensagem**
   - Melhor separar:
     - conversa de ideação,
     - conversa de design,
     - conversa de implementação.

5. **Confirmar entendimento em pontos críticos**
   - Se o resultado de uma decisão é grande (alterar arquitetura, criar novo agente),
     - pedir um resumo de entendimento,
     - revisar antes de seguir.

---

## 2. Quando usar qual agente

### 2.1. GOD Ideas & Backlog Agent

Use quando:
- Quer despejar ideias soltas.
- Quer estruturar backlog.
- Quer priorizar ideias.
- Quer ver quais ideias estão prontas para design.

### 2.2. Agents Architect & Orchestrator

Use quando:
- A ideia envolve **novos agentes** ou mudança em agentes existentes.
- Quer saber qual “time de agentes” usar em um novo projeto.
- Quer organizar/limpar o catálogo de agentes.

### 2.3. Catalyst Agent (ou Project Catalyst)

Use quando:
- A ideia está madura o suficiente para virar:
  - módulo,
  - sistema,
  - fluxo,
  - ou pacote de features.
- Você quer:
  - requisitos claros,
  - arquitetura proposta,
  - plano em etapas.

### 2.4. Core Code Assistant

Use quando:
- Já existe um plano claro (do Catalyst ou de você).
- Quer implementar uma etapa específica.
- Quer refatorar código seguindo diretrizes.
- Quer integrar algo com Supabase / APIs.

### 2.5. Docs & Knowledge Agent

Use quando:
- Quer gerar ou atualizar documentação.
- Quer registrar decisões tomadas.
- Quer resumos para onboarding.

### 2.6. Ops & Analytics Agent

Use quando:
- Tem dados, métricas, logs.
- Quer entender gargalos e oportunidades técnicas/operacionais.

### 2.7. Creative Experience Agent

Use quando:
- Precisa de:
  - telas e UX,
  - textos de marketing,
  - roteiros,
  - materiais de apresentação,
  - ideias visuais/sonoras.

---

## 3. Estrutura sugerida de mensagens

### 3.1. Moldura básica

Ao iniciar uma conversa sobre um tema novo com um agente, use algo como:

```text
Projeto: [nome do projeto, ou "multi-projeto"]

Objetivo principal desta conversa:
[ex.: desenhar um novo módulo, organizar backlog, criar um agente, etc.]

Contexto rápido:
[2–5 frases explicando a situação]

O que eu quero de você agora:
[ex.: me fazer perguntas, organizar requisitos, propor arquitetura, etc.]
```

### 3.2. Exemplo para Catalyst

```text
Projeto: Agents Hub

Objetivo desta conversa:
Desenhar o módulo de cadastro e visualização de projetos.

Contexto rápido:
Já definimos o modelo conceitual de projects/agents/ideas.
Agora quero uma tela e fluxo para CRUD de projects, com boa UX.

O que eu quero de você agora:
1) Reescrever o que você entendeu.
2) Me fazer 5–8 perguntas.
3) Depois das respostas, propor requisitos, arquitetura front/back e um plano em etapas.
```

### 3.3. Exemplo para Core Code Assistant

```text
Projeto: Agents Hub
Stack: React + Vite + TS + Supabase

Contexto:
O Catalyst já propôs o plano abaixo para o módulo de projects:
[cole o plano]

Escopo desta etapa:
Implementar apenas o Step 1: listar projetos existentes em uma página.

O que eu quero de você agora:
1) Dizer quais arquivos pretende criar/editar.
2) Sugerir a estrutura básica dos componentes/hooks/services.
3) Implementar o Step 1.
4) No final, listar os arquivos alterados e resumir o que foi feito.
```

---

## 4. Boas práticas de uso contínuo

1. **Guardar prompts que funcionaram bem**
   - Sempre que uma interação der muito certo, salvar aquele prompt em `prompt-kits.md`.

2. **Referenciar documentos de conhecimento**
   - Ex.: “Conforme `agents-hub-data-model-conceptual.md`…”,  
     ou “Use o glossário em `ecosystem-glossary.md` para manter a mesma linguagem.”

3. **Evitar depender da memória da conversa para decisões críticas**
   - Quando uma decisão for importante:
     - peça para o Docs Agent gerar um ADR ou um resumo e salve em markdown.

4. **Fechar ciclos**
   - Se algo foi só planejado, marcar como tal.
   - Se foi implementado, pedir para o Docs Agent atualizar as docs e para o Ops Agent observar.

---

## 5. O que os agentes devem esperar de você (GOD user)

- Clareza sobre:
  - qual projeto,
  - qual objetivo,
  - qual horizonte (v1, v2, longo prazo).

- Disponibilidade para:
  - responder perguntas,
  - escolher entre opções,
  - aprovar planos antes de implementar.

- Input honesto sobre:
  - o que ficou bom,
  - o que precisa melhorar,
  - quais estilos de resposta funcionam melhor para você.

---

## 6. O que você pode esperar dos agentes

- Que perguntem quando o contexto não estiver claro.
- Que proponham alternativas e expliquem trade-offs.
- Que dividam o trabalho em etapas pequenas e rastreáveis.
- Que atualizem ou apontem para os documentos corretos quando fizerem algo importante.

---

## 7. Atualizações futuras

Estas diretrizes podem ser refinadas conforme:

- novos agentes entrarem no ecossistema,
- você identificar padrões de interação que funcionam muito bem,
- ou notar comportamentos que valem ser reforçados (ou evitados).

Sempre que ajustar este documento, considere também atualizar `prompt-kits.md`
com novos exemplos concretos.
