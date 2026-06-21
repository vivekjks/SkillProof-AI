import { agents } from "@/components/skillproof/data"
import { NeoPanel, StatusPill } from "@/components/skillproof/ui-kit"

export function AgentFlow() {
  return (
    <NeoPanel className="overflow-hidden">
      <div className="border-b-[3px] border-black bg-black px-6 py-5 text-white">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Multi-agent verification pipeline</h2>
          <StatusPill tone="yellow">Terminal3 scoped actions</StatusPill>
        </div>
      </div>
      <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent, index) => {
          const Icon = agent.icon
          return (
            <div key={agent.id} className="min-h-[210px] border-b-[3px] border-black p-6 md:border-r-[3px]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-black" style={{ backgroundColor: agent.accent }}>
                  <Icon className="h-7 w-7 text-black" />
                </div>
                <span className="font-mono text-sm font-bold text-[#5D5D5D]">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold">{agent.name}</h3>
              <p className="mt-3 text-[15px] font-medium leading-6 text-[#393939]">{agent.role}</p>
              <p className="mt-4 inline-flex rounded-full border-2 border-black bg-[#F6F6F6] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em]">
                {agent.signal}
              </p>
            </div>
          )
        })}
      </div>
    </NeoPanel>
  )
}
