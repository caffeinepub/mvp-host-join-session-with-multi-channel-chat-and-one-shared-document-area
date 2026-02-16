import { useState } from 'react';
import { useListPlayerDocuments } from '../../hooks/usePlayerDocuments';
import { CreatePlayerDocumentDialog } from './PlayerDocumentManagementDialogs';
import type { PlayerDocument } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { User, Plus, Lock } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

type PlayerDocumentsDialogProps = {
  sessionId: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDocument: (doc: PlayerDocument) => void;
  onDocumentCreated: (documentId: bigint) => void;
};

export default function PlayerDocumentsDialog({
  sessionId,
  open,
  onOpenChange,
  onSelectDocument,
  onDocumentCreated,
}: PlayerDocumentsDialogProps) {
  const { identity } = useInternetIdentity();
  const { data: playerDocuments = [], refetch } = useListPlayerDocuments(sessionId);
  const [showCreate, setShowCreate] = useState(false);

  const handleDocumentCreated = (documentId: bigint) => {
    setShowCreate(false);
    refetch();
    onDocumentCreated(documentId);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Player Documents</DialogTitle>
            <DialogDescription>
              View and manage your player documents. Private documents are only visible to you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={() => setShowCreate(true)} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create New Document
            </Button>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {playerDocuments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No player documents yet.</p>
                    <p className="text-sm">Create one to get started!</p>
                  </div>
                ) : (
                  playerDocuments.map((doc) => {
                    const isOwner = identity && doc.owner.toString() === identity.getPrincipal().toString();
                    return (
                      <button
                        key={doc.id.toString()}
                        onClick={() => {
                          onSelectDocument(doc);
                          onOpenChange(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors text-left"
                      >
                        <User className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {isOwner ? 'Your document' : `Owner: ${doc.owner.toString().slice(0, 8)}...`}
                          </p>
                        </div>
                        {doc.isPrivate && (
                          <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
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
