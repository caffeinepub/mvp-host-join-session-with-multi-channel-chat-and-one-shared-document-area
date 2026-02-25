import { useState } from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Button } from '../../ui/button';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';
import type { CommunityTheme } from '../../../types/community';
import { FONT_OPTIONS, BACKGROUND_PRESETS } from '../../../lib/communityTheme';
import { getContrastWarning } from '../../../lib/colorContrast';

type AdvancedCustomizationSectionProps = {
  theme: CommunityTheme;
  onChange: (theme: CommunityTheme) => void;
  bannerImage?: File;
  bannerUrl?: string;
  onBannerChange: (file: File | undefined, url?: string) => void;
};

export default function AdvancedCustomizationSection({
  theme,
  onChange,
}: AdvancedCustomizationSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const contrastWarning = getContrastWarning(theme.textColor, theme.backgroundColor);

  const handlePresetSelect = (presetName: string) => {
    const preset = BACKGROUND_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setSelectedPreset(presetName);
      onChange({
        ...theme,
        backgroundColor: preset.value,
        backgroundGradient: preset.gradient,
      });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between">
          <span>Advanced Customization</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-6 mt-4">
        {/* Theme Colors */}
        <div className="space-y-4">
          <h3 className="font-semibold">Theme Colors</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => onChange({ ...theme, accentColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => onChange({ ...theme, accentColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Preset</Label>
            <div className="grid grid-cols-2 gap-2">
              {BACKGROUND_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant={selectedPreset === preset.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetSelect(preset.name)}
                  className="justify-start"
                >
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{ background: preset.gradient || preset.value }}
                  />
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => {
                  setSelectedPreset(null);
                  onChange({ ...theme, backgroundColor: e.target.value, backgroundGradient: undefined });
                }}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={theme.backgroundColor}
                onChange={(e) => {
                  setSelectedPreset(null);
                  onChange({ ...theme, backgroundColor: e.target.value, backgroundGradient: undefined });
                }}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={theme.textColor}
                onChange={(e) => onChange({ ...theme, textColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={theme.textColor}
                onChange={(e) => onChange({ ...theme, textColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          {contrastWarning && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{contrastWarning}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Custom Fonts */}
        <div className="space-y-2">
          <Label htmlFor="fontFamily">Font Family</Label>
          <Select value={theme.fontFamily} onValueChange={(value) => onChange({ ...theme, fontFamily: value })}>
            <SelectTrigger id="fontFamily">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Layout Style */}
        <div className="space-y-2">
          <Label>Layout Style</Label>
          <RadioGroup
            value={theme.layoutStyle}
            onValueChange={(value) => onChange({ ...theme, layoutStyle: value as CommunityTheme['layoutStyle'] })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Compact" id="layout-compact" />
              <Label htmlFor="layout-compact" className="font-normal cursor-pointer">
                Compact (Discord-like sidebar)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Card-based" id="layout-card" />
              <Label htmlFor="layout-card" className="font-normal cursor-pointer">
                Card-based (Amino-style grids)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Minimal" id="layout-minimal" />
              <Label htmlFor="layout-minimal" className="font-normal cursor-pointer">
                Minimal (Full-width clean)
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
