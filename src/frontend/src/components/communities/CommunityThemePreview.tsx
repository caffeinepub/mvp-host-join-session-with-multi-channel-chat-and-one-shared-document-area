import type { CommunityFormData } from '../../types/community';

type CommunityThemePreviewProps = {
  formData: CommunityFormData;
};

export default function CommunityThemePreview({ formData }: CommunityThemePreviewProps) {
  const { theme, name, coverUrl, iconUrl } = formData;

  const previewStyle = {
    backgroundColor: theme.backgroundColor,
    background: theme.backgroundGradient || theme.backgroundColor,
    color: theme.textColor,
    fontFamily: theme.fontFamily,
    borderColor: theme.primaryColor,
  };

  const displayImage = iconUrl || coverUrl || '/assets/generated/community-cover-1.dim_600x800.png';

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Live Preview</h3>
      <div
        className="rounded-lg p-4 border-2"
        style={previewStyle}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
            style={{ borderColor: theme.accentColor, borderWidth: '2px' }}
          >
            <img src={displayImage} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-semibold" style={{ color: theme.primaryColor }}>
              {name || 'Community Name'}
            </h4>
            <p className="text-xs opacity-70">Preview Card</p>
          </div>
        </div>
        <button
          className="w-full py-2 px-4 rounded-full text-sm font-medium"
          style={{
            backgroundColor: theme.accentColor,
            color: '#ffffff',
          }}
        >
          Join Community
        </button>
      </div>
    </div>
  );
}
