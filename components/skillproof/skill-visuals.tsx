"use client"

import { Radar } from "lucide-react"
import { useSkillProof } from "@/components/skillproof/skillproof-state"
import { NeoPanel, StatusPill } from "@/components/skillproof/ui-kit"

export function SkillBars() {
  const { skillScores } = useSkillProof()

  return (
    <NeoPanel className="p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <StatusPill tone="blue">Skill graph</StatusPill>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">Evidence-weighted scores</h2>
        </div>
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border-[3px] border-black bg-[#2F81F7]">
          <Radar className="h-7 w-7 text-white" />
        </div>
      </div>
      <div className="mt-7 space-y-5">
        {skillScores.map((skill, index) => (
          <div key={skill.name} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold">{skill.name}</p>
                <p className="text-sm font-medium text-[#5B5B5B]">{skill.evidence}</p>
              </div>
              <span className="rounded-xl border-2 border-black bg-[#FFC224] px-3 py-1 font-mono text-sm font-bold">
                {skill.score.toFixed(1)}
              </span>
            </div>
            <div className="h-5 overflow-hidden rounded-full border-[3px] border-black bg-white">
              <div
                className="h-full rounded-r-full border-r-[3px] border-black"
                style={{
                  width: `${skill.score * 10}%`,
                  backgroundColor: ["#15B8A6", "#2F81F7", "#FFC224", "#FF6B7A", "#8B5CF6"][index],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </NeoPanel>
  )
}
