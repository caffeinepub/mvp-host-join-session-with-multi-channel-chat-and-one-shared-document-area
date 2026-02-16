import { useState, useEffect, useRef } from 'react';
import { useActor } from '../../hooks/useActor';
import { useListDocumentFiles, useUploadDocumentFile } from '../../hooks/useDocumentFiles';
import type { Document } from '../../backend';
import { ExternalBlob } from '../../backend';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Save, Lock, Unlock, Loader2, AlertTriangle, Upload, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { formatTimestamp } from '../../lib/time';
import { parseFileMarkers, createFileMarker, insertFileMarker } from '../../lib/documentFileMarkers';

type DocumentEditorViewProps = {
  document: Document;
  isHost: boolean;
  onDocumentChanged: () => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'md'];

export default function DocumentEditorView({ document, isHost, onDocumentChanged }: DocumentEditorViewProps) {
  const { actor } = useActor();
  const [content, setContent] = useState(document.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: documentFiles = [] } = useListDocumentFiles(document.id);
  const uploadFile = useUploadDocumentFile();

  // Update content when document changes
  useEffect(() => {
    setContent(document.content);
    setHasUnsavedChanges(false);
  }, [document.id, document.content]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== document.content);
  };

  const handleSave = async () => {
    if (!actor || !hasUnsavedChanges) return;

    setSaving(true);
    setError('');

    try {
      const result = await actor.editDocument(document.id, content);
      if (result.__kind__ === 'error') {
        setError(result.error);
        return;
      }

      setHasUnsavedChanges(false);
      onDocumentChanged();
    } catch (err: any) {
      console.error('Error saving document:', err);
      setError(err.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadProgress(null);

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Unsupported file type. Allowed: images (jpg, png, gif, webp) and files (pdf, txt, md)`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    try {
      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Upload file
      const result = await uploadFile.mutateAsync({
        documentId: document.id,
        file: blob,
        filename: file.name,
        mimeType: file.type,
        size: BigInt(file.size),
      });

      if (result.__kind__ === 'error') {
        setError(result.error);
        setUploadProgress(null);
        return;
      }

      // Get the newly uploaded file to get its ID
      // We need to refetch the file list to get the new file ID
      // For now, we'll wait a moment and then insert a placeholder
      // The backend should return the file ID in the response, but it doesn't currently
      // So we'll need to fetch the list and find the newest one
      setTimeout(async () => {
        try {
          const files = await actor?.listDocumentFiles(document.id);
          if (files && files.length > 0) {
            // Find the most recent file (highest ID)
            const newestFile = files.reduce((prev, current) => 
              current.id > prev.id ? current : prev
            );

            // Insert marker at cursor position or end
            const cursorPosition = textareaRef.current?.selectionStart ?? content.length;
            const marker = createFileMarker(Number(newestFile.id), file.name);
            const newContent = insertFileMarker(content, cursorPosition, marker);
            
            setContent(newContent);
            setHasUnsavedChanges(true);
          }
        } catch (err) {
          console.error('Error fetching file list:', err);
        }
        setUploadProgress(null);
      }, 500);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
      setUploadProgress(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isReadOnly = document.locked;
  const isUploading = uploadProgress !== null;

  // Parse file markers from content
  const fileMarkers = parseFileMarkers(content);

  // Create a map of file ID to file reference for quick lookup
  const fileMap = new Map(documentFiles.map(f => [Number(f.id), f]));

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Document Header */}
      <div className="border-b border-border px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{document.name}</h2>
          <div className="flex items-center gap-2">
            {document.locked ? (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Unlock className="h-3 w-3" />
                Unlocked
              </Badge>
            )}
            <Badge variant="outline">Rev. {document.revision.toString()}</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last modified: {formatTimestamp(document.lastModified)}</span>
          {hasUnsavedChanges && (
            <span className="text-amber-600 dark:text-amber-400">Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 overflow-auto flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isReadOnly && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              This document is locked. {isHost ? 'Unlock it to allow editing.' : 'Only the host can unlock it.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Button (Host Only) */}
        {isHost && !isReadOnly && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isUploading || saving}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading {Math.round(uploadProgress || 0)}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload file/image
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              Max 10MB • jpg, png, gif, webp, pdf, txt, md
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.md"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          disabled={isReadOnly || saving}
          className="flex-1 resize-none font-mono text-sm min-h-[300px]"
          placeholder="Start typing..."
        />

        {/* Render Attachments */}
        {fileMarkers.length > 0 && (
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold">Attachments</h3>
            <div className="space-y-2">
              {fileMarkers.map((marker) => {
                const fileRef = fileMap.get(marker.fileId);
                
                if (!fileRef) {
                  return (
                    <div key={marker.fileId} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50">
                      <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          File not found: {marker.filename}
                        </p>
                      </div>
                    </div>
                  );
                }

                const isImage = fileRef.mimeType.startsWith('image/');
                const fileUrl = fileRef.file.getDirectURL();

                if (isImage) {
                  return (
                    <div key={marker.fileId} className="border border-border rounded-lg overflow-hidden">
                      <img
                        src={fileUrl}
                        alt={fileRef.filename}
                        className="w-full max-h-96 object-contain bg-muted"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="p-2 bg-muted/50 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{fileRef.filename}</span>
                        <a
                          href={fileUrl}
                          download={fileRef.filename}
                          className="text-xs text-primary hover:underline"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={marker.fileId} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileRef.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {fileRef.mimeType} • {(Number(fileRef.size) / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <a
                      href={fileUrl}
                      download={fileRef.filename}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isReadOnly || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
