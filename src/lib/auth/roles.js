export const USER_ROLES = {
  admin: "admin",
  studio: "studio",
};

export function isAdminUser(user) {
  return user?.role === USER_ROLES.admin;
}
