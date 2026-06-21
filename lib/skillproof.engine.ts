import { createHash } from "crypto"
import { generateStructuredWithOpenAI } from "@/lib/openai.server"
import type {
  EvidenceProject,
  EvidenceSignal,
  InterviewEvaluationResult,
  InterviewQuestionInput,
  InterviewQuestionScore,
  PassportCredential,
  SharePackage,
  SkillAnalysisInput,
  SkillAnalysisResult,
  SkillScore,
  Terminal3AuditReceipt,
} from "@/lib/skillproof.types"

const FALLBACK_SKILLS: SkillScore[] = [
  { name: "React", score: 9.1, evidence: "Component architecture, hooks answers, and UI project evidence", source: "project" },
  { name: "Node.js", score: 8.6, evidence: "Server routes, auth flow, and API orchestration evidence", source: "project" },
  { name: "Python", score: 8.1, evidence: "Resume and project signals indicate automation and data parsing depth", source: "resume" },
  { name: "MongoDB", score: 7.8, evidence: "Database usage appears in stack and project evidence", source: "resume" },
  { name: "AI Agents", score: 9.0, evidence: "Multi-agent workflow, Terminal3 audit trail, and interview scoring", source: "agent" },
]

const FALLBACK_PROJECTS: EvidenceProject[] = [
  {
    title: "Recruiter Evidence Hub",
    stack: "Next.js, Tailwind, MongoDB",
    score: 94,
    summary: "Full-stack dashboard with authenticated evidence review and export-ready reports.",
  },
  {
    title: "GitHub Complexity Analyzer",
    stack: "Node.js, GitHub API, Recharts",
    score: 89,
    summary: "Language, commit, dependency, and architecture scoring for public repositories.",
  },
  {
    title: "AI Interview Console",
    stack: "React, Agent workflow, Terminal3 ADK",
    score: 91,
    summary: "Question generation, answer grading, credential issuance, and signed audit trail.",
  },
]

type GitHubRepo = {
  name: string
  language: string | null
  stargazers_count: number
  description: string | null
  html_url: string
  updated_at: string
}

type GitHubSummary = {
  available: boolean
  repoCount: number
  languages: string[]
  topRepos: Array<Pick<GitHubRepo, "name" | "language" | "stargazers_count" | "description" | "html_url">>
}

function stableHash(payload: unknown, length = 18) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, length)
}

function clampScore(score: number, min = 0, max = 10) {
  return Math.min(max, Math.max(min, Number(score.toFixed(1))))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function isSkillScore(value: unknown): value is SkillScore {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.score === "number" &&
    typeof value.evidence === "string"
  )
}

function isProject(value: unknown): value is EvidenceProject {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    typeof value.stack === "string" &&
    typeof value.score === "number" &&
    typeof value.summary === "string"
  )
}

function isSignal(value: unknown): value is EvidenceSignal {
  return (
    isRecord(value) &&
    typeof value.label === "string" &&
    typeof value.value === "string" &&
    ["verified", "private", "pending", "signed"].includes(String(value.status))
  )
}

function isAnalysisPayload(value: unknown): value is Omit<SkillAnalysisResult, "provider" | "audit" | "generatedAt"> {
  return (
    isRecord(value) &&
    typeof value.summary === "string" &&
    typeof value.trustScore === "number" &&
    Array.isArray(value.skills) &&
    value.skills.every(isSkillScore) &&
    Array.isArray(value.projects) &&
    value.projects.every(isProject) &&
    Array.isArray(value.evidenceSignals) &&
    value.evidenceSignals.every(isSignal) &&
    Array.isArray(value.recommendations) &&
    value.recommendations.every((item) => typeof item === "string")
  )
}

function isInterviewQuestionScore(value: unknown): value is InterviewQuestionScore {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.score === "number" &&
    ["strong", "adequate", "needs-work"].includes(String(value.verdict)) &&
    typeof value.feedback === "string"
  )
}

