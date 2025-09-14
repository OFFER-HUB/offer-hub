export interface CreateProjectDTO {
    client_id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
}

export interface ProjectResponse {
    message: string;
    success: boolean;
    data: Project;
}

export interface Project {
    id: string;
    client_id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    status: string;
}

export interface ProjectAttachment {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
}

export interface ProjectMilestone {
    id: string;
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
}

export interface ProjectDraft{
    client_id: string;
    title: string;
    description: string;
    category: string;
    budgetAmount: number;
    subcategory: string;
    skills: string[];
    experienceLevel: string;
    projectType: 'on-time' | 'ongoing';
    visibility: 'public' | 'private';
    budgetType: 'fixed' | 'hourly';
    duration: string;
    attachments: ProjectAttachment[];
    milestones: ProjectMilestone[];
}