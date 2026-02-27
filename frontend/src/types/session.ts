import type { Principal } from '@icp-sdk/core/principal';
import type { ExternalBlob } from '../backend';

export interface SessionMember {
  id: Principal;
  nickname: string;
  joinedAt: bigint;
}

export interface Channel {
  id: bigint;
  name: string;
  createdBy: Principal;
}

export interface MembersChannel {
  id: bigint;
  name: string;
  createdBy: Principal;
}

export interface Message {
  id: bigint;
  channelId: bigint;
  author: string;
  content: string;
  timestamp: bigint;
  image?: ExternalBlob;
  gif?: string;
  replyToId?: bigint;
}

export interface Session {
  id: bigint;
  name: string;
  host: Principal;
  passwordHash?: Uint8Array;
  members: SessionMember[];
  channels: Channel[];
  membersChannels: MembersChannel[];
  createdAt: bigint;
  lastActive: bigint;
}

export interface Document {
  id: bigint;
  sessionId: bigint;
  name: string;
  content: string;
  revision: bigint;
  locked: boolean;
  createdBy: Principal;
  lastModified: bigint;
}

export interface PlayerDocument {
  id: bigint;
  sessionId: bigint;
  owner: Principal;
  name: string;
  content: string;
  createdBy: Principal;
  lastModified: bigint;
  images: ImageReference[];
  isPrivate: boolean;
}

export interface PlayerDocumentMetadata {
  id: bigint;
  sessionId: bigint;
  owner: Principal;
  name: string;
  createdBy: Principal;
  lastModified: bigint;
  isPrivate: boolean;
}

export interface ImageReference {
  id: bigint;
  documentId: bigint;
  fileId: string;
  caption: string;
  position: bigint;
  size: bigint;
  createdBy: Principal;
  lastModified: bigint;
  title: string;
}

export interface DocumentFileReference {
  id: bigint;
  documentId: bigint;
  file: ExternalBlob;
  filename: string;
  mimeType: string;
  size: bigint;
  createdBy: Principal;
  lastModified: bigint;
}

export interface DocumentComment {
  id: bigint;
  documentId: bigint;
  author: Principal;
  text: string;
  timestamp: bigint;
}

export interface UploadFileRequest {
  documentId: bigint;
  file: ExternalBlob;
  filename: string;
  mimeType: string;
  size: bigint;
}

export interface SessionExport {
  session: Session;
  channels: Channel[];
  messages: Message[];
  documents: Document[];
  playerDocuments: PlayerDocument[];
  images: ImageReference[];
  documentFiles: DocumentFileReference[];
  turnOrder?: {
    sessionId: bigint;
    order: string[];
    currentIndex: bigint;
  };
}

export interface DiceRollResult {
  pattern: string;
  rolls: bigint[];
  total: bigint;
  modifier: bigint;
}
