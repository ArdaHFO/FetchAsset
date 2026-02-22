'use client'

import { useCallback, useRef, useState } from 'react'
import { UploadCloud, FileCheck, X, Loader2 } from 'lucide-react'
import { WobblyButton } from '@/components/ui'

interface FileUploaderProps {
  requestId: string
  projectId: string
  token: string
  clientName: string
  allowedTypes?: string[] | null
  maxSizeMb?: number | null
  clientNote?: string
  onSuccess: (submissionId: string) => void
  onError: (msg: string) => void
  submitting: boolean
  setSubmitting: (v: boolean) => void
}

export function FileUploader({
  requestId,
  projectId,
  token,
  clientName,
  allowedTypes,
  maxSizeMb,
  clientNote,
  onSuccess,
  onError,
  submitting,
  setSubmitting,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const maxBytes = maxSizeMb ? maxSizeMb * 1024 * 1024 : 100 * 1024 * 1024

  function validateFile(file: File): string | null {
    if (file.size > maxBytes) {
      return `File is too large. Maximum size is ${maxSizeMb ?? 100} MB.`
    }
    if (allowedTypes && allowedTypes.length > 0) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      const ok = allowedTypes.some((t) => t.toLowerCase() === ext || file.type.includes(t.toLowerCase()))
      if (!ok) {
        return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
      }
    }
    return null
  }

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const err = validateFile(file)
    if (err) { onError(err); return }
    setSelectedFile(file)
    onError('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedTypes, maxBytes])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  async function handleUpload() {
    if (!selectedFile) return
    setSubmitting(true)
    onError('')

    const fd = new FormData()
    fd.append('token', token)
    fd.append('requestId', requestId)
    fd.append('projectId', projectId)
    fd.append('clientName', clientName)
    fd.append('requestType', 'file')
    fd.append('file', selectedFile)
    if (clientNote) fd.append('clientNote', clientNote)

    try {
      const res = await fetch('/api/portal/submit', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || json.error) {
        onError(json.error ?? 'Upload failed.')
        setSubmitting(false)
        return
      }
      onSuccess(json.submissionId)
    } catch {
      onError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !submitting && inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 py-10 border-2 cursor-pointer transition-all"
        style={{
          borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px',
          borderStyle: 'dashed',
          borderColor: dragging ? '#2d5da1' : selectedFile ? '#2d2d2d' : '#2d2d2d40',
          background: dragging ? '#2d5da110' : selectedFile ? '#2d2d2d08' : 'transparent',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={submitting}
          accept={allowedTypes ? allowedTypes.map((t) => `.${t}`).join(',') : undefined}
        />

        {selectedFile ? (
          <>
            <FileCheck size={32} className="text-ink/60" />
            <div className="text-center">
              <p className="font-body text-sm text-ink font-medium">{selectedFile.name}</p>
              <p className="font-body text-xs text-ink/50 mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </>
        ) : (
          <>
            <UploadCloud size={32} className="text-ink/35" />
            <div className="text-center">
              <p className="font-body text-sm text-ink/60">
                {dragging ? 'Drop it!' : 'Drag & drop or click to browse'}
              </p>
              {allowedTypes && (
                <p className="font-body text-xs text-ink/40 mt-1">
                  {allowedTypes.join(', ')} · up to {maxSizeMb ?? 100} MB
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2">
        {selectedFile && !submitting && (
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
            className="p-1.5 text-ink/40 hover:text-accent transition-colors"
            style={{ borderRadius: '6px' }}
            title="Remove file"
          >
            <X size={14} />
          </button>
        )}
        <WobblyButton
          variant="primary"
          size="md"
          disabled={!selectedFile || submitting}
          onClick={handleUpload}
          loading={submitting}
          className="flex-1"
        >
          {!submitting && (
            <>
              <UploadCloud size={15} className="mr-2" />
              Upload File
            </>
          )}
        </WobblyButton>
      </div>
    </div>
  )
}
