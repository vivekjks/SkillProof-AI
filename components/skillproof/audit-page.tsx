"use client"

import { Download, ShieldCheck } from "lucide-react"
import { AgentFlow } from "@/components/skillproof/agent-flow"
import { AuditTimeline } from "@/components/skillproof/audit-timeline"
import { PageShell } from "@/components/skillproof/page-shell"
import { useSkillProof } from "@/components/skillproof/skillproof-state"
import { ActionButton, NeoPanel, SectionTitle, StatusPill } from "@/components/skillproof/ui-kit"

export function AuditPage() {
  const { state } = useSkillProof()

  function exportAudit() {
    const blob = new Blob([JSON.stringify(state.auditEvents, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "skillproof-audit-log.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionTitle
              title="Every agent action is"
              highlight="auditable"
              description="The Audit Agent records each identity, evidence, analysis, interview, scoring, credential, and sharing event with a Terminal3-compatible signature envelope."
            />
            <ActionButton onClick={exportAudit} variant="accent">
              <Download className="h-5 w-5" /> Export audit JSON
            </ActionButton>
          </div>
          <NeoPanel className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-black bg-[#15B8A6]">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Audit coverage</h2>
                  <p className="text-sm font-medium text-[#5B5B5B]">{state.auditEvents.length} signed events retained locally</p>
                </div>
              </div>
              <StatusPill tone="green">Recruiter-verifiable trail</StatusPill>
            </div>
          </NeoPanel>
          <AuditTimeline />
          <AgentFlow />
        </div>
      </section>
    </PageShell>
  )
}
