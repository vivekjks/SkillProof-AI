"use client"

import { BadgeCheck, Download, ExternalLink, ShieldCheck } from "lucide-react"
import { useSkillProof } from "@/components/skillproof/skillproof-state"
import { ActionButton, MonoLine, NeoPanel, StatusPill } from "@/components/skillproof/ui-kit"

export function PassportCard({ showActions = true }: { showActions?: boolean }) {
  const { state, trustScore, skillScores, issuePassport } = useSkillProof()
  const issued = state.passportIssued
  const credential = state.credential

  function downloadCredential() {
    if (!credential) return
    const blob = new Blob([JSON.stringify(credential, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "skillproof-terminal3-credential.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <NeoPanel className="overflow-hidden">
      <div className="bg-[#15B8A6] p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <StatusPill tone={issued ? "green" : "yellow"}>{issued ? "Credential issued" : "Ready to issue"}</StatusPill>
            <h2 className="mt-5 text-3xl font-bold md:text-5xl">Verified Skill Passport</h2>
            <p className="mt-3 max-w-2xl text-[16px] font-semibold leading-7">
              Portable proof for recruiters: identity, evidence, interview, scores, credential status, and a signed audit path.
            </p>
          </div>
          <div className="hidden h-20 w-20 items-center justify-center rounded-full border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:flex">
            <BadgeCheck className="h-10 w-10" />
          </div>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-[0.8fr_1.2fr]">
        <div className="border-b-[3px] border-black p-6 md:border-b-0 md:border-r-[3px]">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-[4px] border-black bg-[#FFC224] text-4xl font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            RA
          </div>
          <h3 className="mt-6 text-3xl font-bold">Richu Anand</h3>
          <p className="mt-2 text-[16px] font-medium leading-7 text-[#393939]">Frontend + AI agent engineer</p>
          <div className="mt-5">
            <MonoLine>{state.terminal3?.did ?? "did:t3n:pending"}</MonoLine>
          </div>
          <div className="mt-6 rounded-2xl border-[3px] border-black bg-[#F6F6F6] p-4">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#5D5D5D]">Trust score</p>
            <p className="mt-2 text-[56px] font-bold leading-none">{trustScore}%</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {skillScores.slice(0, 4).map((skill) => (
              <div key={skill.name} className="rounded-2xl border-[3px] border-black bg-white p-4">
                <p className="text-lg font-bold">{skill.name}</p>
                <p className="mt-2 font-mono text-3xl font-bold">{skill.score.toFixed(1)}</p>
                <p className="mt-2 text-sm font-medium leading-5 text-[#5B5B5B]">{skill.evidence}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border-[3px] border-black bg-black p-5 text-white">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#BFFFEF]" />
              <p className="font-bold">Terminal3 signed credential envelope</p>
            </div>
            <p className="mt-3 text-sm font-medium leading-6 text-white/75">
              Credential Agent issues this passport only after identity, evidence analysis, interview scoring,
              and audit confirmation are complete.
            </p>
            {credential ? (
              <div className="mt-4 space-y-3">
                <MonoLine className="block bg-white text-black">{credential.id}</MonoLine>
                <p className="text-xs font-semibold leading-5 text-white/70">
                  Proof: {credential.proof.t3nMode} / {credential.proof.sdkOperation}
                </p>
              </div>
            ) : null}
          </div>
          {showActions ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <ActionButton onClick={issuePassport} variant={issued ? "light" : "accent"}>
                {issued ? "Reissue passport" : "Issue passport"}
              </ActionButton>
              {credential ? (
                <ActionButton onClick={downloadCredential} variant="light">
                  <Download className="h-5 w-5" /> Download VC JSON
                </ActionButton>
              ) : null}
              <ActionButton href="/share" variant="dark">
                Share profile
              </ActionButton>
            </div>
          ) : null}
          {state.shareLink ? (
            <a href={state.shareLink} className="mt-4 inline-flex items-center gap-2 text-sm font-bold underline">
              Recruiter verification link <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </NeoPanel>
  )
}
