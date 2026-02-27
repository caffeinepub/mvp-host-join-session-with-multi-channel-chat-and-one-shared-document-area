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
import { Save, Lock, Loader2, AlertTriangle, Upload, FileText, Image as ImageIcon, Eye, Edit } from 'lucide-react';
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
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

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

    if (!file || !document || !currentDocumentId) {
      if (file && !currentDocumentId) {
        setError('Document not loaded. Please wait and try again.');
      }
      return;
    }

    setError('');
    setUploadProgress(0);

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      setUploadProgress(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Unsupported file type. Allowed: images (jpg, png, gif, webp) and files (pdf, txt, md)`);
      setUploadProgress(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10MB.');
      setUploadProgress(null);
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

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

      const fileId = result.ok;

      const cursorPosition = textareaRef.current?.selectionStart ?? content.length;
      const marker = createFileMarker(Number(fileId), file.name);
      const newContent = insertFileMarker(content, cursorPosition, marker);

      setContent(newContent);
      setHasUnsavedChanges(true);
      setUploadProgress(null);
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.message || 'Failed to upload file');
      setUploadProgress(null);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isOwner = identity && document && document.owner.toString() === identity.getPrincipal().toString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError || !document) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {loadError ? 'Failed to load document' : 'Document not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-lg font-semibold truncate">{document.name}</h2>
          {document.isPrivate && (
            <Badge variant="secondary" className="flex-shrink-0">
              <Lock className="mr-1 h-3 w-3" />
              Private
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isOwner && (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="privacy-toggle" className="text-xs text-muted-foreground">
                  Private
                </Label>
                <Switch
                  id="privacy-toggle"
                  checked={document.isPrivate}
                  onCheckedChange={handleVisibilityToggle}
                  disabled={setVisibility.isPending}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>

              {hasUnsavedChanges && !isPreview && (
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pt-2 flex-shrink-0">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isPreview || !isOwner ? (
          <DocumentContentPreview documentId={document.id} content={content} />
        ) : (
          <div className="space-y-4">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[400px] font-mono text-sm resize-none"
              disabled={saving}
              placeholder="Start writing your document..."
            />

            {/* Upload Controls */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImageUploadDialog(true)}
                disabled={!currentDocumentId}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Add Image
              </Button>

              <label>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={!currentDocumentId}
                >
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Attach File
                  </span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.md"
                  onChange={handleFileSelect}
                  disabled={!currentDocumentId}
                />
              </label>
            </div>

            {/* Upload Progress */}
            {uploadProgress !== null && (
              <div className="space-y-1">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}

            {/* File Attachments */}
            {documentFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Attachments</p>
                <div className="space-y-1">
                  {documentFiles.map((file) => (
                    <div
                      key={file.id.toString()}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{file.filename}</span>
                      <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                        {(Number(file.size) / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="border-t border-border px-4 py-2 flex-shrink-0 text-xs text-muted-foreground">
        Last modified: {formatTimestamp(document.lastModified)}
      </div>

      {/* Comments */}
      <div className="border-t border-border p-4 flex-shrink-0">
        <DocumentCommentsSection documentId={document.id} isHost={!!isOwner} />
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
