import { NextResponse } from "next/server"
import { interviewQuestions } from "@/components/skillproof/data"
import {
  applyRateLimit,
  jsonError,
  parseJsonObject,
  requireSkillProofSession,
} from "@/lib/skillproof-security.server"

export const runtime = "nodejs"

type InterviewGrade = {
  score: number
  strengths: string[]
  gaps: string[]
  recommendation: string
  mode: "openai" | "local"
  model: string
}

function localGrade(answers: Record<string, string>): InterviewGrade {
  const answerText = interviewQuestions.map((question) => answers[question.id] ?? "").join(" ")
  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length
  const answered = interviewQuestions.filter((question) => answers[question.id]?.trim()).length
  const keywordHits = [
    "state",
    "effect",
    "dependency",
    "closure",
    "memo",
    "callback",
    "reference",
    "event",
    "bubbling",
    "delegation",
  ].filter((keyword) => answerText.toLowerCase().includes(keyword)).length
  const score = Math.min(94, 52 + answered * 10 + Math.min(22, Math.floor(wordCount / 8)) + keywordHits * 2)

  return {
    score,
    strengths: [
      answered === interviewQuestions.length ? "Completed every interview prompt" : "Started the technical interview flow",
      keywordHits >= 4 ? "Used relevant frontend engineering terminology" : "Provided an initial technical signal",
      wordCount >= 50 ? "Answers include enough depth for scoring" : "Answers are concise and easy to review",
    ],
    gaps: [
      keywordHits < 5 ? "Add more concrete examples and tradeoffs" : "Expand with production debugging examples",
      wordCount < 80 ? "Give fuller answers for higher confidence" : "Mention measurable project outcomes",
    ],
    recommendation:
      score >= 82
        ? "Proceed to credential issuance after evidence analysis."
        : "Ask one follow-up interview round before issuing the final passport.",
    mode: "local",
    model: "deterministic-rubric",
  }
}

function getTextOutput(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return ""
  }
  const response = payload as { output_text?: unknown; output?: unknown }
  if (typeof response.output_text === "string") {
    return response.output_text
  }
  if (!Array.isArray(response.output)) {
    return ""
  }

  return response.output
    .flatMap((item) => {
      if (typeof item !== "object" || item === null || !Array.isArray((item as { content?: unknown }).content)) {
        return []
      }
      return (item as { content: Array<{ text?: unknown; type?: unknown }> }).content
        .filter((content) => content.type === "output_text" && typeof content.text === "string")
        .map((content) => content.text as string)
    })
    .join("\n")
}

function validateAnswers(value: unknown) {
  if (value === undefined) {
    return {}
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw Object.assign(new Error("answers must be an object."), { status: 400 })
  }

  const allowedIds = new Set(interviewQuestions.map((question) => question.id))
  const answers: Record<string, string> = {}

  for (const [id, answer] of Object.entries(value)) {
    if (!allowedIds.has(id)) {
      throw Object.assign(new Error(`Unknown interview question id: ${id}`), { status: 400 })
    }
    if (typeof answer !== "string") {
      throw Object.assign(new Error(`Answer for ${id} must be text.`), { status: 400 })
    }
    if (answer.length > 2_500) {
      throw Object.assign(new Error(`Answer for ${id} is too long.`), { status: 413 })
    }
    answers[id] = answer.trim()
  }

  return answers
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "ai-interview-grade", 15, 60_000)
  if (limited) return limited

  const session = requireSkillProofSession(request)
  if (session instanceof NextResponse) return session

  let answers: Record<string, string>
  try {
    const body = await parseJsonObject(request, 12_288)
    answers = validateAnswers(body.answers)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid request body", Number((error as { status?: number }).status ?? 400))
  }

  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"

  if (!apiKey) {
    return NextResponse.json(localGrade(answers))
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions:
          "You are SkillProof AI's Interview Agent. Grade frontend engineering interview answers. Return only JSON that matches the supplied schema. Reward correctness, depth, examples, tradeoffs, and clear communication.",
        input: JSON.stringify({
          questions: interviewQuestions.map(({ id, question, rubric }) => ({ id, question, rubric })),
          answers,
        }),
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "skillproof_interview_grade",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["score", "strengths", "gaps", "recommendation"],
              properties: {
                score: { type: "number", minimum: 0, maximum: 100 },
                strengths: {
                  type: "array",
                  maxItems: 3,
                  items: { type: "string" },
                },
                gaps: {
                  type: "array",
                  maxItems: 3,
                  items: { type: "string" },
                },
                recommendation: { type: "string" },
              },
            },
          },
        },
        max_output_tokens: 500,
      }),
    })

    if (!response.ok) {
      return NextResponse.json(localGrade(answers))
    }

    const payload = await response.json()
    const outputText = getTextOutput(payload)
    const parsed = JSON.parse(outputText) as Omit<InterviewGrade, "mode" | "model">
    const rawScore = Number(parsed.score) || 0
    const normalizedScore = rawScore <= 10 ? rawScore * 10 : rawScore

    return NextResponse.json({
      score: Math.max(0, Math.min(100, Math.round(normalizedScore))),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 3) : [],
      recommendation: String(parsed.recommendation || "Review evidence before issuing the passport."),
      mode: "openai",
      model,
    } satisfies InterviewGrade)
  } catch {
    return NextResponse.json(localGrade(answers))
  }
}
