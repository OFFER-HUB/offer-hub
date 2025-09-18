import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Upload, Camera, Send } from "lucide-react";

const mockConversation = [
  {
    id: 1,
    content:
      "Hello! I noticed you applied for the Frontend Developer position. I'd like to discuss your application further.",
    timestamp: "10:30 AM",
    isAdmin: true,
    sender: {
      name: "Sarah Johnson",
      role: "HR Manager",
      avatar: "/avatars/admin.jpg",
    },
  },
  {
    id: 2,
    content:
      "Hi Sarah! Thank you for reaching out. I'm very excited about this opportunity and would love to discuss it.",
    timestamp: "10:32 AM",
    isAdmin: false,
    sender: {
      name: "John Smith",
      role: "Applicant",
      avatar: "/avatars/user.jpg",
    },
  },
  {
    id: 3,
    content:
      "Great! Could you tell me more about your experience with React and Next.js? I see you have some projects listed.",
    timestamp: "10:33 AM",
    isAdmin: true,
    sender: {
      name: "Sarah Johnson",
      role: "HR Manager",
      avatar: "/avatars/admin.jpg",
    },
  },
  {
    id: 4,
    content:
      "Absolutely! I've been working with React for about 3 years now, and I've used Next.js extensively in my recent projects. I built a full-stack e-commerce platform and a job board application.",
    timestamp: "10:35 AM",
    isAdmin: false,
    sender: {
      name: "John Smith",
      role: "Applicant",
      avatar: "/avatars/user.jpg",
    },
  },
];

const UserMessageThread: React.FC = () => {
  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/avatars/user.jpg" alt="User" />
            <AvatarFallback className="bg-blue-500 text-white">
              JS
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">John Smith</h3>
            <p className="text-sm text-gray-500">
              Frontend Developer Application
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
            Active
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50">
        {mockConversation.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isAdmin ? "justify-start" : "justify-end"
            }`}
          >
            <div className={`max-w-sm ${message.isAdmin ? "mr-12" : "ml-12"}`}>
              {/* Sender Info */}
              <div
                className={`flex items-center mb-1 ${
                  message.isAdmin ? "justify-start" : "justify-end"
                }`}
              >
                <span className="text-xs text-gray-500 font-medium">
                  {message.sender.name} • {message.sender.role}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`px-4 py-3 rounded-lg ${
                  message.isAdmin
                    ? "bg-white border border-gray-200 text-gray-800"
                    : "bg-blue-500 text-white"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>

              {/* Timestamp */}
              <div
                className={`mt-1 ${
                  message.isAdmin ? "text-left" : "text-right"
                }`}
              >
                <span className="text-xs text-gray-400">
                  {message.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center space-x-3">
          {/* Emoji Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled
          >
            <Smile className="w-6 h-6 text-gray-500" />
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Input
              placeholder="Type your message..."
              className="pr-24 py-3 border-gray-300 rounded-full bg-[#E8E8E8] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            />

            {/* Input Action Icons */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 rounded-full"
                disabled
              >
                <Upload className="w-5 h-5 text-[#1C1B1F]" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 rounded-full"
                disabled
              >
                <Camera className="w-5 h-5 text-[#1C1B1F]" />
              </Button>
            </div>
          </div>

          {/* Send Button */}
          <Button
            size="sm"
            className=" bg-[#1C1B1F] hover:bg-blue-600 text-white rounded-full"
            disabled
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserMessageThread;
