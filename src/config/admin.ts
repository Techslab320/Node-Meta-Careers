export const adminBasePath = "/admin-nodemeta-mateoandres";

export function adminPath(subpath = "") {
  if (!subpath) return adminBasePath;
  return `${adminBasePath}/${subpath.replace(/^\//, "")}`;
}

export const adminLoginPath = adminPath("login");

export function isAdminPagePath(pathname: string) {
  return pathname === adminBasePath || pathname.startsWith(`${adminBasePath}/`);
}
