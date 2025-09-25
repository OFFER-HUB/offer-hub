import { Sidebar } from '@/components/projects/ProjectSidebar'
import { Header } from '@/components/projects/ProjectHeader'
import { ProjectDashboard } from '@/components/projects/ProjectDashboard'

export default function ProjectsPage() {
  return (
    <div className='min-h-screen bg-neutral-200'>
      <div className='mx-auto max-w-[1200px] bg-white shadow-sm rounded-lg overflow-hidden mt-2'>
        <div className='border-b'>
          <Header />
        </div>

        <div className='flex'>
          <aside className='hidden md:block w-64 border-r'>
            <Sidebar />
          </aside>

          <main className='flex-1 pt-3 sm:pt-4 px-4 sm:px-6 pb-4 sm:pb-6 bg-neutral-50'>
            <section aria-labelledby='manage-project-title' className='mx-auto max-w-3xl'>
              <h2 id='manage-project-title' className='sr-only'>
                Manage Project
              </h2>
              <div className='rounded-xl border bg-white'>
                <ProjectDashboard />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

