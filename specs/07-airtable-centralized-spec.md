# 🎯 Especificación: Centralización de Data en Airtable

## 📋 Resumen Ejecutivo

Esta especificación propone **centralizar toda la data del bot en Airtable** como fuente única de verdad, mientras se mantiene una base de datos local mínima para datos operativos (threads, modelos, configuraciones). El bot dependerá exclusivamente de la data de Airtable, y se establecerán procesos externos para nutrir esa data desde CRM, blogs, y otras fuentes.

### 🎯 Objetivos

- **Centralizar toda la data** en Airtable como fuente única de verdad
- **Desacoplar el bot** de fuentes de data externas directas
- **Simplificar la arquitectura** eliminando múltiples integraciones
- **Facilitar mantenimiento** de data a través de procesos externos
- **Mejorar escalabilidad** y flexibilidad del sistema

---

## 🏗️ Arquitectura Centralizada

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                    ADMISSIONS BOT                      │
│                 (Solo Airtable + DB Local)             │
├─────────────────────────────────────────────────────────┤
│ • Airtable: KB, Contenido, Leads, Configuraciones      │
│ • DB Local: Threads, Modelos, Logs, Estado Operativo   │
│ • Sin integraciones directas a CRM o fuentes externas  │
└─────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────┐
│                    HITL HANDLER                        │
│                 (Airtable + Slack)                     │
├─────────────────────────────────────────────────────────┤
│ • Tickets en Airtable                                  │
│ • Notificaciones en Slack                              │
│ • Sin integración directa a sistemas externos          │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Canal     │───▶│ Admissions  │───▶│   HITL      │
│ (WhatsApp)  │    │    Bot      │    │  Handler    │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                   ┌─────────────┐
                   │   Airtable  │
                   │ (Data Hub)  │
                   └─────────────┘
                          │
                   ┌─────────────┐
                   │   DB Local  │
                   │ (Operativo) │
                   └─────────────┘
