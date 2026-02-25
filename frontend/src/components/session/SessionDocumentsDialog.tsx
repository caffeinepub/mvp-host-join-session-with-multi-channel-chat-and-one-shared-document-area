import { useState } from 'react';
import { useListSessionDocuments } from '../../hooks/useSessionDocuments';
import type { Document } from '../../types/session';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { FileText, Lock, Plus } from 'lucide-react';
import DocumentManagementDialogs from './DocumentManagementDialogs';

type SessionDocumentsDialogProps = {
  sessionId: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDocument: (documentId: bigint) => void;
};

export default function SessionDocumentsDialog({
  sessionId,
  open,
  onOpenChange,
  onSelectDocument,
}: SessionDocumentsDialogProps) {
  const { data: documents = [], refetch } = useListSessionDocuments(sessionId);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Session Documents</DialogTitle>
            <DialogDescription>
              View and manage session documents.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mb-2">
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </div>

          <ScrollArea className="max-h-80">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No session documents yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {documents.map((doc: Document) => (
                  <button
                    key={doc.id.toString()}
                    onClick={() => {
                      onSelectDocument(doc.id);
                      onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-left transition-colors min-h-[44px]"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{doc.name}</span>
                    {doc.locked && (
                      <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <DocumentManagementDialogs
        sessionId={sessionId}
        isCreateDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={() => {
          refetch();
          setShowCreate(false);
        }}
      />
    </>
  );
}
