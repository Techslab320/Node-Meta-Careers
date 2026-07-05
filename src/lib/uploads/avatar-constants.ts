export const LOCAL_AVATAR_PREFIX = "local-avatar://";

export function isLocalAvatarUrl(url: string): boolean {
  return url.startsWith(LOCAL_AVATAR_PREFIX);
}
