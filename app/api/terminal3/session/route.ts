import { NextResponse } from "next/server"
import { createTerminal3Session } from "@/lib/terminal3.server"
import {
  applyRateLimit,
  createIdentityVerificationToken,
  createSessionToken,
  setSessionCookie,
} from "@/lib/skillproof-security.server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "terminal3-session", 12, 60_000)
  if (limited) return limited

  const session = await createTerminal3Session()
  const sessionToken = createSessionToken({
    did: session.did,
    tenantDid: session.tenantDid,
    mode: session.mode,
    environment: session.environment,
  })
  const response = NextResponse.json(
    {
      ...session,
      authExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      verificationToken: createIdentityVerificationToken({
        did: session.did,
        mode: session.mode,
        environment: session.environment,
        issuedAt: session.issuedAt,
      }),
    },
    { status: 200 },
  )

  setSessionCookie(response, sessionToken, request)
  return response
}
