export const BIBLE_AUTH_COOKIE = "biblia_access_token";

export function getPanelApiUrl() {
  const value = process.env.LHP_PANEL_API_URL?.trim();
  if (!value) throw new Error("LHP_PANEL_API_URL não configurada.");
  return value.replace(/\/$/, "");
}

export function getBibleAppKey() {
  const value = process.env.BIBLIA_APP_KEY?.trim();
  if (!value) throw new Error("BIBLIA_APP_KEY não configurada.");
  return value;
}
