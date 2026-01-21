'use client'

import { Textarea } from '@/components/ui/textarea'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="在这里输入 Markdown..."
      className="h-full min-h-0 resize-none rounded-none border-0 font-mono focus-visible:ring-0"
    />
  )
}
