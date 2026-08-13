import { useState } from 'react'
import { BottomNavigation } from '@/components/BottomNavigation'
import type { TabId } from '@/components/tabs'
import { HomePage } from '@/pages/HomePage'
import { SchedulePage } from '@/pages/SchedulePage'
import { RuPage } from '@/pages/RuPage'
import { SubjectsPage } from '@/pages/SubjectsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useTheme } from '@/hooks/useTheme'

function App() {
  const [tab, setTab] = useState<TabId>('home')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { preference, setPreference } = useTheme()

  const page = (() => {
    switch (tab) {
      case 'home':
        return <HomePage onNavigate={setTab} onOpenSettings={() => setSettingsOpen(true)} />
      case 'schedule':
        return <SchedulePage onOpenSettings={() => setSettingsOpen(true)} />
      case 'ru':
        return <RuPage onNavigate={setTab} onOpenSettings={() => setSettingsOpen(true)} />
      case 'subjects':
        return <SubjectsPage onOpenSettings={() => setSettingsOpen(true)} />
    }
  })()

  return (
    <div className="min-h-dvh bg-zinc-200/70 dark:bg-zinc-900 md:grid md:place-items-center md:py-6 md:pb-8">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 md:h-[calc(100dvh-3rem)] md:max-w-[26rem] md:max-h-[820px] md:rounded-[2.5rem] md:shadow-2xl md:ring-1 md:ring-zinc-900/10 dark:md:ring-zinc-100/10">
        <main className="min-h-0 flex-1 overflow-y-auto pb-6 app-scrollbar">
          <div key={tab} className="h-full animate-fade-in">
            {page}
          </div>
        </main>

        <div className="relative z-20">
          <BottomNavigation active={tab} onChange={setTab} />
        </div>
      </div>

      {settingsOpen && (
        <SettingsPage
          preference={preference}
          setPreference={setPreference}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}

export default App