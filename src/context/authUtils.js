export function normalizeRole(role) {
  if (!role) return null;
  const raw = role.toString().trim();
  if (!raw) return null;

  const canonical = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (["admin", "administrator", "universityadmin", "systemadministrator", "platformadmin"].includes(canonical)) {
    return "admin";
  }
  if (["societyadmin", "societyadministrator", "societycoordinator"].includes(canonical)) {
    return "society-admin";
  }
  if (["student", "learner"].includes(canonical)) return "student";

  return raw.toLowerCase().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
}

export function roleToDashboardPath(role) {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "/admin";
  if (normalized === "society-admin") return "/society-admin";
  if (normalized === "student") return "/student";
  return "/";
}
