import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Globe, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CreateCommunityDialog from '../components/communities/CreateCommunityDialog';
import CommunityCard from '../components/communities/CommunityCard';
import CommunityPage from './CommunityPage';
import type { Community, CommunityFormData } from '../types/community';
import { loadHiddenCommunityIds, addHiddenCommunityId } from '../lib/myCommunitiesHiddenStorage';

type HubTab = 'discover' | 'my';

interface CommunitiesHubPageProps {
  onBackToSession?: () => void;
  onBack?: () => void;
}

export default function CommunitiesHubPage({ onBackToSession, onBack }: CommunitiesHubPageProps) {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const handleGoBack = onBackToSession || onBack;

  const [activeHubTab, setActiveHubTab] = useState<HubTab>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  // Active community state — persists while CommunitiesHubPage is mounted
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
  const [activeCommunityName, setActiveCommunityName] = useState<string>('');

  useEffect(() => {
    setHiddenIds(loadHiddenCommunityIds());
  }, []);

  const handleCommunityCreated = (formData: CommunityFormData) => {
    const newCommunity: Community = {
      id: `community-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      coverUrl: formData.coverUrl || (formData.coverImage ? URL.createObjectURL(formData.coverImage) : undefined),
      iconUrl: formData.iconUrl || (formData.iconImage ? URL.createObjectURL(formData.iconImage) : undefined),
      bannerUrl: formData.bannerUrl || (formData.bannerImage ? URL.createObjectURL(formData.bannerImage) : undefined),
      privacy: formData.privacy,
      joinType: formData.joinType,
      hostUserId: identity?.getPrincipal().toString() || 'unknown',
      createdAt: Date.now(),
      subPlaces: formData.subPlaces,
      theme: formData.theme,
      joinQuestions: formData.joinQuestions,
    };
    setCommunities((prev) => {
      const exists = prev.some((c) => c.id === newCommunity.id);
      if (exists) return prev;
      return [newCommunity, ...prev];
    });
    setShowCreateDialog(false);
  };

  const handleOpenCommunity = (communityId: string, communityName: string) => {
    setActiveCommunityId(communityId);
    setActiveCommunityName(communityName);
  };

  const handleBackFromCommunity = () => {
    setActiveCommunityId(null);
    setActiveCommunityName('');
  };

  const handleHideCommunity = (id: string) => {
    addHiddenCommunityId(id);
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // If a community is open, render CommunityPage
  if (activeCommunityId) {
    return (
      <CommunityPage
        communityId={activeCommunityId}
        communityName={activeCommunityName}
        onBack={handleBackFromCommunity}
      />
    );
  }

  const callerPrincipal = identity?.getPrincipal().toString();

  const myCommunities = communities.filter(
    (c) => callerPrincipal && c.hostUserId === callerPrincipal
  );

  const filteredCommunities = communities
    .filter((c) => !hiddenIds.has(c.id))
    .filter(
      (c) =>
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredMyCommunities = myCommunities.filter(
    (c) =>
      !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-4 pb-0">
        <div className="flex items-center gap-3 mb-4">
          {handleGoBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Communities</h1>
            <p className="text-xs text-muted-foreground">Discover and join communities</p>
          </div>
          {isAuthenticated && (
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="flex-shrink-0 gap-1"
            >
              <Plus className="w-4 h-4" />
              Create
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* Hub Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveHubTab('discover')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeHubTab === 'discover'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Discover
          </button>
          <button
            onClick={() => setActiveHubTab('my')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeHubTab === 'my'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            My Communities
            {myCommunities.length > 0 && (
              <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {myCommunities.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeHubTab === 'discover' && (
          <div className="p-4">
            {filteredCommunities.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">
                  {searchQuery ? 'No communities found' : 'No communities yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAuthenticated
                    ? 'Be the first to create a community!'
                    : 'Log in to create a community'}
                </p>
                {!isAuthenticated && (
                  <Button size="sm" variant="outline" onClick={login}>
                    Login
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    onOpen={() => handleOpenCommunity(community.id, community.name)}
                    onHide={() => handleHideCommunity(community.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeHubTab === 'my' && (
          <div className="p-4">
            {!isAuthenticated ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-muted-foreground">Log in to see your communities</p>
                <Button size="sm" variant="outline" onClick={login}>
                  Login
                </Button>
              </div>
            ) : filteredMyCommunities.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No communities yet</p>
                <p className="text-sm text-muted-foreground">Create your first community!</p>
                <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Community
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredMyCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    onOpen={() => handleOpenCommunity(community.id, community.name)}
                    isOwned
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Community Dialog */}
      <CreateCommunityDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCommunityCreated={handleCommunityCreated}
      />
    </div>
  );
}
