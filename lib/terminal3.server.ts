import { createHash } from "crypto"
import { createCredentialVerificationToken } from "@/lib/skillproof-security.server"

export type Terminal3ServerSession = {
  did: string
  tenantDid: string
  address: string
  mode: "live" | "demo"
  environment: "testnet" | "production"
  nodeUrl?: string
  usage?: string
  tenantStatus?: string
  privateEvidenceMap?: string
  contractScript?: string
  sdkPackage: string
  sdkOperations: string[]
  error?: string
  issuedAt: string
}

export type Terminal3AgentEventReceipt = {
  mode: "live" | "demo"
  signature: string
  sdkOperation: string
  environment: "testnet" | "production"
  tenantDid?: string
  nodeUrl?: string
  scriptName?: string
  result?: unknown
  error?: string
}

export type SkillCredentialInput = {
  subjectName: string
  subjectRole: string
  subjectDid?: string
  trustScore: number
  skills: Array<{
    name: string
    score: number
    evidence: string
  }>
  evidence: {
    githubHandle?: string
    linkedInUrl?: string
    resumeName?: string
    certificateNames: string[]
    projectUrl?: string
  }
}

export type SkillCredentialEnvelope = {
  "@context": string[]
  id: string
  type: string[]
  issuer: string
  issuanceDate: string
  credentialSubject: SkillCredentialInput & {
    id: string
  }
  proof: {
    type: string
    created: string
    proofPurpose: string
    verificationMethod: string
    t3nMode: "live" | "demo"
    t3nSignature: string
    sdkOperation: string
    proofValue: string
  }
}

const SDK_PACKAGE = "@terminal3/t3n-sdk"
const DEMO_DID = "did:t3n:8f23d4a64f20e935b86c1f0e5a7f91a4"
const PRIVATE_EVIDENCE_TAIL = "skillproof-private-evidence"

function getConfiguredDid() {
  return process.env.T3N_DEMO_DID ?? process.env.T3N_DID ?? DEMO_DID
}

