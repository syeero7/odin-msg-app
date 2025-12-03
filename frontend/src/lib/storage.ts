const STORAGE_KEY = "smoltalk";

export function getItem() {
  const token = window.localStorage.getItem(STORAGE_KEY);
  return token ? token : "";
}

export function setItem(token: string) {
  window.localStorage.setItem(STORAGE_KEY, token);
}

export function removeItem() {
  window.localStorage.removeItem(STORAGE_KEY);
}
