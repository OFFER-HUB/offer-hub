/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateProjectDTO, ProjectDraft, ProjectResponse } from "@/types/project.types";
import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http:localhost:4000",
    headers: {
        'Content-Type': 'application/json'
    },
});

const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
    try {
        const { data } = await request;
        return data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'API request failed');
    }
}

export const useProjectsApi = () => {
    const createProject = (project: CreateProjectDTO) =>
        handleRequest<ProjectResponse>(api.post('/api/projects', project));

    const getProjects = () =>
        handleRequest<ProjectResponse[]>(api.get('/api/projects'));

    const getProjectById = (id: string) =>
        handleRequest<ProjectResponse>(api.get(`/api/projects/${id}`));

    const updateProject = (id: string, project: Partial<CreateProjectDTO>) =>
        handleRequest<ProjectResponse>(api.patch(`/api/projects/${id}`, project));

    const deleteProject = (id: string) =>
        handleRequest<{ success: boolean; message: string }>(api.delete(`/api/projects/${id}`));

    return {
        createProject,
        getProjects,
        getProjectById,
        updateProject,
        deleteProject
    }
};

type MinimalUser = { id: string };
export const mapData = (projectData: ProjectDraft, authenticatedUser: MinimalUser | string): CreateProjectDTO => ({
    client_id: typeof authenticatedUser === "string" ? authenticatedUser : authenticatedUser.id,
    title: projectData.title,
    description: projectData.description,
    category: projectData.category,
    budget: projectData.budgetAmount
})