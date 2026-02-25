import type { ExternalBlob } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// Local type definitions for session/RPG entities
// (These were previously exported from the backend but are no longer in the new backend interface)

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

export interface DiceRollResult {
  pattern: string;
  rolls: bigint[];
  total: bigint;
  modifier: bigint;
}

export interface TurnOrder {
  sessionId: bigint;
  order: string[];
  currentIndex: bigint;
}

export interface SessionExport {
  session: Session;
  channels: Channel[];
  messages: Message[];
  documents: Document[];
  playerDocuments: PlayerDocument[];
  images: ImageReference[];
  documentFiles: DocumentFileReference[];
  turnOrder?: TurnOrder;
}

export interface UploadFileRequest {
  documentId: bigint;
  file: ExternalBlob;
  filename: string;
  mimeType: string;
  size: bigint;
}

export type StandardResponse =
  | { __kind__: 'ok'; ok: string }
  | { __kind__: 'error'; error: string };

export type CreateDocumentResponse =
  | { __kind__: 'ok'; ok: bigint }
  | { __kind__: 'error'; error: string };

export type UploadDocumentFileResponse =
  | { __kind__: 'ok'; ok: bigint }
  | { __kind__: 'error'; error: string };
