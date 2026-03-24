"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { AIModel } from "@/lib/ai/summarize"

type SaveStatus = "idle" | "saving" | "done" | "error"

export default function SharePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const sharedUrl =
      searchParams.get("url") ??
      searchParams.get("text") ??
      searchParams.get("title") ??
      ""
    if (sharedUrl) setUrl(sharedUrl)
  }, [searchParams])

  async function handleSave() {
    if (!url.trim()) return
    setStatus("saving")
    setErrorMsg("")

    const model = (localStorage.getItem("pkb_ai_model") ?? "gpt-4o-mini") as AIModel

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), model }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "저장 실패")
      }

      setStatus("done")
      setTimeout(() => router.push("/"), 1500)
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">링크 저장</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "done" ? (
            <div className="text-center space-y-2 py-4">
              <p className="text-green-600 font-medium">저장 완료!</p>
              <p className="text-sm text-muted-foreground">
                AI가 백그라운드에서 요약 중입니다...
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={status === "saving"}
                />
              </div>

              {errorMsg && (
                <p className="text-sm text-red-500">{errorMsg}</p>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={status === "saving"}
                >
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!url.trim() || status === "saving"}
                >
                  {status === "saving" ? "저장 중..." : "저장"}
                </Button>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  AI 모델:{" "}
                  <Badge variant="secondary" className="text-xs">
                    {typeof window !== "undefined"
                      ? (localStorage.getItem("pkb_ai_model") ?? "gpt-4o-mini")
                      : "gpt-4o-mini"}
                  </Badge>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