```

---

## 📊 Estructura de Airtable

### Base: Henry Admissions Bot

#### Tabla 1: Knowledge Base (KB)

| Campo        | Tipo             | Descripción                                    |
| ------------ | ---------------- | ---------------------------------------------- |
| ID           | Auto Number      | Identificador único                            |
| Question     | Single Line Text | Pregunta o consulta                            |
| Answer       | Long Text        | Respuesta completa                             |
| Category     | Single Select    | Categoría (Precios, Programas, Admisión, etc.) |
| Tags         | Multiple Select  | Tags para búsqueda (país, programa, etc.)      |
| Confidence   | Number           | Nivel de confianza (0-100)                     |
| Source       | Single Line Text | Fuente de la información                       |
| Last Updated | Date             | Última actualización                           |
| Status       | Single Select    | Activo/Inactivo/En Revisión                    |
| Priority     | Single Select    | Alta/Media/Baja                                |
| Assigned To  | Person           | Responsable de mantener                        |

**Ejemplos:**

- Question: "¿Cuánto cuesta el programa Full Stack?"
- Answer: "El programa Full Stack tiene un costo de $4,000 USD..."
- Category: "Precios"
- Tags: ["full-stack", "precios", "argentina", "mexico"]

#### Tabla 2: Content Repository

| Campo        | Tipo             | Descripción                      |
| ------------ | ---------------- | -------------------------------- |
| ID           | Auto Number      | Identificador único              |
| Title        | Single Line Text | Título del contenido             |
| Type         | Single Select    | Video/Artículo/Evento            |
| Program      | Single Select    | Programa asociado                |
| Link         | URL              | Enlace al contenido              |
| Tags         | Multiple Select  | Tags para segmentación           |
| Country      | Multiple Select  | Países objetivo                  |
| Objective    | Multiple Select  | Objetivos (cambio_carrera, etc.) |
| Metadata     | Long Text        | JSON con metadatos adicionales   |
| Status       | Single Select    | Activo/Inactivo/En Revisión      |
| Created Date | Date             | Fecha de creación                |
| Last Used    | Date             | Última vez usado                 |
| Usage Count  | Number           | Veces que se ha usado            |

**Ejemplos:**

- Title: "Graduado Full Stack en Argentina"
- Type: "Video"
- Program: "Full Stack + AI"
- Tags: ["argentina", "cambio_carrera", "fintech"]
- Metadata: `{"duration": "1:15", "graduate_role_before": "Atención al cliente", "graduate_role_after": "Desarrollador Full Stack"}`

#### Tabla 3: Leads

| Campo               | Tipo             | Descripción                    |
| ------------------- | ---------------- | ------------------------------ |
| ID                  | Auto Number      | Identificador único            |
| Lead ID             | Single Line Text | ID del lead en sistema externo |
| First Name          | Single Line Text | Nombre del lead                |
| Country             | Single Select    | País del lead                  |
| Program Interest    | Single Select    | Programa de interés            |
| Stage               | Single Select    | Etapa del lead                 |
| Objective           | Single Select    | Objetivo del lead              |
| Experience Level    | Single Select    | Nivel de experiencia           |
| Last Contact        | Date             | Último contacto                |
| No Response Count   | Number           | Contador de no respuesta       |
| Cohort Date         | Date             | Fecha de cohorte               |
| Seats Remaining Low | Checkbox         | Asientos limitados             |
| Status              | Single Select    | Activo/Inactivo/Convertido     |
| Source              | Single Line Text | Fuente del lead                |
| Created Date        | Date             | Fecha de creación              |

#### Tabla 4: Cadence Rules

| Campo                | Tipo          | Descripción               |
| -------------------- | ------------- | ------------------------- |
| ID                   | Auto Number   | Identificador único       |
| Stage                | Single Select | Etapa del lead            |
| Channel              | Single Select | Canal de comunicación     |
| Min Interval Hours   | Number        | Intervalo mínimo en horas |
| Max Messages Per Day | Number        | Máximo mensajes por día   |
| Active Hours Start   | Number        | Hora de inicio (0-23)     |
| Active Hours End     | Number        | Hora de fin (0-23)        |
| Skip Weekends        | Checkbox      | Saltar fines de semana    |
| Status               | Single Select | Activo/Inactivo           |

#### Tabla 5: Content Selection Rules

| Campo        | Tipo            | Descripción         |
| ------------ | --------------- | ------------------- |
| ID           | Auto Number     | Identificador único |
| Stage        | Single Select   | Etapa del lead      |
| Priority     | Number          | Prioridad (1-10)    |
| Content Type | Single Select   | Tipo de contenido   |
| Program      | Single Select   | Programa objetivo   |
| Country      | Multiple Select | Países objetivo     |
| Objective    | Multiple Select | Objetivos objetivo  |
| Weight       | Number          | Peso para selección |
| Status       | Single Select   | Activo/Inactivo     |

#### Tabla 6: HITL Tickets

| Campo          | Tipo             | Descripción                           |
| -------------- | ---------------- | ------------------------------------- |
| ID             | Auto Number      | Identificador único                   |
| Ticket ID      | Single Line Text | ID del ticket                         |
| Lead ID        | Single Line Text | ID del lead                           |
| Thread ID      | Single Line Text | ID del thread                         |
| Status         | Single Select    | Abierto/Esperando/Respondido/Resuelto |
| Reason         | Single Select    | Razón del escalamiento                |
| Question       | Long Text        | Pregunta del usuario                  |
| Proposed Reply | Long Text        | Respuesta propuesta                   |
| Owner          | Person           | Responsable del ticket                |
| Notes          | Long Text        | Notas del equipo                      |
| Urgency        | Single Select    | Baja/Media/Alta                       |
| SLA Hours      | Number           | SLA en horas                          |
| Created Date   | Date             | Fecha de creación                     |
| Updated Date   | Date             | Fecha de actualización                |

#### Tabla 7: Bot Configuration

| Campo        | Tipo             | Descripción            |
| ------------ | ---------------- | ---------------------- |
| ID           | Auto Number      | Identificador único    |
| Key          | Single Line Text | Clave de configuración |
| Value        | Long Text        | Valor de configuración |
| Category     | Single Select    | Categoría              |
| Description  | Long Text        | Descripción            |
| Last Updated | Date             | Última actualización   |

**Ejemplos:**

- Key: "default_response_timeout"
- Value: "30"
- Category: "Performance"
- Description: "Tiempo máximo de respuesta en segundos"

---

## 🔄 Procesos de Nutrición de Data

### Proceso 1: Sincronización desde CRM (HubSpot)

**Frecuencia:** Cada 15 minutos
**Responsable:** Proceso externo (cron job)

```typescript
// Proceso de sincronización
interface CRMSyncProcess {
  // 1. Obtener leads actualizados desde HubSpot
  fetchUpdatedLeads(): Promise<Lead[]>;

