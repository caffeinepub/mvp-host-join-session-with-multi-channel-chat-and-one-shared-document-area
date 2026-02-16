import { useState } from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const MIN_SCALE = 70;
const MAX_SCALE = 130;
const PRESET_SCALES = [70, 85, 100, 115, 130];

export default function UiScaleControl() {
  const { preferences, updatePreferences } = usePreferences();
  const [open, setOpen] = useState(false);

  const handleScaleChange = (value: number[]) => {
    const clampedValue = Math.max(MIN_SCALE, Math.min(MAX_SCALE, value[0]));
    updatePreferences({ uiScale: clampedValue });
  };

  const handlePresetClick = (scale: number) => {
    updatePreferences({ uiScale: scale });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="UI Scale Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            UI Scale Settings
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-72" align="start" side="right">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ui-scale-slider" className="text-sm font-medium">
              UI Scale: {preferences.uiScale}%
            </Label>
            <Slider
              id="ui-scale-slider"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={5}
              value={[preferences.uiScale]}
              onValueChange={handleScaleChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Presets</Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_SCALES.map((scale) => (
                <Button
                  key={scale}
                  variant={preferences.uiScale === scale ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetClick(scale)}
                  className="h-9 text-xs"
                >
                  {scale}%
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Adjust the UI size for better readability on your device. Changes apply immediately.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
