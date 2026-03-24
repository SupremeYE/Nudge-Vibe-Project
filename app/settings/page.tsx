"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { AIModel } from "@/lib/ai/summarize"

const AI_MODELS: { value: AIModel; label: string; description: string }[] = [
  {
    value: "gpt-4o-mini",
    label: "GPT-4o mini",
    description: "OpenAI · 빠르고 비용 효율적 (기본값)",
  },
  {
    value: "gemini-flash",
    label: "Gemini Flash",
    description: "Google · 멀티모달, 이미지 OCR 지원",
  },
]

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4o-mini")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("pkb_ai_model") as AIModel | null
    if (stored) setSelectedModel(stored)
  }, [])

  function handleSave() {
    localStorage.setItem("pkb_ai_model", selectedModel)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="min-h-screen p-6 bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">설정</h1>
          <p className="text-muted-foreground mt-1">AI 모델 및 앱 설정을 관리합니다</p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>AI 요약 모델</CardTitle>
            <CardDescription>
              링크 저장 시 요약·분류·태그 추출에 사용할 AI 모델을 선택합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI_MODELS.map((model) => (
              <button
                key={model.value}
                onClick={() => setSelectedModel(model.value)}
                className={`w-full text-left rounded-lg border p-4 transition-colors ${
                  selectedModel === model.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.label}</span>
                      {model.value === "gpt-4o-mini" && (
                        <Badge variant="secondary" className="text-xs">기본</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {model.description}
                    </p>
                  </div>
                  {selectedModel === model.value && (
                    <div className="h-4 w-4 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}

            <div className="pt-2">
              <Button onClick={handleSave} disabled={saved}>
                {saved ? "저장됨" : "저장"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
