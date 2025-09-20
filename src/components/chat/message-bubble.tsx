import Image from "next/image";

import { Avatar } from "@/components/ui/avatar";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOutgoing?: boolean;
  avatar?: string;
  attachments?: {
    type: "image" | "file";
    content: string;
  }[];
}

export function MessageBubble({
  content,
  timestamp,
  isOutgoing = false,
  avatar,
  attachments,
}: MessageBubbleProps) {
  if (isOutgoing) {
    return (
      <div className="flex justify-end">
        <div className="flex flex-col items-end">
          <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
            <p>{content}</p>
          </div>
          <span className="text-xs text-muted-foreground mt-1 mr-2">
            {timestamp}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 max-w-[80%]">
      <Avatar className="h-8 w-8 mt-1">
        <Image
          src={avatar || "/placeholder.svg?height=32&width=32"}
          alt="User avatar"
          width={32}
          height={32}
        />
      </Avatar>
      <div>
        <div className="flex flex-col gap-2">
          <div className="bg-muted rounded-lg p-3">
            <p>{content}</p>
          </div>

          {attachments && attachments.length > 0 && (
            <div className="bg-muted rounded-lg overflow-hidden">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="h-64 w-full bg-gray-200 flex items-center justify-center"
                >
                  {attachment.type === "file" && (
                    <div className="h-10 w-10 text-muted-foreground">
                      {attachment.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground mt-1 ml-2">
          {timestamp}
        </span>
      </div>
    </div>
  );
}
