import { NextResponse } from "next/server"
import { analyzeSkillProfile } from "@/lib/skillproof.engine"
import { recordTerminal3AgentEvent } from "@/lib/terminal3.server"
import {
  applyRateLimit,
  jsonError,
  parseJsonObject,
  requireSkillProofSession,
} from "@/lib/skillproof-security.server"
import type { SkillAnalysisInput } from "@/lib/skillproof.types"

export const runtime = "nodejs"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readOptionalString(value: unknown, field: string, maxLength: number) {
  if (value === undefined || value === null || value === "") {
    return ""
  }

  if (typeof value !== "string") {
    throw Object.assign(new Error(`${field} must be text.`), { status: 400 })
  }

  const clean = value.trim()
  if (clean.length > maxLength) {
    throw Object.assign(new Error(`${field} is too long.`), { status: 400 })
  }

  return clean
}

function validateInput(body: Record<string, unknown>, terminal3Did: string): SkillAnalysisInput {
  const certificateNames = body.certificateNames

  if (certificateNames !== undefined && !Array.isArray(certificateNames)) {
    throw Object.assign(new Error("certificateNames must be an array."), { status: 400 })
  }

  return {
    terminal3Did,
    githubHandle: readOptionalString(body.githubHandle, "githubHandle", 40),
    linkedInUrl: readOptionalString(body.linkedInUrl, "linkedInUrl", 160),
    resumeName: readOptionalString(body.resumeName, "resumeName", 120),
    certificateNames: Array.isArray(certificateNames)
      ? certificateNames
          .slice(0, 10)
          .map((name, index) => readOptionalString(name, `certificateNames[${index}]`, 120))
          .filter(Boolean)
      : [],
    projectUrl: readOptionalString(body.projectUrl, "projectUrl", 200),
  }
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "skillproof-analyze", 12, 60_000)
  if (limited) return limited

  const session = requireSkillProofSession(request)
  if (session instanceof NextResponse) return session

  try {
    const body = await parseJsonObject(request, 10_240)
    if (!isRecord(body)) {
      return jsonError("Invalid request body", 400)
    }

    const input = validateInput(body, session.did)
    const audit = await recordTerminal3AgentEvent({
      agent: "Analysis Agent",
      action: `Analyzed evidence graph for ${input.githubHandle || input.projectUrl || session.did}`,
      status: "Verified",
    })
    const analysis = await analyzeSkillProfile(input, audit)

    return NextResponse.json(analysis)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Analysis failed", Number((error as { status?: number }).status ?? 500))
  }
}
