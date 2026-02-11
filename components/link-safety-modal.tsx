'use client'

import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import type { LinkSafetyModalProps } from 'streamdown'
import { ExternalLink, X, Copy } from 'lucide-react'

export function LinkSafetyModal({ url, isOpen, onClose, onConfirm }: LinkSafetyModalProps) {
  const t = useTranslations('linkSafety')
  if (!isOpen || typeof document === 'undefined') return null

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            <span className="text-lg font-semibold">{t('title')}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
        <span className="text-muted-foreground mb-4 block">{t('description')}</span>
        <div className="bg-muted rounded p-3 mb-4 break-all text-sm">{url}</div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded hover:bg-muted"
          >
            <Copy className="h-4 w-4" />
            {t('copyLink')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" />
            {t('openLink')}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
