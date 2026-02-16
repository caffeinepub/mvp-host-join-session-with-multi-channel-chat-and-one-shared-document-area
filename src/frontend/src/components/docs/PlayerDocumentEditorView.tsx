import { useState, useEffect, useRef } from 'react';
import { useGetPlayerDocument, useEditPlayerDocument, useSetPlayerDocumentVisibility } from '../../hooks/usePlayerDocuments';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useListDocumentFiles, useUploadDocumentFile } from '../../hooks/useDocumentFiles';
import { ExternalBlob } from '../../backend';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Loader2, Save, Lock, Upload, AlertTriangle, Image as ImageIcon, Download, FileText } from 'lucide-react';
import { parseFileMarkers, createFileMarker, insertFileMarker } from '../../lib/documentFileMarkers';

type PlayerDocumentEditorViewProps = {
  documentId: bigint;
  onDocumentChanged?: () => void;
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

export default function PlayerDocumentEditorView({ documentId, onDocumentChanged }: PlayerDocumentEditorViewProps) {
  const { identity } = useInternetIdentity();
  const { data: document, isLoading, error } = useGetPlayerDocument(documentId);
  const editMutation = useEditPlayerDocument();
  const visibilityMutation = useSetPlayerDocumentVisibility();
  
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: documentFiles = [] } = useListDocumentFiles(document?.id || null);
  const uploadFile = useUploadDocumentFile();

  const isOwner = document && identity && document.owner.toString() === identity.getPrincipal().toString();

  useEffect(() => {
    if (document) {
      setContent(document.content);
      setHasUnsavedChanges(false);
      setUploadError('');
    }
  }, [document?.id, document?.content]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!document || !isOwner) return;

    try {
      const result = await editMutation.mutateAsync({
        documentId: document.id,
        newContent: content,
      });

      if (result.__kind__ === 'ok') {
        setHasUnsavedChanges(false);
        onDocumentChanged?.();
      }
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleTogglePrivacy = async () => {
    if (!document || !isOwner) return;

    try {
      await visibilityMutation.mutateAsync({
        documentId: document.id,
        isPrivate: !document.isPrivate,
      });
      onDocumentChanged?.();
    } catch (error) {
      console.error('Error toggling privacy:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !document) return;

    setUploadError('');
    setUploadProgress(0);

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setUploadError(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      setUploadProgress(null);
      return;
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(`Unsupported file type. Allowed: images (jpg, png, gif, webp) and files (pdf, txt, md)`);
      setUploadProgress(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File is too large. Maximum size is 10MB.');
      setUploadProgress(null);
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
        setUploadError(result.error);
        setUploadProgress(null);
        return;
      }

      // Use the returned file ID from the backend response
      const fileId = result.ok;
      
      // Insert marker at cursor position or end
      const cursorPosition = textareaRef.current?.selectionStart ?? content.length;
      const marker = createFileMarker(Number(fileId), file.name);
      const newContent = insertFileMarker(content, cursorPosition, marker);
      
      setContent(newContent);
      setHasUnsavedChanges(true);
      setUploadProgress(null);

    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload file');
      setUploadProgress(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            This document is private and you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isUploading = uploadProgress !== null;

  // Parse file markers from content
  const fileMarkers = parseFileMarkers(content);

  // Create a map of file ID to file reference for quick lookup
  const fileMap = new Map(documentFiles.map(f => [Number(f.id), f]));

  // Separate images from other files
  const imageMarkers = fileMarkers.filter(marker => {
    const fileRef = fileMap.get(marker.fileId);
    return fileRef && fileRef.mimeType.startsWith('image/');
  });

  const otherFileMarkers = fileMarkers.filter(marker => {
    const fileRef = fileMap.get(marker.fileId);
    return fileRef && !fileRef.mimeType.startsWith('image/');
  });

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{document.name}</h2>
            <p className="text-sm text-muted-foreground">
              {isOwner ? 'Your Document' : `Owner: ${document.owner.toString().slice(0, 8)}...`}
              {document.isPrivate && ' • Private'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isOwner && (
              <>
                <div className="flex items-center gap-2">
                  <Label htmlFor="privacy-toggle" className="text-sm cursor-pointer">
                    Private
                  </Label>
                  <Switch
                    id="privacy-toggle"
                    checked={document.isPrivate}
                    onCheckedChange={handleTogglePrivacy}
                    disabled={visibilityMutation.isPending}
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || editMutation.isPending}
                  size="sm"
                >
                  {editMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6 overflow-auto flex flex-col gap-4">
        {uploadError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button (Owner Only) */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isUploading || editMutation.isPending}
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

        {isOwner ? (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[300px] font-mono text-sm resize-none flex-1"
            placeholder="Start writing..."
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
          </div>
        )}

        {/* Image Gallery */}
        {imageMarkers.length > 0 && (
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {imageMarkers.map((marker) => {
                const fileRef = fileMap.get(marker.fileId);
                
                if (!fileRef) {
                  return (
                    <div key={marker.fileId} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50">
                      <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Image not found: {marker.filename}
                        </p>
                      </div>
                    </div>
                  );
                }

                const imageUrl = fileRef.file.getDirectURL();

                return (
                  <div key={marker.fileId} className="border border-border rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={fileRef.filename}
                      className="w-full h-48 object-cover bg-muted"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="p-2 bg-muted/50 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate">{fileRef.filename}</span>
                      <a
                        href={imageUrl}
                        download={fileRef.filename}
                        className="text-xs text-primary hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* File Attachments */}
        {otherFileMarkers.length > 0 && (
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Attachments
            </h3>
            <div className="space-y-2">
              {otherFileMarkers.map((marker) => {
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

                const fileUrl = fileRef.file.getDirectURL();

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
      </div>
    </div>
  );
}
