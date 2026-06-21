# SkillProof AI Frontend

SkillProof AI is a Terminal3-backed trusted skill passport app. It helps developers prove their real skills with identity, evidence, AI analysis, interview grading, signed credentials, recruiter share links, and auditable agent receipts.

Production app: https://skillproof-verified.vercel.app

## Problem It Solves

Hiring teams and hackathon judges often see the same problem: developers can claim skills on resumes, LinkedIn, portfolios, or GitHub profiles, but those claims are hard to verify quickly.

Common issues:

- A resume says "React expert", but there is no direct proof of project quality.
- GitHub shows repositories, but recruiters do not have time to inspect every commit and file.
- Certificates and resume uploads are private, so they should not be exposed publicly.
- Interview answers are not connected to the candidate's project evidence.
- Recruiters receive static links, not verifiable credentials.
- AI agents can make decisions, but their actions need identity, authorization, and auditability.

SkillProof AI solves this by turning fragmented skill claims into one recruiter-ready passport backed by Terminal3 Agent Auth.

## What The App Does

The app lets a developer create a verifiable skill profile through a guided workflow:

1. Create a Terminal3-backed identity.
2. Connect evidence streams separately: GitHub, LinkedIn, resume, certificates, and project URL.
3. Run an Analysis Agent that scans the evidence and generates a skill graph.
4. Complete an AI interview that grades frontend engineering answers.
5. Combine identity, evidence, interview, and agent audit receipts into a trust score.
6. Issue a VC-style Skill Passport scoped to the authenticated Terminal3 DID.
7. Generate a signed recruiter verification link.
8. Let recruiters verify the shared passport through a public read-only endpoint.

The product is built for the Terminal3 ADK Developer Challenge category: Best Agent utilising Terminal3 Agent Auth SDK.

## Core Product Features

- Terminal3 Agent Auth session creation with `@terminal3/t3n-sdk`.
- Server-only Terminal3 API key handling.
- HttpOnly app session cookie for protected API routes.
- Separate evidence collection UI for GitHub, LinkedIn, resume, certificates, and project URL.
- OpenAI-powered evidence analysis with deterministic fallback.
- AI interview grading with deterministic fallback.
- Evidence-weighted skill scores and recruiter recommendations.
- VC-style Skill Passport JSON download.
- Signed verification tokens for identity and issued credentials.
- Public recruiter verification at `/passport?verify=...`.
- Signed audit timeline for agent actions.
- Mobile-friendly responsive UI with no horizontal overflow in smoke tests.

## Multi-Agent Workflow

SkillProof AI is structured as a multi-agent product:

- Profile Agent: collects account and document evidence.
- Analysis Agent: evaluates project, GitHub, resume, and certificate signals.
- Interview Agent: grades technical answers.
- Scoring Agent: combines evidence into skill scores and trust score.
- Credential Agent: issues the Terminal3-scoped skill passport.
- Audit Agent: records sensitive actions with signed receipts.

Each important action is represented in the audit trail so the final passport is not just a static profile. It is the output of an auditable agent workflow.

## High-Level Architecture

```text
Browser UI
  |
  | Next.js App Router pages
  v
SkillProof client state
  |
  | fetch()
  v
Next.js API routes
  |
  | server-only calls
  v
Terminal3 SDK + OpenAI Responses API
  |
  v
Signed session, audit receipt, analysis result, credential, verification token
```

The app does not use a separate Express backend in this production version. Frontend pages and backend API routes deploy together on Vercel.

## Folder Architecture

```text
frontend/
  app/
    api/
      ai/interview-grade/route.ts
      health/route.ts
      skillproof/analyze/route.ts
      terminal3/
        agent-event/route.ts
        passport/route.ts
        session/route.ts
        verify/route.ts
    dashboard/
    connect/
    interview/
    report/
    passport/
    share/
    audit/
    layout.tsx
    page.tsx
  components/
    skillproof/
      skillproof-state.tsx
      dashboard-page.tsx
      connect-page.tsx
      report-page.tsx
      passport-card.tsx
      verification-panel.tsx
      terminal3-status.tsx
      audit-timeline.tsx
      ui-kit.tsx
  lib/
    terminal3.server.ts
    skillproof-security.server.ts
    skillproof.engine.ts
    openai.server.ts
    skillproof.types.ts
```

## Important Server Modules

`lib/terminal3.server.ts`

- Loads and uses `@terminal3/t3n-sdk`.
- Authenticates with the configured Terminal3 API key.
- Reads the authenticated DID.
- Creates audit receipts.
- Issues the Skill Passport credential envelope.

`lib/skillproof-security.server.ts`

- Creates and verifies signed app session tokens.
- Sets the HttpOnly `skillproof_session` cookie.
- Creates public identity and credential verification tokens.
- Applies in-memory rate limits to public and protected routes.
- Enforces request body size limits and JSON object parsing.

`lib/skillproof.engine.ts`

