import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useActor } from '../hooks/useActor';
import { Community } from '../backend';
import CommunityCard from '../components/communities/CommunityCard';
import CreateCommunityDialog from '../components/communities/CreateCommunityDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search, Compass, Users, Star } from 'lucide-react';
import { toast } from 'sonner';

interface CommunitiesHubPageProps {
  onBack: () => void;
  onOpenCommunity: (communityId: bigint) => void;
}

type HubTab = 'my' | 'discover';

export default function CommunitiesHubPage({ onBack, onOpenCommunity }: CommunitiesHubPageProps) {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const [activeTab, setActiveTab] = useState<HubTab>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);

  const principalStr = identity?.getPrincipal().toString();

  // We don't have a "list all communities" backend method, so we track locally
  // Communities created in this session are tracked via state
  const [createdCommunityIds, setCreatedCommunityIds] = useState<bigint[]>([]);

  useEffect(() => {
    const loadCommunities = async () => {
      if (!actor || createdCommunityIds.length === 0) return;
      setIsLoadingCommunities(true);
      try {
        const results = await Promise.all(
          createdCommunityIds.map((id) => actor.getCommunity(id))
        );
        const valid = results.filter((c): c is Community => c !== null);
        setMyCommunities(valid);
      } catch (err) {
        console.error('Failed to load communities:', err);
      } finally {
        setIsLoadingCommunities(false);
      }
    };
    loadCommunities();
  }, [actor, createdCommunityIds]);

  const handleCommunityCreated = (communityId: bigint, community: Community) => {
    setCreatedCommunityIds((prev) => [...prev, communityId]);
    setMyCommunities((prev) => {
      const exists = prev.find((c) => c.id === communityId);
      if (exists) return prev;
      return [community, ...prev];
    });
    toast.success(`"${community.name}" created!`);
  };

  const filteredCommunities = myCommunities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cosmic-bg flex flex-col">
      {/* Header */}
      <header className="bg-cosmic-surface/80 backdrop-blur-md border-b border-cosmic-border px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg leading-tight">Communities</h1>
          <p className="text-white/40 text-xs">Explore and join communities</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
          className="bg-cosmic-accent hover:bg-cosmic-accent/80 text-white gap-1.5 rounded-full"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </header>

      {/* Search */}
      <div className="px-4 py-3 bg-cosmic-surface/40 border-b border-cosmic-border">
        <div className="relative max-w-lg mx-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cosmic-accent/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cosmic-border bg-cosmic-surface/40">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'my'
              ? 'text-cosmic-accent border-b-2 border-cosmic-accent'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Star size={15} />
          My Communities
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'discover'
              ? 'text-cosmic-accent border-b-2 border-cosmic-accent'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Compass size={15} />
          Discover
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {activeTab === 'my' && (
          <>
            {isLoadingCommunities ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredCommunities.length > 0 ? (
              <div className="space-y-4">
                {filteredCommunities.map((community) => (
                  <CommunityCard
                    key={community.id.toString()}
                    community={community}
                    onOpen={() => onOpenCommunity(community.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-cosmic-accent/10 border border-cosmic-accent/20 flex items-center justify-center mb-6">
                  <Users size={32} className="text-cosmic-accent/50" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">No communities yet</h3>
                <p className="text-white/40 text-sm max-w-xs mb-6">
                  Create your first community and start building your space!
                </p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-cosmic-accent hover:bg-cosmic-accent/80 text-white gap-2"
                >
                  <Plus size={16} />
                  Create Community
                </Button>
              </div>
            )}
          </>
        )}

        {activeTab === 'discover' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-cosmic-accent/10 border border-cosmic-accent/20 flex items-center justify-center mb-6">
              <Compass size={32} className="text-cosmic-accent/50" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Discover Communities</h3>
            <p className="text-white/40 text-sm max-w-xs">
              Community discovery is coming soon. Check back later!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-white/20 text-xs border-t border-cosmic-border">
        Built with{' '}
        <span className="text-red-400">♥</span>{' '}
        using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cosmic-accent hover:underline"
        >
          caffeine.ai
        </a>{' '}
        · © {new Date().getFullYear()}
      </footer>

      <CreateCommunityDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={handleCommunityCreated}
      />
    </div>
  );
}
