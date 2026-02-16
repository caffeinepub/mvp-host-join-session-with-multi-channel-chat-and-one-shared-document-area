import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type CreatePlayerDocumentResponse = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "error";
    error: string;
};
export type Time = bigint;
export interface Document {
    id: bigint;
    content: string;
    name: string;
    createdBy: Principal;
    locked: boolean;
    lastModified: bigint;
    sessionId: bigint;
    revision: bigint;
}
export interface DocumentWithImages {
    id: bigint;
    content: string;
    name: string;
    createdBy: Principal;
    locked: boolean;
    lastModified: bigint;
    sessionId: bigint;
    revision: bigint;
    images: Array<ImageReference>;
}
export type CreateDocumentResponse = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "error";
    error: string;
};
export interface PlayerDocument {
    id: bigint;
    content: string;
    owner: Principal;
    name: string;
    createdBy: Principal;
    lastModified: bigint;
    isPrivate: boolean;
    sessionId: bigint;
    images: Array<ImageReference>;
}
export type UploadDocumentFileResponse = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "error";
    error: string;
};
export interface Session {
    id: bigint;
    members: Array<SessionMember>;
    host: Principal;
    name: string;
    createdAt: bigint;
    channels: Array<Channel>;
    membersChannels: Array<MembersChannel>;
    passwordHash?: Uint8Array;
    lastActive: bigint;
}
export interface UploadFileRequest {
    file: ExternalBlob;
    size: bigint;
    mimeType: string;
    filename: string;
    documentId: bigint;
}
export interface SessionExport {
    playerDocuments: Array<PlayerDocument>;
    turnOrder?: TurnOrder;
    documents: Array<Document>;
    messages: Array<Message>;
    channels: Array<Channel>;
    session: Session;
    documentFiles: Array<DocumentFileReference>;
    images: Array<ImageReference>;
}
export interface SessionCreateRequest {
    password?: string;
    name: string;
    hostNickname: string;
}
export interface PlayerDocumentMetadata {
    id: bigint;
    owner: Principal;
    name: string;
    createdBy: Principal;
    lastModified: bigint;
    isPrivate: boolean;
    sessionId: bigint;
}
export interface DocumentComment {
    id: bigint;
    text: string;
    author: Principal;
    timestamp: Time;
    documentId: bigint;
}
export interface TurnOrder {
    currentIndex: bigint;
    order: Array<string>;
    sessionId: bigint;
}
export interface MembersChannel {
    id: bigint;
    name: string;
    createdBy: Principal;
}
export interface DocumentFileReference {
    id: bigint;
    file: ExternalBlob;
    createdBy: Principal;
    size: bigint;
    mimeType: string;
    filename: string;
    lastModified: bigint;
    documentId: bigint;
}
export interface JoinSessionRequest {
    nickname: string;
    password?: string;
    sessionId: bigint;
}
export interface ImageReference {
    id: bigint;
    title: string;
    createdBy: Principal;
    size: bigint;
    lastModified: bigint;
    fileId: string;
    caption: string;
    documentId: bigint;
    position: bigint;
}
export interface Channel {
    id: bigint;
    name: string;
    createdBy: Principal;
}
export type StandardResponse = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "error";
    error: string;
};
export interface DiceRollResult {
    pattern: string;
    total: bigint;
    modifier: bigint;
    rolls: Array<bigint>;
}
export interface SessionMember {
    id: Principal;
    nickname: string;
    joinedAt: bigint;
}
export interface Message {
    id: bigint;
    content: string;
    channelId: bigint;
    author: string;
    timestamp: bigint;
    image?: ExternalBlob;
    replyToId?: bigint;
}
export type AddImageToDocumentResponse = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "error";
    error: string;
};
export interface UserProfile {
    name: string;
    profilePicture?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(documentId: bigint, text: string): Promise<bigint>;
    addImageToDocument(sessionId: bigint, documentId: bigint, fileId: string, title: string, caption: string, position: bigint, size: bigint): Promise<AddImageToDocumentResponse>;
    addImageToPlayerDocument(documentId: bigint, fileId: string, title: string, caption: string, position: bigint, size: bigint): Promise<AddImageToDocumentResponse>;
    addPlayerImage(documentId: bigint, fileId: string, title: string, caption: string, position: bigint, size: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createChannel(sessionId: bigint, name: string): Promise<StandardResponse>;
    createDocument(sessionId: bigint, name: string, content: string): Promise<CreateDocumentResponse>;
    createMembersChannel(sessionId: bigint, name: string): Promise<StandardResponse>;
    createPlayerDocument(sessionId: bigint, name: string, content: string, isPrivate: boolean): Promise<CreatePlayerDocumentResponse>;
    createSession(request: SessionCreateRequest): Promise<Session>;
    deleteChannel(sessionId: bigint, channelId: bigint): Promise<StandardResponse>;
    deleteComment(commentId: bigint): Promise<void>;
    deleteDocument(documentId: bigint): Promise<StandardResponse>;
    deleteMembersChannel(sessionId: bigint, channelId: bigint): Promise<StandardResponse>;
    deletePlayerDocument(documentId: bigint): Promise<StandardResponse>;
    editDocument(documentId: bigint, newContent: string): Promise<StandardResponse>;
    editPlayerDocument(documentId: bigint, newContent: string): Promise<StandardResponse>;
    exportSession(sessionId: bigint): Promise<SessionExport | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChannels(sessionId: bigint): Promise<Array<Channel>>;
    getComments(documentId: bigint): Promise<Array<DocumentComment>>;
    getDocument(documentId: bigint): Promise<Document | null>;
    getDocumentFileBlob(fileId: bigint): Promise<ExternalBlob | null>;
    getDocumentFileReference(fileId: bigint): Promise<DocumentFileReference | null>;
    getDocumentWithImages(documentId: bigint): Promise<DocumentWithImages | null>;
    getImageReferences(documentId: bigint): Promise<Array<ImageReference>>;
    getImages(sessionId: bigint): Promise<Array<ImageReference>>;
    getMembersChannels(sessionId: bigint): Promise<Array<MembersChannel>>;
    getMessages(sessionId: bigint, channelId: bigint): Promise<Array<Message>>;
    getPlayerDocument(documentId: bigint): Promise<PlayerDocument | null>;
    getSession(sessionId: bigint): Promise<Session | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    importSession(exportData: SessionExport): Promise<StandardResponse>;
    isCallerAdmin(): Promise<boolean>;
    joinSession(request: JoinSessionRequest): Promise<StandardResponse>;
    listDocumentFiles(documentId: bigint): Promise<Array<DocumentFileReference>>;
    listDocuments(sessionId: bigint): Promise<Array<Document>>;
    listPlayerDocuments(sessionId: bigint): Promise<Array<PlayerDocument>>;
    listPlayerDocumentsMetadata(sessionId: bigint): Promise<Array<PlayerDocumentMetadata>>;
    listSessions(): Promise<Array<Session>>;
    lockDocument(documentId: bigint): Promise<StandardResponse>;
    nextTurn(sessionId: bigint): Promise<StandardResponse>;
    postMessage(sessionId: bigint, channelId: bigint, content: string, image: ExternalBlob | null, replyToId: bigint | null): Promise<StandardResponse>;
    removeProfilePicture(): Promise<void>;
    renameChannel(sessionId: bigint, channelId: bigint, newName: string): Promise<StandardResponse>;
    renameDocument(documentId: bigint, newName: string): Promise<StandardResponse>;
    renameMembersChannel(sessionId: bigint, channelId: bigint, newName: string): Promise<StandardResponse>;
    renamePlayerDocument(documentId: bigint, newName: string): Promise<StandardResponse>;
    roll(sessionId: bigint, pattern: string): Promise<DiceRollResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPlayerDocumentVisibility(documentId: bigint, isPrivate: boolean): Promise<StandardResponse>;
    setTurnOrder(sessionId: bigint, order: Array<string>): Promise<StandardResponse>;
    unlockDocument(documentId: bigint): Promise<StandardResponse>;
    updateComment(commentId: bigint, text: string): Promise<void>;
    uploadDocumentFile(request: UploadFileRequest): Promise<UploadDocumentFileResponse>;
}
