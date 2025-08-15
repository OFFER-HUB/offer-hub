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

export interface ProjectDraft{
    client_id: string;
    title: string;
    description: string;
    category: string;
    budgetAmount: number;
    subcategory: string;
    skills: string[];
    experienceLevel: string;
    projectType: "on-time" | "ongoing";
    visibility: "public" | "private";
    budgetType: "fixed" | "hourly";
    duration: string;
    attachments: any[];
    milestones: any[];
}