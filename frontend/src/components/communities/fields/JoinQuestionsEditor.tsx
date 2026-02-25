import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Plus, X } from 'lucide-react';

type JoinQuestionsEditorProps = {
  questions: string[];
  onChange: (questions: string[]) => void;
};

export default function JoinQuestionsEditor({ questions, onChange }: JoinQuestionsEditorProps) {
  const handleAdd = () => {
    if (questions.length < 3) {
      onChange([...questions, '']);
    }
  };

  const handleRemove = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Optional Join Questions (Max 3)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={questions.length >= 3}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Question
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Ask custom questions when users request to join
      </p>

      {questions.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No questions added yet</p>
      )}

      <div className="space-y-3">
        {questions.map((question, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Question ${index + 1} (e.g., "Why do you want to join?")`}
              value={question}
              onChange={(e) => handleChange(index, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {questions.length >= 3 && (
        <p className="text-sm text-muted-foreground">Maximum of 3 questions reached</p>
      )}
    </div>
  );
}
