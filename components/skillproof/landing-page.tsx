import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react"
import { AgentFlow } from "@/components/skillproof/agent-flow"
import { evidenceProjects, integrationChecklist, terminal3ProtocolSteps } from "@/components/skillproof/data"
import { PageShell } from "@/components/skillproof/page-shell"
import { ActionButton, Highlight, NeoPanel, SectionTitle, StatusPill } from "@/components/skillproof/ui-kit"

export function LandingPage() {
  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-8">
            <StatusPill tone="green">Terminal3 Agent Auth SDK powered</StatusPill>
            <h1 className="text-[43px] font-bold leading-[51px] md:text-[76px] md:leading-[86px]">
              SkillProof AI turns claimed skills into{" "}
              <Highlight color="bg-[#15B8A6]">verified proof</Highlight>
            </h1>
            <p className="max-w-3xl text-[18px] font-medium leading-[31px] text-[#393939]">
              A trusted skill passport for developers: GitHub evidence, resumes, certificates, AI interview answers,
              agent scoring, Terminal3 identity, verifiable credentials, and signed audit logs in one production-ready flow.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <ActionButton href="/login" variant="accent">Start Terminal3 login</ActionButton>
              <ActionButton href="/dashboard" variant="light">Open dashboard</ActionButton>
            </div>
          </div>

          <NeoPanel className="relative overflow-hidden bg-[#FFC224] p-4 md:p-6">
            <div className="absolute right-6 top-6 rounded-full border-[3px] border-black bg-white px-4 py-2 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Trust Score 92%
            </div>
            <div className="rounded-[24px] border-[3px] border-black bg-white p-5 md:p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-[4px] border-black bg-[#15B8A6] text-2xl font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                  RA
                </div>
                <div>
                  <p className="text-2xl font-bold">Richu Anand</p>
                  <p className="text-sm font-bold text-[#5B5B5B]">did:t3n:8f23...91a4</p>
                </div>
              </div>
              <div className="mt-7 space-y-4">
                {["React 9.2", "Node.js 8.7", "Python 8.3", "AI Agents 8.9"].map((score, index) => (
                  <div key={score} className="rounded-2xl border-[3px] border-black bg-[#F7F7F7] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{score}</span>
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div className="mt-3 h-4 rounded-full border-[3px] border-black bg-white">
                      <div
                        className="h-full rounded-r-full border-r-[3px] border-black"
                        style={{
                          width: `${[92, 87, 83, 89][index]}%`,
                          backgroundColor: ["#15B8A6", "#2F81F7", "#FFC224", "#FF6B7A"][index],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NeoPanel>
        </div>
      </section>

      <div className="overflow-hidden">
        <div className="relative -left-[10vw] -mx-[10vw] mb-16 mt-10 min-w-[120vw] -rotate-[4deg] overflow-hidden bg-black py-10">
          <div className="flex animate-marquee items-center gap-12 whitespace-nowrap text-3xl font-bold text-white">
            {[...terminal3ProtocolSteps, ...terminal3ProtocolSteps, ...terminal3ProtocolSteps].map((step, index) => (
              <span key={`${step}-${index}`} className="inline-flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-[#FFC224]" />
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            align="center"
            title="Everything judges expect from"
            highlight="Agent Auth"
            description="SkillProof is not a static resume page. Every primary action maps to an agent, Terminal3 identity surface, scoped credential event, and recruiter-verifiable output."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {integrationChecklist.map((item, index) => (
              <NeoPanel key={item} className="min-h-[190px] p-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-black bg-[#15B8A6] text-xl font-bold">
                  {index + 1}
                </div>
                <p className="mt-6 text-xl font-bold leading-8">{item}</p>
              </NeoPanel>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="text-white lg:sticky lg:top-28 lg:self-start">
              <StatusPill tone="yellow">Production flow</StatusPill>
              <h2 className="mt-6 text-4xl font-bold leading-[1.15] md:text-6xl">
                Agents collect, challenge, score, issue, and audit.
              </h2>
              <p className="mt-6 text-[17px] font-medium leading-8 text-white/70">
                The app models the exact workflow from the project brief: profile collection, evidence analysis,
                AI interview, skill scoring, credential issuance, recruiter sharing, and audit review.
              </p>
              <Link href="/connect" className="mt-8 inline-flex items-center gap-2 rounded-xl border-[3px] border-white bg-white px-6 py-4 font-bold text-black">
                Connect evidence <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <AgentFlow />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            title="Evidence sources become"
            highlight="proof"
            description="Resume text, GitHub activity, certificates, projects, and AI interview answers are treated as separate evidence streams before scoring."
          />
          <div className="mt-10 space-y-6">
            {evidenceProjects.map((project, index) => (
              <NeoPanel key={project.title} className="grid overflow-hidden md:grid-cols-[0.9fr_1.1fr]">
                <div className="p-6 md:p-10">
                  <StatusPill tone={index === 0 ? "green" : index === 1 ? "blue" : "pink"}>{project.stack}</StatusPill>
                  <h3 className="mt-6 text-3xl font-bold">{project.title}</h3>
                  <p className="mt-4 text-[17px] font-medium leading-8 text-[#393939]">{project.summary}</p>
                </div>
                <div className="flex min-h-[250px] items-center justify-center border-t-[3px] border-black bg-[#F6F6F6] p-8 md:border-l-[3px] md:border-t-0">
                  <div className="relative h-48 w-48 rounded-full border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <Image src="/images/studio-workspace.svg" alt="" fill className="object-contain p-8" />
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-xl border-[3px] border-black bg-[#FFC224] px-5 py-2 text-xl font-bold">
                      {project.score}%
                    </div>
                  </div>
                </div>
              </NeoPanel>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-black py-12 text-white">
        <div className="container mx-auto flex max-w-7xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-[#15B8A6]" />
              <span className="text-2xl font-bold">SkillProof AI</span>
            </div>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/65">
              Built for Terminal3 ADK judging: complete solution, deep SDK integration, and a creative credential agent use case.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionButton href="/login" variant="accent">Terminal3 login</ActionButton>
            <ActionButton href="/passport" variant="light">View passport</ActionButton>
          </div>
        </div>
      </footer>
    </PageShell>
  )
}
