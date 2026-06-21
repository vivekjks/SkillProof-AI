import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "SkillProof AI",
    terminal3Sdk: "@terminal3/t3n-sdk",
    terminal3Configured: Boolean(process.env.T3N_API_KEY),
    terminal3Environment: process.env.T3N_ENVIRONMENT || "testnet",
    terminal3DidConfigured: Boolean(process.env.T3N_DEMO_DID || process.env.T3N_DID),
    terminal3ContractConfigured: Boolean(process.env.T3N_CONTRACT_ID),
    openAiInterviewGradingConfigured: Boolean(process.env.OPENAI_API_KEY),
    routes: [
      "/api/terminal3/session",
      "/api/terminal3/agent-event",
      "/api/terminal3/passport",
      "/api/terminal3/verify",
      "/api/skillproof/analyze",
      "/api/ai/interview-grade",
    ],
    timestamp: new Date().toISOString(),
  })
}
