import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2 } from 'lucide-react';
import CommunityForm from './CommunityForm';
import CommunityThemePreview from './CommunityThemePreview';
import type { CommunityFormData } from '../../types/community';

type CreateCommunityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommunityCreated?: (communityId: string) => void;
};

export default function CreateCommunityDialog({
  open,
  onOpenChange,
  onCommunityCreated,
}: CreateCommunityDialogProps) {
  const [formData, setFormData] = useState<CommunityFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData) return;

    // Validation
    if (!formData.name.trim()) {
      setError('Community name is required');
      return;
    }

    if (formData.subPlaces.length === 0) {
      setError('At least one sub-place is required');
      return;
    }

    if (formData.subPlaces.some((sp) => !sp.name.trim())) {
      setError('All sub-places must have a name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Call backend to create community
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockCommunityId = `community-${Date.now()}`;
      
      onOpenChange(false);
      if (onCommunityCreated) {
        onCommunityCreated(mockCommunityId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create community');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90dvh] flex flex-col p-0">
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-2 flex-shrink-0">
          <DialogTitle>Create New Community</DialogTitle>
          <DialogDescription>
            Set up your community with custom places, privacy settings, and theming
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 md:px-6 overflow-y-auto">
          <div className="space-y-6 py-4 pb-6">
            <CommunityForm onChange={setFormData} mode="create" />
            
            {formData && (
              <div className="pt-4 border-t">
                <CommunityThemePreview formData={formData} />
              </div>
            )}
          </div>
        </ScrollArea>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mx-4 md:mx-6 flex-shrink-0">
            {error}
          </div>
        )}

        <DialogFooter className="flex gap-2 px-4 md:px-6 pb-4 md:pb-6 pt-2 flex-shrink-0 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !formData}
            className="min-h-[44px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Community'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
