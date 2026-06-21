"use client"

import { BadgeCheck, FileCheck2, Github, Radar } from "lucide-react"
import { AgentFlow } from "@/components/skillproof/agent-flow"
import { AuditTimeline } from "@/components/skillproof/audit-timeline"
import { PageShell } from "@/components/skillproof/page-shell"
import { PassportCard } from "@/components/skillproof/passport-card"
import { SkillBars } from "@/components/skillproof/skill-visuals"
import { Terminal3StatusPanel } from "@/components/skillproof/terminal3-status"
import { useSkillProof } from "@/components/skillproof/skillproof-state"
import { ActionButton, MetricTile, SectionTitle } from "@/components/skillproof/ui-kit"

export function DashboardPage() {
  const { trustScore, evidenceCount, state, runAnalysis } = useSkillProof()

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionTitle
              title="Developer trust dashboard"
              highlight={`${trustScore}%`}
              description="A live cockpit for Terminal3 identity, evidence collection, scoring, credential issuance, recruiter sharing, and audit trails."
            />
            <ActionButton onClick={runAnalysis} variant={state.analysisComplete ? "light" : "accent"}>
              {state.analysisComplete ? "Re-run analysis" : "Run analysis"}
            </ActionButton>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <MetricTile icon={Radar} label="Trust score" value={`${trustScore}%`} detail="Weighted by identity, evidence, interview, and credential status." accent="bg-[#15B8A6]" />
            <MetricTile icon={Github} label="Evidence" value={`${evidenceCount}`} detail="Connected sources across GitHub, resume, certificates, and projects." accent="bg-[#2F81F7]" />
            <MetricTile icon={FileCheck2} label="Interview" value={state.interviewComplete ? "Done" : "Open"} detail="AI Interview Agent evaluates technical answer quality." accent="bg-[#FFC224]" />
            <MetricTile icon={BadgeCheck} label="Passport" value={state.passportIssued ? "Issued" : "Draft"} detail="Credential Agent signs the shareable skill passport." accent="bg-[#FF6B7A]" />
          </div>

          <Terminal3StatusPanel compact />

          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <SkillBars />
            <AuditTimeline limit={4} />
          </div>

          <AgentFlow />
          <PassportCard />
        </div>
      </section>
    </PageShell>
  )
}
