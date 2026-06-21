"use client"

import { useState } from "react"
import { BadgeCheck, FileUp, Github, Linkedin, PlayCircle } from "lucide-react"
import { evidenceProjects } from "@/components/skillproof/data"
import { PageShell } from "@/components/skillproof/page-shell"
import { useSkillProof } from "@/components/skillproof/skillproof-state"
import { ActionButton, NeoPanel, SectionTitle, StatusPill } from "@/components/skillproof/ui-kit"

export function ConnectPage() {
  const {
    state,
    connectGithub,
    connectLinkedIn,
    uploadResume,
    uploadCertificate,
    setProjectUrl,
    runAnalysis,
  } = useSkillProof()
  const [github, setGithub] = useState(state.githubHandle)
  const [linkedIn, setLinkedIn] = useState(state.linkedInUrl)
  const [certificate, setCertificate] = useState("")
  const projects = state.analysisResult?.projects ?? evidenceProjects

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionTitle
            title="Connect accounts and upload"
            highlight="evidence"
            description="Keep every evidence stream separate: GitHub, LinkedIn, resume, certificates, and project URL. The Analysis Agent then turns them into a scoreable private evidence graph."
          />

          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <NeoPanel className="p-6 md:p-8">
              <h2 className="text-2xl font-bold">Connected accounts</h2>
              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">
                    <Github className="h-4 w-4" /> GitHub handle
                  </span>
                  <input
                    value={github}
                    onChange={(event) => setGithub(event.target.value)}
                    className="h-14 w-full rounded-2xl border-[3px] border-black bg-white px-4 text-lg font-bold outline-none focus:ring-[3px] focus:ring-[#15B8A6]"
                    placeholder="richu-dev"
                  />
                </label>
                <ActionButton onClick={() => connectGithub(github)} variant="accent">Connect GitHub</ActionButton>

                <label className="block pt-3">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">
                    <Linkedin className="h-4 w-4" /> LinkedIn URL
                  </span>
                  <input
                    value={linkedIn}
                    onChange={(event) => setLinkedIn(event.target.value)}
                    className="h-14 w-full rounded-2xl border-[3px] border-black bg-white px-4 text-lg font-bold outline-none focus:ring-[3px] focus:ring-[#2F81F7]"
                    placeholder="https://linkedin.com/in/richu"
                  />
                </label>
                <ActionButton onClick={() => connectLinkedIn(linkedIn)} variant="light">Connect LinkedIn</ActionButton>
              </div>
            </NeoPanel>

            <NeoPanel className="p-6 md:p-8">
              <h2 className="text-2xl font-bold">Resume and certificates</h2>
              <div className="mt-6 space-y-5">
                <label className="block rounded-2xl border-[3px] border-dashed border-black bg-[#FFF9E3] p-5">
                  <span className="flex items-center gap-3 text-lg font-bold">
                    <FileUp className="h-6 w-6" /> Upload resume PDF
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="mt-4 block w-full text-sm font-bold"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) uploadResume(file.name)
                    }}
                  />
                  <p className="mt-3 text-sm font-medium text-[#5B5B5B]">{state.resumeName || "No resume uploaded yet"}</p>
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[#4D4D4D]">
                    <BadgeCheck className="h-4 w-4" /> Certificate name
                  </span>
                  <input
                    value={certificate}
                    onChange={(event) => setCertificate(event.target.value)}
                    className="h-14 w-full rounded-2xl border-[3px] border-black bg-white px-4 text-lg font-bold outline-none focus:ring-[3px] focus:ring-[#FFC224]"
                    placeholder="AWS Cloud Practitioner"
                  />
                </label>
                <ActionButton
                  onClick={() => {
                    uploadCertificate(certificate)
                    setCertificate("")
                  }}
                  variant="light"
                >
                  Add certificate
                </ActionButton>

                <div className="flex flex-wrap gap-2">
                  {state.certificateNames.map((name) => (
                    <StatusPill key={name} tone="green">{name}</StatusPill>
                  ))}
                </div>
              </div>
            </NeoPanel>
          </div>

          <NeoPanel className="p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h2 className="text-2xl font-bold">Project evidence URL</h2>
                <p className="mt-3 text-[16px] font-medium leading-7 text-[#393939]">
                  Add a representative project. The Analysis Agent scores complexity, stack, documentation,
                  and repo activity before the Scoring Agent updates the report.
                </p>
                <input
                  value={state.projectUrl}
                  onChange={(event) => setProjectUrl(event.target.value)}
                  className="mt-5 h-14 w-full rounded-2xl border-[3px] border-black bg-white px-4 text-base font-bold outline-none focus:ring-[3px] focus:ring-[#15B8A6]"
                />
                <div className="mt-5">
                  <ActionButton onClick={runAnalysis} variant="accent">
                    <PlayCircle className="h-5 w-5" /> Analyze evidence
                  </ActionButton>
                </div>
              </div>
              <div className="grid gap-3">
                {projects.map((project) => (
                  <div key={project.title} className="rounded-2xl border-[3px] border-black bg-[#F6F6F6] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-bold">{project.title}</p>
                      <span className="rounded-lg border-2 border-black bg-[#FFC224] px-3 py-1 font-mono text-sm font-bold">{project.score}%</span>
                    </div>
                    <p className="mt-2 text-sm font-medium leading-6 text-[#5B5B5B]">{project.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </NeoPanel>
        </div>
      </section>
    </PageShell>
  )
}
