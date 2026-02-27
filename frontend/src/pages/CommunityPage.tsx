import React, { useState, useCallback } from 'react';
import { ArrowLeft, Edit2, Settings, Users, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import DraggableTabBar from '../components/communities/DraggableTabBar';
import BannerCustomizationDialog from '../components/communities/BannerCustomizationDialog';
import TabPermissionsDialog from '../components/communities/TabPermissionsDialog';
import HomeTab from '../components/communities/HomeTab';
import ChatTabPlaceholder from '../components/communities/ChatTabPlaceholder';
import TabPlaceholder from '../components/communities/TabPlaceholder';

const DEFAULT_TABS = ['Home', 'Chat', 'Lore', 'Polls', 'Quizzes', 'Rules'];

interface CommunityPageProps {
  communityId: string;
  communityName: string;
  onBack: () => void;
}

export default function CommunityPage({ communityId, communityName, onBack }: CommunityPageProps) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Home');
  const [showBannerDialog, setShowBannerDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  const callerPrincipal = identity?.getPrincipal();

  // Fetch community data
  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: ['community', communityId],
    queryFn: async () => {
      if (!actor) return null;
      // We get community info from posts query + banner settings stored in community
      // The backend doesn't have a getCommunity method, so we use what we have
      return null;
    },
    enabled: !!actor && !actorFetching,
  });

  // Fetch banner settings from community hub - we store them locally after fetch
  const [bannerSettings, setBannerSettings] = useState<{
    bannerBlob?: Uint8Array;
    bannerColor?: string;
    bannerFont?: string;
    accentColor?: string;
    bannerUrl?: string;
  }>({
    bannerColor: '#1a1a2e',
    accentColor: '#7c3aed',
    bannerFont: 'sans',
  });

  // Check if current user is host
  const { data: isHost } = useQuery({
    queryKey: ['isCommunityHost', communityId, callerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !callerPrincipal) return false;
      return actor.isCommunityHost(communityId, callerPrincipal);
    },
    enabled: !!actor && !actorFetching && !!callerPrincipal,
  });

  // Check if current user can reorder tabs
  const { data: canReorder } = useQuery({
    queryKey: ['canReorder', communityId, callerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !callerPrincipal) return false;
      return actor.isCommunityHostOrPermitted(communityId, callerPrincipal);
    },
    enabled: !!actor && !actorFetching && !!callerPrincipal,
  });

  // Fetch tab order
  const { data: tabOrderData } = useQuery({
    queryKey: ['tabOrder', communityId],
    queryFn: async () => {
      if (!actor) return DEFAULT_TABS;
      const order = await actor.getTabOrder(communityId);
      return order.length > 0 ? order : DEFAULT_TABS;
    },
    enabled: !!actor && !actorFetching,
  });

  // Fetch posts for stats
  const { data: posts } = useQuery({
    queryKey: ['communityPosts', communityId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPosts(communityId);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });

  // Update tab order mutation
  const updateTabOrderMutation = useMutation({
    mutationFn: async (newOrder: string[]) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateTabOrder(communityId, newOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabOrder', communityId] });
    },
  });

  const tabs = tabOrderData || DEFAULT_TABS;
  const accentColor = bannerSettings.accentColor || '#7c3aed';
  const bannerColor = bannerSettings.bannerColor || '#1a1a2e';
  const bannerFont = bannerSettings.bannerFont || 'sans';

  const fontClass = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
    display: 'font-display',
  }[bannerFont] || 'font-sans';

  const handleReorder = useCallback((newOrder: string[]) => {
    updateTabOrderMutation.mutate(newOrder);
  }, [updateTabOrderMutation]);

  const handleBannerSaved = useCallback((settings: {
    bannerBlob?: Uint8Array;
    bannerColor?: string;
    bannerFont?: string;
    accentColor?: string;
    bannerUrl?: string;
  }) => {
    setBannerSettings(settings);
    queryClient.invalidateQueries({ queryKey: ['community', communityId] });
  }, [communityId, queryClient]);

  const postCount = posts?.length ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Banner */}
      <div
        className="relative w-full"
        style={{
          background: bannerSettings.bannerUrl
            ? `url(${bannerSettings.bannerUrl}) center/cover no-repeat`
            : bannerColor,
          minHeight: '200px',
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="bg-black/30 hover:bg-black/50 text-white rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Host controls */}
        {isHost && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBannerDialog(true)}
              className="bg-black/30 hover:bg-black/50 text-white text-xs"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              Edit Banner
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPermissionsDialog(true)}
              className="bg-black/30 hover:bg-black/50 text-white text-xs"
            >
              <Shield className="w-3 h-3 mr-1" />
              Permissions
            </Button>
          </div>
        )}

        {/* Community name */}
        <div className="absolute bottom-6 left-6 z-10">
          <h1
            className={`text-3xl font-bold text-white drop-shadow-lg ${fontClass}`}
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            {communityName}
          </h1>
          {isHost && (
            <span className="text-xs text-white/70 bg-black/30 px-2 py-0.5 rounded-full mt-1 inline-block">
              Host
            </span>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span><strong className="text-foreground">{postCount}</strong> posts</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Community</span>
        </div>
        <div className="ml-auto">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* Draggable Tab Bar */}
      <DraggableTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onReorder={handleReorder}
        canReorder={!!canReorder}
        accentColor={accentColor}
      />

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'Home' && (
          <HomeTab communityId={communityId} accentColor={accentColor} />
        )}
        {activeTab === 'Chat' && <ChatTabPlaceholder />}
        {activeTab === 'Lore' && (
          <TabPlaceholder
            tabName="Lore"
            accentColor={accentColor}
            description="Share the lore, history, and world-building of your community."
            icon="📖"
          />
        )}
        {activeTab === 'Polls' && (
          <TabPlaceholder
            tabName="Polls"
            accentColor={accentColor}
            description="Create polls and gather opinions from your community members."
            icon="📊"
          />
        )}
        {activeTab === 'Quizzes' && (
          <TabPlaceholder
            tabName="Quizzes"
            accentColor={accentColor}
            description="Test your community's knowledge with fun quizzes."
            icon="🧠"
          />
        )}
        {activeTab === 'Rules' && (
          <TabPlaceholder
            tabName="Rules"
            accentColor={accentColor}
            description="Community guidelines and rules for all members."
            icon="📋"
          />
        )}
      </div>

      {/* Banner Customization Dialog */}
      {showBannerDialog && (
        <BannerCustomizationDialog
          communityId={communityId}
          currentSettings={bannerSettings}
          onClose={() => setShowBannerDialog(false)}
          onSaved={handleBannerSaved}
        />
      )}

      {/* Tab Permissions Dialog */}
      {showPermissionsDialog && (
        <TabPermissionsDialog
          communityId={communityId}
          onClose={() => setShowPermissionsDialog(false)}
        />
      )}
    </div>
  );
}
