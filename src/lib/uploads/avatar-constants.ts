export const LOCAL_AVATAR_PREFIX = "local-avatar://";
export const MONGO_AVATAR_PREFIX = "mongo-avatar://";

export function isLocalAvatarUrl(url: string): boolean {
  return url.startsWith(LOCAL_AVATAR_PREFIX);
}

export function isMongoAvatarUrl(url: string): boolean {
  return url.startsWith(MONGO_AVATAR_PREFIX);
}

export function getMongoAvatarId(url: string): string {
  return url.slice(MONGO_AVATAR_PREFIX.length);
}
