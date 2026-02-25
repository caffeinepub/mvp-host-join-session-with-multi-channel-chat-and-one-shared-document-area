import { useState } from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Settings } from 'lucide-react';

type UIScaleSettingsPopoverProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function UIScaleSettingsPopover({ open, onOpenChange }: UIScaleSettingsPopoverProps) {
  const { preferences, updatePreferences } = usePreferences();
  const [localValue, setLocalValue] = useState(preferences.uiScalePercent);

  const handleSliderChange = (values: number[]) => {
    const newValue = Math.max(10, Math.min(200, values[0]));
    setLocalValue(newValue);
    updatePreferences({ uiScalePercent: newValue });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const clamped = Math.max(10, Math.min(200, value));
      setLocalValue(clamped);
      updatePreferences({ uiScalePercent: clamped });
    }
  };

  const handleReset = () => {
    setLocalValue(100);
    updatePreferences({ uiScalePercent: 100 });
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="UI scale settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">UI Scale</h4>
            <p className="text-sm text-muted-foreground">
              Adjust the interface size from 10% to 200%
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="scale-input" className="text-sm">
                  Scale Percentage
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="scale-input"
                    type="number"
                    min={10}
                    max={200}
                    value={localValue}
                    onChange={handleInputChange}
                    className="w-20 h-8 text-right"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <Slider
                value={[localValue]}
                onValueChange={handleSliderChange}
                min={10}
                max={200}
                step={5}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full"
            >
              Reset to 100%
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
