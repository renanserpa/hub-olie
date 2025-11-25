# Arquitetura de Conhecimento – Agents Hub & Projetos (v1)

> Este documento define **como organizar o conhecimento** dentro do ecossistema:
> - por projeto,
> - por domínio (ex.: manufatura, costura, bordado),
> - por agente,
> - e como reaproveitar isso em novos projetos.

A ideia é que, com o tempo, o Agents Hub se torne uma **grande biblioteca estruturada**, onde:
- cada projeto contribui com conhecimento específico,
- cada domínio (ex.: ateliê de costura) vira um “pacote de conhecimento”,
- e os agentes sabem como usar esse material.

---

## 1. Tipos de Conhecimento no Ecossistema

Vamos considerar quatro camadas principais de conhecimento:

1. **Conhecimento Global (Core / Plataforma)**
   - conceitos que se aplicam a vários projetos:
     - arquitetura de agentes,
     - modelo de dados do Agents Hub,
     - stack de tecnologias (Supabase, Vercel, Gemini, etc.),
     - padrões de prompts (prompt-kits),
     - boas práticas de desenvolvimento, UX, ops.

2. **Conhecimento de Projeto**
   - documentação específica de cada projeto/sistema:
     - visão geral do produto,
     - módulos,
     - fluxos,
     - decisões de arquitetura,
     - integrações,
     - backlog relevante.

3. **Conhecimento de Domínio**
   - conhecimento do “mundo real” para o qual o sistema existe:
     - no caso do OlieHub:
       - manufatura sob demanda,
       - operação de ateliê,
       - tipos de máquinas,
       - etapas de produção,
       - papéis (costureira, bordadeira, logística, etc.).
     - em outro projeto, poderia ser:
       - educação, saúde, logística, finanças, etc.

4. **Conhecimento de Agente**
   - blueprints e materiais específicos para cada agente:
     - escopo, responsabilidades,
     - tipos de entrada/saída,
     - integrações,
     - exemplos de uso,
     - dicas de como conversar com esse agente.

---

## 2. Estrutura Sugerida de Pastas / Arquivos

Uma forma simples e escalável de organizar isso em um repositório (ou área de knowledge) é:

```text
knowledge/
  stack-links.md                  # Tecnologias globais do ecossistema
  prompt-kits.md                  # Kits de prompts globais
  agents-hub-overview.md          # Visão geral do Agents Hub
  agents-hub-data-model-conceptual.md
  agents-core.md                  # Core de agentes
  agents-architect-agent.md
  catalyst-agent.md
  god-ideas-agent.md
  core-code-assistant.md
  ... (outros blueprints globais)

  projects/
    oliehub/
      oliehub-overview.md         # Visão geral do OlieHub
      oliehub-architecture.md     # Módulos, fluxos, integrações
      oliehub-status-roadmap.md   # Fases, versões, backlog macro
      domain/
        atelier-manufacturing-overview.md
        sewing-machines-basics.md
        embroidery-machines-basics.md
        production-workflow-atelier.md
        quality-control-atelier.md
      agents/
        oliehub-catalyst-agent.md
        oliehub-code-assistant.md
        oliehub-ops-agent.md
        ... (quando existirem)
      prompts/
        oliehub-specific-prompts.md
        oliehub-support-scenarios.md

    agents-hub/
      agents-hub-overview.md      # já existe, pode ser referenciado aqui
      agents-hub-ux-ideas.md
      agents-hub-roadmap.md
      agents-hub-agents-mapping.md

    outro-projeto/
      ...

```

Isso permite:

- separar claramente o que é **global** do que é **por projeto**;
- dentro de cada projeto, separar:
  - visão do sistema,
  - domínio do negócio,
  - agentes daquele projeto,
  - prompts específicos.

---

## 3. Conhecimento de Domínio – Exemplo: Ateliê / OlieHub

Quando o OlieHub estiver mais maduro, podemos ter um pacote de domínio, por exemplo:

### 3.1. `atelier-manufacturing-overview.md`

- visão geral da operação de um ateliê:
  - tipos de produto,
  - fluxo de pedido → produção → expedição,
  - principais papéis (costureira, bordadeira, cortador, etc.).

### 3.2. `sewing-machines-basics.md`

- tipos de máquinas de costura,
- capacidades,
- limitações,
- manutenção básica,
- como isso impacta:
  - tempo de produção,
  - qualidade,
  - restrições técnicas.

### 3.3. `embroidery-machines-basics.md`

- tipos de máquinas de bordado,
- bastidores, fios, tipos de ponto,
- tempos por área de bordado,
- como isso dialoga com:
  - cadastro de produtos,
  - capacidade produtiva,
  - filas de produção.

