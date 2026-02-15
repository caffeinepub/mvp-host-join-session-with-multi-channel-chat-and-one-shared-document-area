import { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import type { Document } from '../../backend';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Save, Lock, Unlock, Loader2, AlertTriangle } from 'lucide-react';
import { formatTimestamp } from '../../lib/time';

type DocumentEditorViewProps = {
  document: Document;
  isHost: boolean;
  onDocumentChanged: () => void;
};

export default function DocumentEditorView({ document, isHost, onDocumentChanged }: DocumentEditorViewProps) {
  const { actor } = useActor();
  const [content, setContent] = useState(document.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const isReadOnly = document.locked;

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
      <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4">
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

        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          disabled={isReadOnly || saving}
          className="flex-1 resize-none font-mono text-sm"
          placeholder="Start typing..."
        />

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
