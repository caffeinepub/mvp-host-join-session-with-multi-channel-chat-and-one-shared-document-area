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
export interface CommunityPost {
    id: bigint;
    communityId: bigint;
    text: string;
    authorName: string;
    timestamp: Time;
    image?: ExternalBlob;
    authorPrincipal: Principal;
}
export interface Community {
    id: bigint;
    font?: string;
    host: Principal;
    primaryColor?: string;
    name: string;
    accentColor?: string;
    layoutOptions?: string;
    bannerImage?: ExternalBlob;
}
export type Time = bigint;
export interface TabData {
    tab: Tab;
    order: bigint;
    canReorderMember: boolean;
}
export type StandardResponse = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "error";
    error: string;
};
export interface UserProfile {
    name: string;
    profilePicture?: ExternalBlob;
}
export enum Tab {
    chat = "chat",
    home = "home",
    lore = "lore",
    polls = "polls",
    quizzes = "quizzes",
    rules = "rules"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    canReorder(communityId: bigint, principal: Principal): Promise<boolean>;
    createCommunity(name: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "error";
        error: string;
    }>;
    createCommunityPost(communityId: bigint, authorName: string, content: string, image: ExternalBlob | null): Promise<StandardResponse>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommunity(communityId: bigint): Promise<Community | null>;
    getCommunityPosts(communityId: bigint): Promise<Array<CommunityPost>>;
    getMemberTabReorderPermissions(communityId: bigint): Promise<Array<[Principal, boolean]>>;
    getTabs(communityId: bigint): Promise<Array<TabData>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reorderTabs(communityId: bigint, newTabOrder: Array<Tab>): Promise<StandardResponse>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCommunitySettings(communityId: bigint, bannerImage: ExternalBlob | null, primaryColor: string | null, accentColor: string | null, font: string | null, layoutOptions: string | null): Promise<StandardResponse>;
    updateMemberTabReorderPermission(communityId: bigint, member: Principal, canReorderTabs: boolean): Promise<StandardResponse>;
}