  // 2. Mapear a estructura de Airtable
  mapToAirtableFormat(leads: Lead[]): AirtableLead[];

  // 3. Actualizar Airtable
  updateAirtableLeads(leads: AirtableLead[]): Promise<void>;

  // 4. Registrar sincronización
  logSync(syncData: SyncLog): Promise<void>;
}
```

**Campos sincronizados:**

- Información básica del lead
- Etapa actual
- Último contacto
- Programas de interés
- Datos demográficos

### Proceso 2: Nutrición desde Blog/Contenido

**Frecuencia:** Diaria
**Responsable:** Proceso externo

```typescript
// Proceso de nutrición de contenido
interface ContentSyncProcess {
  // 1. Escanear fuentes de contenido
  scanContentSources(): Promise<ContentSource[]>;

  // 2. Extraer metadatos
  extractMetadata(content: ContentSource): ContentMetadata;

  // 3. Clasificar y etiquetar
  classifyContent(content: ContentSource): ContentClassification;

  // 4. Crear entrada en Airtable
  createAirtableContent(content: ProcessedContent): Promise<void>;
}
```

**Fuentes de contenido:**

- Blog de Henry
- Canal de YouTube
- Eventos y webinars
- Casos de éxito
- Testimonios

### Proceso 3: Actualización de KB

**Frecuencia:** Semanal
**Responsable:** Equipo de contenido

```typescript
// Proceso de actualización de KB
interface KBUpdateProcess {
  // 1. Revisar tickets HITL resueltos
  reviewResolvedTickets(): Promise<HITLTicket[]>;

  // 2. Identificar gaps en KB
  identifyKBGaps(tickets: HITLTicket[]): KBGap[];

  // 3. Generar propuestas de KB
  generateKBProposals(gaps: KBGap[]): KBProposal[];

  // 4. Notificar al equipo
  notifyTeam(proposals: KBProposal[]): Promise<void>;
}
```

### Proceso 4: Análisis y Optimización

**Frecuencia:** Semanal
**Responsable:** Proceso de analytics

```typescript
// Proceso de análisis
interface AnalyticsProcess {
  // 1. Recolectar métricas de uso
  collectUsageMetrics(): Promise<UsageMetrics>;

  // 2. Analizar efectividad de contenido
  analyzeContentEffectiveness(): Promise<ContentAnalysis>;

  // 3. Optimizar reglas de selección
  optimizeSelectionRules(analysis: ContentAnalysis): SelectionRuleUpdate[];

  // 4. Actualizar Airtable
  updateSelectionRules(rules: SelectionRuleUpdate[]): Promise<void>;
}
```

---

## 🛠️ Cambios en lp-core

### Nuevo Cliente: AirtableClient

```typescript
// packages/lp-core/src/clients/airtable-client.ts
export class AirtableClient {
  private base: Airtable.Base;

  constructor(apiKey: string, baseId: string) {
    this.base = new Airtable({ apiKey }).base(baseId);
  }

  // KB Operations
  async searchKB(query: string): Promise<KBAnswer[]> {
    const records = await this.base("Knowledge Base")
      .select({
        filterByFormula: `OR(SEARCH("${query}", {Question}), SEARCH("${query}", {Tags}))`,
        sort: [{ field: "Confidence", direction: "desc" }],
      })
      .all();

    return records.map((record) => ({
      answer: record.get("Answer"),
      source: record.get("Source"),
      confidence: record.get("Confidence"),
    }));
  }

  // Content Operations
  async selectContent(criteria: ContentCriteria): Promise<Content | null> {
    const filters = this.buildContentFilters(criteria);

    const records = await this.base("Content Repository")
      .select({
        filterByFormula: filters,
        sort: [{ field: "Usage Count", direction: "asc" }],
      })
      .firstPage();

    if (records.length === 0) return null;

    return this.mapToContent(records[0]);
  }

  // Lead Operations
  async getLead(leadId: string): Promise<LeadContext | null> {
    const records = await this.base("Leads")
      .select({
        filterByFormula: `{Lead ID} = "${leadId}"`,
      })
      .firstPage();

    if (records.length === 0) return null;

    return this.mapToLeadContext(records[0]);
  }

