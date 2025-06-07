"use client";

import { useState } from "react";
import { ArrowLeft, Smile, ImageIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface UserChatProps {
  onBack: () => void;
}

export function UserChat({ onBack }: UserChatProps) {
  const [message, setMessage] = useState("");

  const messages = [
    {
      id: 1,
      content: "The main text of the message sent out",
      timestamp: "09:21 am",
      isAdmin: true,
    },
    {
      id: 2,
      content: "The main text of the message sent out",
      timestamp: "09:23 am",
      isAdmin: false,
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Send message logic would go here
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="bg-gray-50 p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src="/placeholder.svg?height=40&width=40"
            alt="John Doe"
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-medium">John Doe</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl p-3 ${
                msg.isAdmin
                  ? "bg-blue-500 text-white rounded-tr-none"
                  : "bg-gray-200 text-gray-800 rounded-tl-none"
              }`}
            >
              <p>{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.isAdmin ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <Smile className="h-5 w-5 text-gray-400" />
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button variant="ghost" size="icon" className="rounded-full">
            <ImageIcon className="h-5 w-5 text-gray-400" />
          </Button>
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="rounded-full bg-[#0f172a] hover:bg-gray-800"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
