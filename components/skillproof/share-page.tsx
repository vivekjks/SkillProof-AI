"use client"

import { useState } from "react"
import { Copy, Link2, Mail, Share2 } from "lucide-react"
import { AuditTimeline } from "@/components/skillproof/audit-timeline"
import { PageShell } from "@/components/skillproof/page-shell"
import { PassportCard } from "@/components/skillproof/passport-card"
import { useSkillProof } from "@/components/skillproof/skillproof-state"
import { ActionButton, MonoLine, NeoPanel, SectionTitle, StatusPill } from "@/components/skillproof/ui-kit"

export function SharePage() {
  const { state, generateShareLink } = useSkillProof()
  const [copied, setCopied] = useState(false)

  const link = state.shareLink

  async function handleGenerate() {
    const generated = generateShareLink()
    await navigator.clipboard?.writeText(generated).catch(() => undefined)
    setCopied(true)
  }

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionTitle
              title="Share a recruiter-ready"
              highlight="verification link"
              description="Generate a shareable Skill Passport link with a signed audit event. Recruiters get proof, not a claim list."
            />
            <ActionButton onClick={handleGenerate} variant="accent">
              <Share2 className="h-5 w-5" /> Generate link
            </ActionButton>
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
            <NeoPanel className="p-6 md:p-8">
              <StatusPill tone={link ? "green" : "yellow"}>{link ? "Link ready" : "No link yet"}</StatusPill>
              <h2 className="mt-4 text-3xl font-bold">Recruiter package</h2>
              <p className="mt-3 text-[16px] font-medium leading-7 text-[#393939]">
                The shared profile exposes the credential summary while keeping private resume, certificate,
                and account evidence behind Terminal3-scoped agent access.
              </p>
              <div className="mt-6 rounded-2xl border-[3px] border-black bg-[#F7F7F7] p-4">
                <MonoLine className="block">{link || "Generate a verification link"}</MonoLine>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <ActionButton onClick={handleGenerate} variant="light">
                  <Copy className="h-5 w-5" /> {copied ? "Copied" : "Copy link"}
                </ActionButton>
                <ActionButton href={`mailto:?subject=SkillProof AI passport&body=${encodeURIComponent(link || "SkillProof AI passport pending")}`} variant="dark">
                  <Mail className="h-5 w-5" /> Email recruiter
                </ActionButton>
              </div>
              <div className="mt-8 space-y-3">
                {["Trust score", "Top skills", "Terminal3 DID", "Credential issue status", "Agent audit proof"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border-[3px] border-black bg-white px-4 py-3 font-bold">
                    <Link2 className="h-5 w-5" /> {item}
                  </div>
                ))}
              </div>
            </NeoPanel>
            <PassportCard showActions={false} />
          </div>

          <AuditTimeline limit={5} />
        </div>
      </section>
    </PageShell>
  )
}
