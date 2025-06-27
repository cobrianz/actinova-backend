export function getAccessibleTabs(role) {
  const rolePermissions = {
    administrator: [
      "dashboard",
      "users",
      "courses",
      "certificates",
      "blog",
      "community",
      "revenue",
      "plans",
      "help",
      "settings",
      "profile",
    ],
    writer: ["blog", "help", "profile"],
    moderator: ["community", "help", "profile"],
    instructor: ["courses", "certificates", "help", "profile"],
    analyst: ["dashboard","revenue", "help", "profile"],
    support: ["help", "profile"],
  };

  return rolePermissions[role] || ["dashboard", "profile"];
}