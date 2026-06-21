# SkillProof AI

SkillProof AI is a Terminal3-backed developer skill passport for the Terminal3 ADK Developer Challenge. It turns claimed developer skills into a recruiter-verifiable profile by combining Terminal3 identity, evidence collection, AI analysis, interview grading, signed credential issuance, recruiter share links, and auditable agent receipts.

Production app: https://skillproof-verified.vercel.app

## What It Does

- Creates a server-side Terminal3 Agent Auth session with `@terminal3/t3n-sdk`.
- Keeps evidence streams separate: GitHub, LinkedIn, resume name, certificates, and project URL.
- Runs a multi-agent workflow: Profile Agent, Analysis Agent, Interview Agent, Scoring Agent, Credential Agent, and Audit Agent.
- Uses OpenAI Responses API for evidence analysis and interview grading when configured.
- Falls back to deterministic local scoring when OpenAI is unavailable.
- Issues a VC-style Skill Passport JSON envelope scoped to the authenticated Terminal3 DID.
- Generates signed recruiter verification links at `/passport?verify=...`.
- Verifies shared identity or credential tokens through `/api/terminal3/verify`.
- Provides an audit page with signed Terminal3-backed activity receipts.

## Terminal3 Integration

The SDK integration is server-only in `frontend/lib/terminal3.server.ts`; browser code never receives `T3N_API_KEY`.

Implemented SDK usage:

- `setEnvironment("testnet" | "production")`
- `loadWasmComponent()`
- `eth_get_address(T3N_API_KEY)`
- `new T3nClient({ handlers: { EthSign } })`
- `handshake()`
- `authenticate(createEthAuthInput(address))`
- `getUsage()`
- `getAuditEvents({ limit: 5 })`
- `new TenantClient({ tenantDid })`
- `TenantClient.tenant.me()`
- optional private map setup via `T3N_CONTRACT_ID`
- optional tenant contract execution via `T3N_SKILLPROOF_SCRIPT`

Sensitive routes require the HttpOnly `skillproof_session` cookie created by `/api/terminal3/session`.

## Main Routes

- `/` landing page
- `/login` Terminal3 Agent Auth login
- `/dashboard` trust score, agent status, skill graph, passport status
- `/connect` separate evidence collection
- `/interview` AI interview grading
- `/report` generated skill report and recommendations
- `/passport` credential view, VC download, and verification result
- `/share` recruiter verification link generation
- `/audit` signed audit log export
- `/api/health` runtime configuration check
- `/api/skillproof/analyze` protected evidence analysis
- `/api/terminal3/session` protected-session bootstrap
- `/api/terminal3/passport` protected credential issuance
- `/api/terminal3/agent-event` protected audit receipt
- `/api/terminal3/verify` public read-only verification endpoint
- `/api/ai/interview-grade` protected interview grading

## Tech Stack

- Next.js 15 App Router
- React 19
- Tailwind CSS 4
- Terminal3 `@terminal3/t3n-sdk`
- OpenAI Responses API
- Vercel for frontend and API route deployment

There is no separate Render backend in the current production build. The API is implemented with Next.js API routes, so frontend and backend deploy together on Vercel.

## Environment

Create `frontend/.env.local` with:

```bash
T3N_API_KEY=
T3N_ENVIRONMENT=testnet
T3N_DEMO_DID=
SKILLPROOF_SESSION_SECRET=
NEXT_PUBLIC_APP_URL=https://skillproof-verified.vercel.app
```

Optional:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
T3N_CONTRACT_ID=
T3N_SKILLPROOF_SCRIPT=
T3N_SKILLPROOF_AUDIT_FUNCTION=record-audit-event
MONGODB_URI=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Local Development

```bash
cd frontend
corepack pnpm install
corepack pnpm dev
```

Production build locally:

```bash
corepack pnpm build
corepack pnpm exec next start -p 3010
```

## Verification

Validated checks:

```bash
cd frontend
corepack pnpm lint
corepack pnpm audit --prod
corepack pnpm build
```

Runtime smoke tests validated:

- unauthenticated passport, audit, and interview routes return `401`
- malformed authenticated passport JSON returns `400`
- live Terminal3 session returns the configured DID
- passport issuance pins the subject DID to the session DID
- signed credential share token verifies through `/api/terminal3/verify`
- `/api/skillproof/analyze` returns OpenAI-backed skill analysis
- Playwright desktop flow: identity, analysis, passport, share, verification
- Playwright mobile smoke flow across main pages with no horizontal overflow
 

 