  async updateLead(
    leadId: string,
    updates: Partial<LeadContext>
  ): Promise<void> {
    const records = await this.base("Leads")
      .select({
        filterByFormula: `{Lead ID} = "${leadId}"`,
      })
      .firstPage();

    if (records.length > 0) {
      await this.base("Leads").update(
        records[0].id,
        this.mapToAirtableFormat(updates)
      );
    }
  }

  // Cadence Operations
  async getCadenceRules(
    stage: LeadStage,
    channel: CommunicationChannel
  ): Promise<CadenceRule[]> {
    const records = await this.base("Cadence Rules")
      .select({
        filterByFormula: `AND({Stage} = "${stage}", {Channel} = "${channel}", {Status} = "Activo")`,
      })
      .all();

    return records.map((record) => this.mapToCadenceRule(record));
  }

  // HITL Operations
  async createTicket(
    ticket: Omit<Ticket, "ticket_id" | "created_at" | "updated_at">
  ): Promise<{ ticket_id: string }> {
    const record = await this.base("HITL Tickets").create([
      {
        fields: this.mapTicketToAirtable(ticket),
      },
    ]);

    return { ticket_id: record[0].get("Ticket ID") };
  }

  async updateTicket(
    ticketId: string,
    updates: Partial<Ticket>
  ): Promise<void> {
    const records = await this.base("HITL Tickets")
      .select({
        filterByFormula: `{Ticket ID} = "${ticketId}"`,
      })
      .firstPage();

    if (records.length > 0) {
      await this.base("HITL Tickets").update(
        records[0].id,
        this.mapTicketUpdatesToAirtable(updates)
      );
    }
  }

  // Configuration Operations
  async getConfig(key: string): Promise<string | null> {
    const records = await this.base("Bot Configuration")
      .select({
        filterByFormula: `{Key} = "${key}"`,
      })
      .firstPage();

    return records.length > 0 ? records[0].get("Value") : null;
  }

  // Private helper methods
  private buildContentFilters(criteria: ContentCriteria): string {
    const filters = [];

    if (criteria.program) {
      filters.push(`{Program} = "${criteria.program}"`);
    }

    if (criteria.type) {
      filters.push(`{Type} = "${criteria.type}"`);
    }

    if (criteria.country) {
      filters.push(`FIND("${criteria.country}", {Country}) > 0`);
    }

    filters.push(`{Status} = "Activo"`);

    return filters.join(" AND ");
  }

  private mapToContent(record: Airtable.Record): Content {
    return {
      id: record.get("ID").toString(),
      type: record.get("Type"),
      program: record.get("Program"),
      tags: record.get("Tags") || [],
      link: record.get("Link"),
      metadata: record.get("Metadata")
        ? JSON.parse(record.get("Metadata"))
        : undefined,
    };
  }

  private mapToLeadContext(record: Airtable.Record): LeadContext {
    return {
      lead_id: record.get("Lead ID"),
      first_name: record.get("First Name"),
      country: record.get("Country"),
      program_interest: record.get("Program Interest"),
      stage: record.get("Stage"),
      objective: record.get("Objective"),
      experience_level: record.get("Experience Level"),
      last_contact_at: new Date(record.get("Last Contact")),
      no_response_count: record.get("No Response Count") || 0,
      cohort_date: record.get("Cohort Date"),
      seats_remaining_low: record.get("Seats Remaining Low") || false,
    };
  }
}
```

### Actualización de Clients Existentes

```typescript
// packages/lp-core/src/clients/kb-client.ts
export class KBClient {
  constructor(private airtableClient: AirtableClient) {}

  async lookup(query: string): Promise<KBAnswer | null> {
    const answers = await this.airtableClient.searchKB(query);
    return answers.length > 0 ? answers[0] : null;
  }
}

// packages/lp-core/src/clients/content-client.ts
export class ContentClient {
  constructor(private airtableClient: AirtableClient) {}

  async selectContent(criteria: ContentCriteria): Promise<Content | null> {
    return this.airtableClient.selectContent(criteria);
  }

  async getContentHistory(leadId: string): Promise<ContentHistory[]> {
    // Esto se mantiene en DB local para performance
    return this.localDB.getContentHistory(leadId);
  }
}

