# Relatório de Migração e Análise Comparativa: Settings v3.0

**Executor:** Arquiteto-Executor Sênior (Crew-Gemini)
**Data:** 2024-07-29

## 1. Objetivo

Este documento detalha o processo de consolidação das versões 1.0 e 2.0 do Módulo de Configurações (`Settings`) para criar a versão 3.0. O objetivo é unificar as melhores características de ambas, resultando em um módulo mais completo, resiliente e preparado para o futuro.

## 2. Análise Comparativa: v1 vs. v2

| Característica | Versão 1.0 (O que foi mantido) | Versão 2.0 (O que foi incorporado) | Consolidação na v3.0 |
| :--- | :--- | :--- | :--- |
| **Estrutura de Abas** | 7 abas principais (conceitual) | 5 abas principais (com sub-abas) | **7 abas principais unificadas**, com sub-abas aninhadas para Catálogos e Materiais, conforme a visão mais completa. |
| **Catálogos** | Paletas, 4 tipos de cores. | Paletas, 7 tipos de cores, Texturas, Fontes para monogramas. | **Incorporado:** A estrutura expandida com 7 cores, texturas e fontes é agora o padrão. |
| **Materiais** | Grupos de Insumo, Materiais Básicos. | Grupos de Suprimento, Materiais Básicos. | **Consolidado:** Mantida a estrutura de dois níveis, com nomenclatura e campos alinhados. |
| **Logística** | Apenas placeholders. | Seção completa: Métodos de Entrega, Cálculo de Frete, Simulador, Embalagens, Vínculos. | **Visão da v2 Adotada:** A estrutura completa foi implementada como placeholders, indicando as tabelas necessárias. |
| **Sistema (Settings)** | Tabela `system_settings` como Key-Value. Hook `useSystemSettings`. | Tabela `system_settings` como Key-Value. Hook `useSystemSettings`. | **Consolidado:** O padrão Key-Value e o hook foram mantidos e aprimorados. |
| **Aparência / Mídia** | Placeholders. | Conceito detalhado com Storage Buckets (`product-media`, `material-media`) e tabela `media_assets`. | **Visão da v2 Adotada:** A arquitetura de mídia foi implementada como um placeholder informativo. |
| **Segurança** | **Base do v3:** Modelo RBAC detalhado com `user_roles`, `app_role`, `has_role()`, `is_admin()`. Hook `useAdminAccess`. RLS bem definido. | Menção ao RLS e hook `useAdminAccess`. | **Modelo v1 Mantido:** O sistema de permissões, funções e políticas RLS da v1 foi preservado integralmente por ser mais robusto e detalhado. |
| **Componentes UI** | Managers genéricos (`TableManager`, `EditDrawer`). Tratamento de erros. Validação Zod. | Managers específicos por aba. | **Modelo v1 Mantido e Expandido:** O `TableManager` (agora `TabContent`) foi mantido como base e aprimorado para suportar a complexidade da v3, incluindo uploads de arquivos. |
| **Resiliência de Dados** | Não especificado. | Não especificado, mas implícito. | **Nova Feature do v3:** O `supabaseService` agora detecta tabelas inexistentes, retorna `[]` para evitar crashes, e **loga um relatório no console**, facilitando o diagnóstico e a migração. |

## 3. Estratégia de Unificação para a Versão 3.0

-   **Fundação de Segurança da v1:** A base de segurança (RLS, funções `is_admin`, `has_role`) e a arquitetura de componentes genéricos (`TableManager`/`TabContent`) foram mantidas como a espinha dorsal.
-   **Escopo de Dados da v2:** A arquitetura de dados expandida (16 tabelas) e a estrutura de navegação aninhada da v2 foram adotadas como o "mapa" para a funcionalidade completa.
-   **Implementação Híbrida e Progressiva:** O sistema foi codificado para suportar o escopo completo da v2. Onde as tabelas correspondentes existem no schema atual (`schema.json`), os gerenciadores (`TabContent`) são renderizados. Onde não existem, o componente `PlaceholderContent` é exibido, informando ao administrador qual tabela precisa ser criada.

## 4. Próximos Passos: Migração Incremental

A versão 3.0 está funcional com os dados existentes e preparada para o futuro. Para habilitar todas as funcionalidades, a seguinte sequência de migrações no banco de dados Supabase é recomendada:

1.  **Habilitar Catálogos Completos:**
    -   `CREATE TABLE public.config_color_palettes (...)`
    -   `CREATE TABLE public.lining_colors (...)`
    -   `CREATE TABLE public.puller_colors (...)`
    -   `CREATE TABLE public.embroidery_colors (...)`
    -   `CREATE TABLE public.config_fabric_textures (...)`

2.  **Habilitar Materiais Completos:**
    -   `CREATE TABLE public.config_supply_groups (...)`

3.  **Habilitar Logística:**
    -   Criar as 4 tabelas de logística: `logistics_delivery_methods`, `logistics_freight_params`, `config_packaging_types`, `config_bond_types`.

4.  **Habilitar Mídia:**
    -   Criar os buckets `product-media` e `material-media` no Supabase Storage.
    -   `CREATE TABLE public.media_assets (...)`

A cada migração aplicada, a UI do módulo Settings v3 irá automaticamente "desbloquear" a seção correspondente, substituindo o placeholder pelo gerenciador de dados funcional, sem necessidade de alteração no código frontend.