import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Search, Plus, ArrowLeft, Users, Crown, X } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import { loadHiddenCommunityIds, addHiddenCommunityId } from '../lib/myCommunitiesHiddenStorage';

type CommunitiesHubPageProps = {
  onBackToSession: () => void;
};

type CommunityCard = {
  id: string;
  name: string;
  coverImage: string;
  host: string;
  activityCount?: number;
  description?: string;
};

const MY_COMMUNITIES: CommunityCard[] = [
  {
    id: '1',
    name: 'Haider & Maryam',
    coverImage: '/assets/generated/community-cover-1.dim_600x800.png',
    host: 'Haider',
    activityCount: 6,
  },
  {
    id: '2',
    name: 'Al-Mafia Al-Yemenia',
    coverImage: '/assets/generated/community-cover-2.dim_600x800.png',
    host: 'Admin',
    activityCount: 9,
  },
  {
    id: '3',
    name: 'LGBT+ AR',
    coverImage: '/assets/generated/community-cover-3.dim_600x800.png',
    host: 'Rainbow',
    activityCount: 0,
  },
  {
    id: '4',
    name: 'Malook Al-Ameeraat',
    coverImage: '/assets/generated/community-cover-1.dim_600x800.png',
    host: 'Queen',
    activityCount: 9,
  },
  {
    id: '5',
    name: 'Zodiac & Stars',
    coverImage: '/assets/generated/community-cover-2.dim_600x800.png',
    host: 'Astro',
    activityCount: 9,
  },
  {
    id: '6',
    name: 'One Crew',
    coverImage: '/assets/generated/community-cover-3.dim_600x800.png',
    host: 'Luffy',
    activityCount: 9,
  },
];

const DISCOVER_COMMUNITIES: CommunityCard[] = [
  {
    id: '7',
    name: 'Bollywood | Arabic',
    coverImage: '/assets/generated/community-cover-1.dim_600x800.png',
    host: 'Bollywood',
    description: 'Discuss Bollywood movies, music, and stars in Arabic',
  },
  {
    id: '8',
    name: 'Best Friend',
    coverImage: '/assets/generated/community-cover-2.dim_600x800.png',
    host: 'BFF',
    description: 'A community for best friends to share and connect',
  },
  {
    id: '9',
    name: 'Family K-POP',
    coverImage: '/assets/generated/community-cover-3.dim_600x800.png',
    host: 'KPop',
    description: 'K-Pop fans unite! Share your favorite groups and songs',
  },
  {
    id: '10',
    name: 'Anime Legends',
    coverImage: '/assets/generated/community-cover-1.dim_600x800.png',
    host: 'Otaku',
    description: 'For anime lovers to discuss their favorite series',
  },
  {
    id: '11',
    name: 'Gaming Hub',
    coverImage: '/assets/generated/community-cover-2.dim_600x800.png',
    host: 'Gamer',
    description: 'Connect with gamers and share gaming experiences',
  },
  {
    id: '12',
    name: 'Art & Design',
    coverImage: '/assets/generated/community-cover-3.dim_600x800.png',
    host: 'Artist',
    description: 'Share your art and get inspired by others',
  },
  {
    id: '13',
    name: 'Book Club',
    coverImage: '/assets/generated/community-cover-1.dim_600x800.png',
    host: 'Reader',
    description: 'Discuss books and share reading recommendations',
  },
  {
    id: '14',
    name: 'Fitness & Health',
    coverImage: '/assets/generated/community-cover-2.dim_600x800.png',
    host: 'FitLife',
    description: 'Share fitness tips and health advice',
  },
  {
    id: '15',
    name: 'Travel Stories',
    coverImage: '/assets/generated/community-cover-3.dim_600x800.png',
    host: 'Traveler',
    description: 'Share your travel experiences and tips',
  },
];

