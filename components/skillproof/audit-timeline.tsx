"use client"

import { ShieldCheck } from "lucide-react"
import { useSkillProof } from "@/components/skillproof/skillproof-state"
import { MonoLine, NeoPanel, StatusPill } from "@/components/skillproof/ui-kit"

export function AuditTimeline({ limit }: { limit?: number }) {
  const { state } = useSkillProof()
  const events = limit ? state.auditEvents.slice(0, limit) : state.auditEvents

  return (
    <NeoPanel className="overflow-hidden">
      <div className="border-b-[3px] border-black bg-[#111] px-6 py-5 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-[#BFFFEF]" />
            <h2 className="text-2xl font-bold">Agent audit trail</h2>
          </div>
          <StatusPill tone="yellow">Signed events</StatusPill>
        </div>
      </div>
      <div className="divide-y-[3px] divide-black">
        {events.map((event) => (
          <div key={event.id} className="grid gap-4 p-5 md:grid-cols-[120px_1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#5D5D5D]">{event.time}</p>
              <p className="mt-1 text-sm font-bold">{event.status}</p>
            </div>
            <div>
              <p className="text-lg font-bold">{event.agent}</p>
              <p className="mt-1 text-[15px] font-medium leading-6 text-[#393939]">{event.action}</p>
              {event.sdkOperation ? (
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-[#5D5D5D]">
                  {event.mode === "live" ? "Live Terminal3" : "Demo receipt"} / {event.sdkOperation}
                </p>
              ) : null}
            </div>
            <MonoLine>{event.signature}</MonoLine>
          </div>
        ))}
      </div>
    </NeoPanel>
  )
}
