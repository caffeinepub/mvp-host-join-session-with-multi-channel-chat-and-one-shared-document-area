import { useState, useEffect, useRef } from 'react';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetPlayerDocument, useEditPlayerDocument, useSetPlayerDocumentVisibility } from '../../hooks/usePlayerDocuments';
import { useListDocumentFiles, useUploadDocumentFile } from '../../hooks/useDocumentFiles';
import { useAddImageToPlayerDocument } from '../../hooks/useDocumentImages';
import { ExternalBlob } from '../../backend';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Save, Lock, Loader2, AlertTriangle, Upload, Download, FileText, Image as ImageIcon, Eye, Edit } from 'lucide-react';
import { formatTimestamp } from '../../lib/time';
import { parseFileMarkers, createFileMarker, insertFileMarker } from '../../lib/documentFileMarkers';
import ImageUploadWithTitleDialog from './ImageUploadWithTitleDialog';
import DocumentCommentsSection from './DocumentCommentsSection';
import DocumentContentPreview from './DocumentContentPreview';

type PlayerDocumentEditorViewProps = {
  documentId: bigint;
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

export default function PlayerDocumentEditorView({ documentId, onDocumentChanged }: PlayerDocumentEditorViewProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { data: document, isLoading, error: loadError } = useGetPlayerDocument(documentId);
  const editDocument = useEditPlayerDocument();
  const setVisibility = useSetPlayerDocumentVisibility();

  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Derive the current document ID - only use it when document is loaded and matches prop
  const currentDocumentId = document && document.id === documentId ? document.id : null;

  // Only fetch files when we have a valid loaded document ID
  const { data: documentFiles = [] } = useListDocumentFiles(currentDocumentId);
  const uploadFile = useUploadDocumentFile();
  const addImage = useAddImageToPlayerDocument();

  // Update content when document changes
  useEffect(() => {
    if (document) {
      setContent(document.content);
      setHasUnsavedChanges(false);
      setError('');
    }
  }, [document?.id, document?.content]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== (document?.content || ''));
  };

  const handleSave = async () => {
    if (!document || !hasUnsavedChanges) return;

    setSaving(true);
    setError('');

    try {
      const result = await editDocument.mutateAsync({
        documentId: document.id,
        newContent: content,
      });

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

  const handleVisibilityToggle = async (isPrivate: boolean) => {
    if (!document) return;

    setError('');
    try {
      const result = await setVisibility.mutateAsync({
        documentId: document.id,
        isPrivate,
      });

      if (result.__kind__ === 'error') {
        setError(result.error);
        return;
      }

      onDocumentChanged();
    } catch (err: any) {
      console.error('Error changing visibility:', err);
      setError(err.message || 'Failed to change visibility');
    }
  };

  const handleImageUpload = async (file: File, title: string) => {
    // Guard: ensure document is loaded before upload
    if (!document || !currentDocumentId) {
      setError('Document not loaded. Please wait and try again.');
      return;
    }

    setError('');
    setUploadProgress(0);

    try {
      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Upload file using the loaded document ID
      const uploadResult = await uploadFile.mutateAsync({
        documentId: currentDocumentId,
        file: blob,
        filename: file.name,
        mimeType: file.type,
        size: BigInt(file.size),
      });

      if (uploadResult.__kind__ === 'error') {
        setError(uploadResult.error);
        setUploadProgress(null);
        return;
      }

      const fileId = uploadResult.ok;

      // Register image reference with title
      const imageResult = await addImage.mutateAsync({
        documentId: currentDocumentId,
        fileId: fileId.toString(),
        title: title || file.name,
        caption: '',
        position: BigInt(0),
        size: BigInt(file.size),
      });

      if (imageResult.__kind__ === 'error') {
        setError(imageResult.error);
        setUploadProgress(null);
        return;
      }

      // Insert marker at cursor position or end
      const cursorPosition = textareaRef.current?.selectionStart ?? content.length;
      const marker = createFileMarker(Number(fileId), file.name);
      const newContent = insertFileMarker(content, cursorPosition, marker);

      setContent(newContent);
      setHasUnsavedChanges(true);
      setUploadProgress(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
      setUploadProgress(null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Guard: ensure document is loaded before upload
    if (!file || !document || !currentDocumentId) {
      if (file && !currentDocumentId) {
        setError('Document not loaded. Please wait and try again.');
      }
      return;
    }

    setError('');
    setUploadProgress(0);

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      setUploadProgress(null);
      return;
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Unsupported file type. Allowed: images (jpg, png, gif, webp) and files (pdf, txt, md)`);
      setUploadProgress(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10MB.');
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

      // Upload file using the loaded document ID
      const result = await uploadFile.mutateAsync({
        documentId: currentDocumentId,
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
      setError(err.message || 'Failed to upload file');
      setUploadProgress(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError || !document) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {loadError ? 'Failed to load document' : 'Document not found or you do not have access'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isOwner = identity?.getPrincipal().toString() === document.owner.toString();
  const isReadOnly = !isOwner;
  const isUploading = uploadProgress !== null;
  
  // Disable upload actions until document is fully loaded and ID matches
  const canUpload = isOwner && !!currentDocumentId && !isUploading && !saving;

  // Parse file markers from content
  const fileMarkers = parseFileMarkers(content);

  // Create a map of file ID to file reference for quick lookup
  const fileMap = new Map(documentFiles.map((f) => [Number(f.id), f]));

  // Separate images from other files
  const imageMarkers = fileMarkers.filter((marker) => {
    const fileRef = fileMap.get(marker.fileId);
    return fileRef && fileRef.mimeType.startsWith('image/');
  });

  const otherFileMarkers = fileMarkers.filter((marker) => {
    const fileRef = fileMap.get(marker.fileId);
    return fileRef && !fileRef.mimeType.startsWith('image/');
  });

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Document Header */}
      <div className="border-b border-border px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{document.name}</h2>
          <div className="flex items-center gap-2">
            {document.isPrivate ? (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            ) : (
              <Badge variant="outline">Shared</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last modified: {formatTimestamp(document.lastModified)}</span>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && <span className="text-amber-600 dark:text-amber-400">Unsaved changes</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              className="gap-2"
            >
              {isPreview ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor or Preview */}
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
            <AlertDescription>This is a read-only view. Only the owner can edit this document.</AlertDescription>
          </Alert>
        )}

        {isPreview ? (
          /* Preview Mode */
          <div className="flex-1">
            <DocumentContentPreview content={content} documentFiles={documentFiles} />
          </div>
        ) : (
          /* Edit Mode */
          <>
            {/* Visibility Toggle (Owner Only) */}
            {isOwner && (
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="visibility-toggle">Private Document</Label>
                  <p className="text-xs text-muted-foreground">
                    {document.isPrivate
                      ? 'Only you and the host can see this document'
                      : 'All session members can see this document'}
                  </p>
                </div>
                <Switch
                  id="visibility-toggle"
                  checked={document.isPrivate}
                  onCheckedChange={handleVisibilityToggle}
                  disabled={setVisibility.isPending}
                />
              </div>
            )}

            {/* Upload Buttons (Owner Only) - Disabled until document is loaded */}
            {isOwner && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canUpload}
                  onClick={() => setShowImageUploadDialog(true)}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading {Math.round(uploadProgress || 0)}%
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Upload image
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canUpload}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload file
                </Button>
                <span className="text-xs text-muted-foreground">Max 10MB • jpg, png, gif, webp, pdf, txt, md</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
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
              placeholder={isReadOnly ? 'This document is read-only' : 'Start typing...'}
            />

            {!isReadOnly && (
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={!hasUnsavedChanges || saving}>
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
                        <div
                          key={marker.fileId}
                          className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50"
                        >
                          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Image not found: {marker.filename}</p>
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
                          <a href={imageUrl} download={fileRef.filename} className="text-xs text-primary hover:underline">
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
                  File Attachments
                </h3>
                <div className="space-y-2">
                  {otherFileMarkers.map((marker) => {
                    const fileRef = fileMap.get(marker.fileId);

                    if (!fileRef) {
                      return (
                        <div
                          key={marker.fileId}
                          className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50"
                        >
                          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">File not found: {marker.filename}</p>
                          </div>
                        </div>
                      );
                    }

                    const fileUrl = fileRef.file.getDirectURL();

                    return (
                      <div
                        key={marker.fileId}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{fileRef.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {fileRef.mimeType} • {(Number(fileRef.size) / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <a href={fileUrl} download={fileRef.filename}>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comments Section - Pass isOwner as isHost for permission logic */}
      <div className="border-t border-border">
        <DocumentCommentsSection documentId={document.id} isHost={isOwner} />
      </div>

      {/* Image Upload Dialog */}
      {showImageUploadDialog && (
        <ImageUploadWithTitleDialog
          open={showImageUploadDialog}
          onOpenChange={setShowImageUploadDialog}
          onUpload={handleImageUpload}
        />
      )}
    </div>
  );
}
