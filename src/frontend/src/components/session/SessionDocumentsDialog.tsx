import { useState } from 'react';
import { useListSessionDocuments, useCreateSessionDocument, useRenameSessionDocument, useDeleteSessionDocument } from '../../hooks/useSessionDocuments';
import type { Document } from '../../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FileText, Plus, MoreVertical, Edit, Trash2, Loader2, AlertTriangle, Lock } from 'lucide-react';
import { formatTimestamp } from '../../lib/time';

type SessionDocumentsDialogProps = {
  sessionId: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDocument: (documentId: bigint) => void;
};

export default function SessionDocumentsDialog({ sessionId, open, onOpenChange, onSelectDocument }: SessionDocumentsDialogProps) {
  const { data: documents = [], isLoading } = useListSessionDocuments(sessionId);
  const createDocument = useCreateSessionDocument();
  const renameDocument = useRenameSessionDocument();
  const deleteDocument = useDeleteSessionDocument();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!documentName.trim()) {
      setError('Document name is required');
      return;
    }

    setError('');
    try {
      const result = await createDocument.mutateAsync({
        sessionId,
        name: documentName.trim(),
        content: '',
      });

      if (result.__kind__ === 'error') {
        setError(result.error);
        return;
      }

      setDocumentName('');
      setShowCreateDialog(false);
      
      // Select the newly created document
      onSelectDocument(result.ok);
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error creating document:', err);
      setError(err.message || 'Failed to create document');
    }
  };

  const handleRename = async () => {
    if (!selectedDocument || !documentName.trim()) {
      setError('Document name is required');
      return;
    }

    setError('');
    try {
      const result = await renameDocument.mutateAsync({
        documentId: selectedDocument.id,
        newName: documentName.trim(),
      });

      if (result.__kind__ === 'error') {
        setError(result.error);
        return;
      }

      setDocumentName('');
      setSelectedDocument(null);
      setShowRenameDialog(false);
    } catch (err: any) {
      console.error('Error renaming document:', err);
      setError(err.message || 'Failed to rename document');
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    setError('');
    try {
      const result = await deleteDocument.mutateAsync(selectedDocument.id);

      if (result.__kind__ === 'error') {
        setError(result.error);
        return;
      }

      setSelectedDocument(null);
      setShowDeleteDialog(false);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document');
    }
  };

  const openRenameDialog = (doc: Document) => {
    setSelectedDocument(doc);
    setDocumentName(doc.name);
    setShowRenameDialog(true);
  };

  const openDeleteDialog = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Documents</DialogTitle>
            <DialogDescription>
              View and manage documents for this session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setShowCreateDialog(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No documents yet</p>
                <p className="text-sm">Create your first document to get started</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id.toString()}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <button
                        onClick={() => {
                          onSelectDocument(doc.id);
                          onOpenChange(false);
                        }}
                        className="flex-1 flex items-start gap-3 text-left"
                      >
                        <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{doc.name}</h4>
                            {doc.locked && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Rev. {doc.revision.toString()} • {formatTimestamp(doc.lastModified)}
                          </p>
                        </div>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRenameDialog(doc)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(doc)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Document Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Document</DialogTitle>
            <DialogDescription>
              Enter a name for the new document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doc-name">Document Name</Label>
              <Input
                id="doc-name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createDocument.isPending}>
              {createDocument.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Document Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>
              Enter a new name for the document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-doc">Document Name</Label>
              <Input
                id="rename-doc"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter new name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={renameDocument.isPending}>
              {renameDocument.isPending ? 'Renaming...' : 'Rename'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Document Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDocument?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteDocument.isPending}>
              {deleteDocument.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