function isInterviewPayload(value: unknown): value is Omit<InterviewEvaluationResult, "provider" | "audit" | "generatedAt"> {
  return (
    isRecord(value) &&
    typeof value.overall === "number" &&
    typeof value.passed === "boolean" &&
    typeof value.feedback === "string" &&
    Array.isArray(value.questionScores) &&
    value.questionScores.every(isInterviewQuestionScore) &&
    Array.isArray(value.recommendedFocus) &&
    value.recommendedFocus.every((item) => typeof item === "string")
  )
}

async function fetchGithubSummary(handle: string): Promise<GitHubSummary> {
  const cleanHandle = handle.trim().replace(/^@/, "")

  if (!cleanHandle) {
    return { available: false, repoCount: 0, languages: [], topRepos: [] }
  }

  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanHandle)}/repos?sort=updated&per_page=8`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "SkillProof-AI",
      },
      next: { revalidate: 900 },
    })

    if (!response.ok) {
      return { available: false, repoCount: 0, languages: [], topRepos: [] }
    }

    const repos = (await response.json()) as GitHubRepo[]
    const languages = Array.from(new Set(repos.map((repo) => repo.language).filter(Boolean) as string[]))

    return {
      available: true,
      repoCount: repos.length,
      languages,
      topRepos: repos.slice(0, 5).map(({ name, language, stargazers_count, description, html_url }) => ({
        name,
        language,
        stargazers_count,
        description,
        html_url,
      })),
    }
  } catch {
    return { available: false, repoCount: 0, languages: [], topRepos: [] }
  }
}

function deterministicAnalysis(input: SkillAnalysisInput, github: GitHubSummary): Omit<SkillAnalysisResult, "provider" | "audit" | "generatedAt"> {
  const evidenceCount = [
    input.terminal3Did,
    input.githubHandle,
    input.linkedInUrl,
    input.resumeName,
    input.projectUrl,
    ...input.certificateNames,
  ].filter(Boolean).length
  const githubBoost = github.available ? Math.min(6, github.repoCount) : 0
  const trustScore = Math.min(96, 72 + evidenceCount * 2 + githubBoost + (input.terminal3Did ? 8 : 0))
  const languageSkills = github.languages.slice(0, 3).map((language, index) => ({
    name: language,
    score: clampScore(8.6 - index * 0.2),
    evidence: `Detected in recent GitHub repositories for ${input.githubHandle}`,
    source: "github" as const,
  }))
  const skills = [...languageSkills, ...FALLBACK_SKILLS].slice(0, 5)

  return {
    summary:
      "SkillProof created a recruiter-ready skill graph from Terminal3 identity, project evidence, GitHub signals, uploaded documents, certificates, and interview readiness.",
    trustScore,
    skills,
    projects: github.topRepos.length
      ? github.topRepos.slice(0, 3).map((repo, index) => ({
          title: repo.name,
          stack: repo.language ?? "Mixed stack",
          score: 88 + Math.min(8, repo.stargazers_count + index),
          summary: repo.description ?? `Recent public repository used as skill evidence: ${repo.html_url}`,
        }))
      : FALLBACK_PROJECTS,
    evidenceSignals: [
      { label: "Terminal3 DID", value: input.terminal3Did ?? "pending", status: input.terminal3Did ? "signed" : "pending" },
      { label: "GitHub", value: github.available ? `${github.repoCount} repositories scanned` : input.githubHandle || "not connected", status: github.available ? "verified" : "pending" },
      { label: "Resume", value: input.resumeName || "not uploaded", status: input.resumeName ? "private" : "pending" },
      { label: "Certificates", value: `${input.certificateNames.length} certificate(s)`, status: input.certificateNames.length ? "private" : "pending" },
    ],
    recommendations: [
      "Issue the passport after the interview signal is complete.",
      "Add at least one certificate or resume artifact for a stronger private evidence map.",
      "Share the recruiter link only after Terminal3 identity is live or intentionally marked demo.",
    ],
  }
}

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "trustScore", "skills", "projects", "evidenceSignals", "recommendations"],
  properties: {
    summary: { type: "string" },
    trustScore: { type: "number", minimum: 0, maximum: 100 },
    skills: {
      type: "array",
      minItems: 5,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "score", "evidence", "source"],
        properties: {
          name: { type: "string" },
          score: { type: "number", minimum: 0, maximum: 10 },
          evidence: { type: "string" },
          source: { type: "string", enum: ["github", "resume", "certificate", "interview", "terminal3", "project", "agent"] },
        },
      },
    },
    projects: {
      type: "array",
      minItems: 3,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "stack", "score", "summary"],
        properties: {
          title: { type: "string" },
          stack: { type: "string" },
          score: { type: "number", minimum: 0, maximum: 100 },
          summary: { type: "string" },
        },
      },
    },
    evidenceSignals: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "value", "status"],
        properties: {
          label: { type: "string" },
          value: { type: "string" },
          status: { type: "string", enum: ["verified", "private", "pending", "signed"] },
        },
      },
    },
    recommendations: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" },
    },
  },
}

export async function analyzeSkillProfile(input: SkillAnalysisInput, audit: Terminal3AuditReceipt): Promise<SkillAnalysisResult> {
  const github = await fetchGithubSummary(input.githubHandle)
  const prompt = JSON.stringify({ input, github }, null, 2)
  const aiResult = await generateStructuredWithOpenAI({
    name: "skillproof_analysis",
    instructions:
      "You are SkillProof AI's Analysis Agent. Return concise JSON only. Score developer skills from evidence, avoid inflated claims, keep private evidence separate, and mention Terminal3 identity/audit value when present.",
    prompt,
    schema: analysisSchema,
    validate: isAnalysisPayload,
  })
  const data = aiResult?.data ?? deterministicAnalysis(input, github)

  return {
    ...data,
    provider: aiResult ? "openai" : "deterministic",
    skills: data.skills.map((skill) => ({ ...skill, score: clampScore(skill.score) })),
    projects: data.projects.map((project) => ({ ...project, score: Math.min(100, Math.max(0, Math.round(project.score))) })),
    trustScore: Math.min(100, Math.max(0, Math.round(data.trustScore))),
    audit,
    generatedAt: new Date().toISOString(),
  }
}

function scoreAnswer(answer: string, question: string): InterviewQuestionScore {
  const normalized = answer.toLowerCase()
  const keywordGroups = [
    ["state", "effect", "dependency", "closure", "render"],
    ["memo", "callback", "reference", "value", "performance"],
    ["event", "bubble", "capture", "propagation", "delegate"],
  ]
  const group = question.toLowerCase().includes("memo")
    ? keywordGroups[1]
    : question.toLowerCase().includes("bubbling")
      ? keywordGroups[2]
      : keywordGroups[0]
  const hits = group.filter((keyword) => normalized.includes(keyword)).length
  const lengthBoost = Math.min(2, Math.floor(answer.trim().length / 120))
  const score = clampScore(4.5 + hits * 0.8 + lengthBoost)
  const verdict = score >= 8 ? "strong" : score >= 6.5 ? "adequate" : "needs-work"

  return {
    id: stableHash(question, 8),
    score,
    verdict,
    feedback:
      verdict === "strong"
        ? "Answer shows practical depth and uses relevant terminology."
        : verdict === "adequate"
          ? "Answer is directionally correct but needs sharper examples and tradeoffs."
          : "Answer needs more concrete technical detail and production examples.",
  }
}

function deterministicInterview(questions: InterviewQuestionInput[]): Omit<InterviewEvaluationResult, "provider" | "audit" | "generatedAt"> {
  const questionScores = questions.map((question) => ({
    ...scoreAnswer(question.answer, question.question),
    id: question.id,
  }))
  const overall = clampScore(questionScores.reduce((sum, item) => sum + item.score, 0) / Math.max(1, questionScores.length))

  return {
    overall,
    passed: overall >= 7,
    feedback:
      overall >= 7
        ? "The interview signal supports the current skill score. Answers show enough implementation awareness for recruiter verification."
        : "The interview signal is incomplete. Add more detailed examples before issuing the final passport.",
    questionScores,
    recommendedFocus: ["Add production examples", "Discuss tradeoffs", "Explain failure cases"],
  }
}

const interviewSchema = {
  type: "object",
  additionalProperties: false,
  required: ["overall", "passed", "feedback", "questionScores", "recommendedFocus"],
  properties: {
    overall: { type: "number", minimum: 0, maximum: 10 },
    passed: { type: "boolean" },
    feedback: { type: "string" },
    questionScores: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "score", "verdict", "feedback"],
        properties: {
          id: { type: "string" },
          score: { type: "number", minimum: 0, maximum: 10 },
          verdict: { type: "string", enum: ["strong", "adequate", "needs-work"] },
          feedback: { type: "string" },
        },
      },
    },
    recommendedFocus: {
      type: "array",
      minItems: 2,
      maxItems: 5,
      items: { type: "string" },
    },
  },
}

export async function evaluateInterview(questions: InterviewQuestionInput[], audit: Terminal3AuditReceipt): Promise<InterviewEvaluationResult> {
  const aiResult = await generateStructuredWithOpenAI({
    name: "skillproof_interview_evaluation",
    instructions:
      "You are SkillProof AI's Interview Agent. Grade answers strictly but fairly. Return JSON only. Preserve each question id exactly.",
    prompt: JSON.stringify({ questions }, null, 2),
    schema: interviewSchema,
    maxOutputTokens: 700,
    validate: isInterviewPayload,
  })
  const data = aiResult?.data ?? deterministicInterview(questions)

  return {
    ...data,
    provider: aiResult ? "openai" : "deterministic",
    overall: clampScore(data.overall),
    questionScores: data.questionScores.map((score) => ({ ...score, score: clampScore(score.score) })),
    audit,
    generatedAt: new Date().toISOString(),
  }
}

export function issuePassportCredential(input: {
  holderDid: string
  subjectName?: string
  trustScore: number
  skills: SkillScore[]
  terminal3Mode: "live" | "demo"
  audit: Terminal3AuditReceipt
}): PassportCredential {
  const issuedAt = new Date().toISOString()
  const evidenceHash = stableHash({
    did: input.holderDid,
    trustScore: input.trustScore,
    skills: input.skills,
    issuedAt,
  }, 24)

  return {
    credentialId: `sp-vc-${stableHash({ evidenceHash, did: input.holderDid }, 20)}`,
    status: "issued",
    issuer: "SkillProof AI Credential Agent",
    holderDid: input.holderDid,
    subjectName: input.subjectName || "Richu Anand",
    issuedAt,
    trustScore: input.trustScore,
    skillClaims: input.skills.slice(0, 5),
    evidenceHash,
    terminal3Mode: input.terminal3Mode,
    auditSignature: input.audit.signature,
  }
}

export function createSharePackage(input: {
  origin: string
  holderDid: string
  credentialId?: string
  audit: Terminal3AuditReceipt
}): SharePackage {
  const token = stableHash({
    holderDid: input.holderDid,
    credentialId: input.credentialId,
    signature: input.audit.signature,
  }, 28)

  return {
    link: `${input.origin.replace(/\/$/, "")}/passport?verify=${encodeURIComponent(token)}`,
    token,
    accessPolicy: "public-summary-private-evidence",
    verifierClaims: ["Trust score", "Top skills", "Terminal3 DID", "Credential issue status", "Agent audit proof"],
    auditSignature: input.audit.signature,
    generatedAt: new Date().toISOString(),
  }
}