// packages/lp-core/src/clients/crm-client.ts
export class CRMClient {
  constructor(private airtableClient: AirtableClient) {}

  async updateLead(leadId: string, data: Partial<LeadContext>): Promise<void> {
    return this.airtableClient.updateLead(leadId, data);
  }

  async logInteraction(
    leadId: string,
    interaction: Interaction
  ): Promise<void> {
    // Las interacciones se mantienen en DB local para performance
    return this.localDB.logInteraction(leadId, interaction);
  }
}

// packages/lp-core/src/clients/hitl-client.ts
export class HITLClient {
  constructor(private airtableClient: AirtableClient) {}

  async escalate(caseData: EscalationCase): Promise<{ ticket_id: string }> {
    const ticket = {
      lead_id: caseData.lead_context.lead_id,
      thread_id: caseData.conversation.thread_id,
      status: "OPEN" as TicketStatus,
      reason: caseData.reason,
      question: caseData.conversation.unanswered_question,
      notes: JSON.stringify(caseData),
      urgency:
        caseData.urgency === "high"
          ? 2
          : caseData.urgency === "medium"
          ? 8
          : 24,
      sla_hours:
        caseData.urgency === "high"
          ? 2
          : caseData.urgency === "medium"
          ? 8
          : 24,
    };

    return this.airtableClient.createTicket(ticket);
  }
}
```

### Nuevo Cliente: LocalDBClient

```typescript
// packages/lp-core/src/clients/local-db-client.ts
export class LocalDBClient {
  constructor(private db: Database) {}

  // Thread management
  async getThread(threadId: string): Promise<Thread | null> {
    return this.db.threads.findUnique({ where: { id: threadId } });
  }

  async updateThread(
    threadId: string,
    updates: Partial<Thread>
  ): Promise<void> {
    await this.db.threads.update({
      where: { id: threadId },
      data: updates,
    });
  }

  // Content history
  async getContentHistory(leadId: string): Promise<ContentHistory[]> {
    return this.db.contentHistory.findMany({
      where: { lead_id: leadId },
      orderBy: { sent_at: "desc" },
    });
  }

  async logContentSent(history: Omit<ContentHistory, "id">): Promise<void> {
    await this.db.contentHistory.create({ data: history });
  }

  // Interactions
  async logInteraction(
    leadId: string,
    interaction: Interaction
  ): Promise<void> {
    await this.db.interactions.create({ data: interaction });
  }

  // Bot state
  async getBotState(leadId: string): Promise<BotState | null> {
    return this.db.botState.findUnique({ where: { lead_id: leadId } });
  }

  async updateBotState(
    leadId: string,
    state: Partial<BotState>
  ): Promise<void> {
    await this.db.botState.upsert({
      where: { lead_id: leadId },
      update: state,
      create: { lead_id: leadId, ...state },
    });
  }
}
```

### Actualización del Index Principal

```typescript
// packages/lp-core/src/index.ts
export * from "./types";

// Clients
export { AirtableClient } from "./clients/airtable-client";
export { LocalDBClient } from "./clients/local-db-client";
export { KBClient } from "./clients/kb-client";
export { ContentClient } from "./clients/content-client";
export { CRMClient } from "./clients/crm-client";
export { MessengerClient } from "./clients/messenger-client";
export { HITLClient } from "./clients/hitl-client";

// Services
export { CadenceManager } from "./services/cadence-manager";

// Agents
export { AdmissionsBot } from "./agents/admissions-bot";
export { HITLHandler } from "./agents/hitl-handler";

// Main bot instance for easy usage
import { AdmissionsBot } from "./agents/admissions-bot";
import { HITLHandler } from "./agents/hitl-handler";
import { AirtableClient } from "./clients/airtable-client";
import { LocalDBClient } from "./clients/local-db-client";

export const createAdmissionsBot = (config: {
  airtableApiKey: string;
  airtableBaseId: string;
  localDbUrl: string;
}) => {
  const airtableClient = new AirtableClient(
    config.airtableApiKey,
    config.airtableBaseId
  );
  const localDbClient = new LocalDBClient(config.localDbUrl);

  return new AdmissionsBot(airtableClient, localDbClient);
};

