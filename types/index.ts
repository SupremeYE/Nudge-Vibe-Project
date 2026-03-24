import type { Tables, Enums } from "./database.types"

export type Item = Tables<"items">
export type Folder = Tables<"folders">
export type Tag = Tables<"tags">
export type Reminder = Tables<"reminders">

export type ReadingStatus = Enums<"reading_status">
export type ReminderType = Enums<"reminder_type">

// 태그 포함한 아이템 확장 타입
export type ItemWithTags = Item & {
  tags: Tag[]
}
