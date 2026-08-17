import { useState } from 'react'
import { BottomNavigation } from '@/components/BottomNavigation'
import type { TabId } from '@/components/tabs'
import { HomePage } from '@/pages/HomePage'
import { SchedulePage } from '@/pages/SchedulePage'
import { RuPage } from '@/pages/RuPage'
import { SubjectsPage } from '@/pages/SubjectsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useTheme } from '@/hooks/useTheme'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { ScheduleProvider } from '@/context/ScheduleContext'
import { NotificationSync } from '@/hooks/useNotificationSync'
import { OnboardingPage } from '@/pages/OnboardingPage'

function App() {
  const [tab, setTab] = useState<TabId>('home')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [onboarded, setOnboarded] = useLocalStorage<boolean>('onboarded', false)
  const { preference, setPreference } = useTheme()

  if (!onboarded) {
    return <OnboardingPage onComplete={() => setOnboarded(true)} />
  }

  const tabs: TabId[] = ['home', 'schedule', 'ru', 'subjects']

  const renderTab = (t: TabId) => {
    switch (t) {
      case 'home':
        return <HomePage onNavigate={setTab} onOpenSettings={() => setSettingsOpen(true)} />
      case 'schedule':
        return <SchedulePage onOpenSettings={() => setSettingsOpen(true)} />
      case 'ru':
        return <RuPage onNavigate={setTab} onOpenSettings={() => setSettingsOpen(true)} />
      case 'subjects':
        return <SubjectsPage onOpenSettings={() => setSettingsOpen(true)} />
    }
  }

  return (
    <ScheduleProvider>
      <NotificationSync />
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950">
        <main className="min-h-0 flex-1 overflow-y-auto pb-6 app-scrollbar">
          {tabs.map((t) => (
            <div
              key={t}
              className={t === tab ? 'h-full animate-fade-in' : 'hidden'}
              aria-hidden={t !== tab}
            >
              {renderTab(t)}
            </div>
          ))}
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
          onEditSubjects={() => {
            setSettingsOpen(false)
            setTab('subjects')
          }}
        />
      )}
    </ScheduleProvider>
  )
}

export default App