import { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import type { Document } from '../../types/session';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Loader2, Save, Eye, Edit, Upload, Image } from 'lucide-react';
import { useListDocumentImages } from '../../hooks/useDocumentImages';
import { useListDocumentFiles } from '../../hooks/useDocumentFiles';
import DocumentCommentsSection from './DocumentCommentsSection';
import DocumentContentPreview from './DocumentContentPreview';
import ImageUploadWithTitleDialog from './ImageUploadWithTitleDialog';
import { ExternalBlob } from '../../backend';

type DocumentEditorViewProps = {
  document: Document;
  isHost: boolean;
  sessionId: bigint;
  onDocumentChanged: () => void;
};

export default function DocumentEditorView({
  document,
  isHost,
  sessionId,
  onDocumentChanged,
}: DocumentEditorViewProps) {
  const { actor } = useActor();
  const [content, setContent] = useState(document.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { data: images = [] } = useListDocumentImages(document.id);
  const { data: files = [] } = useListDocumentFiles(document.id);

  useEffect(() => {
    setContent(document.content);
  }, [document.id, document.content]);

  const handleSave = async () => {
    if (!actor) return;

    setIsSaving(true);
    try {
      const result = await (actor as any).editDocument(document.id, content);
      if (result.__kind__ === 'ok') {
        onDocumentChanged();
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, title: string) => {
    if (!actor) return;

    setUploadProgress(0);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      const uploadResult = await (actor as any).uploadDocumentFile({
        documentId: document.id,
        file: blob,
        filename: file.name,
        mimeType: file.type,
        size: BigInt(file.size),
      });

      if (uploadResult && uploadResult.__kind__ === 'ok') {
        const fileId = uploadResult.ok;
        await (actor as any).addImageToDocument(
          sessionId,
          document.id,
          fileId.toString(),
          title || file.name,
          '',
          BigInt(0),
          BigInt(file.size)
        );
        onDocumentChanged();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actor) return;

    setUploadProgress(0);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      await (actor as any).uploadDocumentFile({
        documentId: document.id,
        file: blob,
        filename: file.name,
        mimeType: file.type,
        size: BigInt(file.size),
      });

      onDocumentChanged();
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const canEdit = isHost && !document.locked;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold">{document.name}</h2>
          {document.locked && (
            <span className="text-xs text-muted-foreground">🔒 Locked</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              {isEditMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditMode(false)}
                    disabled={isSaving}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isEditMode && canEdit ? (
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm resize-none"
              disabled={isSaving}
            />

            {isHost && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImageUpload(true)}
                >
                  <Image className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
                <label>
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </span>
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            )}

            {uploadProgress !== null && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <DocumentContentPreview documentId={document.id} content={content} />
        )}
      </div>

      {/* Comments */}
      <div className="border-t border-border p-4 flex-shrink-0">
        <DocumentCommentsSection documentId={document.id} isHost={isHost} />
      </div>

      {showImageUpload && (
        <ImageUploadWithTitleDialog
          open={showImageUpload}
          onOpenChange={setShowImageUpload}
          onUpload={handleImageUpload}
        />
      )}
    </div>
  );
}
