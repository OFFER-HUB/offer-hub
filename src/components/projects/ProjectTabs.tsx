'use client'

interface Tab {
  key: string
  label: string
}

interface ProjectTabsProps {
  tabs: readonly Tab[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ProjectTabs({ tabs, activeTab, onTabChange }: ProjectTabsProps) {
  return (
    <div className='mx-auto w-full max-w-[680px]'>
      <div className='flex items-center justify-evenly gap-2 rounded-none bg-slate-700 px-4 py-2'>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={[
              'rounded-none px-4 py-2 text-[15px] sm:text-base font-semibold transition',
              activeTab === t.key ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-100/90 hover:bg-slate-800',
            ].join(' ')}
            aria-pressed={activeTab === t.key}
            aria-label={`Tab ${t.label}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

