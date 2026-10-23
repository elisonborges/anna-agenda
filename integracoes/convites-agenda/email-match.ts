// Regras puras de correspondência do e-mail do convite.
export function emailMatches(invited: unknown, account: unknown, verified: unknown): boolean {
  if (verified !== true || typeof invited !== "string" || typeof account !== "string") return false;
  return invited.trim().toLowerCase() === account.trim().toLowerCase();
}
