import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { buildMockMatrix, QR_SIZE } from '@/lib/mockQr'
import { useUserQrCode } from '@/hooks/useUserQrCode'

export interface QrCodeHandle {
  download: () => Promise<void>
}

interface Props {
  className?: string
}

/** Exibe o QR Code do usuário.
 *  Se o código estiver configurado, mostra a imagem real;
 *  caso contrário, gera um QR fake para demonstração. */
export const QrCodeDisplay = forwardRef<QrCodeHandle, Props>(function QrCodeDisplay(
  { className = '' },
  ref,
) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { qrCode } = useUserQrCode()
  const matrix = useMemo(() => buildMockMatrix(), [])
  const [showMock, setShowMock] = useState(!qrCode)

  useEffect(() => {
    if (!qrCode) {
      setShowMock(true)
      return
    }
    const img = new Image()
    img.onload = () => setShowMock(false)
    img.onerror = () => setShowMock(true)
    img.src = qrCode
  }, [qrCode])

  useImperativeHandle(ref, () => ({
    download: async () => {
      if (showMock && svgRef.current) {
        const blob = new Blob([svgRef.current.outerHTML], { type: 'image/svg+xml' })
        triggerDownload(blob, 'qrcode-ru.svg')
        return
      }
      try {
        const res = await fetch(qrCode)
        const blob = await res.blob()
        triggerDownload(blob, 'qrcode-ru.png')
      } catch {
        /* imagem indisponível */
      }
    },
  }))

  return (
    <div className={className}>
      {showMock ? (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
          role="img"
          aria-label="QR Code do Restaurante Universitário"
          className="h-full w-full"
          shapeRendering="crispEdges"
        >
          <rect width={QR_SIZE} height={QR_SIZE} fill="white" />
          {matrix.map((row, y) =>
            row.map((cell, x) =>
              cell ? (
                <rect key={`${x}-${y}`} x={x} y={y} width={1.06} height={1.06} fill="#111827" />
              ) : null,
            ),
          )}
        </svg>
      ) : (
        <img
          src={qrCode}
          alt="QR Code do Restaurante Universitário"
          className="h-full w-full object-contain"
        />
      )}
    </div>
  )
})

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
