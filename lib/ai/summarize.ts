import type { OGData } from "@/lib/og-parser"
import { createClient } from "@/lib/supabase/server"

export type AIModel = "gpt-4o-mini" | "gemini-flash"

interface SummarizeResult {
  summary: string
  category: string
  tags: string[]
}

const SYSTEM_PROMPT = `당신은 웹 링크 내용을 분석하는 AI입니다.
주어진 제목과 설명을 바탕으로 JSON만 응답하세요 (다른 텍스트 없이):
{
  "summary": "2-3문장으로 핵심 내용 요약 (한국어)",
  "category": "기술|비즈니스|디자인|과학|문화|건강|기타 중 하나",
  "tags": ["관련태그1", "관련태그2", "관련태그3"]
}`

async function callGPT4oMini(content: string): Promise<SummarizeResult> {
  const { default: OpenAI } = await import("openai")
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  })
  return JSON.parse(res.choices[0].message.content ?? "{}") as SummarizeResult
}

async function callGeminiFlash(content: string): Promise<SummarizeResult> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai")
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const prompt = `${SYSTEM_PROMPT}\n\n${content}`
  const res = await model.generateContent(prompt)
  const text = res.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return JSON.parse(jsonMatch?.[0] ?? "{}") as SummarizeResult
}

export async function summarizeWithAI(
  itemId: string,
  og: OGData,
  model: AIModel = "gpt-4o-mini"
): Promise<void> {
  const content = [
    og.title ? `제목: ${og.title}` : "",
    og.description ? `설명: ${og.description}` : "",
    og.siteName ? `사이트: ${og.siteName}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  if (!content.trim()) return

  let result: SummarizeResult
  try {
    if (model === "gemini-flash") {
      result = await callGeminiFlash(content)
    } else {
      result = await callGPT4oMini(content)
    }
  } catch (err) {
    console.error("[AI Summarize] Failed:", err)
    return
  }

  const supabase = await createClient()

  await supabase
    .from("items")
    .update({
      summary: result.summary ?? null,
      auto_category: result.category ?? null,
      ai_model: model,
    })
    .eq("id", itemId)

  if (result.tags?.length) {
    const tagRows = result.tags
      .filter((t) => typeof t === "string" && t.trim())
      .map((name) => ({ name: name.trim(), item_id: itemId }))
    if (tagRows.length) {
      await supabase.from("tags").insert(tagRows)
    }
  }
}