export const createHITLHandler = (config: {
  airtableApiKey: string;
  airtableBaseId: string;
  slackToken: string;
}) => {
  const airtableClient = new AirtableClient(
    config.airtableApiKey,
    config.airtableBaseId
  );

  return new HITLHandler(airtableClient, config.slackToken);
};
```

---

## 🗄️ Base de Datos Local

### Estructura Mínima

```sql
-- Threads (conversaciones activas)
CREATE TABLE threads (
  id VARCHAR(255) PRIMARY KEY,
  lead_id VARCHAR(255) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content History (historial de contenido enviado)
CREATE TABLE content_history (
  id SERIAL PRIMARY KEY,
  lead_id VARCHAR(255) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  type VARCHAR(50) NOT NULL,
  thread_id VARCHAR(255) NOT NULL
);

-- Interactions (log de interacciones)
CREATE TABLE interactions (
  id SERIAL PRIMARY KEY,
  lead_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Bot State (estado interno del bot)
CREATE TABLE bot_state (
  lead_id VARCHAR(255) PRIMARY KEY,
  current_stage VARCHAR(50),
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  conversation_context JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cadence Log (log de reglas de cadencia aplicadas)
CREATE TABLE cadence_log (
  id SERIAL PRIMARY KEY,
  lead_id VARCHAR(255) NOT NULL,
  rule_id VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  result VARCHAR(50) NOT NULL
);

-- Error Log (log de errores)
CREATE TABLE error_log (
  id SERIAL PRIMARY KEY,
  error_type VARCHAR(100) NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Herramientas de Nutrición

### Herramienta 1: CRM Sync Tool

```typescript
// tools/crm-sync.ts
export class CRMSyncTool {
  constructor(
    private hubspotClient: HubSpotClient,
    private airtableClient: AirtableClient
  ) {}

  async syncLeads(): Promise<void> {
    // 1. Obtener leads actualizados desde HubSpot
    const updatedLeads = await this.hubspotClient.getUpdatedLeads();

    // 2. Mapear a formato Airtable
    const airtableLeads = updatedLeads.map((lead) => ({
      "Lead ID": lead.id,
      "First Name": lead.firstName,
      Country: lead.country,
      "Program Interest": lead.programInterest,
      Stage: lead.stage,
      Objective: lead.objective,
      "Experience Level": lead.experienceLevel,
      "Last Contact": lead.lastContactDate,
      "No Response Count": lead.noResponseCount,
      "Cohort Date": lead.cohortDate,
      "Seats Remaining Low": lead.seatsRemainingLow,
      Status: "Activo",
    }));

    // 3. Actualizar Airtable
    await this.airtableClient.batchUpdateLeads(airtableLeads);
  }
}
```

### Herramienta 2: Content Sync Tool

```typescript
// tools/content-sync.ts
export class ContentSyncTool {
  constructor(
    private wordpressClient: WordPressClient,
    private youtubeClient: YouTubeClient,
    private airtableClient: AirtableClient
  ) {}

  async syncBlogContent(): Promise<void> {
    // 1. Obtener posts del blog
    const posts = await this.wordpressClient.getRecentPosts();

    // 2. Procesar cada post
    for (const post of posts) {
      const content = {
        Title: post.title,
        Type: "Artículo",
        Program: this.extractProgram(post.content),
        Link: post.link,
        Tags: this.extractTags(post.categories),
        Country: this.extractCountry(post.content),
        Objective: this.extractObjective(post.content),
        Metadata: JSON.stringify({
          reading_time: post.readingTime,
          author: post.author,
          publish_date: post.publishDate,
        }),
        Status: "Activo",
      };

      await this.airtableClient.createContent(content);
    }
  }

  async syncYouTubeContent(): Promise<void> {
    // Similar proceso para videos de YouTube
  }
}
```

### Herramienta 3: KB Update Tool

```typescript
// tools/kb-update.ts
export class KBUpdateTool {
  constructor(private airtableClient: AirtableClient) {}

  async analyzeHITLTickets(): Promise<void> {
    // 1. Obtener tickets resueltos recientemente
    const resolvedTickets = await this.airtableClient.getResolvedTickets();

    // 2. Analizar patrones
    const patterns = this.analyzePatterns(resolvedTickets);

    // 3. Generar propuestas de KB
    const proposals = this.generateKBProposals(patterns);

    // 4. Notificar al equipo
    await this.notifyTeam(proposals);
  }

  private analyzePatterns(tickets: Ticket[]): Pattern[] {
    // Lógica para identificar patrones en tickets
  }

  private generateKBProposals(patterns: Pattern[]): KBProposal[] {
    // Lógica para generar propuestas de KB
  }
}
```

---

## 📈 Ventajas de la Arquitectura

### 1. **Simplicidad**

- Una sola fuente de verdad (Airtable)
- Menos integraciones directas
- Arquitectura más limpia

### 2. **Flexibilidad**

- Fácil modificación de data sin deploy
- Procesos de nutrición independientes
- Escalabilidad horizontal

### 3. **Mantenibilidad**

- Data centralizada y accesible
- Procesos de actualización automatizados
- Menor acoplamiento

### 4. **Performance**

- DB local para datos operativos
- Cache inteligente en Airtable
- Consultas optimizadas

### 5. **Escalabilidad**

- Procesos de nutrición independientes
- Fácil agregar nuevas fuentes
- Monitoreo centralizado

---

## 🚀 Roadmap de Implementación

### Fase 1: Setup Airtable (1 semana)

- [ ] Crear base de datos en Airtable
- [ ] Configurar tablas y campos
- [ ] Migrar data inicial
- [ ] Configurar permisos y acceso

### Fase 2: Actualizar lp-core (2 semanas)

- [ ] Implementar AirtableClient
- [ ] Actualizar clients existentes
- [ ] Implementar LocalDBClient
- [ ] Actualizar agents para usar nueva arquitectura

### Fase 3: Procesos de Nutrición (2 semanas)

- [ ] Implementar CRM Sync Tool
- [ ] Implementar Content Sync Tool
- [ ] Implementar KB Update Tool
- [ ] Configurar cron jobs

### Fase 4: Testing y Optimización (1 semana)

- [ ] Testing completo del sistema
- [ ] Optimización de performance
- [ ] Monitoreo y alertas
- [ ] Documentación

---

## ⚠️ Consideraciones y Riesgos

### Riesgos Técnicos

- **Dependencia de Airtable**: Rate limits y disponibilidad
- **Sincronización**: Consistencia de data entre fuentes
- **Performance**: Latencia en consultas a Airtable

### Mitigaciones

- **Cache local**: Para datos frecuentemente accedidos
- **Retry logic**: Para fallos de Airtable
- **Fallback mechanisms**: Para casos críticos
- **Monitoreo**: Alertas para problemas de sincronización

### Éxito del Proyecto

- **Data centralizada**: Una sola fuente de verdad
- **Mantenimiento simplificado**: Procesos automatizados
- **Escalabilidad mejorada**: Fácil agregar nuevas fuentes
- **Flexibilidad**: Cambios sin deploy

---

## 📋 Checklist de Implementación

### Preparación

- [ ] Configurar cuenta de Airtable
- [ ] Diseñar estructura de tablas
- [ ] Definir procesos de nutrición
- [ ] Configurar permisos y acceso

### Desarrollo

- [ ] Implementar AirtableClient
- [ ] Actualizar clients existentes
- [ ] Implementar LocalDBClient
- [ ] Crear herramientas de nutrición

### Testing

- [ ] Testing de sincronización
- [ ] Testing de performance
- [ ] Testing de fallback
- [ ] Testing de escalabilidad

### Lanzamiento

- [ ] Migración gradual de data
- [ ] Monitoreo intensivo
- [ ] Ajustes basados en métricas
- [ ] Documentación completa

---

## 🎯 Conclusión

Esta arquitectura centralizada en Airtable proporciona una base sólida para el bot de admisiones, simplificando significativamente la gestión de data mientras mantiene toda la funcionalidad. Los procesos de nutrición automatizados aseguran que la data esté siempre actualizada, y la separación entre data operativa (DB local) y data de negocio (Airtable) optimiza el performance.

**Beneficios clave:**

- ✅ **Data centralizada** en Airtable
- ✅ **Procesos automatizados** de nutrición
- ✅ **Arquitectura simplificada**
- ✅ **Escalabilidad mejorada**
- ✅ **Mantenimiento facilitado**
- ✅ **Flexibilidad máxima**

La implementación puede comenzar inmediatamente con esta especificación, proporcionando una base robusta y escalable para el sistema de admisiones.
