"use client"

import { useEffect, useState } from "react"
import { BadgeCheck, ShieldAlert, ShieldCheck } from "lucide-react"
import { MonoLine, NeoPanel, StatusPill } from "@/components/skillproof/ui-kit"

type VerificationResult = {
  ok: boolean
  valid: boolean
  kind: "identity" | "credential"
  claims: {
    typ: "identity-verify" | "credential-verify"
    did?: string
    mode?: "live" | "demo"
    environment?: "testnet" | "production"
    credentialId?: string
    issuer?: string
    subjectDid?: string
    subjectName?: string
    subjectRole?: string
    trustScore?: number
    proofMode?: "live" | "demo"
    proofOperation?: string
    issuedAt: string
    skills?: Array<{ name: string; score: number; evidence: string }>
  }
}

export function VerificationPanel() {
  const [token, setToken] = useState<string | null>(null)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const verifyToken = params.get("verify")

    if (!verifyToken) {
      return
    }

    setToken(verifyToken)
    setLoading(true)

    fetch(`/api/terminal3/verify?token=${encodeURIComponent(verifyToken)}`)
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload.error ?? "Verification failed")
        }
        setResult(payload as VerificationResult)
      })
      .catch((verifyError) => {
        setError(verifyError instanceof Error ? verifyError.message : "Verification failed")
      })
      .finally(() => setLoading(false))
  }, [])

  if (!token) {
    return null
  }

  const credential = result?.kind === "credential" ? result.claims : null
  const identity = result?.kind === "identity" ? result.claims : null

  return (
    <NeoPanel className="p-6 md:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <StatusPill tone={result?.valid ? "green" : error ? "pink" : "yellow"}>
            {loading ? "Checking verification" : result?.valid ? "Verification valid" : "Verification pending"}
          </StatusPill>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">Recruiter verification result</h2>
          <p className="mt-3 max-w-3xl text-[16px] font-medium leading-7 text-[#393939]">
            SkillProof verifies shared links with a server-signed token derived from the Terminal3-authenticated identity
            or the issued credential envelope.
          </p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-black bg-[#DFFAF4]">
          {error ? <ShieldAlert className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border-[3px] border-black bg-[#FFE4EA] p-5">
          <p className="font-bold">This verification token could not be validated.</p>
          <p className="mt-2 text-sm font-semibold text-[#5B5B5B]">{error}</p>
        </div>
      ) : null}

      {identity ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border-[3px] border-black bg-[#E5F0FF] p-4">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">DID</p>
            <div className="mt-3">
              <MonoLine>{identity.did}</MonoLine>
            </div>
          </div>
          <div className="rounded-2xl border-[3px] border-black bg-[#DFFAF4] p-4">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">Terminal3 mode</p>
            <p className="mt-3 text-2xl font-bold">{identity.mode ?? "identity"}</p>
            <p className="text-sm font-semibold text-[#393939]">{identity.environment ?? "testnet"}</p>
          </div>
          <div className="rounded-2xl border-[3px] border-black bg-[#FFF1BE] p-4">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">Issued</p>
            <p className="mt-3 text-base font-bold">{new Date(identity.issuedAt).toLocaleString()}</p>
          </div>
        </div>
      ) : null}

      {credential ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl border-[3px] border-black bg-[#DFFAF4] p-5">
            <BadgeCheck className="h-8 w-8" />
            <h3 className="mt-4 text-2xl font-bold">{credential.subjectName}</h3>
            <p className="mt-1 font-semibold text-[#393939]">{credential.subjectRole}</p>
            <div className="mt-4">
              <MonoLine>{credential.subjectDid}</MonoLine>
            </div>
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">Trust score</p>
            <p className="mt-2 text-5xl font-bold">{credential.trustScore}%</p>
          </div>
          <div className="rounded-2xl border-[3px] border-black bg-black p-5 text-white">
            <p className="font-bold text-[#BFFFEF]">Terminal3 credential proof</p>
            <div className="mt-4 space-y-3">
              <MonoLine className="block bg-white text-black">{credential.credentialId}</MonoLine>
              <p className="text-sm font-semibold text-white/75">
                Proof: {credential.proofMode} / {credential.proofOperation}
              </p>
              <p className="text-sm font-semibold text-white/75">Issuer: {credential.issuer}</p>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {(credential.skills ?? []).slice(0, 4).map((skill) => (
                <div key={skill.name} className="rounded-xl border border-white/20 bg-white/[0.08] p-3">
                  <p className="font-bold">{skill.name}</p>
                  <p className="font-mono text-lg font-bold text-[#FFC224]">{skill.score.toFixed(1)}</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-white/70">{skill.evidence}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </NeoPanel>
  )
}
