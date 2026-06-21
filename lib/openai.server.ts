type StructuredRequest<T> = {
  name: string
  instructions: string
  prompt: string
  schema: Record<string, unknown>
  maxOutputTokens?: number
  validate: (value: unknown) => value is T
}

type ResponseOutputText = {
  type?: string
  text?: string
  refusal?: string
}

type ResponseOutputItem = {
  type?: string
  content?: ResponseOutputText[]
}

type OpenAIResponse = {
  output?: ResponseOutputItem[]
  output_text?: string
}

function extractOutputText(payload: OpenAIResponse) {
  if (payload.output_text) {
    return payload.output_text
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) {
        return content.text
      }
    }
  }

  return ""
}

export async function generateStructuredWithOpenAI<T>({
  name,
  instructions,
  prompt,
  schema,
  maxOutputTokens = 900,
  validate,
}: StructuredRequest<T>): Promise<{ data: T; model: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return null
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions,
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      max_output_tokens: maxOutputTokens,
      store: false,
      text: {
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema,
        },
      },
    }),
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as OpenAIResponse
  const rawText = extractOutputText(payload)

  if (!rawText) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(rawText)
    return validate(parsed) ? { data: parsed, model } : null
  } catch {
    return null
  }
}
