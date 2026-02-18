import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import CommunityImagePickers from './fields/CommunityImagePickers';
import JoinQuestionsEditor from './fields/JoinQuestionsEditor';
import SubPlacesEditor from './fields/SubPlacesEditor';
import AdvancedCustomizationSection from './fields/AdvancedCustomizationSection';
import type { CommunityFormData, PrivacyType, JoinType } from '../../types/community';
import { DEFAULT_THEME } from '../../lib/communityTheme';

type CommunityFormProps = {
  initialData?: Partial<CommunityFormData>;
  onChange: (data: CommunityFormData) => void;
  mode?: 'create' | 'edit';
};

export default function CommunityForm({ initialData, onChange, mode = 'create' }: CommunityFormProps) {
  const [formData, setFormData] = useState<CommunityFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    privacy: initialData?.privacy || 'Public',
    joinType: initialData?.joinType || 'Request to Join',
    joinQuestions: initialData?.joinQuestions || [],
    subPlaces: initialData?.subPlaces || [{ name: 'General Chat', type: 'Chat' }],
    theme: initialData?.theme || DEFAULT_THEME,
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const updateField = <K extends keyof CommunityFormData>(field: K, value: CommunityFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Community Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Community Name *</Label>
        <Input
          id="name"
          placeholder="Void Weavers"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
        />
      </div>

      {/* 2. Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Cosmic community for explorers of the unknown"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
        />
      </div>

      {/* 3. Cover Image */}
      <CommunityImagePickers
        coverImage={formData.coverImage}
        coverUrl={formData.coverUrl}
        iconImage={formData.iconImage}
        iconUrl={formData.iconUrl}
        bannerImage={formData.bannerImage}
        bannerUrl={formData.bannerUrl}
        onCoverChange={(file, url) => {
          updateField('coverImage', file);
          updateField('coverUrl', url);
        }}
        onIconChange={(file, url) => {
          updateField('iconImage', file);
          updateField('iconUrl', url);
        }}
        onBannerChange={(file, url) => {
          updateField('bannerImage', file);
          updateField('bannerUrl', url);
        }}
      />

      {/* 4. Privacy Settings */}
      <div className="space-y-2">
        <Label>Privacy Settings</Label>
        <RadioGroup
          value={formData.privacy}
          onValueChange={(value) => updateField('privacy', value as PrivacyType)}
        >
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="Public" id="privacy-public" className="mt-1" />
            <div>
              <Label htmlFor="privacy-public" className="font-normal cursor-pointer">
                Public
              </Label>
              <p className="text-sm text-muted-foreground">
                Discoverable in search and recommendations
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="Private" id="privacy-private" className="mt-1" />
            <div>
              <Label htmlFor="privacy-private" className="font-normal cursor-pointer">
                Private
              </Label>
              <p className="text-sm text-muted-foreground">
                Only accessible via invite link/code or direct request
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* 5. Join Type */}
      <div className="space-y-2">
        <Label htmlFor="joinType">Join Type</Label>
        <Select
          value={formData.joinType}
          onValueChange={(value) => updateField('joinType', value as JoinType)}
        >
          <SelectTrigger id="joinType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Request to Join">Request to Join</SelectItem>
            <SelectItem value="Invite-Only">Invite-Only</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
          </SelectContent>
        </Select>
        {formData.joinType === 'Open' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Less moderated — use for trusted groups
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* 6. Optional Join Questions */}
      <JoinQuestionsEditor
        questions={formData.joinQuestions}
        onChange={(questions) => updateField('joinQuestions', questions)}
      />

      {/* 7. Initial Sub-Places */}
      <SubPlacesEditor
        subPlaces={formData.subPlaces}
        onChange={(subPlaces) => updateField('subPlaces', subPlaces)}
      />

      {/* 8. Advanced Customization */}
      <AdvancedCustomizationSection
        theme={formData.theme}
        onChange={(theme) => updateField('theme', theme)}
        bannerImage={formData.bannerImage}
        bannerUrl={formData.bannerUrl}
        onBannerChange={(file, url) => {
          updateField('bannerImage', file);
          updateField('bannerUrl', url);
        }}
      />
    </div>
  );
}
