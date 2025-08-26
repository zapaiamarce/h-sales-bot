# Spec 03: Cursor Agent Rule Development

## Overview

Develop a Cursor rule that will serve as a base template for creating TypeScript-only agents in the packages directory. These agents will be backend-focused, use Vercel AI SDK patterns, have no build process, and follow a consistent architecture pattern with shared tools and prompts.

## Project Requirements

### Technology Stack

- **Language**: TypeScript (no compilation/build process)
- **Runtime**: Node.js
- **AI Framework**: Vercel AI SDK
- **Testing**: Vitest
- **Architecture**: Backend-only agents using AI SDK patterns
- **Package Manager**: pnpm workspace
- **Development**: Cursor IDE with custom rules

### Architecture Guidelines

- Agents run in backend only (no frontend integration)
- TypeScript files only (no build step)
- Use Vercel AI SDK patterns (Sequential Processing, Routing, Parallel Processing, Multi-Step Tool Usage)
- Modular and composable design
- Clear separation of concerns
- Shared tools and prompts

## Agent Package Structure

```
packages/
├── tools/                  # Tools compartidas - DOMINIO + ADAPTER AI
│   ├── src/
│   │   ├── crm/
│   │   │   ├── index.ts        # FUNCS de dominio puras (createLeadFn, qualifyLeadFn…)
│   │   │   ├── types.ts        # Tipos del dominio CRM
│   │   │   ├── mock.ts         # impl en memoria para tests/dev
│   │   │   ├── mock.test.ts    # Tests de mock
│   │   │   └── ai/
│   │   │       └── index.ts    # adapters AI SDK: tool(createLead), tool(qualifyLead)
│   │   ├── email/
│   │   │   ├── index.ts        # FUNCS de dominio puras (sendEmailFn, scheduleEmailFn…)
│   │   │   ├── types.ts        # Tipos del dominio email
│   │   │   ├── mock.ts         # impl en memoria para tests/dev
│   │   │   ├── mock.test.ts    # Tests de mock
│   │   │   └── ai/
│   │   │       └── index.ts    # adapters AI SDK: tool(sendEmail), tool(scheduleEmail)
│   │   ├── kb/
│   │   │   ├── index.ts        # FUNCS de dominio puras (searchFn, createArticleFn…)
│   │   │   ├── types.ts        # Tipos del dominio KB
│   │   │   ├── mock.ts         # impl en memoria para tests/dev
│   │   │   ├── mock.test.ts    # Tests de mock
│   │   │   └── ai/
│   │   │       └── index.ts    # adapters AI SDK: tool(search), tool(createArticle)
│   │   └── index.ts            # re-exports convenientes (sin mezclar dominios)
│   ├── package.json
│   └── tsconfig.json
├── {type}-agent/           # Naming convention: sales-agent, support-agent, etc.
│   ├── src/
│   │   ├── index.ts        # Exporta {type}Agent() y {type}AgentTool()
│   │   ├── agent.ts        # Lógica del agente con guardrails
│   │   ├── agent.test.ts   # Tests del agente
│   │   ├── agent-tool.ts   # Wrapper del agente como tool
│   │   └── prompts.ts      # Prompts específicos del agente
│   ├── package.json
│   └── tsconfig.json
└── prompts/                # Prompts compartidos
    ├── src/
    │   ├── index.ts
    │   ├── guards.ts       # Guardias comunes (JSON only, etc.)
    │   ├── sales-prompts.ts
    │   ├── support-prompts.ts
    │   └── types.ts        # Tipos de prompts y respuestas
    ├── package.json
    └── tsconfig.json
```

## Cursor Rule Specification

### Rule Name: `h-sales-bot-agent-template`

### Rule Purpose

Provide a consistent template and guidance for creating TypeScript-only agents in the h-sales-bot workspace using Vercel AI SDK patterns and shared tools/prompts.

### Rule Triggers

- When creating new agent packages
- When working in `packages/*-agent` directories
- When implementing agent logic
- When defining agent types and interfaces

### Rule Guidelines

#### 1. Package Structure

