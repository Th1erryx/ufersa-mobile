import { useState } from 'react'
import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Download,
  Monitor,
  Moon,
  PencilLine,
  QrCode,
  RotateCcw,
  Share2,
  Sun,
  Upload,
} from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useProfile } from '@/hooks/useProfile'
import { useUserQrCode } from '@/hooks/useUserQrCode'
import { useCampus, campusOptions } from '@/hooks/useCampus'
import { useSchedule } from '@/context/ScheduleContext'
import type { ThemePreference } from '@/types'

interface Props {
  preference: ThemePreference
  setPreference: (p: ThemePreference) => void
  onClose: () => void
  onEditSubjects: () => void
}

type Section = 'pessoal' | 'qr' | null

export function SettingsPage({ preference, setPreference, onClose, onEditSubjects }: Props) {
  const { profile, update, reset: resetProfile } = useProfile()
  const { qrCode, setOverride, reset: resetQr } = useUserQrCode()
  const { campus, setCampusId } = useCampus()
  const { canInstall, isIos, isStandalone, promptInstall } = useInstallPrompt()
  const { resetAll: resetSchedule } = useSchedule()
  const [notifications, setNotifications] = useLocalStorage<{ classes: boolean; ru: boolean }>(
    'notifications',
    { classes: true, ru: true },
  )
  const [openSection, setOpenSection] = useState<Section>(null)

  const [name, setName] = useState(profile.name)
  const [course, setCourse] = useState(profile.course)
  const [period, setPeriod] = useState(profile.period)
  const [ra, setRa] = useState(profile.ra)
  const [qrInput, setQrInput] = useState('')

  const themeOptions: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ]

  const savePersonal = () => {
    update({ name: name.trim() || profile.name, course, period: period.trim(), ra: ra.trim() })
    setOpenSection(null)
  }

  const saveQr = () => {
    setOverride(qrInput.trim())
    setOpenSection(null)
  }

  return (
    <div
      className="fixed inset-0 z-30 flex justify-end bg-zinc-950/30 backdrop-blur-sm md:justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Configurações"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-in-right flex h-full w-full max-w-md flex-col overflow-y-auto bg-zinc-50 shadow-qr app-scrollbar dark:bg-zinc-950"
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
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Configurações</h2>
          </div>
        </header>

        <div className="flex-1 space-y-7 px-4 pb-12 pt-2">
          <section>
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

          <section>
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

          <section>
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

          <section>
            <SectionTitle>Notificações</SectionTitle>
            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <ToggleRow
                icon={Bell}
                label="Avisos de aula"
                description="Lembre antes do início de cada aula"
                checked={notifications.classes}
                onChange={(v) => setNotifications({ ...notifications, classes: v })}
              />
              <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
              <ToggleRow
                icon={Bell}
                label="Lembretes do RU"
                description="Horários de funcionamento do restaurante"
                checked={notifications.ru}
                onChange={(v) => setNotifications({ ...notifications, ru: v })}
              />
            </div>
            <p className="mt-1.5 px-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              Visual apenas — notificações push serão adicionadas em versões futuras.
            </p>
          </section>

          <section>
            <SectionTitle>Dados</SectionTitle>
            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <DataButton
                icon={PencilLine}
                label="Editar informações pessoais"
                expanded={openSection === 'pessoal'}
                onClick={() => setOpenSection(openSection === 'pessoal' ? null : 'pessoal')}
              >
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
                    setName(profile.name)
                    setCourse(profile.course)
                    setPeriod(profile.period)
                    setRa(profile.ra)
                    setOpenSection(null)
                  }}
                />
              </DataButton>
              <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
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
                <ActionRow onSave={saveQr} onReset={() => resetQr()} />
              </DataButton>
              <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
              <DataButton
                icon={PencilLine}
                label="Editar disciplinas"
                onClick={onEditSubjects}
                plain
              >
                <Instruction />
              </DataButton>
              <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
              <DataButton
                icon={RotateCcw}
                label="Restaurar dados padrão"
                onClick={() => {}}
                plain
              >
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Restaura as disciplinas e horários originais de{' '}
                  <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    src/data
                  </code>
                  . As alterações feitas aqui serão perdidas.
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
            </div>
          </section>

          <section>
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
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
      {children}
    </p>
  )
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Bell
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 px-5 py-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Icon size={18} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
        <span className="block text-xs text-zinc-500 dark:text-zinc-400">{description}</span>
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
    </label>
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
  children: React.ReactNode
  expanded?: boolean
  onClick: () => void
  plain?: boolean
}) {
  return (
    <div>
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
      {expanded && <div className="animate-fade-in px-5 pb-4">{children}</div>}
      {plain && <div className="animate-fade-in px-5 pb-4">{children}</div>}
    </div>
  )
}

function Instruction() {
  return (
    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
      As disciplinas e horários são editadas nos arquivos{' '}
      <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        src/data/subjects.ts
      </code>{' '}
      e{' '}
      <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        src/data/schedule.ts
      </code>
      .
    </p>
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
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
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