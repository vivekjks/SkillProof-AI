"use client"

import { MessageSquareText, Mic, Sparkles } from "lucide-react"
import { interviewQuestions } from "@/components/skillproof/data"
import { PageShell } from "@/components/skillproof/page-shell"
import { useSkillProof } from "@/components/skillproof/skillproof-state"
import { ActionButton, NeoPanel, SectionTitle, StatusPill } from "@/components/skillproof/ui-kit"

export function InterviewPage() {
  const { state, answerQuestion, completeInterview } = useSkillProof()
  const answered = interviewQuestions.filter((question) => state.answers[question.id]?.trim()).length
  const grade = state.interviewGrade

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionTitle
              title="AI Interview Agent asks"
              highlight="proof questions"
              description="This flow simulates the interview agent from project.md. Answers are stored locally, graded into the score model, and signed into the audit trail."
            />
            <ActionButton onClick={completeInterview} variant={state.interviewComplete ? "light" : "accent"}>
              {state.interviewComplete ? "Re-grade interview" : "Complete interview"}
            </ActionButton>
          </div>

          <NeoPanel className="overflow-hidden">
            <div className="border-b-[3px] border-black bg-black px-6 py-5 text-white">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <Mic className="h-6 w-6 text-[#FFC224]" />
                  <h2 className="text-2xl font-bold">Technical interview console</h2>
                </div>
                <StatusPill tone="yellow">{answered}/{interviewQuestions.length} answered</StatusPill>
              </div>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
              <div className="divide-y-[3px] divide-black">
                {interviewQuestions.map((question, index) => (
                  <div key={question.id} className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-black bg-[#15B8A6] text-xl font-bold">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-2xl font-bold">{question.question}</h3>
                        <p className="mt-2 text-[15px] font-medium leading-6 text-[#5B5B5B]">{question.rubric}</p>
                        <textarea
                          value={state.answers[question.id] ?? ""}
                          onChange={(event) => answerQuestion(question.id, event.target.value)}
                          rows={5}
                          className="mt-5 w-full resize-y rounded-2xl border-[3px] border-black bg-[#FCFCF8] p-4 text-base font-medium leading-7 outline-none focus:ring-[3px] focus:ring-[#2F81F7]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <aside className="border-t-[3px] border-black bg-[#FFC224] p-6 lg:border-l-[3px] lg:border-t-0">
                <MessageSquareText className="h-10 w-10" />
                <h3 className="mt-5 text-3xl font-bold">Agent rubric</h3>
                <p className="mt-4 text-[16px] font-semibold leading-7">
                  The interview signal is intentionally separate from repository evidence. This prevents inflated scores
                  from profile claims alone and gives recruiters a better confidence layer.
                </p>
                {grade ? (
                  <div className="mt-6 rounded-2xl border-[3px] border-black bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#5B5B5B]">
                        {grade.mode === "openai" ? "OpenAI grade" : "Local grade"}
                      </p>
                      <span className="rounded-xl border-2 border-black bg-[#15B8A6] px-3 py-1 font-mono text-lg font-bold">
                        {grade.score}%
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold">{grade.model}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#393939]">{grade.recommendation}</p>
                  </div>
                ) : null}
                <div className="mt-6 space-y-3">
                  {["Correctness", "Depth", "Examples", "Tradeoffs", "Communication"].map((label) => (
                    <div key={label} className="flex items-center gap-3 rounded-2xl border-[3px] border-black bg-white px-4 py-3 font-bold">
                      <Sparkles className="h-5 w-5" />
                      {label}
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </NeoPanel>
        </div>
      </section>
    </PageShell>
  )
}
