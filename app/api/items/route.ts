import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseOGTags } from "@/lib/og-parser"
import { summarizeWithAI, type AIModel } from "@/lib/ai/summarize"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const url: string = body.url
  const folderId: string | null = body.folder_id ?? null
  const model: AIModel = body.model ?? "gpt-4o-mini"

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 })
  }

  // 즉시 OG태그 파싱
  const og = await parseOGTags(url)

  // DB에 즉시 저장 (AI 처리 전)
  const { data: item, error } = await supabase
    .from("items")
    .insert({
      user_id: user.id,
      url,
      title: og.title,
      image_url: og.image,
      folder_id: folderId,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 응답 반환 후 백그라운드에서 AI 요약/분류 처리
  after(summarizeWithAI(item.id, og, model))

  return NextResponse.json({ item }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const folderId = searchParams.get("folder_id")
  const status = searchParams.get("status")
  const category = searchParams.get("category")
  const search = searchParams.get("q")

  let query = supabase
    .from("items")
    .select("*, tags(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (folderId) query = query.eq("folder_id", folderId)
  if (status) query = query.eq("reading_status", status)
  if (category) query = query.eq("auto_category", category)
  if (search) query = query.ilike("title", `%${search}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
