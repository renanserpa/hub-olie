# Relatório de Migração e Análise Comparativa: Logistics v3.0

**Executor:** Arquiteto-Executor Sênior (Crew-Gemini)
**Data:** 2024-07-30

## 1. Objetivo

Este documento detalha o processo de unificação das versões 1.0 e 2.0 do Módulo de Logística (`Logistics`) para criar a versão 3.0. O objetivo é consolidar a gestão de status, configurações de entrega e o fluxo operacional de WMS (Warehouse Management System) em um único módulo coeso, robusto e integrado ao Olie Hub.

## 2. Análise Comparativa: v1 vs. v2

| Característica | Versão 1.0 (Conceitual) | Versão 2.0 (Foco em WMS) | Consolidação na v3.0 |
| :--- | :--- | :--- | :--- |
| **Estrutura de Abas** | Foco na gestão de **Status** (Pedidos, Produção, Entregas) e configurações. | Foco no fluxo operacional: **Fila, Ondas, Picking, Packing, Expedição**. | **Estrutura v2 Adotada:** A v3 foi implementada com a visão de fluxo de WMS, por ser mais completa e abranger todo o processo de saída. A gestão de status foi movida para dentro da aba "Configurações" da logística. |
| **Gerenciador de Status** | Componente central do módulo, gerenciando 3 tipos de status. | Não era o foco principal, mas os status são usados no Kanban de expedição. | **Funcionalidade Mantida e Remanejada:** A ideia de um gerenciador de status foi mantida, mas agora reside dentro da aba de "Configurações" do módulo de Logística, em vez de ser o módulo inteiro. |
| **Ondas de Separação (Picking Waves)** | Não existente. | **Funcionalidade Core:** Criação de "ondas" para agrupar pedidos e otimizar a separação. | **Funcionalidade Core Adotada na v3:** O sistema de criação de ondas a partir de uma fila de pedidos prontos é a principal feature da nova aba "Fila & Ondas". |
| **Picking & Packing** | Não existente. | Painéis dedicados para tarefas de separação e embalagem, com validação por scan. | **Implementado como Placeholders:** Os painéis de Picking e Packing foram criados na UI, com placeholders que indicam as tabelas `logistics_pick_tasks` e `logistics_packages` como pré-requisitos. |
| **Expedição (Shipments)** | Foco em integrações (gerar etiqueta, rastreio) via `logistics` JSONB no pedido. | **Kanban Visual:** Um `ShipmentBoard` para acompanhar o status de cada envio (`pending` -> `delivered`). | **Visão Híbrida:** A v3 adota o Kanban de expedição da v2 para a gestão visual. As ações de integração da v1 (gerar etiqueta, etc.) serão acionadas a partir dos cards neste Kanban. |
| **Hooks de Dados** | Hook simples para carregar os status. | Múltiplos hooks especializados (`useWaves`, `usePicking`, `useShipment`). | **Hook Orquestrador Central:** Foi criado um único `useLogistics` que gerencia o estado de todo o módulo, busca dados de múltiplos locais (`orders`, `logistics_waves`) e calcula dados derivados (a fila de picking). |
| **Segurança (RLS)** | Políticas genéricas para admin. | Políticas aplicadas a novas tabelas como `logistics_waves`. | **Modelo Consolidado:** Políticas de RLS foram definidas para as novas tabelas, com permissões granulares para roles como `admin` e `atendimento`. |

## 3. Estratégia de Unificação para a Versão 3.0

-   **Módulo como Fluxo de Trabalho:** A UI foi desenhada para guiar o usuário através do processo logístico real: ver a fila, criar uma onda, separar, embalar e expedir.
-   **Centralização da Lógica no `useLogistics`:** Este hook se tornou o cérebro do módulo. Ele busca os pedidos que estão no status `paid` ou `in_production`, filtra aqueles que ainda não estão em nenhuma onda, e os apresenta na "Fila de Picking", criando uma fonte de dados dinâmica e em tempo real.
-   **Componentes Modulares e Reutilizáveis:** Foram criados componentes específicos para cada parte do fluxo, como `QueuePanel`, `CreateWaveDialog`, e `ShipmentBoard`, garantindo que a complexidade seja encapsulada e a manutenção seja facilitada.
-   **Implementação Progressiva com Placeholders:** Onde as funcionalidades dependem de tabelas ainda não migradas (como picking e packing), placeholders informativos foram utilizados para não bloquear o desenvolvimento e indicar claramente os próximos passos.

## 4. Próximos Passos: Migração Incremental

A versão 3.0 está funcional para a criação de ondas e visualização de expedições. Para habilitar o fluxo completo de WMS, a seguinte sequência de migrações no banco de dados Supabase é recomendada:

1.  **Habilitar Tabelas Base (Já implementado no mock):**
    -   `CREATE TABLE public.logistics_waves (...)`
    -   `CREATE TABLE public.logistics_shipments (...)`

2.  **Habilitar Picking Detalhado:**
    -   `CREATE TABLE public.logistics_pick_tasks (...)` (para listar os itens de uma onda).

3.  **Habilitar Packing e Rastreamento:**
    -   `CREATE TABLE public.logistics_packages (...)` (para registrar pacotes, peso, dimensões).
    -   `CREATE TABLE public.logistics_labels (...)` (para armazenar as etiquetas geradas).

4.  **Habilitar Configurações Avançadas:**
    -   `CREATE TABLE public.logistics_delivery_methods (...)`
    -   `CREATE TABLE public.logistics_freight_params (...)`
    -   `CREATE TABLE public.config_packaging_types (...)`

A cada migração, os placeholders correspondentes na UI do Logistics v3 podem ser substituídos pelos componentes funcionais, desbloqueando progressivamente todo o poder do módulo.