export default function CommunitiesHubPage({ onBackToSession }: CommunitiesHubPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'communities' | 'chats' | 'profile' | 'notifications'>('communities');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [hiddenCommunityIds, setHiddenCommunityIds] = useState<Set<string>>(new Set());
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  useEffect(() => {
    setHiddenCommunityIds(loadHiddenCommunityIds());
  }, []);

  const visibleMyCommunities = MY_COMMUNITIES.filter(
    (community) => !hiddenCommunityIds.has(community.id)
  );

  const handleRemoveCommunity = (id: string) => {
    setConfirmRemoveId(id);
  };

  const confirmRemove = () => {
    if (confirmRemoveId) {
      addHiddenCommunityId(confirmRemoveId);
      setHiddenCommunityIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(confirmRemoveId);
        return newSet;
      });
      setConfirmRemoveId(null);
    }
  };

  const cancelRemove = () => {
    setConfirmRemoveId(null);
  };

  const handleTabClick = (tab: 'communities' | 'chats' | 'profile' | 'notifications') => {
    if (tab === 'communities') {
      setActiveTab(tab);
    } else {
      // Show placeholder for other tabs
      setActiveTab(tab);
    }
  };

  return (
    <div className="communities-hub-container">
      {/* Header with Back Button and Search */}
      <header className="communities-header">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBackToSession} className="text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Communities</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
          <Input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/15"
          />
        </div>
      </header>

      {/* Main Content */}
      <ScrollArea className="communities-content">
        <div className="px-4 pb-24">
          {/* My Communities Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">My Communities</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {visibleMyCommunities.map((community) => (
                <div key={community.id} className="community-card relative">
                  <button
                    onClick={() => handleRemoveCommunity(community.id)}
                    className="absolute top-1 right-1 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                    aria-label={`Remove ${community.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2">
                    <img
                      src={community.coverImage}
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                    {community.activityCount !== undefined && community.activityCount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0">
                        +{community.activityCount}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white line-clamp-2">{community.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <Crown className="h-3 w-3" />
                      <span>{community.host}</span>
                    </div>
                    <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full">
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Discover Section */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Discover</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {DISCOVER_COMMUNITIES.map((community) => (
                <div key={community.id} className="community-card">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2">
                    <img
                      src={community.coverImage}
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white line-clamp-2">{community.name}</h3>
                    {community.description && (
                      <p className="text-xs text-white/60 line-clamp-2">{community.description}</p>
                    )}
                    <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full">
                      Request to Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateDialog(true)}
        className="communities-fab"
        aria-label="Create New Community"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom Navigation */}
      <nav className="communities-bottom-nav">
        <button
          onClick={() => handleTabClick('communities')}
          className={`communities-nav-item ${activeTab === 'communities' ? 'active' : ''}`}
        >
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Communities</span>
        </button>
        <button
          onClick={() => handleTabClick('chats')}
          className={`communities-nav-item ${activeTab === 'chats' ? 'active' : ''}`}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs mt-1">My Chats</span>
        </button>
        <button
          onClick={() => handleTabClick('profile')}
          className={`communities-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-1">Profile</span>
        </button>
        <button
          onClick={() => handleTabClick('notifications')}
          className={`communities-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs mt-1">Notifications</span>
        </button>
      </nav>

      {/* Create Community Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Create New Community</DialogTitle>
            <DialogDescription>
              Community creation flow coming soon! You'll be able to set up your own moderated space with custom places, privacy settings, and join approval options.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={confirmRemoveId !== null} onOpenChange={(open) => !open && cancelRemove()}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Remove Community</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this community from your list? You can always add it back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={cancelRemove}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Placeholder for non-Communities tabs */}
      {activeTab !== 'communities' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === 'chats' && 'My Chats feature is coming in the next iteration.'}
              {activeTab === 'profile' && 'Profile page is coming in the next iteration.'}
              {activeTab === 'notifications' && 'Notifications feature is coming in the next iteration.'}
            </p>
            <Button onClick={() => setActiveTab('communities')}>Back to Communities</Button>
          </div>
        </div>
      )}
    </div>
  );
}
