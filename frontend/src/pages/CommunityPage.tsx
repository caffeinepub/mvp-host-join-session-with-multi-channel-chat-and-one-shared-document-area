import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCommunity, useGetTabs, useCanReorder } from '../hooks/useQueries';
import { Tab, TabData } from '../backend';
import CommunityBanner from '../components/communities/CommunityBanner';
import CommunityStatsBar from '../components/communities/CommunityStatsBar';
import CommunityTabs from '../components/communities/CommunityTabs';
import HomeTab from '../components/communities/HomeTab';
import ChatTab from '../components/communities/ChatTab';
import LoreTab from '../components/communities/LoreTab';
import PollsTab from '../components/communities/PollsTab';
import QuizzesTab from '../components/communities/QuizzesTab';
import RulesTab from '../components/communities/RulesTab';
import HostControlsButton from '../components/communities/HostControlsButton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunityPageProps {
  communityId: bigint;
  onBack: () => void;
}

export default function CommunityPage({ communityId, onBack }: CommunityPageProps) {
  const { identity } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.home);

  const { data: community, isLoading: communityLoading } = useGetCommunity(communityId);
  const { data: tabs, isLoading: tabsLoading } = useGetTabs(communityId);
  const principalStr = identity?.getPrincipal().toString() ?? null;
  const { data: canReorder } = useCanReorder(communityId, principalStr);

  const isHost = community?.host.toString() === principalStr;

  // Apply community theme
  useEffect(() => {
    if (community) {
      const root = document.documentElement;
      if (community.primaryColor) {
        root.style.setProperty('--community-primary', community.primaryColor);
      }
      if (community.accentColor) {
        root.style.setProperty('--community-accent', community.accentColor);
      }
      if (community.font) {
        root.style.setProperty('--community-font', community.font);
      }
    }
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--community-primary');
      root.style.removeProperty('--community-accent');
      root.style.removeProperty('--community-font');
    };
  }, [community]);

  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.home:
        return <HomeTab communityId={communityId} />;
      case Tab.chat:
        return <ChatTab />;
      case Tab.lore:
        return <LoreTab />;
      case Tab.polls:
        return <PollsTab />;
      case Tab.quizzes:
        return <QuizzesTab />;
      case Tab.rules:
        return <RulesTab />;
      default:
        return <HomeTab communityId={communityId} />;
    }
  };

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-cosmic-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cosmic-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-cosmic-bg flex flex-col items-center justify-center gap-4">
        <p className="text-white text-lg">Community not found.</p>
        <Button onClick={onBack} variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-bg flex flex-col" style={{ fontFamily: community.font ?? undefined }}>
      {/* Back button overlay */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full transition-all text-sm font-medium"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* Host controls button */}
      {isHost && (
        <div className="absolute top-4 right-4 z-30">
          <HostControlsButton communityId={communityId} community={community} />
        </div>
      )}

      {/* Banner */}
      <CommunityBanner
        name={community.name}
        description={community.layoutOptions ?? ''}
        bannerImage={community.bannerImage ?? null}
        primaryColor={community.primaryColor ?? null}
      />

      {/* Stats bar */}
      <CommunityStatsBar memberCount={0} />

      {/* Tabs */}
      <CommunityTabs
        communityId={communityId}
        tabs={tabs ?? []}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canReorder={canReorder ?? false}
        isLoading={tabsLoading}
      />

      {/* Tab content */}
      <div className="flex-1 bg-cosmic-bg">
        {renderTabContent()}
      </div>
    </div>
  );
}
