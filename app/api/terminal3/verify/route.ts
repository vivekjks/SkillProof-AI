import { NextResponse } from "next/server"
import {
  applyRateLimit,
  jsonError,
  verifyPublicVerificationToken,
} from "@/lib/skillproof-security.server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const limited = applyRateLimit(request, "terminal3-verify", 60, 60_000)
  if (limited) return limited

  const url = new URL(request.url)
  const token = url.searchParams.get("token")

  if (!token || token.length > 4096) {
    return jsonError("A valid verification token is required.", 400)
  }

  const claims = verifyPublicVerificationToken(token)

  if (!claims) {
    return jsonError("Verification token is invalid or expired.", 400)
  }

  return NextResponse.json({
    ok: true,
    valid: true,
    kind: claims.typ === "credential-verify" ? "credential" : "identity",
    claims,
  })
}
