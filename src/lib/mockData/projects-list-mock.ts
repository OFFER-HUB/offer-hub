// Datos mock para la lista de proyectos

export type Project = {
  id: string
  title: string
  person: string
  date: string
  status: 'active' | 'completed' | 'dispute'
  avatarSrc?: string
}

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Mobile App UI/UX design',
    person: 'John Doe',
    date: 'Jan 22, 2025 · present',
    status: 'completed',
    avatarSrc: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '2',
    title: 'Creative Mobile App UI/UX Solutions',
    person: 'Emily Johnson',
    date: 'March 10, 2024 · current',
    status: 'completed',
    avatarSrc: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '3',
    title: 'Innovative Mobile Application User Interface and Experience Design',
    person: 'Alex Smith',
    date: 'February 15, 2023 · ongoing',
    status: 'completed',
    avatarSrc: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '4',
    title: 'FinTech Dashboard Revamp',
    person: 'Taylor Green',
    date: 'May 02, 2025 · sprint 3',
    status: 'active',
    avatarSrc: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '5',
    title: 'E‑commerce App Dispute Case',
    person: 'Chris White',
    date: 'Opened · Jul 2025',
    status: 'dispute',
    avatarSrc: '/placeholder.svg?height=40&width=40',
  },
]

export function getMockProjects(): Project[] {
  return mockProjects
}

