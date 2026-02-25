import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Plus, X } from 'lucide-react';
import type { SubPlace, SubPlaceType } from '../../../types/community';

type SubPlacesEditorProps = {
  subPlaces: SubPlace[];
  onChange: (subPlaces: SubPlace[]) => void;
};

export default function SubPlacesEditor({ subPlaces, onChange }: SubPlacesEditorProps) {
  const handleAdd = () => {
    if (subPlaces.length < 5) {
      onChange([...subPlaces, { name: '', type: 'Chat' }]);
    }
  };

  const handleRemove = (index: number) => {
    onChange(subPlaces.filter((_, i) => i !== index));
  };

  const handleNameChange = (index: number, name: string) => {
    const updated = [...subPlaces];
    updated[index] = { ...updated[index], name };
    onChange(updated);
  };

  const handleTypeChange = (index: number, type: SubPlaceType) => {
    const updated = [...subPlaces];
    updated[index] = { ...updated[index], type };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Initial Sub-Places (2-5 recommended)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={subPlaces.length >= 5}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Sub-Place
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Create starting sections for your community (at least 1 required)
      </p>

      {subPlaces.length === 0 && (
        <p className="text-sm text-destructive">At least one sub-place is required</p>
      )}

      <div className="space-y-3">
        {subPlaces.map((subPlace, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Input
                placeholder={`Name (e.g., "General Chat", "RPG Tavern")`}
                value={subPlace.name}
                onChange={(e) => handleNameChange(index, e.target.value)}
              />
              <Select
                value={subPlace.type}
                onValueChange={(value) => handleTypeChange(index, value as SubPlaceType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chat">Chat</SelectItem>
                  <SelectItem value="Documents">Documents</SelectItem>
                  <SelectItem value="RPG">RPG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(index)}
              className="mt-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {subPlaces.length >= 5 && (
        <p className="text-sm text-muted-foreground">Maximum of 5 sub-places reached</p>
      )}
    </div>
  );
}
