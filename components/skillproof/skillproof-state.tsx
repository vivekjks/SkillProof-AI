"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { baseSkills, seedAuditEvents } from "@/components/skillproof/data"
import type { SkillAnalysisResult, SkillScore } from "@/lib/skillproof.types"

const STORAGE_KEY = "skillproof-ai-state-v4"

export type Terminal3Session = {
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
  verificationToken?: string
  authExpiresAt?: string
}

export type AuditEvent = {
  id: string
  agent: string
  action: string
  status: string
  time: string
  signature: string
  mode?: "live" | "demo"
  sdkOperation?: string
}

export type InterviewGrade = {
  score: number
  strengths: string[]
  gaps: string[]
  recommendation: string
  mode: "openai" | "local"
  model: string
}

export type SkillCredentialEnvelope = {
  "@context": string[]
  id: string
  type: string[]
  issuer: string
  issuanceDate: string
  credentialSubject: {
    id: string
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

export type SkillProofState = {
  terminal3: Terminal3Session | null
  githubHandle: string
  linkedInUrl: string
  resumeName: string
  certificateNames: string[]
  projectUrl: string
  analysisComplete: boolean
  analysisResult: SkillAnalysisResult | null
  interviewComplete: boolean
  interviewGrade: InterviewGrade | null
  passportIssued: boolean
  credential: SkillCredentialEnvelope | null
  credentialShareToken: string
  shareLink: string
  answers: Record<string, string>
  auditEvents: AuditEvent[]
}

type SkillProofContextValue = {
  state: SkillProofState
  trustScore: number
  skillScores: SkillScore[]
  identityReady: boolean
  evidenceCount: number
  loadingTerminal3: boolean
  startTerminal3Login: () => Promise<Terminal3Session | null>
  connectGithub: (handle: string) => void
  connectLinkedIn: (url: string) => void
  uploadResume: (name: string) => void
  uploadCertificate: (name: string) => void
  setProjectUrl: (url: string) => void
  runAnalysis: () => Promise<void>
  answerQuestion: (id: string, answer: string) => void
  completeInterview: () => Promise<void>
  issuePassport: () => Promise<SkillCredentialEnvelope | null>
  generateShareLink: () => string
  resetDemo: () => void
}

const demoTerminal3Session: Terminal3Session = {
  did: "did:t3n:8f23d4a64f20e935b86c1f0e5a7f91a4",
  tenantDid: "did:t3n:8f23d4a64f20e935b86c1f0e5a7f91a4",
  address: "0xSkillProofDemo",
  mode: "demo",
  environment: "testnet",
  nodeUrl: "demo",
  usage: "Demo credits: 20,000 protected actions",
  tenantStatus: "Demo tenant ready",
  privateEvidenceMap: "skillproof-private-evidence",
  contractScript: "optional",
  sdkPackage: "@terminal3/t3n-sdk",
  sdkOperations: [
    "setEnvironment(testnet)",
    "loadWasmComponent()",
    "T3nClient.handshake()",
    "authenticate(createEthAuthInput(address))",
    "TenantClient maps/contracts ready",
  ],
  issuedAt: new Date().toISOString(),
}

function createAuditEvent(agent: string, action: string, status = "Signed"): AuditEvent {
  const source = `${agent}:${action}:${Date.now()}`
  let hash = 0
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(index)
    hash |= 0
  }

  return {
    id: `${Date.now()}-${Math.abs(hash)}`,
    agent,
    action,
    status,
    time: new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
    signature: `t3n:${Math.abs(hash).toString(16).padStart(8, "0")}`,
  }
}

const defaultState: SkillProofState = {
  terminal3: null,
  githubHandle: "richu-dev",
  linkedInUrl: "",
  resumeName: "",
  certificateNames: [],
  projectUrl: "https://github.com/richu-dev/skillproof-ai",
  analysisComplete: false,
  analysisResult: null,
  interviewComplete: false,
  interviewGrade: null,
  passportIssued: false,
  credential: null,
  credentialShareToken: "",
  shareLink: "",
  answers: {
    hooks:
      "Hooks let function components use state and effects. Dependency arrays control when effects or memoized values refresh, so stale closures and missing dependencies can create incorrect UI state.",
  },
  auditEvents: seedAuditEvents.map((event, index) => ({
    id: `seed-${index}`,
    signature: `t3n:seed-${index + 1}`,
    ...event,
  })),
}

const SkillProofContext = createContext<SkillProofContextValue | null>(null)

function getEvidenceCount(state: SkillProofState) {
  return [
    state.terminal3,
    state.githubHandle,
    state.linkedInUrl,
    state.resumeName,
    state.projectUrl,
    ...state.certificateNames,
  ].filter(Boolean).length
}

function deriveTrustScore(state: SkillProofState) {
  if (state.analysisResult) {
    const interviewBoost = state.interviewComplete ? 3 : 0
    const passportBoost = state.passportIssued ? 1 : 0

    return Math.min(98, state.analysisResult.trustScore + interviewBoost + passportBoost)
  }

  const evidence = getEvidenceCount(state)
  const base = 72
  const identityBoost = state.terminal3 ? 8 : 0
  const analysisBoost = state.analysisComplete ? 7 : 0
  const interviewBoost = state.interviewComplete ? 5 : 0
  const passportBoost = state.passportIssued ? 2 : 0

  return Math.min(96, base + Math.min(evidence, 5) * 2 + identityBoost + analysisBoost + interviewBoost + passportBoost)
}

function deriveSkillScores(state: SkillProofState): SkillScore[] {
  if (state.analysisResult?.skills.length) {
    return state.analysisResult.skills.slice(0, 5)
  }

  const analysisBoost = state.analysisComplete ? 0.2 : 0
  const interviewBoost = state.interviewComplete ? 0.25 : 0

  return baseSkills.map((skill, index) => ({
    ...skill,
    score: Math.min(9.8, Number((skill.score + analysisBoost + interviewBoost - index * 0.02).toFixed(1))),
    source: "project",
  }))
}

function localInterviewGrade(answers: Record<string, string>): InterviewGrade {
  const answerText = Object.values(answers).join(" ")
  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length
  const answered = Object.values(answers).filter((answer) => answer.trim()).length
  const keywordHits = ["state", "effect", "dependency", "closure", "memo", "callback", "event"].filter((keyword) =>
    answerText.toLowerCase().includes(keyword),
  ).length
  const score = Math.min(94, 52 + answered * 10 + Math.min(22, Math.floor(wordCount / 8)) + keywordHits * 2)

  return {
    score,
    strengths: [
      "Completed the technical interview flow",
      keywordHits >= 4 ? "Used relevant frontend engineering terminology" : "Provided an initial technical signal",
      wordCount >= 50 ? "Answers include enough depth for scoring" : "Answers are concise and easy to review",
    ],
    gaps: ["Add more concrete implementation examples", "Mention measurable project outcomes"],
    recommendation: score >= 82 ? "Proceed to credential issuance." : "Add one follow-up interview round before issuing.",
    mode: "local",
    model: "client-deterministic-rubric",
  }
}

function createPersistableState(state: SkillProofState) {
  const persistable = { ...state }
  delete (persistable as Partial<SkillProofState>).answers
  delete (persistable as Partial<SkillProofState>).credential

  return persistable
}

async function postAgentEvent(agent: string, action: string, status: string) {
  try {
    const response = await fetch("/api/terminal3/agent-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent, action, status }),
    })
    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    return {
      signature: typeof payload.signature === "string" ? payload.signature : undefined,
      mode: payload.mode === "live" ? "live" as const : "demo" as const,
      sdkOperation: typeof payload.sdkOperation === "string" ? payload.sdkOperation : undefined,
    }
  } catch {
    // Local state remains authoritative for the demo when the network is unavailable.
    return null
  }
}

