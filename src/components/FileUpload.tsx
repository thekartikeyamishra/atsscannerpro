'use client';
// components/FileUpload.tsx — Multi-format resume uploader with premium UX

import React, { useCallback, useRef, useState } from 'react';
import type { FileFormat } from '@/types';

// Supported file types for display
const ACCEPTED_TYPES = [
  { ext: '.pdf', label: 'PDF', mime: 'application/pdf' },
  { ext: '.docx', label: 'Word', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { ext: '.doc', label: 'DOC', mime: 'application/msword' },
  { ext: '.txt', label: 'TXT', mime: 'text/plain' },
  { ext: '.rtf', label: 'RTF', mime: 'application/rtf' },
  { ext: '.odt', label: 'ODT', mime: 'application/vnd.oasis.opendocument.text' },
];

const ACCEPT_STRING = ACCEPTED_TYPES.map(t => t.ext).join(',') + ',' + ACCEPTED_TYPES.map(t => t.mime).join(',');

const FORMAT_ICONS: Record<string, React.ReactElement> = {
  pdf: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-400">
      <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
    </svg>
  ),
  docx: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-400">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-slate-400">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
    </svg>
  ),
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileFormat(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
    'text/plain': 'txt',
    'application/rtf': 'rtf',
    'text/rtf': 'rtf',
    'application/vnd.oasis.opendocument.text': 'odt',
  };
  return mimeMap[file.type] || ext || 'unknown';
}

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, selectedFile, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setWarning(null);

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      onFileSelect(null);
      return;
    }
    if (file.size < 500) {
      setError('File appears empty. Please upload a complete resume file.');
      onFileSelect(null);
      return;
    }

    // Soft warning for unknown types
    const fmt = getFileFormat(file);
    if (!['pdf','docx','doc','txt','rtf','odt'].includes(fmt)) {
      setWarning('Unrecognized file type — we\'ll attempt to extract text, but PDF/DOCX is recommended.');
    }

    onFileSelect(file);
    // Haptic feedback
    if ('vibrate' in navigator) navigator.vibrate(30);
  }, [onFileSelect]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const fmt = selectedFile ? getFileFormat(selectedFile) : '';
  const icon = FORMAT_ICONS[fmt] || FORMAT_ICONS.default;

  return (
    <div className="w-full">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDragEnd={() => setIsDragging(false)}
        className={[
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed',
          'p-8 cursor-pointer transition-all duration-300 select-none outline-none',
          disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
          isDragging
            ? 'border-blue-400 bg-blue-500/10 scale-[1.02] shadow-lg shadow-blue-500/10'
            : selectedFile
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-white/15 bg-white/[0.02] hover:border-blue-500/40 hover:bg-white/[0.05]',
        ].filter(Boolean).join(' ')}
      >
        {/*
          sr-only rather than hidden: `hidden` removes the control from the
          accessibility tree and the tab order, so keyboard and screen-reader
          users had no way to choose a file at all. sr-only keeps it focusable
          and announced while staying invisible.
        */}
        <label htmlFor="resume-file-input" className="sr-only">
          Upload your resume (PDF, DOCX, DOC, TXT or RTF, max 10MB)
        </label>
        <input
          id="resume-file-input"
          ref={inputRef}
          type="file"
          accept={ACCEPT_STRING}
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          disabled={disabled}
          aria-describedby={error ? 'file-error' : warning ? 'file-warning' : undefined}
        />

        {selectedFile ? (
          /* File selected state */
          <div className="flex flex-col items-center gap-2 w-full animate-fade-in-scale">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              {icon}
            </div>
            <div className="text-center min-w-0 w-full px-8">
              <p className="font-semibold text-white text-sm truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatFileSize(selectedFile.size)} · {fmt.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Ready to scan
            </div>
            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
                setError(null);
                setWarning(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              disabled={disabled}
              aria-label="Remove file"
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/25 flex items-center justify-center transition-colors group"
            >
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-3">
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-300
              ${isDragging ? 'bg-blue-500/20 border-blue-400/40 scale-110' : 'bg-white/[0.05] border-white/10'}`}>
              <svg className={`w-7 h-7 transition-colors ${isDragging ? 'text-blue-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white text-sm">
                {isDragging ? 'Drop your resume here' : 'Upload your resume'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Drag & drop or <span className="text-blue-400 font-medium">browse files</span>
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                {['PDF', 'DOCX', 'DOC', 'TXT', 'RTF'].map(ext => (
                  <span key={ext} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-500 border border-white/[0.06] font-mono">
                    .{ext.toLowerCase()}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-600 mt-1.5">Max 10MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p id="file-error" role="alert" className="mt-2 text-sm text-red-400 flex items-start gap-1.5 animate-fade-in">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Warning */}
      {warning && !error && (
        <p id="file-warning" role="status" className="mt-2 text-xs text-yellow-500/80 flex items-start gap-1.5 animate-fade-in">
          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {warning}
        </p>
      )}
    </div>
  );
}