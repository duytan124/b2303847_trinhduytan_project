export function isAuthenticated() {
  return !!sessionStorage.getItem("authenticateToken");
}
