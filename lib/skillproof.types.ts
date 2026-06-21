export type SkillScore = {
  name: string
  score: number
  evidence: string
  source?: "github" | "resume" | "certificate" | "interview" | "terminal3" | "project" | "agent"
}

export type EvidenceProject = {
  title: string
  stack: string
  score: number
  summary: string
}

export type EvidenceSignal = {
  label: string
  value: string
  status: "verified" | "private" | "pending" | "signed"
}

export type Terminal3AuditReceipt = {
  mode: "live" | "demo"
  signature: string
  sdkOperation: string
  error?: string
}

export type SkillAnalysisInput = {
  terminal3Did?: string
  githubHandle: string
  linkedInUrl: string
  resumeName: string
  certificateNames: string[]
  projectUrl: string
}

export type SkillAnalysisResult = {
  provider: "openai" | "deterministic"
  summary: string
  trustScore: number
  skills: SkillScore[]
  projects: EvidenceProject[]
  evidenceSignals: EvidenceSignal[]
  recommendations: string[]
  audit: Terminal3AuditReceipt
  generatedAt: string
}

export type InterviewQuestionInput = {
  id: string
  question: string
  rubric: string
  answer: string
}

export type InterviewQuestionScore = {
  id: string
  score: number
  verdict: "strong" | "adequate" | "needs-work"
  feedback: string
}

export type InterviewEvaluationResult = {
  provider: "openai" | "deterministic"
  overall: number
  passed: boolean
  feedback: string
  questionScores: InterviewQuestionScore[]
  recommendedFocus: string[]
  audit: Terminal3AuditReceipt
  generatedAt: string
}

export type PassportCredential = {
  credentialId: string
  status: "issued"
  issuer: "SkillProof AI Credential Agent"
  holderDid: string
  subjectName: string
  issuedAt: string
  trustScore: number
  skillClaims: SkillScore[]
  evidenceHash: string
  terminal3Mode: "live" | "demo"
  auditSignature: string
}

export type SharePackage = {
  link: string
  token: string
  accessPolicy: "public-summary-private-evidence"
  verifierClaims: string[]
  auditSignature: string
  generatedAt: string
}
