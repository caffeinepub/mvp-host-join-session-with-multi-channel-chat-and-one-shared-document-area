import { useState, useEffect } from 'react';
import { useGetPlayerDocument, useEditPlayerDocument, useSetPlayerDocumentVisibility } from '../../hooks/usePlayerDocuments';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Loader2, Save, Lock } from 'lucide-react';

type PlayerDocumentEditorViewProps = {
  documentId: bigint;
  onDocumentChanged?: () => void;
};

export default function PlayerDocumentEditorView({ documentId, onDocumentChanged }: PlayerDocumentEditorViewProps) {
  const { identity } = useInternetIdentity();
  const { data: document, isLoading, error } = useGetPlayerDocument(documentId);
  const editMutation = useEditPlayerDocument();
  const visibilityMutation = useSetPlayerDocumentVisibility();
  
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isOwner = document && identity && document.owner.toString() === identity.getPrincipal().toString();

  useEffect(() => {
    if (document) {
      setContent(document.content);
      setHasUnsavedChanges(false);
    }
  }, [document]);

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
      <div className="flex-1 p-6 overflow-auto">
        {isOwner ? (
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[500px] font-mono text-sm resize-none"
            placeholder="Start writing..."
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
