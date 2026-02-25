import { useState, useEffect, useRef } from 'react';
import { useListDocumentFiles, useUploadDocumentFile } from '../../hooks/useDocumentFiles';
import { useAddImageToDocument } from '../../hooks/useDocumentImages';
import type { Document } from '../../types/session';
import { ExternalBlob } from '../../backend';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Save,
  Lock,
  Unlock,
  Loader2,
  AlertTriangle,
  Upload,
  Download,
  FileText,
  Image as ImageIcon,
  Eye,
  Edit,
} from 'lucide-react';
import { formatTimestamp } from '../../lib/time';
import { parseFileMarkers, createFileMarker, insertFileMarker } from '../../lib/documentFileMarkers';
import ImageUploadWithTitleDialog from './ImageUploadWithTitleDialog';
import DocumentCommentsSection from './DocumentCommentsSection';
import DocumentContentPreview from './DocumentContentPreview';

type DocumentEditorViewProps = {
  document: Document;
  isHost: boolean;
  sessionId: bigint;
  onDocumentChanged: () => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
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

export default function DocumentEditorView({
  document,
  isHost,
  sessionId,
  onDocumentChanged,
}: DocumentEditorViewProps) {
  const [content, setContent] = useState(document.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: documentFiles = [] } = useListDocumentFiles(document.id);
  const uploadFile = useUploadDocumentFile();
  const addImage = useAddImageToDocument();

  useEffect(() => {
    setContent(document.content);
    setHasUnsavedChanges(false);
    setError('');
  }, [document.id, document.content, document.revision]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== document.content);
  };

  const handleSave = async () => {
    setError('Document editing is not available in the current version.');
  };

  const handleImageUpload = async (_file: File, _title: string) => {
    setError('Image upload is not available in the current version.');
  };

  const handleFileSelect = async (_e: React.ChangeEvent<HTMLInputElement>) => {
    setError('File upload is not available in the current version.');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isReadOnly = document.locked;
  const isUploading = uploadProgress !== null;
  const fileMarkers = parseFileMarkers(content);
  const fileMap = new Map(documentFiles.map((f) => [Number(f.id), f]));
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
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-amber-600 dark:text-amber-400">Unsaved changes</span>
            )}
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
              This document is locked.{' '}
              {isHost ? 'Unlock it to allow editing.' : 'Only the host can unlock it.'}
            </AlertDescription>
          </Alert>
        )}

        {isPreview ? (
          <div className="flex-1">
            <DocumentContentPreview content={content} documentFiles={documentFiles} />
          </div>
        ) : (
          <>
            {isHost && !isReadOnly && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading || saving}
                  onClick={() => setShowImageUploadDialog(true)}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Upload image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading || saving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload file
                </Button>
                <span className="text-xs text-muted-foreground">
                  Max 10MB • jpg, png, gif, webp, pdf, txt, md
                </span>
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
              placeholder="Start typing..."
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
                          <p className="text-sm text-muted-foreground">
                            Image not found: {marker.filename}
                          </p>
                        </div>
                      );
                    }
                    const imageUrl = fileRef.file.getDirectURL();
                    return (
                      <div
                        key={marker.fileId}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={fileRef.filename}
                          className="w-full h-48 object-cover bg-muted"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="p-2 bg-muted/50 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground truncate">
                            {fileRef.filename}
                          </span>
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
                        <div
                          key={marker.fileId}
                          className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50"
                        >
                          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            File not found: {marker.filename}
                          </p>
                        </div>
                      );
                    }
                    const fileUrl = fileRef.file.getDirectURL();
                    return (
                      <div
                        key={marker.fileId}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{fileRef.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {fileRef.mimeType} • {(Number(fileRef.size) / 1024).toFixed(1)} KB
                            </p>
                          </div>
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

        <DocumentCommentsSection documentId={document.id} isHost={isHost} />
      </div>

      {/* Use correct prop: onOpenChange instead of onClose */}
      <ImageUploadWithTitleDialog
        open={showImageUploadDialog}
        onOpenChange={setShowImageUploadDialog}
        onUpload={handleImageUpload}
      />
    </div>
  );
}
