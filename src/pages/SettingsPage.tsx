import { useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import {
  Bell,
  BellRing,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck2,
  Loader2,
  Monitor,
  Moon,
  PencilLine,
  QrCode,
  RotateCcw,
  Share2,
  Sun,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useModalFocus } from '@/hooks/useModalFocus'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useProfile } from '@/hooks/useProfile'
import { useUserQrCode } from '@/hooks/useUserQrCode'
import { useCampus, campusOptions } from '@/hooks/useCampus'
import { useCustomLinks } from '@/hooks/useCustomLinks'
import { DEFAULT_CAMPUS_ID } from '@/data/campuses'
import { student } from '@/data/student'
import { useSchedule } from '@/context/ScheduleContext'
import { useMaterials } from '@/context/MaterialsContext'
import { useGrades } from '@/context/GradesContext'
import { buildBackup, exportBackup, restoreBackup } from '@/lib/backup'
import { saveJson } from '@/lib/storage'
import { inputClass } from '@/lib/ui'
import { notificationsSupported, requestNotificationPermission, DEFAULT_NOTIFICATIONS, type NotificationSettings } from '@/lib/notifications'
import type { ThemePreference } from '@/types'

interface Props {
  preference: ThemePreference
  setPreference: (p: ThemePreference) => void
  onClose: () => void
  onEditSubjects: () => void
}

type Section = 'qr' | null

