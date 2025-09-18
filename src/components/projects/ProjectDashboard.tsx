"use client"

import { useMemo, useState } from "react"

import withErrorBoundary from "@/components/shared/WithErrorBoundary";
import { ProjectCard } from "@/components/projects/ProjectCard"
import { ProjectTabs } from "@/components/projects/ProjectTabs"
import { ProjectsList } from "@/components/projects/ProjectsList"

import { getMockProjects} from "@/lib/mockData/projects-list-mock"

const TABS = [
  { key: "active", label: "Active project" },
  { key: "completed", label: "Completed" },
  { key: "analytics", label: "Analytics" },
  { key: "dispute", label: "Dispute" },
] as const

type TabKey = (typeof TABS)[number]["key"]

function ProjectDashboard() {
  const [tab, setTab] = useState<TabKey>("completed")
  const projects = getMockProjects()

  const filtered = useMemo(() => {
    if (tab === "analytics") return []
    if (tab === "active") return projects.filter((p) => p.status === "active")
    if (tab === "completed") return projects.filter((p) => p.status === "completed")
    if (tab === "dispute") return projects.filter((p) => p.status === "dispute")
    return []
  }, [tab, projects])

  const handleTabChange = (newTab: string) => {
    setTab(newTab as TabKey);
  };

  return (
    <div className="p-3 sm:p-6">
      <ProjectTabs tabs={TABS} activeTab={tab} onTabChange={handleTabChange} />
      
      <div className="mx-auto w-full max-w-[680px] mt-3 sm:mt-4 space-y-4">
        {tab === "analytics" ? (
          <div className="rounded-lg border bg-white p-6 text-center text-slate-500">
            Analytics view - Coming soon
          </div>
        ) : (
          <ProjectsList projects={filtered} />
        )}
      </div>
    </div>
  )
}

export default withErrorBoundary(ProjectDashboard);

