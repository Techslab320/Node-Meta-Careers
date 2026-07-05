import { isLocalAvatarUrl, LOCAL_AVATAR_PREFIX } from "@/lib/uploads/avatar-constants";

export function getAvatarDisplayUrl(avatarUrl: string): string | null {
  if (!avatarUrl.trim()) return null;
  if (isLocalAvatarUrl(avatarUrl)) {
    const filename = avatarUrl.slice(LOCAL_AVATAR_PREFIX.length);
    return `/api/admin/avatars/${encodeURIComponent(filename)}`;
  }
  return avatarUrl;
}

export function getPublicAvatarDisplayUrl(avatarUrl: string): string | null {
  if (!avatarUrl.trim()) return null;
  if (isLocalAvatarUrl(avatarUrl)) {
    const filename = avatarUrl.slice(LOCAL_AVATAR_PREFIX.length);
    return `/api/chat-room/avatars/${encodeURIComponent(filename)}`;
  }
  return avatarUrl;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