```
packages/{type}-agent/
├── src/
│   ├── index.ts            # Exporta {type}Agent() y {type}AgentTool()
│   ├── agent.ts            # Lógica del agente con guardrails
│   ├── agent.test.ts       # Tests del agente
│   ├── agent-tool.ts       # Wrapper del agente como tool
│   └── prompts.ts          # Agent-specific prompts
├── package.json
└── tsconfig.json
```

#### 2. Tools = Dominio Puro + Adapter AI SDK (Submódulo `/ai`)

Separar "dominio" de "adapter AI" con un submódulo **`/ai`** te da orden, testeo fácil y cero ciclos:

## Dominio (puro)

```typescript
// packages/tools/src/crm/index.ts
import { z } from "zod";

export const CreateLeadInput = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
});
export type CreateLeadInput = z.infer<typeof CreateLeadInput>;

export type CreateLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; error: string };

export async function createLeadFn(
  input: CreateLeadInput
): Promise<CreateLeadResult> {
  // aquí llamás a HubSpot/Supabase/etc. (o mock)
  return { ok: true, leadId: "ld_123" };
}

// packages/tools/src/crm/mock.ts
export async function createLeadMock(
  input: CreateLeadInput
): Promise<CreateLeadResult> {
  // impl en memoria para tests/dev
  return { ok: true, leadId: `mock_${Date.now()}` };
}
```

## Adapter AI SDK

```typescript
// packages/tools/src/crm/ai/index.ts
import { tool } from "ai";
import { z } from "zod";
import { createLeadFn } from "../index";

export const createLead = tool({
  description: "Create a new lead in CRM",
  inputSchema: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.string().optional(),
    idempotencyKey: z.string().optional(),
  }),
  execute: async (input) => {
    const res = await createLeadFn(input);
    if (!res.ok) throw new Error(res.error);
    return res;
  },
});
```

## Index de tools (re‑exports claros)

```typescript
// packages/tools/src/index.ts
export * as crm from "./crm"; // dominio
export * as crmAi from "./crm/ai"; // adapters AI SDK
export * as kb from "./kb";
export * as kbAi from "./kb/ai";
export * as email from "./email";
export * as emailAi from "./email/ai";
```

#### 3. Agent Tool Wrapper Pattern

Los wrappers de agentes van **dentro del paquete del agente**, no en `tools`:

```typescript
// packages/sales-agent/src/agent-tool.ts
import { tool } from "ai";
import { z } from "zod";
import { salesAgent } from "./agent";

export const salesAgentTool = tool({
  description:
    "Run the sales agent to qualify leads and provide sales recommendations",
  inputSchema: z.object({
    query: z.string().describe("The sales-related query to process"),
    context: z
      .object({
        leadInfo: z
          .object({
            name: z.string(),
            email: z.string(),
            company: z.string().optional(),
          })
          .optional(),
        previousInteraction: z.string().optional(),
      })
      .optional(),
  }),
  execute: async ({ query, context }) => {
    try {
      const result = await salesAgent(query, { context });
      return result;
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
```

#### 4. Agent Usage Pattern (Nuevo)

Los agentes eligen qué usar: dominio o AI tools:

```typescript
// packages/sales-agent/src/tools.ts
import { crmAi, emailAi } from "@h-sales-bot/tools";
// tools expuestos al modelo:
export const salesAgentTools = {
  createLead: crmAi.createLead,
  sendEmail: emailAi.sendEmail,
};

// O usar dominio directamente cuando necesites lógica manual:
import { crm } from "@h-sales-bot/tools";
const leadResult = await crm.createLeadFn({
  name: "John",
  email: "john@example.com",
});
```

#### 5. Agent Implementation Pattern (Vercel AI SDK)

