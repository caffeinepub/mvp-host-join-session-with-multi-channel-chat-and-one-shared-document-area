import { useState, useEffect } from 'react';
import { useGetPlayerDocument, useEditPlayerDocument } from '../../hooks/usePlayerDocuments';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Loader2, Save, Lock } from 'lucide-react';

type PlayerDocumentEditorViewProps = {
  documentId: bigint;
};

export default function PlayerDocumentEditorView({ documentId }: PlayerDocumentEditorViewProps) {
  const { identity } = useInternetIdentity();
  const { data: document, isLoading, error } = useGetPlayerDocument(documentId);
  const editMutation = useEditPlayerDocument();
  
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
      }
    } catch (error) {
      console.error('Error saving document:', error);
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
            This document is hidden and you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isOwner && !document.visible) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            This document is hidden by its owner.
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
              {!document.visible && ' • Hidden'}
            </p>
          </div>
          {isOwner && (
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
          )}
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
