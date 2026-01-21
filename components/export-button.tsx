'use client'

import { useState } from 'react'
import { toBlob } from 'html-to-image'
import { saveAs } from 'file-saver'
import { Check, Copy, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>
}

function getExportOptions(): Parameters<typeof toBlob>[1] {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    pixelRatio: 2,
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    style: { overflow: 'visible' },
  }
}

function prepareForExport(element: HTMLDivElement): {
  addedLineNumbers: Element[]
  hiddenEmptyLines: HTMLElement[]
} {
  const addedLineNumbers: Element[] = []
  const hiddenEmptyLines: HTMLElement[] = []

  const codeBlocks = element.querySelectorAll(
    '[data-streamdown="code-block-body"] code'
  )
  codeBlocks.forEach((code) => {
    // 隐藏末尾空行（html-to-image 不支持 :has() 选择器）
    const lines = code.querySelectorAll(':scope > span')
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i] as HTMLElement
      const hasNoSpan = !line.querySelector('span')
      const hasOnlyEmptySpan =
        line.children.length === 1 &&
        line.children[0].tagName === 'SPAN' &&
        !line.children[0].textContent
      if (hasNoSpan || hasOnlyEmptySpan) {
        line.style.display = 'none'
        hiddenEmptyLines.push(line)
      } else {
        break
      }
    }

    // 添加行号
    const visibleLines = Array.from(lines).filter(
      (line) => (line as HTMLElement).style.display !== 'none'
    )
    visibleLines.forEach((line, index) => {
      const lineNumber = document.createElement('span')
      lineNumber.textContent = String(index + 1)
      lineNumber.setAttribute('data-export-line-number', 'true')
      lineNumber.style.cssText = `
        display: inline-block;
        width: 1.5rem;
        margin-right: 1rem;
        text-align: right;
        color: var(--muted-foreground);
        opacity: 0.5;
        font-family: ui-monospace, monospace;
        font-size: 13px;
        user-select: none;
      `
      ;(line as HTMLElement).style.setProperty('--hide-line-number', '1')
      line.insertBefore(lineNumber, line.firstChild)
      addedLineNumbers.push(lineNumber)
    })
  })

  return { addedLineNumbers, hiddenEmptyLines }
}

function restoreAfterExport(state: {
  addedLineNumbers: Element[]
  hiddenEmptyLines: HTMLElement[]
}): void {
  state.addedLineNumbers.forEach((lineNumber) => {
    const parent = lineNumber.parentElement
    if (parent) {
      ;(parent as HTMLElement).style.removeProperty('--hide-line-number')
    }
    lineNumber.remove()
  })
  state.hiddenEmptyLines.forEach((line) => {
    line.style.display = ''
  })
}

async function captureBlob(element: HTMLDivElement): Promise<Blob | null> {
  const state = prepareForExport(element)
  try {
    return await toBlob(element, getExportOptions())
  } finally {
    restoreAfterExport(state)
  }
}

export function ExportButton({ targetRef }: ExportButtonProps): React.ReactNode {
  const [isExporting, setIsExporting] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleExport(): Promise<void> {
    if (!targetRef.current) return

    setIsExporting(true)
    const blob = await captureBlob(targetRef.current)
    if (blob) saveAs(blob, `markdown-${Date.now()}.png`)
    setIsExporting(false)
  }

  async function handleCopy(): Promise<void> {
    if (!targetRef.current) return

    setIsCopying(true)
    const blob = await captureBlob(targetRef.current)
    if (blob) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setIsCopying(false)
  }

  function renderCopyIcon(): React.ReactNode {
    if (isCopying) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    if (copied) return <Check className="mr-2 h-4 w-4" />
    return <Copy className="mr-2 h-4 w-4" />
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={handleCopy}
        disabled={isCopying}
        size="sm"
        variant="ghost"
      >
        {renderCopyIcon()}
        {copied ? '已复制' : '复制'}
      </Button>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        size="sm"
      >
        {isExporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        下载
      </Button>
    </div>
  )
}