```typescript
// agent.ts
import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs } from "ai";
import { z } from "zod";
import { crmAi, emailAi } from "@h-sales-bot/tools";
import { salesPrompts } from "./prompts";
import { AgentResponse } from "@h-sales-bot/prompts";

const MAX_STEPS = 8;
const MAX_TOKENS = 800;

export async function salesAgent(
  input: string,
  config: AgentConfig
): Promise<z.infer<typeof AgentResponse>> {
  const model = openai("gpt-4o");

  // Multi-step tool usage pattern con guardrails
  const { text, toolCalls, steps, finishReason } = await generateText({
    model,
    tools: {
      createLead: crmAi.createLead,
      sendEmail: emailAi.sendEmail,
      answer: tool({
        description: "Provide the final structured answer",
        inputSchema: z.object({
          qualification: z.object({
            score: z.number(),
            category: z.enum(["hot", "warm", "cold"]),
            reasoning: z.string(),
            nextSteps: z.array(z.string()),
          }),
          recommendations: z.array(z.string()),
        }),
      }),
    },
    stopWhen: stepCountIs(MAX_STEPS),
    maxTokens: MAX_TOKENS,
    system: salesPrompts.system,
    prompt: input,
    onStepFinish({ text, toolCalls, finishReason, usage }) {
      trace("step_finish", {
        step: steps.length,
        finishReason,
        toolCalls: toolCalls?.length || 0,
      });
    },
  });

  // Validar respuesta final
  if (finishReason !== "stop" && finishReason !== "tool-calls-exhausted") {
    return {
      success: false,
      message: "Agent execution was interrupted",
      error: `Unexpected finish reason: ${finishReason}`,
    };
  }

  return {
    success: true,
    message: text,
    data: { toolCalls, steps },
    metadata: { model: "gpt-4o", steps: steps.length },
  };
}

// index.ts
export { salesAgent } from "./agent";
export { salesAgentTool } from "./agent-tool";

// Telemetría mínima
export function trace(event: string, meta: Record<string, any> = {}) {
  console.log(JSON.stringify({ ts: Date.now(), event, ...meta }));
}
```

#### 5. Prompts Pattern con Guardias

```typescript
// packages/prompts/src/guards.ts
export const guards = {
  system: `🚫 IMPORTANT RULES:
- NEVER invent information not provided
- ALWAYS respond with valid JSON when requested
- Use ONLY the tools provided
- If unsure, ask for clarification
- Be concise and professional`,

  jsonOnly: `📋 RESPONSE FORMAT:
You MUST respond with valid JSON in this exact format:
{
  "qualification": {
    "score": number (1-10),
    "category": "hot" | "warm" | "cold",
    "reasoning": "string",
    "nextSteps": ["string"]
  },
  "recommendations": ["string"]
}`,
};

// packages/prompts/src/sales-prompts.ts
import { guards } from "./guards";

export const salesPrompts = {
  system: `${guards.system}

You are an expert sales agent specializing in lead qualification and customer engagement.

Your capabilities:
- Analyze lead information and qualify prospects
- Create and update leads in CRM
- Send personalized follow-up emails
- Provide sales recommendations

${guards.jsonOnly}

Always be professional, helpful, and focused on understanding customer needs.`,

  leadQualification: `Analyze the following lead information and provide a qualification assessment:

Lead Information:
{leadInfo}

Qualification Criteria:
- Budget: Does the prospect have budget authority?
- Timeline: What is their purchase timeline?
- Authority: Can they make purchasing decisions?
- Need: How urgent is their need?

${guards.jsonOnly}`,

  followUp: `Generate a personalized follow-up message for this lead:

Lead: {leadName}
Previous Interaction: {previousInteraction}
Next Steps: {nextSteps}

Create a professional, engaging follow-up that addresses their specific needs.`,
};
```

### Rule Constraints

#### 1. No Build Process

- Agents are TypeScript-only
- No compilation step required
- Direct execution with tsx
- Use `"type": "module"` in package.json for ES modules

#### 2. Backend Only

- No React components
- No frontend dependencies
- Node.js runtime only
- Focus on business logic and external integrations

#### 3. Consistent Naming

- Use kebab-case for package names: `{type}-agent`
- Use camelCase for file names
- Use PascalCase for class names
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants

#### 4. Testing

- Tests alongside each file: `file.test.ts`
- Use Vitest for testing
- Test both agent logic and tools

#### 5. Dependency Management

- Use workspace dependencies: `"@h-sales-bot/tools": "workspace:*"`
- Use Vercel AI SDK for AI functionality
- Use Vitest for testing
- Minimal external dependencies

### Package.json Template