- Fetches GitHub repository signals.
- Uses OpenAI structured outputs when configured.
- Falls back to deterministic scoring when OpenAI is unavailable.
- Produces skill scores, project summaries, evidence signals, recommendations, and trust score.

`lib/openai.server.ts`

- Calls the OpenAI Responses API with `store: false`.
- Validates structured JSON output before returning it to the app.

## Terminal3 Integration

The Terminal3 integration is server-only. The browser never receives `T3N_API_KEY`.

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
- optional private map setup through `T3N_CONTRACT_ID`
- optional tenant contract execution through `T3N_SKILLPROOF_SCRIPT`

Protected routes require the HttpOnly session cookie created by `POST /api/terminal3/session`.

## Data Flow

1. User opens `/login` or `/dashboard` and creates identity.
2. `POST /api/terminal3/session` authenticates with Terminal3 and returns public session details.
3. The route sets a signed HttpOnly `skillproof_session` cookie.
4. User adds evidence on `/connect`.
5. `POST /api/skillproof/analyze` validates the session and generates an analysis result.
6. `POST /api/ai/interview-grade` grades interview answers after session validation.
7. `POST /api/terminal3/passport` issues the credential after session validation.
8. The route pins `credentialSubject.id` to the authenticated Terminal3 DID.
9. The app generates a share URL with a signed verification token.
10. Recruiters open `/passport?verify=...`.
11. `GET /api/terminal3/verify` validates the token and returns only public verification claims.

## Security Model

- `T3N_API_KEY` is only used in server code.
- Sensitive write routes require `skillproof_session`.
- Session cookies are HttpOnly and SameSite=Lax.
- Vercel/HTTPS deployments use Secure cookies.
- Public verification accepts only signed expiring tokens.
- Client-submitted `subjectDid` values are ignored for credential issuance.
- Request bodies are size-limited.
- Malformed JSON returns clean `400` responses.
- Public and protected routes have rate limits.
- Raw interview answers and full credential JSON are not persisted to localStorage.

## App Routes

- `/` landing page
- `/login` Terminal3 Agent Auth identity setup
- `/dashboard` trust score, identity status, agent flow, skill graph, audit preview
- `/connect` evidence collection
- `/interview` AI interview flow
- `/report` generated skill report
- `/passport` credential view, VC download, verification result
- `/share` recruiter link generation
- `/audit` audit log export

## API Routes

- `GET /api/health`
- `POST /api/terminal3/session`
- `POST /api/skillproof/analyze`
- `POST /api/ai/interview-grade`
- `POST /api/terminal3/passport`
- `POST /api/terminal3/agent-event`
- `GET /api/terminal3/verify?token=...`

## Judging Criteria Mapping

Completeness:

- Full multi-page app experience.
- Live identity, evidence, analysis, interview, credential, share, and audit flows.
- Production deployment on Vercel.

Terminal3 SDK integration:

- Uses the Terminal3 SDK server-side for authentication, DID retrieval, usage checks, tenant client access, and audit-oriented receipts.
- Credential issuance is scoped to the authenticated Terminal3 DID.
- Protected actions require a Terminal3-backed app session.

Creativity:

- Turns Agent Auth into a practical recruiter verification workflow.
- Uses agents to convert noisy skill claims into a signed skill passport.
- Lets recruiters verify public claims without seeing private resume/certificate evidence.

## Tech Stack

- Next.js 15 App Router
- React 19
- Tailwind CSS 4
- Terminal3 `@terminal3/t3n-sdk`
- OpenAI Responses API
- Vercel deployment

## Environment

Required:

```bash
T3N_API_KEY=
T3N_ENVIRONMENT=testnet
T3N_DEMO_DID=
SKILLPROOF_SESSION_SECRET=
NEXT_PUBLIC_APP_URL=https://skillproof-verified.vercel.app
```

Recommended:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Optional:

```bash
T3N_CONTRACT_ID=
T3N_SKILLPROOF_SCRIPT=
T3N_SKILLPROOF_AUDIT_FUNCTION=record-audit-event
MONGODB_URI=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Local Development

```bash
corepack pnpm install
corepack pnpm dev
```

Production-style local run:

```bash
corepack pnpm build
corepack pnpm exec next start -p 3010
```

## Verification

```bash
corepack pnpm lint
corepack pnpm audit --prod
corepack pnpm build
```

Validated runtime checks:

- unauthenticated protected routes return `401`
- malformed authenticated JSON returns `400`
- live Terminal3 session returns configured DID
- credential issuance pins subject DID to session DID
- signed credential token verifies through `/api/terminal3/verify`
- analysis route returns OpenAI-backed or deterministic result
- Playwright desktop flow passes: identity -> analysis -> passport -> share -> verify
- Playwright mobile flow passes with no horizontal overflow

## Deployment

The frontend and API routes deploy together on Vercel.

Current production URL:

```text
https://skillproof-verified.vercel.app
```

Vercel settings:

- Framework: Next.js
- Build command: `corepack pnpm build`
- Environment variables: copy required values from `.env.local`
 