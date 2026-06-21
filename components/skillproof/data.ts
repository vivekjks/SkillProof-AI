import {
  BadgeCheck,
  Bot,
  BrainCircuit,
  FileCheck2,
  Github,
  Home,
  LayoutDashboard,
  Link2,
  ListChecks,
  LockKeyhole,
  MessageSquareText,
  Radar,
  Share2,
  ShieldCheck,
  UploadCloud,
} from "lucide-react"

export const productNavItems = [
  { href: "/", label: "Landing", icon: Home },
  { href: "/login", label: "Login", icon: LockKeyhole },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/connect", label: "Connect", icon: Github },
  { href: "/interview", label: "AI Interview", icon: MessageSquareText },
  { href: "/report", label: "Skill Report", icon: Radar },
  { href: "/passport", label: "Passport", icon: BadgeCheck },
  { href: "/share", label: "Share", icon: Share2 },
  { href: "/audit", label: "Audit Logs", icon: ListChecks },
]

export const agents = [
  {
    id: "profile",
    name: "Profile Agent",
    role: "Collects GitHub, LinkedIn, resume, and certificates",
    signal: "Identity-scoped collection",
    accent: "#15B8A6",
    icon: UploadCloud,
  },
  {
    id: "analysis",
    name: "Analysis Agent",
    role: "Reads repositories, project complexity, resume claims, and certificate evidence",
    signal: "Private evidence map",
    accent: "#2F81F7",
    icon: BrainCircuit,
  },
  {
    id: "interview",
    name: "Interview Agent",
    role: "Asks targeted technical questions and grades answer quality",
    signal: "Agent-auth challenge",
    accent: "#FFC224",
    icon: MessageSquareText,
  },
  {
    id: "scoring",
    name: "Scoring Agent",
    role: "Combines evidence into skill scores and an overall trust score",
    signal: "TEE scoring contract",
    accent: "#FF6B7A",
    icon: Radar,
  },
  {
    id: "credential",
    name: "Credential Agent",
    role: "Issues a reusable verified skill passport for recruiter verification",
    signal: "Smart VC issuance",
    accent: "#8B5CF6",
    icon: FileCheck2,
  },
  {
    id: "audit",
    name: "Audit Agent",
    role: "Signs every sensitive action and records an immutable activity trail",
    signal: "Merkle audit row",
    accent: "#111111",
    icon: ShieldCheck,
  },
]

export const baseSkills = [
  { name: "React", score: 9.2, evidence: "8 production UI repos, hooks interview passed" },
  { name: "Node.js", score: 8.7, evidence: "API design, auth middleware, queue workers" },
  { name: "Python", score: 8.3, evidence: "ML scripts, automation, data parsing" },
  { name: "MongoDB", score: 7.8, evidence: "Schema design and aggregation usage" },
  { name: "AI Agents", score: 8.9, evidence: "Multi-agent orchestration and audit design" },
]

export const evidenceProjects = [
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

export const interviewQuestions = [
  {
    id: "hooks",
    question: "Explain React Hooks and why dependency arrays matter.",
    rubric: "Looks for lifecycle replacement, closure awareness, and practical state examples.",
  },
  {
    id: "memo",
    question: "What is the difference between useMemo and useCallback?",
    rubric: "Checks whether the candidate distinguishes cached values from stable function references.",
  },
  {
    id: "bubbling",
    question: "What is event bubbling, and when would you stop propagation?",
    rubric: "Looks for DOM event phases, delegation, and careful use of stopPropagation.",
  },
]

export const seedAuditEvents = [
  {
    agent: "Profile Agent",
    action: "Terminal3 identity prepared for SkillProof tenant",
    status: "Signed",
    time: "09:12",
  },
  {
    agent: "Analysis Agent",
    action: "GitHub repositories scanned for language and commit evidence",
    status: "Verified",
    time: "09:18",
  },
  {
    agent: "Scoring Agent",
    action: "Trust score generated from project, resume, certificate, and interview signals",
    status: "Complete",
    time: "09:27",
  },
]

export const integrationChecklist = [
  "SDK dependency installed as @terminal3/t3n-sdk",
  "Server-only T3N_API_KEY usage with encrypted TEE handshake",
  "DID is read from authenticated session, never hard-coded",
  "Tenant KV map hooks for private credential evidence",
  "Agent action endpoint signs and records auditable events",
  "Demo fallback keeps the product usable without exposing secrets",
]

export const terminal3ProtocolSteps = [
  "Authenticate with developer key",
  "Open encrypted TEE session",
  "Read Terminal3 DID from session",
  "Scope agents to skill evidence",
  "Issue verified credential",
  "Record immutable audit trail",
]

export const externalDocs = [
  {
    label: "T3 ADK overview",
    href: "https://docs.terminal3.io/developers/adk/overview/what-is-adk",
  },
  {
    label: "T3N platform",
    href: "https://docs.terminal3.io/t3n/overview/what-is-t3n",
  },
  {
    label: "Agent Developer Kit",
    href: "https://www.terminal3.io/products/agent-developer-kit",
  },
]

export const actionIcons = {
  connect: Link2,
  agent: Bot,
  verified: BadgeCheck,
}