```json
{
  "name": "@h-sales-bot/{type}-agent",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "scripts": {
    "dev": "tsx watch src/agent.ts",
    "start": "tsx src/agent.ts",
    "test": "vitest",
    "test:watch": "vitest watch",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@h-sales-bot/tools": "workspace:*",
    "@h-sales-bot/prompts": "workspace:*",
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.0",
    "openai": "^4.0.0",
    "zod": "^3.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "@types/node": "^20.0.0",
    "vitest": "^1.0.0"
  }
}
```

### tsconfig.json Template

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true
  },
  "include": ["src/**/*"]
}
```

### Vitest Config Template

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
```

## Development Guidelines

### Agent Implementation

- Usar Vercel AI SDK patterns (Sequential, Routing, Parallel, Multi-Step Tool Usage)
- TypeScript-only, sin build process
- Backend-only, sin frontend integration
- Tests con Vitest junto a cada archivo
- Implementar guardrails operativos (step limits, token budget, timeouts)
- Validar respuestas con Zod
- Usar telemetría mínima

### Package Dependencies

- Usar workspace dependencies: `"@h-sales-bot/tools": "workspace:*"`
- Las tools compartidas son reutilizables entre agentes
- Los agentes pueden usar otros agentes a través de wrappers
- Mantener dependencias mínimas y enfocadas
- Composición de agentes para funcionalidades complejas
- Evitar ciclos entre tools y agentes

### General Rules

- No corrars 'next build' para probar, estoy corriendo un 'next dev' en la terminal y se chocan
- Tools NO pueden importar nada de `packages/*-agent/` (evitar ciclos)
- Usar telemetría mínima en todos los agentes y tools
- Validar todas las salidas con Zod
- Implementar guardrails operativos (step limits, token budget, timeouts)

## Implementation Steps

### 1. Create Base Packages

1. **Tools Package**: Shared tools using AI SDK patterns that export directly
2. **Prompts Package**: Shared prompts

### 2. Create First Agent

1. **Sales Agent**: Lead qualification and sales process using AI SDK patterns
2. Follow the established pattern
3. Implement basic functionality with Vercel AI SDK

### 3. Cursor Rule Integration

1. Create `.cursorrules` file in project root
2. Define the agent template rule
3. Test with new agent creation

## Success Criteria

- [ ] Cursor rule created and functional
- [ ] Base packages (tools, prompts) implemented
- [ ] First agent (sales-agent) created following AI SDK patterns
- [ ] Vercel AI SDK integration working
- [ ] Multi-step tool usage working
- [ ] Vitest testing setup working
- [ ] No build process required for agents
- [ ] Consistent architecture across all agents
- [ ] TypeScript-only implementation
- [ ] Backend-focused design
- [ ] Clear separation of concerns
- [ ] Workspace dependencies working correctly
- [ ] Shared tools and prompts working
- [ ] Tools = dominio puro + adapter AI SDK
- [ ] Agent wrappers en paquetes del agente (no en tools)
- [ ] Contratos de I/O estables con Zod
- [ ] Guardrails operativos implementados
- [ ] Prompts con guardias y versionado
- [ ] Testing realista con mocks
- [ ] Telemetría mínima implementada
- [ ] Sin ciclos entre tools y agentes

## Notes

- Agents are backend-only, no frontend integration
- Focus on business logic and external service integration
- Use TypeScript for type safety without compilation
- Maintain consistent patterns across all agents
- Keep dependencies minimal and focused
- Use Vercel AI SDK patterns (Sequential, Routing, Parallel, Multi-Step Tool Usage)
- Use Vitest for testing
- Share common tools and prompts across agents
- Tests alongside each file for better organization
- Tools = funciones puras de dominio + adapter AI SDK
- Agent wrappers van en paquetes del agente (evitar ciclos)
- Contratos de I/O estables con Zod para validación
- Guardrails operativos: step limits, token budget, timeouts, idempotencia
- Prompts con guardias comunes y versionado
- Testing realista con mocks (no servicios reales)
- Telemetría mínima para debugging y monitoreo
- Sin ciclos entre tools y agentes
- JSON only en respuestas estructuradas

## References

- [Vercel AI SDK Agents](https://ai-sdk.dev/docs/foundations/agents)
- [TypeScript ES Modules](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [tsx - TypeScript Execute](https://github.com/esbuild-kit/tsx)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Vitest](https://vitest.dev/)
- [Cursor Rules Documentation](https://cursor.sh/docs/rules)
