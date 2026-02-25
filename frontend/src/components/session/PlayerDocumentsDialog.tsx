import { useState } from 'react';
import { useListPlayerDocuments } from '../../hooks/usePlayerDocuments';
import { CreatePlayerDocumentDialog } from './PlayerDocumentManagementDialogs';
import type { PlayerDocument } from '../../types/session';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, FileText, Lock } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

type PlayerDocumentsDialogProps = {
  sessionId: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDocument: (doc: PlayerDocument) => void;
  onDocumentCreated?: (documentId: bigint) => void;
};

export default function PlayerDocumentsDialog({
  sessionId,
  open,
  onOpenChange,
  onSelectDocument,
  onDocumentCreated,
}: PlayerDocumentsDialogProps) {
  const { identity } = useInternetIdentity();
  const { data: documents = [], refetch } = useListPlayerDocuments(sessionId);
  const [showCreate, setShowCreate] = useState(false);

  const currentPrincipal = identity?.getPrincipal().toString();

  const handleDocumentCreated = (documentId: bigint) => {
    refetch();
    onDocumentCreated?.(documentId);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Player Documents</DialogTitle>
            <DialogDescription>
              View and manage your personal documents.
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
                <p className="text-sm">No player documents yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {documents.map((doc) => {
                  const isOwner = doc.owner.toString() === currentPrincipal;
                  return (
                    <button
                      key={doc.id.toString()}
                      onClick={() => {
                        onSelectDocument(doc);
                        onOpenChange(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-left transition-colors min-h-[44px]"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-sm truncate">{doc.name}</span>
                      {doc.isPrivate && (
                        <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                      )}
                      {isOwner && (
                        <span className="text-xs text-muted-foreground shrink-0">Mine</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <CreatePlayerDocumentDialog
        sessionId={sessionId}
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={refetch}
        onCreated={handleDocumentCreated}
      />
    </>
  );
}