### 3.4. `production-workflow-atelier.md`

- passo a passo da produção:
  - receber pedido,
  - confirmação de arte,
  - preparação de aviamentos/tecidos,
  - costura,
  - bordado,
  - inspeção,
  - embalagem,
  - expedição.

Tudo isso vira **base de conhecimento** não só para o OlieHub, mas para:

- futuros sistemas de manufatura personalizados,
- agentes especialistas em operações de ateliê,
- agentes de planejamento de capacidade, etc.

---

## 4. Como os Agentes Usam esse Conhecimento

### 4.1. Catalyst Agent

- Quando desenha módulos de produção para o OlieHub (ou sistemas similares), pode:
  - consultar os arquivos de domínio (`atelier-manufacturing-overview.md`, etc.),
  - entender restrições reais (máquinas, tempos, qualidade),
  - propor fluxos e dados mais aderentes à realidade.

### 4.2. GOD Ideas Agent

- Pode usar conhecimento de domínio para:
  - enriquecer ideias (ex.: “essa ideia afetaria o fluxo de costura e bordado?”),
  - sugerir tags e classificações (ex.: `produção`, `logística`, `máquinas`).

### 4.3. Core Code Assistant

- Usa esse conhecimento mais indiretamente:
  - ao implementar features descritas pelo Catalyst, sabe que existem conceitos de domínio que precisam ser respeitados (campos, regras, validações).

### 4.4. Creative Experience Agent

- Pode usar o pacote de domínio para:
  - criar telas, materiais, textos e imagens que falem a linguagem do ateliê,
  - produzir catálogos, apresentações e materiais comerciais para o Ateliê Olie,
  - gerar conteúdos que façam sentido para o público final (clientes do ateliê).

### 4.5. Ops & Analytics Agent

- Pode usar domínio para interpretar métricas:
  - taxa de retrabalho,
  - tempo médio de produção por tipo de peça,
  - gargalos por tipo de máquina,
  - sazonalidade de pedidos.

---

## 5. Reuso em Outros Projetos

O grande benefício de organizar o conhecimento assim é o **reaproveitamento**:

- O conhecimento de **manufatura de ateliê** pode ser útil em:
  - outros ERPs de produção,
  - sistemas de planejamento de capacidade,
  - chatbots de suporte para operadores.

- O conhecimento de **stack técnica** (Supabase, Vercel, etc.) já está em `stack-links.md`,
  - e pode ser usado por qualquer projeto que compartilhe essas tecnologias.

- O conhecimento sobre **padrões de agentes** (agents-core, blueprints) é global,
  - e toda vez que um novo projeto nasce, ele já parte dessa base.

---

## 6. Boas Práticas para Criar Novos Documentos de Conhecimento

1. **Um arquivo = um tema claro**
   - Evitar documentos gigantes com tudo misturado.
   - Melhor ter vários arquivos menores bem nomeados.

2. **Nomear de forma explícita**
   - `atelier-manufacturing-overview.md` (claro e descritivo),
   - em vez de `anotacoes-aleatorias.md`.

3. **Sempre incluir:**
   - contexto (onde isso se aplica),
   - termos importantes (glossário mínimo),
   - exemplos práticos.

4. **Tagging / referências internas**
   - no começo do documento, referenciar outros arquivos relevantes:
     - “Relacionado a: `oliehub-overview.md`, `stack-links.md`…”


5. **Pensar nos agentes como leitores**
   - Escrever de forma que um agente (Catalyst, Creative, Ops) consiga usar aquilo.
   - Explicar conceitos-chave e relações com o sistema.

---

## 7. Próximos Passos Práticos

1. **Para o Agents Hub:**
   - Já temos vários arquivos globais (core de agentes, modelo de dados, stack, prompt-kits).
   - Próximo passo é criar:
     - `agents-hub-ux-ideas.md` (ideias de UX do próprio hub),
     - `agents-hub-roadmap.md` (fases de entrega).

2. **Para o OlieHub (quando focarmos nele):**
   - Criar pelo menos:
     - `oliehub-overview.md` (já existe em parte, podemos consolidar),
     - `atelier-manufacturing-overview.md`,
     - `sewing-machines-basics.md`,
     - `embroidery-machines-basics.md`,
     - `production-workflow-atelier.md`.

3. **Para cada novo projeto:**
   - criar uma pastinha em `knowledge/projects/<nome-do-projeto>/`,
   - começar com `overview.md` + uma pasta `domain/`,
   - deixar os agentes ajudarem a detalhar.

Este documento serve como referência para você (GOD user) e para o **Agents Architect / Catalyst**,  
quando forem decidir **como e onde** guardar o próximo pedaço de conhecimento que nascer.
