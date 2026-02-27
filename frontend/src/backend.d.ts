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
export interface UserProfile {
    name: string;
    profilePicture?: ExternalBlob;
}
export interface CommunityPost {
    id: string;
    content: string;
    communityId: string;
    imageBlob?: Uint8Array;
    createdAt: bigint;
    authorPrincipal: Principal;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(communityId: string, content: string, imageBlob: Uint8Array | null): Promise<string | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPosts(communityId: string): Promise<Array<CommunityPost>>;
    getTabOrder(communityId: string): Promise<Array<string>>;
    getTabPermissions(communityId: string): Promise<Array<Principal>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantTabReorderPermission(communityId: string, principal: Principal): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isCommunityHost(communityId: string, member: Principal): Promise<boolean>;
    isCommunityHostOrPermitted(communityId: string, member: Principal): Promise<boolean>;
    removeProfilePicture(): Promise<void>;
    revokeTabReorderPermission(communityId: string, principal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBannerSettings(communityId: string, bannerBlob: Uint8Array | null, bannerColor: string | null, bannerFont: string | null, accentColor: string | null): Promise<void>;
    updateTabOrder(communityId: string, newOrder: Array<string>): Promise<void>;
}