function getEnvironment(): "testnet" | "production" {
  return process.env.T3N_ENVIRONMENT === "production" ? "production" : "testnet"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function shortError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function createSignature(payload: unknown) {
  return `t3n:${createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16)}`
}

function formatUsage(result: unknown) {
  if (isRecord(result) && isRecord(result.balance)) {
    const available = result.balance.available
    if (typeof available === "string" || typeof available === "number") {
      return `Credits available: ${available}`
    }
  }

  return "Usage available"
}

function describeTenant(result: unknown) {
  if (isRecord(result)) {
    const status = result.status
    if (typeof status === "string") {
      return `Tenant ${status}`
    }
  }

  return "Tenant record available"
}

function createDemoSession(error?: string): Terminal3ServerSession {
  const did = getConfiguredDid()

  return {
    did,
    tenantDid: did,
    address: "0xSkillProofDemo",
    mode: "demo",
    environment: getEnvironment(),
    nodeUrl: "demo",
    usage: "Demo credits: 20,000 protected actions",
    tenantStatus: "Demo tenant ready",
    privateEvidenceMap: PRIVATE_EVIDENCE_TAIL,
    contractScript: process.env.T3N_SKILLPROOF_SCRIPT || "optional",
    sdkPackage: SDK_PACKAGE,
    sdkOperations: [
      "setEnvironment(testnet)",
      "loadWasmComponent()",
      "T3nClient.handshake()",
      "authenticate(createEthAuthInput(address))",
      "TenantClient maps/contracts ready",
    ],
    error,
    issuedAt: new Date().toISOString(),
  }
}

async function createAuthenticatedTerminal3Client(apiKey: string) {
  const sdk = await import("@terminal3/t3n-sdk")
  const environment = getEnvironment()

  sdk.setEnvironment(environment)
  const wasmComponent = await sdk.loadWasmComponent()
  const address = sdk.eth_get_address(apiKey)
  const t3n = new sdk.T3nClient({
    wasmComponent,
    handlers: {
      EthSign: sdk.metamask_sign(address, undefined, apiKey),
    },
  })

  await t3n.handshake()
  const did = await t3n.authenticate(sdk.createEthAuthInput(address))
  const tenantDid = did.value
  const tenant = new sdk.TenantClient({
    t3n,
    baseUrl: sdk.getNodeUrl(),
    tenantDid,
  })

  return {
    sdk,
    environment,
    address,
    t3n,
    tenant,
    tenantDid,
    nodeUrl: sdk.getNodeUrl(),
  }
}

export async function createTerminal3Session(): Promise<Terminal3ServerSession> {
  const apiKey = process.env.T3N_API_KEY
  if (!apiKey) {
    return createDemoSession("T3N_API_KEY is not configured; running a safe local demo session.")
  }

  try {
    const { environment, address, t3n, tenant, tenantDid, nodeUrl } =
      await createAuthenticatedTerminal3Client(apiKey)
    const sdkOperations = [
      `setEnvironment(${environment})`,
      "loadWasmComponent()",
      "new T3nClient({ handlers: EthSign })",
      "handshake()",
      "authenticate(createEthAuthInput(address))",
      "new TenantClient({ tenantDid: authenticated DID })",
    ]

    const usage = await t3n
      .getUsage()
      .then((result: unknown) => {
        sdkOperations.push("getUsage()")
        return formatUsage(result)
      })
      .catch(() => "Usage endpoint unavailable")

    const tenantStatus = await tenant.tenant
      .me()
      .then((result: unknown) => {
        sdkOperations.push("TenantClient.tenant.me()")
        return describeTenant(result)
      })
      .catch(async () => {
        try {
          await tenant.tenant.claim()
          sdkOperations.push("TenantClient.tenant.claim()")
          return "Tenant claim submitted"
        } catch (error) {
          return `Tenant lookup unavailable: ${shortError(error, "unknown error")}`
        }
      })

    await t3n.getAuditEvents({ limit: 5 }).then(() => {
      sdkOperations.push("getAuditEvents({ limit: 5 })")
    }).catch(() => undefined)

    const contractId = Number(process.env.T3N_CONTRACT_ID)
    let privateEvidenceMap = "Waiting for T3N_CONTRACT_ID"

    if (Number.isFinite(contractId)) {
      await tenant.maps
        .create({
          tail: PRIVATE_EVIDENCE_TAIL,
          visibility: "private",
          writers: { only: [contractId] },
          readers: { only: [contractId] },
        })
        .then(() => {
          privateEvidenceMap = `Created ${tenant.canonicalName(PRIVATE_EVIDENCE_TAIL)}`
          sdkOperations.push(`TenantClient.maps.create(${PRIVATE_EVIDENCE_TAIL})`)
        })
        .catch((error) => {
          privateEvidenceMap = `Map ready or unavailable: ${shortError(error, "unknown error")}`
          sdkOperations.push(`TenantClient.maps.create(${PRIVATE_EVIDENCE_TAIL})`)
        })
    }

    return {
      did: tenantDid,
      tenantDid,
      address,
      mode: "live",
      environment,
      nodeUrl,
      usage,
      tenantStatus,
      privateEvidenceMap,
      contractScript: process.env.T3N_SKILLPROOF_SCRIPT || "optional",
      sdkPackage: SDK_PACKAGE,
      sdkOperations,
      issuedAt: new Date().toISOString(),
    }
  } catch (error) {
    return createDemoSession(error instanceof Error ? error.message : "Terminal3 SDK session failed.")
  }
}

export async function recordTerminal3AgentEvent(input: {
  agent: string
  action: string
  status: string
}): Promise<Terminal3AgentEventReceipt> {
  const payload = {
    ...input,
    at: new Date().toISOString(),
  }
  const signature = createSignature(payload)

  const apiKey = process.env.T3N_API_KEY
  const scriptName = process.env.T3N_SKILLPROOF_SCRIPT
  const functionName = process.env.T3N_SKILLPROOF_AUDIT_FUNCTION ?? "record-audit-event"

  if (apiKey) {
    try {
      const { sdk, environment, t3n, tenantDid, nodeUrl } = await createAuthenticatedTerminal3Client(apiKey)

      if (!scriptName) {
        return {
          mode: "live",
          signature,
          sdkOperation: "handshake() + authenticate() + local signed receipt",
          environment,
          tenantDid,
          nodeUrl,
        }
      }

      const scriptVersion = await sdk.getScriptVersion(nodeUrl, scriptName)
      const result = await t3n.executeAndDecode({
        script_name: scriptName,
        script_version: scriptVersion,
        function_name: functionName,
        input: payload,
      })

      return {
        mode: "live" as const,
        signature,
        sdkOperation: "executeAndDecode(record-audit-event)",
        environment,
        tenantDid,
        nodeUrl,
        scriptName,
        result,
      }
    } catch (error) {
      return {
        mode: "demo" as const,
        signature,
        sdkOperation: "local signed audit fallback",
        environment: getEnvironment(),
        error: error instanceof Error ? error.message : "SDK audit call failed",
      }
    }
  }

  return {
    mode: "demo" as const,
    signature,
    sdkOperation: "local signed audit fallback",
    environment: getEnvironment(),
  }
}

export async function issueTerminal3SkillCredential(input: SkillCredentialInput): Promise<{
  credential: SkillCredentialEnvelope
  audit: Terminal3AgentEventReceipt
  shareToken: string
}> {
  const audit = await recordTerminal3AgentEvent({
    agent: "Credential Agent",
    action: `Issued Skill Passport for ${input.subjectName} with ${input.trustScore}% trust score`,
    status: "Signed",
  })
  const issuedAt = new Date().toISOString()
  const configuredDid = getConfiguredDid()
  const subjectDid = input.subjectDid || audit.tenantDid || configuredDid
  const issuer = audit.tenantDid || configuredDid
  const credentialId = `urn:skillproof:${createHash("sha256")
    .update(`${subjectDid}:${input.trustScore}:${issuedAt}`)
    .digest("hex")
    .slice(0, 24)}`
  const unsignedCredential = {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://terminal3.io/contexts/skillproof/v1"],
    id: credentialId,
    type: ["VerifiableCredential", "SkillPassportCredential"],
    issuer,
    issuanceDate: issuedAt,
    credentialSubject: {
      id: subjectDid,
      ...input,
    },
  }
  const proofValue = createSignature({ unsignedCredential, audit })
  const shareToken = createCredentialVerificationToken({
    credentialId,
    issuer,
    subjectDid,
    subjectName: input.subjectName,
    subjectRole: input.subjectRole,
    trustScore: input.trustScore,
    skills: input.skills.slice(0, 8),
    evidenceHash: proofValue,
    proofMode: audit.mode,
    proofOperation: audit.sdkOperation,
    issuedAt,
  })

  return {
    credential: {
      ...unsignedCredential,
      proof: {
        type: "Terminal3AgentAuthReceipt2026",
        created: issuedAt,
        proofPurpose: "assertionMethod",
        verificationMethod: `${issuer}#agent-auth`,
        t3nMode: audit.mode,
        t3nSignature: audit.signature,
        sdkOperation: audit.sdkOperation,
        proofValue,
      },
    },
    audit,
    shareToken,
  }
}
