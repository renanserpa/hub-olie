# Camada Criativa Visual – Olie Atlas Network

> Camada dedicada a **identidade visual, UI, design gráfico, mockups e composição de cenas**.  
> Atua depois da Camada Cognitiva (ideia, visão, personas) e em paralelo à Camada de Arquitetura Técnica.

Enquanto a Camada Cognitiva responde “o que queremos e para quem?”,  
a **Camada Criativa Visual** responde: **“como isso deve se parecer e se sentir visualmente?”**

---

## 1. Objetivo da Camada Criativa Visual

- Criar **linguagem visual** para projetos, produtos, marcas e sistemas.
- Ajudar a traduzir requisitos de produto em:
  - identidades visuais,
  - interfaces,
  - materiais gráficos,
  - cenas e ambientes.
- Servir tanto a:
  - sistemas (UIs de aplicativos, dashboards, sites), quanto
  - produtos físicos (mockups, estampas, texturas).

---

## 2. Principais Agentes da Camada Criativa Visual

| Agente              | Função                                                                 | Tipo                          |
|---------------------|------------------------------------------------------------------------|-------------------------------|
| 🖼️ VisualDesignerAI  | Cria identidades visuais, logos e layouts.                            | Designer Gráfico              |
| 🧠 StyleTransferAI   | Converte estilos visuais (realista, cartoon, sketch, etc.).           | Processamento de Imagem       |
| 🎨 UXBuilderAI       | Cria wireframes, UIs e interações.                                    | UX / UI Designer              |
| 🧵 TextileAI         | Cria tecidos, padrões e texturas (CLO3D, Substance, etc.).            | Moda / Materiais              |
| 🧱 3DDesignerAI      | Modela objetos 3D e renderiza ambientes.                              | Modelagem / 3D / Blender      |
| 🧩 SceneComposerAI   | Cria composições completas (cenários, ambientes, luz, enquadramento). | Direção de Arte               |
| 🧰 ProductMockupAI   | Gera mockups de produtos físicos em contexto realista.                | Designer de Produto / Mockups |

---

## 3. Entradas e Saídas típicas desta camada

**Entradas** (vêm principalmente da Camada Cognitiva e do Catalyst):
- descrição do produto/sistema,
- público-alvo e personas,
- tom de marca (ex.: artesanal, tech, premium, lúdico),
- requisitos de UI (ex.: tabelas, cards, filtros, formulários),
- necessidades de materiais (ex.: posts, cartões, etiquetas, mockups).

**Saídas**:
- descrições de identidades visuais,
- guidelines de UI (cores, tipografia, componentes),
- ideias de telas/wireframes e fluxos visuais,
- especificações de imagens para geração com modelos visuais,
- descrições de mockups, cenas 3D, cenários e composições.

---

## 4. Relação com outras camadas

- **Camada Cognitiva**
  - Define visão, propósito, personas, tom de voz.
  - Alimenta a Camada Criativa Visual com contexto.

- **Camada de Arquitetura Técnica**
  - Define componentes, estruturas de UI (páginas, rotas, estados).
  - Trabalha junto com UXBuilderAI para transformar componentes em telas reais.

- **Camada Audiovisual / Story Crew**
  - Complementa o visual com narrativa, vídeo, som, emoção.

- **Camada Operacional / Marketing (futuro)**
  - Usa os outputs da Camada Criativa Visual para campanhas, materiais, documentações.

---

## 5. Blueprints sugeridos

Cada agente desta camada deve ter um blueprint próprio em arquivos `.md`, por exemplo:

- `agents/visual-designer-ai.md`
- `agents/style-transfer-ai.md`
- `agents/ux-builder-ai.md`
- `agents/textile-ai.md`
- `agents/3d-designer-ai.md`
- `agents/scene-composer-ai.md`
- `agents/product-mockup-ai.md`

Cada blueprint deve definir:
- objetivos,
- escopo / fora de escopo,
- tipos de entrada/saída,
- integrações (por exemplo, Figma, Canva, geradores de imagem, motores 3D),
- exemplos de prompts práticos,
- relação com projetos específicos (ex.: OlieHub, outros produtos).

---
