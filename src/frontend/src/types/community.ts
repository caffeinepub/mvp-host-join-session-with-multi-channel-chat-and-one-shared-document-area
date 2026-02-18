export type SubPlaceType = 'Chat' | 'Documents' | 'RPG';

export interface SubPlace {
  name: string;
  type: SubPlaceType;
}

export interface CommunityTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  backgroundGradient?: string;
  textColor: string;
  fontFamily: string;
  layoutStyle: 'Compact' | 'Card-based' | 'Minimal';
}

export type PrivacyType = 'Public' | 'Private';
export type JoinType = 'Request to Join' | 'Invite-Only' | 'Open';

export interface Community {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  bannerUrl?: string;
  iconUrl?: string;
  privacy: PrivacyType;
  joinType: JoinType;
  hostUserId: string;
  createdAt: number;
  subPlaces: SubPlace[];
  theme: CommunityTheme;
  joinQuestions: string[];
}

export interface CommunityFormData {
  name: string;
  description: string;
  coverImage?: File;
  coverUrl?: string;
  iconImage?: File;
  iconUrl?: string;
  bannerImage?: File;
  bannerUrl?: string;
  privacy: PrivacyType;
  joinType: JoinType;
  joinQuestions: string[];
  subPlaces: SubPlace[];
  theme: CommunityTheme;
}
