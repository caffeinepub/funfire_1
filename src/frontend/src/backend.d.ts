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
export interface Comment {
    id: string;
    author: string;
    message: string;
    timestamp: bigint;
    postId: string;
}
export interface Post {
    id: string;
    media?: ExternalBlob;
    postType: PostType;
    title: string;
    description: string;
    likes: bigint;
    timestamp: bigint;
}
export interface UserProfile {
    name: string;
}
export enum PostType {
    video = "video",
    text = "text",
    image = "image"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: string, author: string, message: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(title: string, description: string, postType: PostType, media: ExternalBlob | null): Promise<void>;
    deletePost(id: string): Promise<void>;
    getAllPosts(): Promise<Array<Post>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsForPost(postId: string): Promise<Array<Comment>>;
    getPost(id: string): Promise<Post>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
