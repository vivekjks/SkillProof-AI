import { createHmac, timingSafeEqual } from "crypto"
import { NextResponse } from "next/server"

const SESSION_COOKIE = "skillproof_session"
const TOKEN_VERSION = "v1"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 2
const VERIFY_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

type SignedTokenPayload = Record<string, unknown> & {
  typ: "session" | "identity-verify" | "credential-verify"
  iat: number
  exp: number
}

export type SkillProofSessionClaims = {
  did: string
  tenantDid: string
  mode: "live" | "demo"
  environment: "testnet" | "production"
  iat: number
  exp: number
}

export type VerificationClaims =
  | {
      typ: "identity-verify"
      did: string
      mode: "live" | "demo"
      environment: "testnet" | "production"
      issuedAt: string
      iat: number
      exp: number
    }
  | {
      typ: "credential-verify"
      credentialId: string
      issuer: string
      subjectDid: string
      subjectName: string
      subjectRole: string
      trustScore: number
      skills: Array<{ name: string; score: number; evidence: string }>
      evidenceHash: string
      proofMode: "live" | "demo"
      proofOperation: string
      issuedAt: string
      iat: number
      exp: number
    }

type RateBucket = {
  count: number
  resetAt: number
}

const rateBuckets = new Map<string, RateBucket>()

function getSigningSecret() {
  return (
    process.env.SKILLPROOF_SESSION_SECRET ||
    process.env.T3N_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "skillproof-local-development-secret"
  )
}

function base64UrlEncode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url")
}

function base64UrlDecode<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T
  } catch {
    return null
  }
}

function sign(data: string) {
  return createHmac("sha256", getSigningSecret()).update(data).digest("base64url")
}

function createSignedToken(payload: SignedTokenPayload) {
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT", v: TOKEN_VERSION })
  const body = base64UrlEncode(payload)
  const signature = sign(`${header}.${body}`)
  return `${header}.${body}.${signature}`
}

function verifySignedToken<T extends SignedTokenPayload>(token: string, expectedType: T["typ"]) {
  const parts = token.split(".")
  if (parts.length !== 3) return null

  const [header, body, signature] = parts
  const expected = sign(`${header}.${body}`)
  const actualBytes = Buffer.from(signature)
  const expectedBytes = Buffer.from(expected)

  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) {
    return null
  }

  const payload = base64UrlDecode<T>(body)
  const now = Math.floor(Date.now() / 1000)

  if (!payload || payload.typ !== expectedType || typeof payload.exp !== "number" || payload.exp < now) {
    return null
  }

  return payload
}

function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? ""
  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export function applyRateLimit(request: Request, key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const bucketKey = `${key}:${getClientIp(request)}`
  const bucket = rateBuckets.get(bucketKey)

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (bucket.count >= limit) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)),
        },
      },
    )
  }

  bucket.count += 1
  return null
}

export async function parseJsonObject(request: Request, maxBytes: number) {
  const length = Number(request.headers.get("content-length") ?? 0)
  if (Number.isFinite(length) && length > maxBytes) {
    throw Object.assign(new Error("Payload too large"), { status: 413 })
  }

  const raw = await request.text()
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    throw Object.assign(new Error("Payload too large"), { status: 413 })
  }

  if (!raw.trim()) {
    return {}
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("JSON body must be an object")
    }
    return parsed as Record<string, unknown>
  } catch {
    throw Object.assign(new Error("Invalid JSON body"), { status: 400 })
  }
}

export function createSessionToken(input: {
  did: string
  tenantDid: string
  mode: "live" | "demo"
  environment: "testnet" | "production"
}) {
  const now = Math.floor(Date.now() / 1000)
  return createSignedToken({
    typ: "session",
    did: input.did,
    tenantDid: input.tenantDid,
    mode: input.mode,
    environment: input.environment,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  })
}

function shouldUseSecureCookie(request?: Request) {
  if (process.env.VERCEL === "1") {
    return true
  }

  if (!request) {
    return process.env.NODE_ENV === "production"
  }

  return new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https"
}

export function setSessionCookie(response: NextResponse, token: string, request?: Request) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export function requireSkillProofSession(request: Request): SkillProofSessionClaims | NextResponse {
  const token = getCookie(request, SESSION_COOKIE)
  if (!token) {
    return jsonError("Terminal3 SkillProof session required. Create identity first.", 401)
  }

  const claims = verifySignedToken<SignedTokenPayload & SkillProofSessionClaims>(token, "session")
  if (
    !claims ||
    typeof claims.did !== "string" ||
    typeof claims.tenantDid !== "string" ||
    (claims.mode !== "live" && claims.mode !== "demo") ||
    (claims.environment !== "testnet" && claims.environment !== "production")
  ) {
    return jsonError("Terminal3 SkillProof session is invalid or expired.", 401)
  }

  return {
    did: claims.did,
    tenantDid: claims.tenantDid,
    mode: claims.mode,
    environment: claims.environment,
    iat: claims.iat,
    exp: claims.exp,
  }
}

export function createIdentityVerificationToken(input: {
  did: string
  mode: "live" | "demo"
  environment: "testnet" | "production"
  issuedAt: string
}) {
  const now = Math.floor(Date.now() / 1000)
  return createSignedToken({
    typ: "identity-verify",
    did: input.did,
    mode: input.mode,
    environment: input.environment,
    issuedAt: input.issuedAt,
    iat: now,
    exp: now + VERIFY_MAX_AGE_SECONDS,
  })
}

export function createCredentialVerificationToken(input: Omit<Extract<VerificationClaims, { typ: "credential-verify" }>, "typ" | "iat" | "exp">) {
  const now = Math.floor(Date.now() / 1000)
  return createSignedToken({
    typ: "credential-verify",
    ...input,
    iat: now,
    exp: now + VERIFY_MAX_AGE_SECONDS,
  })
}

export function verifyPublicVerificationToken(token: string): VerificationClaims | null {
  const identity = verifySignedToken<SignedTokenPayload & Extract<VerificationClaims, { typ: "identity-verify" }>>(
    token,
    "identity-verify",
  )
  if (identity && typeof identity.did === "string") {
    return identity
  }

  const credential = verifySignedToken<SignedTokenPayload & Extract<VerificationClaims, { typ: "credential-verify" }>>(
    token,
    "credential-verify",
  )
  if (
    credential &&
    typeof credential.credentialId === "string" &&
    typeof credential.issuer === "string" &&
    typeof credential.subjectDid === "string" &&
    typeof credential.subjectName === "string" &&
    typeof credential.trustScore === "number" &&
    Array.isArray(credential.skills)
  ) {
    return credential
  }

  return null
}