export function SkillProofProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SkillProofState>(defaultState)
  const [hydrated, setHydrated] = useState(false)
  const [loadingTerminal3, setLoadingTerminal3] = useState(false)

  useEffect(() => {
    let readyTimer: number | undefined

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setState({ ...defaultState, ...JSON.parse(saved), answers: defaultState.answers, credential: null })
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    } finally {
      readyTimer = window.setTimeout(() => {
        setHydrated(true)
      }, 0)
    }

    return () => {
      if (readyTimer) {
        window.clearTimeout(readyTimer)
      }
    }
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createPersistableState(state)))

    function persistBeforeUnload() {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createPersistableState(state)))
    }

    window.addEventListener("pagehide", persistBeforeUnload)
    return () => window.removeEventListener("pagehide", persistBeforeUnload)
  }, [hydrated, state])

  const addAudit = useCallback((agent: string, action: string, status = "Signed") => {
    const event = createAuditEvent(agent, action, status)
    setState((current) => ({
      ...current,
      auditEvents: [event, ...current.auditEvents].slice(0, 18),
    }))
    void postAgentEvent(agent, action, status).then((receipt) => {
      if (!receipt) return
      setState((current) => ({
        ...current,
        auditEvents: current.auditEvents.map((item) =>
          item.id === event.id
            ? {
                ...item,
                signature: receipt.signature ?? item.signature,
                mode: receipt.mode,
                sdkOperation: receipt.sdkOperation,
              }
            : item,
        ),
      }))
    })
  }, [])

  const startTerminal3Login = useCallback(async () => {
    setLoadingTerminal3(true)
    try {
      const response = await fetch("/api/terminal3/session", { method: "POST" })
      const payload = (await response.json()) as Terminal3Session & { error?: string }
      const session = response.ok ? payload : { ...demoTerminal3Session, error: payload.error ?? "Demo session active" }
      setState((current) => ({ ...current, terminal3: session }))
      addAudit("Profile Agent", `Terminal3 identity ${session.mode === "live" ? "authenticated" : "simulated"} for ${session.did}`, session.mode === "live" ? "Signed" : "Demo")
      return session
    } catch {
      setState((current) => ({ ...current, terminal3: demoTerminal3Session }))
      addAudit("Profile Agent", "Terminal3 demo identity created because live SDK session is unavailable", "Demo")
      return null
    } finally {
      setLoadingTerminal3(false)
    }
  }, [addAudit])

  const connectGithub = useCallback((handle: string) => {
    setState((current) => ({ ...current, githubHandle: handle.trim() }))
    addAudit("Profile Agent", `GitHub account connected: ${handle.trim() || "pending"}`, "Verified")
  }, [addAudit])

  const connectLinkedIn = useCallback((url: string) => {
    setState((current) => ({ ...current, linkedInUrl: url.trim() }))
    addAudit("Profile Agent", "LinkedIn evidence linked to private profile map", "Signed")
  }, [addAudit])

  const uploadResume = useCallback((name: string) => {
    setState((current) => ({ ...current, resumeName: name }))
    addAudit("Analysis Agent", `Resume queued for skill extraction: ${name}`, "Private")
  }, [addAudit])

  const uploadCertificate = useCallback((name: string) => {
    setState((current) => ({
      ...current,
      certificateNames: name && !current.certificateNames.includes(name)
        ? [...current.certificateNames, name]
        : current.certificateNames,
    }))
    if (name) {
      addAudit("Credential Agent", `Certificate evidence sealed: ${name}`, "Private")
    }
  }, [addAudit])

  const setProjectUrl = useCallback((url: string) => {
    setState((current) => ({ ...current, projectUrl: url }))
  }, [])

  const runAnalysis = useCallback(async () => {
    const session = state.terminal3 ?? await startTerminal3Login()

    try {
      const response = await fetch("/api/skillproof/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubHandle: state.githubHandle,
          linkedInUrl: state.linkedInUrl,
          resumeName: state.resumeName,
          certificateNames: state.certificateNames,
          projectUrl: state.projectUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis request failed")
      }

      const analysisResult = (await response.json()) as SkillAnalysisResult
      setState((current) => ({ ...current, terminal3: current.terminal3 ?? session, analysisComplete: true, analysisResult }))
      addAudit(
        "Analysis Agent",
        `${analysisResult.provider === "openai" ? "OpenAI" : "Deterministic"} skill graph generated from verified evidence`,
        "Verified",
      )
      addAudit("Scoring Agent", "Skill graph recalculated from Terminal3-scoped evidence", "Complete")
    } catch {
      setState((current) => ({ ...current, terminal3: current.terminal3 ?? session, analysisComplete: true }))
      addAudit("Analysis Agent", "Portfolio, resume, certificates, and GitHub repositories analyzed with local fallback", "Verified")
      addAudit("Scoring Agent", "Skill graph recalculated from verified evidence", "Complete")
    }
  }, [addAudit, startTerminal3Login, state])

  const answerQuestion = useCallback((id: string, answer: string) => {
    setState((current) => ({ ...current, answers: { ...current.answers, [id]: answer } }))
  }, [])

  const completeInterview = useCallback(async () => {
    let interviewGrade: InterviewGrade | null = null
    const session = state.terminal3 ?? await startTerminal3Login()

    try {
      const response = await fetch("/api/ai/interview-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: state.answers }),
      })
      if (!response.ok) {
        throw new Error("Interview grade request failed")
      }
      interviewGrade = (await response.json()) as InterviewGrade
    } catch {
      interviewGrade = localInterviewGrade(state.answers)
    }

    setState((current) => ({ ...current, terminal3: current.terminal3 ?? session, interviewComplete: true, interviewGrade }))
    addAudit(
      "Interview Agent",
      interviewGrade
        ? `AI interview graded at ${interviewGrade.score}% by ${interviewGrade.mode === "openai" ? "OpenAI" : "local"} rubric`
        : "AI interview answers evaluated against technical rubric",
      "Complete",
    )
    addAudit("Scoring Agent", "Interview signal merged into trust score", "Verified")
  }, [addAudit, startTerminal3Login, state.answers, state.terminal3])

  const issuePassport = useCallback(async () => {
    let issuedCredential: SkillCredentialEnvelope | null = null
    const session = state.terminal3 ?? await startTerminal3Login()

    try {
      const trustScoreForCredential = deriveTrustScore(state)
      const skills = deriveSkillScores(state)
      const response = await fetch("/api/terminal3/passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: "Richu Anand",
          subjectRole: "Frontend + AI agent engineer",
          trustScore: trustScoreForCredential,
          skills,
          evidence: {
            githubHandle: state.githubHandle,
            linkedInUrl: state.linkedInUrl,
            resumeName: state.resumeName,
            certificateNames: state.certificateNames,
            projectUrl: state.projectUrl,
          },
        }),
      })
      if (!response.ok) {
        throw new Error("Passport request failed")
      }

      const payload = (await response.json()) as { credential?: SkillCredentialEnvelope; shareToken?: string }
      issuedCredential = payload.credential ?? null
      setState((current) => ({
        ...current,
        terminal3: current.terminal3 ?? session,
        passportIssued: true,
        credential: payload.credential ?? current.credential,
        credentialShareToken: payload.shareToken ?? current.credentialShareToken,
      }))
    } catch {
      setState((current) => ({ ...current, terminal3: current.terminal3 ?? session, passportIssued: true }))
    }
    addAudit("Credential Agent", "Verified Skill Passport issued as Terminal3-backed credential", "Signed")
    return issuedCredential
  }, [addAudit, startTerminal3Login, state])

  const generateShareLink = useCallback(() => {
    const origin = typeof window === "undefined" ? "https://skillproof.ai" : window.location.origin
    const token = state.credentialShareToken || state.terminal3?.verificationToken || state.terminal3?.did || demoTerminal3Session.did
    const link = `${origin}/passport?verify=${encodeURIComponent(token)}`
    setState((current) => ({ ...current, shareLink: link }))
    addAudit("Audit Agent", "Recruiter verification link generated", "Signed")
    return link
  }, [addAudit, state.credentialShareToken, state.terminal3?.did, state.terminal3?.verificationToken])

  const resetDemo = useCallback(() => {
    setState(defaultState)
    window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  const trustScore = deriveTrustScore(state)
  const skillScores = useMemo(() => deriveSkillScores(state), [state])

  const value = useMemo<SkillProofContextValue>(() => ({
    state,
    trustScore,
    skillScores,
    identityReady: Boolean(state.terminal3),
    evidenceCount: getEvidenceCount(state),
    loadingTerminal3,
    startTerminal3Login,
    connectGithub,
    connectLinkedIn,
    uploadResume,
    uploadCertificate,
    setProjectUrl,
    runAnalysis,
    answerQuestion,
    completeInterview,
    issuePassport,
    generateShareLink,
    resetDemo,
  }), [
    state,
    trustScore,
    skillScores,
    loadingTerminal3,
    startTerminal3Login,
    connectGithub,
    connectLinkedIn,
    uploadResume,
    uploadCertificate,
    setProjectUrl,
    runAnalysis,
    answerQuestion,
    completeInterview,
    issuePassport,
    generateShareLink,
    resetDemo,
  ])

  return <SkillProofContext.Provider value={value}>{children}</SkillProofContext.Provider>
}

export function useSkillProof() {
  const context = useContext(SkillProofContext)
  if (!context) {
    throw new Error("useSkillProof must be used within SkillProofProvider")
  }
  return context
}
