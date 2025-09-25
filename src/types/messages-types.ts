// Common types for messages and conversations. Keeping this centralized
// ensures consistency across the thread, composer, and mock data.

export type Direction = 'sent' | 'received'

export type AttachmentKind = 'image' | 'file'

export type Attachment = {
  id: string
  kind: AttachmentKind
  name: string
  size: number // bytes
  mime: string
  url: string // object URL or remote URL
  width?: number
  height?: number
}

export type DeliveryStatus = 'sent' | 'delivered' | 'read'

export type Message = {
  id: string
  direction: Direction
  // Optional body text (caption); can be empty if message is attachment-only.
  text?: string
  // Original acceptance criteria uses a display time like "09:21 am".
  // We keep this for explicit display while also storing createdAt for grouping.
  time?: string
  // ISO string or Date for grouping and ordering
  createdAt: string | number | Date
  attachments?: Attachment[]
  status?: DeliveryStatus
  // Inline reply payload for previews (text snippet and first attachment thumbnail)
  replyTo?: {
    id: string
    text?: string
    attachmentThumbUrl?: string
    attachmentKind?: AttachmentKind
  }
}

export type Participant = {
  id: string
  name: string
  avatarUrl?: string
}

export type Conversation = {
  id: string
  participant: Participant
  // Unread count for the conversation list
  unread?: number
  messages: Message[]
}
