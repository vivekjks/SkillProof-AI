"use client"

import { KeyRound, Network, ShieldCheck, WalletCards } from "lucide-react"
import { useSkillProof } from "@/components/skillproof/skillproof-state"
import { ActionButton, MonoLine, NeoPanel, StatusPill } from "@/components/skillproof/ui-kit"

export function Terminal3StatusPanel({ compact = false }: { compact?: boolean }) {
  const { state, loadingTerminal3, startTerminal3Login } = useSkillProof()
  const session = state.terminal3

  return (
    <NeoPanel className={compact ? "p-5" : "p-6 md:p-8"}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <StatusPill tone={session?.mode === "live" ? "green" : "yellow"}>
            {session ? `${session.mode === "live" ? "Live" : "Demo"} Terminal3 identity` : "Terminal3 identity pending"}
          </StatusPill>
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Agent Auth SDK session</h2>
            <p className="mt-2 max-w-2xl text-[15px] font-medium leading-7 text-[#393939]">
              SkillProof authenticates agents server-side with the Terminal3 SDK, opens the encrypted T3N session,
              reads the DID from authentication, and scopes all passport actions to auditable agent events.
            </p>
          </div>
        </div>
        <ActionButton onClick={startTerminal3Login} loading={loadingTerminal3} variant={session ? "light" : "accent"}>
          {session ? "Refresh identity" : "Create identity"}
        </ActionButton>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border-[3px] border-black bg-[#E5F0FF] p-4">
          <KeyRound className="mb-3 h-6 w-6" />
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">DID</p>
          <div className="mt-3">
            <MonoLine>{session?.did ?? "Not authenticated yet"}</MonoLine>
          </div>
        </div>
        <div className="rounded-2xl border-[3px] border-black bg-[#DFFAF4] p-4">
          <Network className="mb-3 h-6 w-6" />
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">Network</p>
          <p className="mt-3 text-xl font-bold">{session?.environment ?? "testnet"}</p>
          <p className="text-sm font-medium text-[#393939]">{session?.usage ?? "Usage appears after auth"}</p>
        </div>
        <div className="rounded-2xl border-[3px] border-black bg-[#FFF1BE] p-4">
          <WalletCards className="mb-3 h-6 w-6" />
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">SDK package</p>
          <p className="mt-3 text-xl font-bold">{session?.sdkPackage ?? "@terminal3/t3n-sdk"}</p>
          <p className="text-sm font-medium text-[#393939]">Server-only key handling</p>
        </div>
        <div className="rounded-2xl border-[3px] border-black bg-[#FFE4EA] p-4">
          <ShieldCheck className="mb-3 h-6 w-6" />
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">Tenant scope</p>
          <p className="mt-3 text-lg font-bold">{session?.tenantStatus ?? "Waiting for auth"}</p>
          <p className="text-sm font-medium text-[#393939]">{session?.privateEvidenceMap ?? "Private map pending"}</p>
        </div>
      </div>

      {session?.nodeUrl || session?.contractScript ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border-[3px] border-black bg-[#F7F7F7] p-4">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">Node URL</p>
            <div className="mt-3">
              <MonoLine>{session.nodeUrl ?? "Resolved by SDK"}</MonoLine>
            </div>
          </div>
          <div className="rounded-2xl border-[3px] border-black bg-[#F7F7F7] p-4">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">Audit contract</p>
            <div className="mt-3">
              <MonoLine>{session.contractScript ?? "Optional T3N_SKILLPROOF_SCRIPT"}</MonoLine>
            </div>
          </div>
        </div>
      ) : null}

      {session ? (
        <div className="mt-6 rounded-2xl border-[3px] border-black bg-black p-5 text-white">
          <div className="flex items-center gap-2 text-[#BFFFEF]">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-bold">SDK operations exercised</span>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {session.sdkOperations.map((operation) => (
              <div key={operation} className="rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2 font-mono text-xs text-white">
                {operation}
              </div>
            ))}
          </div>
          {session.error ? <p className="mt-4 text-sm font-semibold text-[#FFC224]">{session.error}</p> : null}
        </div>
      ) : null}
    </NeoPanel>
  )
}
