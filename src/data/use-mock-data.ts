export const mockMessages = [
  {
    id: 1,
    content: 'Hey there!',
    timestamp: '10:30 AM',
    isOutgoing: false,
    type: 'text',
  },
  {
    id: 2,
    content: 'Hello! How are you?',
    timestamp: '10:31 AM',
    isOutgoing: true,
    type: 'text',
  },
  {
    id: 3,
    content: 'Document file',
    timestamp: '10:32 AM',
    isOutgoing: false,
    type: 'file',
    fileData: {
      name: 'ProjectBrief.pdf',
      size: '1.2MB',
      uploadDate: '2024-06-01',
      status: 'Uploaded',
    },
  },
]

export const mockConversation = {
  id: 1,
  name: 'Alice Johnson',
  avatar: '/placeholder.svg',
  lastMessage: 'Let\'s catch up',
  timestamp: '10:32 AM',
  isOnline: true,
  unreadCount: 2,
}
