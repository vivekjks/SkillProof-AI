"use client"

import { LockKeyhole, Network, ShieldCheck } from "lucide-react"
import { integrationChecklist } from "@/components/skillproof/data"
import { PageShell } from "@/components/skillproof/page-shell"
import { Terminal3StatusPanel } from "@/components/skillproof/terminal3-status"
import { MetricTile, NeoPanel, SectionTitle } from "@/components/skillproof/ui-kit"

export function LoginPage() {
  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionTitle
            title="Terminal3 login creates the"
            highlight="trusted identity"
            description="The live path uses the Agent Auth SDK on the server. Without credentials, SkillProof enters demo mode and clearly shows which SDK operations are wired."
          />
          <Terminal3StatusPanel />
          <div className="grid gap-6 md:grid-cols-3">
            <MetricTile icon={LockKeyhole} label="Secret safety" value="0" detail="Developer keys are never exposed to client JavaScript." accent="bg-[#FFC224]" />
            <MetricTile icon={Network} label="Environment" value="T3N" detail="Testnet by default, production through T3N_ENVIRONMENT." accent="bg-[#15B8A6]" />
            <MetricTile icon={ShieldCheck} label="Identity" value="DID" detail="The app reads the authenticated DID from Terminal3 session output." accent="bg-[#2F81F7]" />
          </div>
          <NeoPanel className="p-6 md:p-8">
            <h2 className="text-2xl font-bold">SDK integration checklist</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {integrationChecklist.map((item) => (
                <div key={item} className="rounded-2xl border-[3px] border-black bg-[#F7F7F7] p-4 text-[15px] font-bold">
                  {item}
                </div>
              ))}
            </div>
          </NeoPanel>
        </div>
      </section>
    </PageShell>
  )
}
