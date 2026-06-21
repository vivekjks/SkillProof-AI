import { NextResponse } from "next/server"
import { recordTerminal3AgentEvent } from "@/lib/terminal3.server"
import {
  applyRateLimit,
  jsonError,
  parseJsonObject,
  requireSkillProofSession,
} from "@/lib/skillproof-security.server"

export const runtime = "nodejs"

function readEventField(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) {
    throw Object.assign(new Error(`${field} is required.`), { status: 400 })
  }

  const clean = value.trim()
  if (clean.length > maxLength) {
    throw Object.assign(new Error(`${field} is too long.`), { status: 400 })
  }

  return clean
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "terminal3-agent-event", 40, 60_000)
  if (limited) return limited

  const session = requireSkillProofSession(request)
  if (session instanceof NextResponse) return session

  let body: Record<string, unknown>
  try {
    body = await parseJsonObject(request, 6_144)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid request body", Number((error as { status?: number }).status ?? 400))
  }

  let eventInput: { agent: string; action: string; status: string }
  try {
    eventInput = {
      agent: readEventField(body.agent, "agent", 64),
      action: readEventField(body.action, "action", 220),
      status: readEventField(body.status, "status", 32),
    }
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid event", Number((error as { status?: number }).status ?? 400))
  }

  const event = await recordTerminal3AgentEvent(eventInput)

  return NextResponse.json(event)
}
