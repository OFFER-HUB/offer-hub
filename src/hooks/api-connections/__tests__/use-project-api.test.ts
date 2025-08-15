import { renderHook, act } from "@testing-library/react";
import { useProjectsApi, mapData } from "../use-project-api";
import { CreateProjectDTO } from "@/types/project.types";
import axios, { AxiosInstance } from "axios";

jest.mock("axios", () => {
    const mAxios: Partial<Record<keyof AxiosInstance, jest.Mock>> = {
        create: jest.fn(() => mAxios),
        post: jest.fn(),
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn()
    };
    return mAxios;
});
const mockData = axios as unknown as {
    create: jest.Mock;
    post: jest.Mock;
    get: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
}

describe("useProjectApi", () => {
    const projectData: CreateProjectDTO = {
        client_id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Test project",
        description: "Development",
        category: "Frontend Developer",
        budget: 1000,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Created project successly", async () => {
        const mockResponse = { data: { ...projectData, id: "123" } };
        mockData.post.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useProjectsApi());
        let createdProject;
        await act(async () => {
            createdProject = await result.current.createProject(projectData);
        });
        expect(mockData.post).toHaveBeenCalledWith(
            "/api/projects",
            projectData
        );
        expect(createdProject).toEqual(mockResponse.data);
    });

    it("throws an error if project creation fails", async () => {
        mockData.post.mockRejectedValueOnce({
            response: { data: { message: "Error to create" } },
        });

        const { result } = renderHook(() => useProjectsApi());
        await expect(result.current.createProject(projectData)).rejects.toThrow(
            "Error to create"
        );
    })

    it("get all projects", async () => {
        const mockResponse = { data: [projectData] };
        mockData.get.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useProjectsApi());
        let projects;
        await act(async () => {
            projects = await result.current.getProjects();
        });

        expect(mockData.get).toHaveBeenCalledWith("/api/projects");
        expect(projects).toEqual(mockResponse.data);
    });

    it("get project by id", async () => {
        const projectId = "123";
        const mockResponse = { data: { ...projectData, id: projectId } };
        mockData.get.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useProjectsApi());
        let project;
        await act(async () => {
            project = await result.current.getProjectById(projectId);
        });

        expect(mockData.get).toHaveBeenCalledWith(`/api/projects/${projectId}`);
        expect(project).toEqual(mockResponse.data);
    });

    it("update project successfully", async () => {
        const projectId = "123";
        const updatePayload = { title: "Updated title" };
        const mockResponse = { data: { ...projectData, ...updatePayload, id: projectId } };
        mockData.patch.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useProjectsApi());
        let updatedProject;
        await act(async () => {
            updatedProject = await result.current.updateProject(projectId, updatePayload);
        });

        expect(mockData.patch).toHaveBeenCalledWith(`/api/projects/${projectId}`, updatePayload);
        expect(updatedProject).toEqual(mockResponse.data);
    });

    it("delete project successfully", async () => {
        const projectId = "123";
        const mockResponse = { data: { message: "Project deleted successfully" } };
        mockData.delete.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useProjectsApi());
        let deleteResult;
        await act(async () => {
            deleteResult = await result.current.deleteProject(projectId);
        });

        expect(mockData.delete).toHaveBeenCalledWith(`/api/projects/${projectId}`);
        expect(deleteResult).toEqual(mockResponse.data);
    });

    it("mapData mapping the data correctly", () => {
        const rawData = {
            client_id: "550e8400-e29b-41d4-a716-446655440000",
            title: "Draft project",
            description: "this is a new project",
            category: "Full Stack Development",
            budgetAmount: 1500,
            status: "draft",
            subcategory: "",
            skills: [],
            experienceLevel: "",
            projectType: "on-time" as const,
            visibility: "public" as const,
            budgetType: "fixed" as const,
            duration: "",
            attachments: [],
            milestones: [],
        };

        const user = { id: "550e8400-e29b-41d4-a716-446655440000" };

        const mapped = mapData(rawData, user);
        expect(mapped).toEqual({
            client_id: user.id,
            title: rawData.title,
            description: rawData.description,
            category: rawData.category,
            budget: rawData.budgetAmount
        });
    })
})