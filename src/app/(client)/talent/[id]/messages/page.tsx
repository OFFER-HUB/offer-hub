"use client"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTalentData } from "@/hooks/talent/useTalentData"
import { MessageBubble } from "@/components/messaging/MessageBubble"
import { MessageInputs } from "@/components/messaging/MessageInputs"
import Image from "next/image"
import TalentLayout from "@/components/talent/talents/TalentLayout"

interface Message {
  id: string
  text: string
  timestamp: string
  isOutgoing: boolean
}

export default function MessagesPage() {
  const params = useParams()
  const router = useRouter()
  const talentId = params.id as string
  const { getTalentById } = useTalentData()
  const talent = getTalentById(Number(talentId))

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "The main text of the message sent out",
      timestamp: "09:21 am",
      isOutgoing: true,
    },
    {
      id: "2",
      text: "The main text of the message sent out",
      timestamp: "09:23 am",
      isOutgoing: false,
    },
  ])

  const handleSendMessage = (messageText: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOutgoing: true,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <section className="min-h-screen bg-gray-100">
      <div className="bg-white px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-gray-900">Message</h1>
          </div>
        </div>
      </div>
      <TalentLayout padding="p-0" borderRadius="">
        <div className="flex flex-col">
          {/* Header */}
          <div className="bg-teal-100 flex  py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-gray-700 hover:text-gray-900"
            ></Button>

            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src={talent?.avatar || "/professional-male-designer-avatar.png"}
                  alt={talent?.name || "User"}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">{talent?.name || "John Doe"}</h1>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-10 py-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message.text}
                timestamp={message.timestamp}
                isOutgoing={message.isOutgoing}
              />
            ))}
          </div>

          {/* Message Input */}
          <div className="pt-28">
            <MessageInputs onSendMessage={handleSendMessage} />
          </div>
        </div>
      </TalentLayout>
    </section>
  )
}