export function SettingsPage({ preference, setPreference, onClose, onEditSubjects }: Props) {
  const focusRef = useModalFocus(true, onClose)
  const { profile, update, reset: resetProfile } = useProfile()
  const { qrCode, setOverride, reset: resetQr } = useUserQrCode()
  const { campus, setCampusId } = useCampus()
  const { canInstall, isIos, isStandalone, promptInstall } = useInstallPrompt()
  const { resetAll: resetSchedule, subjects, entries, importData } = useSchedule()
  const { materials, importMaterials, clearMaterials } = useMaterials()
  const { grades, importGrades, clearGrades } = useGrades()
  const { links, replaceLinks, reset: resetLinks } = useCustomLinks()
  const [notifications, setNotifications] = useLocalStorage<NotificationSettings>(
    'notifications',
    DEFAULT_NOTIFICATIONS,
  )
  const notificationsNorm: NotificationSettings = {
    ...DEFAULT_NOTIFICATIONS,
    ...notifications,
  }
  const [openSection, setOpenSection] = useState<Section>(null)
  const [backupStatus, setBackupStatus] = useState<'' | 'ok' | 'error'>('')
  const [backupBusy, setBackupBusy] = useState(false)
  const [confirmWipe, setConfirmWipe] = useState(false)
  const [photoViewer, setPhotoViewer] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(profile.name)
  const [course, setCourse] = useState(profile.course)
  const [period, setPeriod] = useState(profile.period)
  const [ra, setRa] = useState(profile.ra)
  const [qrInput, setQrInput] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  const themeOptions: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ]

  const savePersonal = () => {
    update({ name: name.trim() || profile.name, course, period: period.trim(), ra: ra.trim() })
    setEditingProfile(false)
  }

  const saveQr = () => {
    setOverride(qrInput.trim())
    setOpenSection(null)
  }

  const handleExport = async () => {
    setBackupStatus('')
    setBackupBusy(true)
    try {
      const payload = await buildBackup({
        subjects,
        entries,
        profile,
        qrCode,
        campusId: campus.id,
        theme: preference,
        notifications,
        links,
        grades,
        materials,
      })
      await exportBackup(payload)
    } catch {
      setBackupStatus('error')
    } finally {
      setBackupBusy(false)
    }
  }

  const handleRestore = async (file: File) => {
    setBackupStatus('')
    setBackupBusy(true)
    try {
      const text = await file.text()
      await restoreBackup(text, {
        applySchedule: importData,
        applyProfile: update,
        applyQrCode: (v) => setOverride(v),
        applyCampus: setCampusId,
        applyTheme: setPreference,
        applyNotifications: (n) =>
          setNotifications({ ...DEFAULT_NOTIFICATIONS, ...n }),
        applyLinks: (linkList) => replaceLinks(linkList),
        applyGrades: importGrades,
        applyMaterials: importMaterials,
      })
      setBackupStatus('ok')
    } catch {
      setBackupStatus('error')
    } finally {
      setBackupBusy(false)
    }
  }

  const handleWipeAll = async () => {
    resetSchedule()
    resetProfile()
    resetQr()
    resetLinks()
    setCampusId(DEFAULT_CAMPUS_ID)
    setPreference('system')
    setNotifications(DEFAULT_NOTIFICATIONS)
    setName(student.name)
    setCourse(student.course)
    setPeriod(student.period)
    setRa(student.ra)
    setQrInput('')
    await clearMaterials()
    clearGrades()
    saveJson('onboarded', false)
    setConfirmWipe(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => update({ photo: reader.result as string })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const toggleNotification = async (
    patch: Partial<NotificationSettings>,
  ) => {
    const turningOn = Object.values(patch).some(Boolean)
    if (turningOn && notificationsSupported()) {
      await requestNotificationPermission()
    }
    setNotifications({ ...notifications, ...patch })
  }

  return (
    <div
      ref={focusRef}
      className="fixed inset-0 z-30 flex justify-end bg-zinc-950/30 backdrop-blur-sm md:justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-in-right flex h-full w-full flex-col overflow-y-auto bg-zinc-50 shadow-qr app-scrollbar dark:bg-zinc-950"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between bg-zinc-50/85 px-4 py-4 backdrop-blur-md dark:bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <Pressable
              onClick={onClose}
              aria-label="Fechar configurações"
              className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-all duration-200 hover:scale-105 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <ChevronRight size={18} className="rotate-180" />
            </Pressable>
            <h2 id="settings-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Configurações
            </h2>
          </div>
        </header>

        <div className="flex-1 space-y-7 px-4 pb-12 pt-2 md:space-y-9 md:px-6 lg:px-8">
          <section className="section-virtualize">
            <SectionTitle>Perfil</SectionTitle>
            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3.5 bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-4">
                <button
                  onClick={() => {
                    if (profile.photo) setPhotoViewer(true)
                    else photoInputRef.current?.click()
                  }}
                  aria-label="Alterar foto de perfil"
                  className="group relative block shrink-0"
                >
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt={`Foto de ${profile.name}`}
                      className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/30 transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white transition-transform duration-200 group-hover:scale-105">
                      <UserRound size={24} strokeWidth={1.9} />
                    </span>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePhotoChange}
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-white">{profile.name}</p>
                  <p className="truncate text-xs text-brand-100">{profile.course}</p>
                </div>
                <button
                  onClick={() => setEditingProfile((v) => !v)}
                  aria-label="Editar informações pessoais"
                  aria-expanded={editingProfile}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-all duration-200 hover:scale-105 hover:bg-white/25"
                >
                  <PencilLine size={17} strokeWidth={2} />
                </button>
              </div>
              <div className="grid grid-cols-2 divide-x divide-zinc-100 dark:divide-zinc-800">
                <div className="px-5 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Período
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {profile.period}
                  </p>
                </div>
                <div className="px-5 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Matrícula (RA)
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {profile.ra}
                  </p>
                </div>
              </div>
              {editingProfile && (
                <div className="animate-fade-in space-y-3 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
                  <Field label="Nome" value={name} onChange={setName} />
                  <Field label="Curso" value={course} onChange={setCourse} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Field label="Período" value={period} onChange={setPeriod} />
                    </div>
                    <div>
                      <Field label="Matrícula (RA)" value={ra} onChange={setRa} />
                    </div>
                  </div>
                  <ActionRow
                    onSave={savePersonal}
                    onReset={() => {
                      resetProfile()
                      setName(student.name)
                      setCourse(student.course)
                      setPeriod(student.period)
                      setRa(student.ra)
                      setEditingProfile(false)
                    }}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="section-virtualize">
            <SectionTitle>Aparência</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setPreference(value)}
                  aria-pressed={preference === value}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3.5 text-xs font-semibold transition-all duration-200 ${
                    preference === value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <Icon size={19} strokeWidth={1.9} />
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="section-virtualize">
            <SectionTitle>Campus</SectionTitle>
            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              {campusOptions.map((option, index) => {
                const active = campus.id === option.id
                return (
                  <div key={option.id}>
                    {index > 0 && <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />}
                    <button
                      onClick={() => setCampusId(option.id)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                        active ? 'bg-brand-500/5 dark:bg-brand-500/10' : ''
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                          active
                            ? 'bg-brand-500 text-white'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        <Building2 size={18} strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          {option.name}
                        </span>
                        <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                          RU: almoço {option.ru.lunch} · jantar {option.ru.dinner}
                        </span>
                      </span>
                      {active && (
                        <CheckCircle2 size={18} className="shrink-0 text-brand-500" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="mt-1.5 px-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              O campus selecionado define os horários exibidos na tela do QR do RU.
            </p>
          </section>

          <section className="section-virtualize">
            <SectionTitle>Instalar</SectionTitle>
            {canInstall ? (
              <div className="rounded-3xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-500/25 dark:bg-brand-500/10">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500 text-white shadow-card">
                    <Download size={20} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      Instalar o app
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Adicione à tela inicial para abrir em tela cheia e usar offline.
                    </p>
                  </div>
                </div>
                <button
                  onClick={promptInstall}
                  className="mt-4 w-full rounded-full bg-brand-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  Instalar
                </button>
              </div>
            ) : isIos && !isStandalone ? (
              <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <Share2 size={20} strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      Instalar no iPhone/iPad
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Toque em <span className="font-semibold">Compartilhar</span> na barra do Safari
                      e escolha <span className="font-semibold">Adicionar à Tela de Início</span>.
                    </p>
                  </div>
                </div>
              </div>
            ) : isStandalone ? (
              <div className="flex items-center gap-3 rounded-3xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  <CheckCircle2 size={20} strokeWidth={1.9} />
                </span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  App instalado na tela inicial
                </p>
              </div>
            ) : null}
          </section>

          <section className="section-virtualize">
            <SectionTitle>Notificações</SectionTitle>
            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <ToggleRow
                icon={Bell}
                label="Avisos de aula"
                description="15 minutos antes do início de cada aula"
                checked={notificationsNorm.classes}
                onChange={(v) => toggleNotification({ classes: v })}
              />
              <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
              <ToggleRow
                icon={FileCheck2}
                label="Lembretes de prova"
                description="15 minutos antes de cada avaliação"
                checked={notificationsNorm.exams}
                onChange={(v) => toggleNotification({ exams: v })}
              />
              <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
              <ToggleRow
                icon={BellRing}
                label="Véspera de prova"
                description={`Um dia antes, às ${notificationsNorm.examEveTime ?? '18:00'}`}
                checked={notificationsNorm.examEve}
                onChange={(v) => toggleNotification({ examEve: v })}
              >
                <label className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Horário
                  </span>
                  <input
                    type="time"
                    value={notificationsNorm.examEveTime ?? '18:00'}
                    onChange={(e) => setNotifications({ ...notifications, examEveTime: e.target.value })}
                    aria-label="Horário do lembrete de véspera"
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
                  />
                </label>
              </ToggleRow>
              <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
              <ToggleRow
                icon={BellRing}
                label="Lembretes do RU"
                description="Quando o restaurante universitário abre"
                checked={notificationsNorm.ru}
                onChange={(v) => toggleNotification({ ru: v })}
              />
            </div>
            <p className="mt-1.5 px-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              {notificationsSupported()
                ? Capacitor.isNativePlatform()
                  ? 'Notificações locais são agendadas no dispositivo, sem internet.'
                  : 'No navegador as notificações disparam enquanto o app estiver aberto.'
                : 'Notificações não disponíveis neste navegador.'}
            </p>
          </section>

          <section className="section-virtualize">
            <SectionTitle>Backup</SectionTitle>
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Exporte um arquivo com toda a sua grade, perfil, QR e materiais, e restaure em
                outro aparelho ou depois de reinstalar.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleExport}
                  disabled={backupBusy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {backupBusy ? (
                    <Loader2 size={15} strokeWidth={2.2} className="animate-spin" />
                  ) : (
                    <Download size={15} strokeWidth={2.2} />
                  )}
                  Exportar
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={backupBusy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Upload size={15} strokeWidth={2.2} />
                  Restaurar
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleRestore(file)
                  e.target.value = ''
                }}
              />
              <div role="status" aria-live="polite">
                {backupStatus === 'ok' && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                    <CheckCircle2 size={14} strokeWidth={2} />
                    Backup restaurado com sucesso!
                  </p>
                )}
                {backupStatus === 'error' && (
                  <p className="mt-3 text-xs font-semibold text-rose-500">
                    Não foi possível completar a operação. Tente novamente.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="section-virtualize">
            <SectionTitle>Dados</SectionTitle>
            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <DataButton
                icon={QrCode}
                label="Editar QR Code"
                expanded={openSection === 'qr'}
                onClick={() => {
                  setQrInput(qrCode)
                  setOpenSection(openSection === 'qr' ? null : 'qr')
                }}
              >
                {qrInput && (
                  <img
                    src={qrInput}
                    alt="Prévia do QR Code"
                    className="mb-3 h-28 w-28 rounded-2xl border border-zinc-200 bg-white object-contain p-1 dark:border-zinc-700"
                  />
                )}
                <Field
                  label="Imagem ou caminho do QR Code"
                  value={qrInput}
                  onChange={setQrInput}
                  placeholder="data:image/png;base64,... ou /qr-code.png"
                />
                <label className="mb-2 flex items-center justify-center gap-2 rounded-full border border-dashed border-zinc-300 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-brand-500 dark:hover:text-brand-400">
                  <Upload size={15} strokeWidth={2.2} />
                  Escolher imagem do QR
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 3 * 1024 * 1024) return
                      const reader = new FileReader()
                      reader.onload = () => setQrInput(reader.result as string)
                      reader.readAsDataURL(file)
                      e.target.value = ''
                    }}
                  />
                </label>
                <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                  Escolha uma imagem (PNG/JPG) do seu QR Code do RU. Sem imagem, o app mostra um
                  QR de demonstração.
                </p>
                <ActionRow
                  onSave={saveQr}
                  onReset={() => {
                    resetQr()
                    setQrInput('')
                  }}
                />
              </DataButton>
              <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
              <DataButton
                icon={PencilLine}
                label="Editar disciplinas"
                onClick={onEditSubjects}
                plain
              />
              <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
              <DataButton
                icon={RotateCcw}
                label="Restaurar dados padrão"
                onClick={() => {}}
                plain
              >
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Apaga todas as disciplinas, horários e provas da grade, voltando ao estado
                  inicial do app.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={resetSchedule}
                    className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
                  >
                    Restaurar agora
                  </button>
                </div>
              </DataButton>
              <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
              <DataButton
                icon={Trash2}
                label="Apagar todos os dados"
                onClick={() => setConfirmWipe((v) => !v)}
                plain
              >
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Remove grade, perfil, QR Code, links, notificações e todos os materiais do
                  aparelho, voltando ao estado inicial do app.
                </p>
                {confirmWipe ? (
                  <div className="animate-fade-in mt-2 flex gap-2">
                    <button
                      onClick={handleWipeAll}
                      className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
                    >
                      Confirmar exclusão
                    </button>
                    <button
                      onClick={() => setConfirmWipe(false)}
                      className="rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmWipe(true)}
                    className="mt-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    Apagar tudo
                  </button>
                )}
              </DataButton>
            </div>
          </section>

          <section className="section-virtualize">
            <SectionTitle>Sobre</SectionTitle>
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">UFERSA Mobile</p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                Sua carteira universitária digital no bolso.
              </p>
              <p className="mt-3 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                v1.0.0
              </p>
            </div>
          </section>
        </div>
      </div>
      {photoViewer && (
        <PhotoViewerModal
          photo={profile.photo ?? null}
          name={profile.name}
          onClose={() => setPhotoViewer(false)}
          onPick={() => {
            setPhotoViewer(false)
            photoInputRef.current?.click()
          }}
          onRemove={() => {
            update({ photo: undefined })
            setPhotoViewer(false)
          }}
        />
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
      {children}
    </h2>
  )
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  children,
}: {
  icon: typeof Bell
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  children?: React.ReactNode
}) {
  return (
    <div
      className="flex cursor-pointer items-center gap-3 px-5 py-4"
      onClick={() => onChange(!checked)}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Icon size={18} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
        <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
        <span className="block text-xs text-zinc-500 dark:text-zinc-400">{description}</span>
        {children}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
        aria-label={label}
      />
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-500' : 'bg-zinc-200 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </div>
  )
}

function DataButton({
  icon: Icon,
  label,
  children,
  expanded,
  onClick,
  plain,
}: {
  icon: typeof Bell
  label: string
  children?: React.ReactNode
  expanded?: boolean
  onClick: () => void
  plain?: boolean
}) {
  return (
    <div>
      {plain ? (
        <div className="flex w-full items-center gap-3 px-5 py-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <Icon size={18} strokeWidth={1.9} />
          </span>
          <span className="flex-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
        </div>
      ) : (
        <Pressable
          onClick={onClick}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-all duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          aria-expanded={expanded}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <Icon size={18} strokeWidth={1.9} />
          </span>
          <span className="flex-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
          <ChevronRight
            aria-hidden="true"
            size={18}
            className={`shrink-0 text-zinc-300 transition-transform duration-200 dark:text-zinc-600 ${expanded ? 'rotate-90' : ''}`}
          />
        </Pressable>
      )}
      {expanded && children && <div className="animate-fade-in px-5 pb-4">{children}</div>}
      {plain && children && <div className="animate-fade-in px-5 pb-4">{children}</div>}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  )
}

function ActionRow({ onSave, onReset }: { onSave: () => void; onReset: () => void }) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        onClick={onSave}
        className="flex-1 rounded-full bg-brand-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
      >
        Salvar
      </button>
      <button
        onClick={onReset}
        className="rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Padrão
      </button>
    </div>
  )
}

function PhotoViewerModal({
  photo,
  name,
  onClose,
  onPick,
  onRemove,
}: {
  photo: string | null
  name: string
  onClose: () => void
  onPick: () => void
  onRemove: () => void
}) {
  const focusRef = useModalFocus(true, onClose)
  return (
    <div
      ref={focusRef}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-viewer-title"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] pb-2">
        <p id="photo-viewer-title" className="text-sm font-medium text-zinc-400">
          Foto de perfil
        </p>
        <Pressable
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          aria-label="Fechar visualizador de foto"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-all duration-200 hover:scale-105 hover:bg-white/20"
        >
          <X size={20} />
        </Pressable>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8" onClick={(e) => e.stopPropagation()}>
        {photo ? (
          <img
            src={photo}
            alt={`Foto de ${name}`}
            className="max-h-[60vh] w-full max-w-sm rounded-3xl object-contain"
          />
        ) : (
          <span className="grid h-32 w-32 place-items-center rounded-full bg-white/10 text-white">
            <UserRound size={56} strokeWidth={1.6} />
          </span>
        )}
        <p className="mt-5 text-lg font-bold text-white">{name}</p>
      </div>

      <div className="flex items-center justify-center gap-3 pb-8 pt-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPick()
          }}
          className="flex items-center gap-2 rounded-full bg-white py-3 px-6 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          <Camera size={17} strokeWidth={2.1} />
          Alterar foto
        </button>
        {photo && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="flex items-center gap-2 rounded-full border border-white/20 py-3 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Trash2 size={17} strokeWidth={2.1} />
            Remover
          </button>
        )}
      </div>
    </div>
  )
}