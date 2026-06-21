import { NextResponse } from "next/server"
import { issueTerminal3SkillCredential, type SkillCredentialInput } from "@/lib/terminal3.server"
import {
  applyRateLimit,
  jsonError,
  parseJsonObject,
  requireSkillProofSession,
} from "@/lib/skillproof-security.server"

export const runtime = "nodejs"

function requestError(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) {
    requestError(`${field} is required.`)
  }

  const clean = value.trim()
  if (clean.length > maxLength) {
    requestError(`${field} is too long.`)
  }

  return clean
}

function readOptionalString(value: unknown, field: string, maxLength: number) {
  if (value === undefined || value === null || value === "") {
    return undefined
  }

  return readString(value, field, maxLength)
}

function readScore(value: unknown, field: string, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max) {
    requestError(`${field} must be a number from 0 to ${max}.`)
  }

  return Number(value.toFixed(1))
}

function validateSkills(value: unknown): SkillCredentialInput["skills"] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 8) {
    requestError("skills must include 1 to 8 verified skills.")
  }

  return value.map((skill, index) => {
    if (!isRecord(skill)) {
      requestError(`skills[${index}] must be an object.`)
    }

    return {
      name: readString(skill.name, `skills[${index}].name`, 40),
      score: readScore(skill.score, `skills[${index}].score`, 10),
      evidence: readString(skill.evidence, `skills[${index}].evidence`, 180),
    }
  })
}

function validateEvidence(value: unknown): SkillCredentialInput["evidence"] {
  const evidence = isRecord(value) ? value : {}
  const certificateNames = evidence.certificateNames

  if (certificateNames !== undefined && !Array.isArray(certificateNames)) {
    requestError("certificateNames must be an array.")
  }

  return {
    githubHandle: readOptionalString(evidence.githubHandle, "githubHandle", 40),
    linkedInUrl: readOptionalString(evidence.linkedInUrl, "linkedInUrl", 160),
    resumeName: readOptionalString(evidence.resumeName, "resumeName", 120),
    certificateNames: Array.isArray(certificateNames)
      ? certificateNames.slice(0, 10).map((name, index) => readString(name, `certificateNames[${index}]`, 120))
      : [],
    projectUrl: readOptionalString(evidence.projectUrl, "projectUrl", 200),
  }
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "terminal3-passport", 8, 60_000)
  if (limited) return limited

  const session = requireSkillProofSession(request)
  if (session instanceof NextResponse) return session

  let body: Record<string, unknown>
  try {
    body = await parseJsonObject(request, 16_384)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid request body", Number((error as { status?: number }).status ?? 400))
  }

  try {
    const credentialInput: SkillCredentialInput = {
      subjectName: readString(body.subjectName, "subjectName", 80),
      subjectRole: readString(body.subjectRole, "subjectRole", 100),
      subjectDid: session.did,
      trustScore: readScore(body.trustScore, "trustScore", 100),
      skills: validateSkills(body.skills),
      evidence: validateEvidence(body.evidence),
    }
    const result = await issueTerminal3SkillCredential(credentialInput)

    return NextResponse.json(result)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Credential request failed", Number((error as { status?: number }).status ?? 500))
  }
}
