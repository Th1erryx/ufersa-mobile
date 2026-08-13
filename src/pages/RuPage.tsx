import { useRef, useState } from 'react'
import { ArrowLeft, Download, Expand, X } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Pressable } from '@/components/Pressable'
import { QrCodeDisplay } from '@/components/QrCodeDisplay'
import type { QrCodeHandle } from '@/components/QrCodeDisplay'
import { ru } from '@/data/qrCode'
import type { TabId } from '@/components/tabs'

interface Props {
  onNavigate: (tab: TabId) => void
  onOpenSettings: () => void
}

export function RuPage({ onNavigate, onOpenSettings }: Props) {
  const qrRef = useRef<QrCodeHandle>(null)
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className="flex h-full flex-col px-4">
      <PageHeader title="Meu QR Code" subtitle="Restaurante Universitário" onSettings={onOpenSettings} />

      <div className="flex flex-1 flex-col items-center justify-center py-2">
        <p className="mb-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Apresente este código no {ru.name.toLowerCase()} ({ru.local}).
        </p>

        <div className="flex w-full max-w-sm flex-col items-center">
          <div className="w-full animate-scale-in rounded-4xl border border-zinc-200/80 bg-white p-6 shadow-qr dark:border-zinc-700/60">
            <QrCodeDisplay ref={qrRef} className="aspect-square w-full" />
          </div>

          <div className="mt-5 w-full rounded-2xl border border-zinc-200/80 bg-white/70 px-4 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Funcionamento
            </p>
            <p className="mt-0.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Almoço {ru.lunch} · Jantar {ru.dinner}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-1 mt-4 grid grid-cols-3 gap-2.5">
        <Pressable
          onClick={() => setFullscreen(true)}
          className="flex flex-col items-center gap-1.5 rounded-2xl bg-brand-500 py-3 text-xs font-semibold text-white shadow-card transition-all hover:bg-brand-600 active:scale-[0.96]"
        >
          <Expand size={18} />
          Tela cheia
        </Pressable>
        <Pressable
          onClick={() => qrRef.current?.download()}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-zinc-200/80 bg-white py-3 text-xs font-semibold text-zinc-700 shadow-card transition-all active:scale-[0.96] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <Download size={18} />
          Salvar imagem
        </Pressable>
        <Pressable
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-zinc-200/80 bg-white py-3 text-xs font-semibold text-zinc-700 shadow-card transition-all active:scale-[0.96] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <ArrowLeft size={18} />
          Voltar
        </Pressable>
      </div>

      {fullscreen && <FullscreenQr onClose={() => setFullscreen(false)} />}
    </div>
  )
}

function FullscreenQr({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] pb-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Meu QR Code</p>
        <Pressable
          onClick={onClose}
          aria-label="Sair da tela cheia"
          className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 text-zinc-600 transition-all duration-200 hover:scale-105 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <X size={20} />
        </Pressable>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <QrCodeDisplay className="aspect-square w-full max-w-[340px]" />
      </div>

      <p className="pb-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
        Apresente na catraca do Restaurante Universitário
      </p>
    </div>
  )
}