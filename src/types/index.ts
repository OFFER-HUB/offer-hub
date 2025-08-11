import { JSX, ReactNode } from "react"

export interface Message {
  id: number
  content: string
  timestamp: string
  isOutgoing: boolean
  type: "text" | "file"
  fileData?: {
    name: string
    size: string
    uploadDate: string
    status: string
  }
}

export interface Conversation {
  id: number
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  isOnline: boolean
  unreadCount?: number
}

export interface MessagesMainProps {
  dispute?: DisputeRow
  activeConversation?: Conversation
  messages: Message[]
  chatHeaderItem?: JSX.Element
  onSendMessage: (content: string, file?: File) => void
}


export interface User {
  id?: string;
  name: string;
  email: string;
  status?: 'active' | 'restricted' | 'blocked';
  createdAt: string;
  avatarUrl: string;
  location?: string;
  role?: string;
  analytics?: {
    totalClients: number;
    clientsChange: number;
    completedJobs: number;
    jobsChange: number;
    totalPayments: number;
    paymentsChange: number;
    profileViews: number;
    viewsChange: number;
  };
}


export interface DisputeRow {
  name: string;
  email: string;
  ticket: string;
  userId?: string;
  amount?: string;
  status?: 'unassigned' | 'active' | 'resolved';
  parties: User[]
  createdAt: string;
}


export interface TabItem {
  label: string;
  value: string;
  component: ReactNode;
  href?: string;
}

export interface PillTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  tabsListclassName?: string;
  triggerClassName?: string;
  activeTriggerClassName?: string;
  inactiveTriggerClassName?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  renderContent?: boolean; // if false, only render the tab triggers
}

// Active Project Management Types
export interface Milestone {
  id: string;
  name: string;
  amount: string;
  status: "paid" | "in-escrow" | "pending";
  icon: ReactNode;
}

export interface ProjectData {
  id: string;
  title: string;
  freelancer: {
    name: string;
    avatar: string;
    location: string;
    timezone: string;
  };
  totalPayment: string;
  inEscrow: string;
  milestones: Milestone[];
}
